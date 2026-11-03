import { existsSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import type { MeshMode, PermissionRules, RunRequest } from "./types";

const DEFAULT_AGY_PATH = join(homedir(), ".local/bin/agy");
const AGY_SETTINGS_FILE = join(homedir(), ".gemini/antigravity-cli/settings.json");
const NO_PERMISSIONS: PermissionRules = { allow: [], deny: [] };

const MODE_INSTRUCTIONS: Readonly<Record<MeshMode, string>> = {
	review: [
		"You are a second-opinion reviewer. The work below was produced by Claude Code in the current directory.",
		"Do NOT modify any file. Read the relevant files yourself.",
		"Report findings ranked CRITICAL, HIGH, MEDIUM, LOW, each with file:line, the problem and a concrete fix.",
		"End with a one-line verdict: APPROVE, WARNING or BLOCK.",
	].join("\n"),
	execute: [
		"You are the execution arm. Run the technical steps below in the current directory.",
		"Report every command you ran with its exit status, then the final state. Stop at the first failure and explain it.",
	].join("\n"),
	worker: [
		"You are a worker on an independent subtask delegated by Claude Code.",
		"Stay strictly within the subtask scope. Report the files you changed and how you verified the result.",
	].join("\n"),
};

export function resolveAgyPath(): string | null {
	const pathCandidate = Bun.which("agy");
	if (pathCandidate) {
		return pathCandidate;
	}
	return existsSync(DEFAULT_AGY_PATH) ? DEFAULT_AGY_PATH : null;
}

// Headless agy aborts the whole turn on the first denied shell command (e.g. `find` to locate a file),
// so reading must go through built-in tools, which only need the read_file grant.
function buildEnvironmentInstructions(workingDirectory: string): string {
	return [
		`Working directory (absolute): ${workingDirectory}`,
		"Read and search files ONLY with your built-in tools (view_file, list_dir, find_by_name, grep_search), never with shell commands.",
		"Shell commands are limited to an allowlist (git status/diff/log, test runners, linters, builds); anything else is denied and ends your turn.",
	].join("\n");
}

export function buildPrompt(mode: MeshMode, taskPrompt: string, workingDirectory: string): string {
	return `${MODE_INSTRUCTIONS[mode]}\n\n${buildEnvironmentInstructions(workingDirectory)}\n\n--- TASK ---\n${taskPrompt}`;
}

export function readPersistedPermissions(settingsFile = AGY_SETTINGS_FILE): PermissionRules {
	if (!existsSync(settingsFile)) {
		return NO_PERMISSIONS;
	}
	try {
		const permissions = JSON.parse(readFileSync(settingsFile, "utf8")).permissions ?? {};
		return { allow: permissions.allow ?? [], deny: permissions.deny ?? [] };
	} catch (error) {
		console.error(`mesh: ignoring unreadable ${settingsFile}: ${(error as Error).message}`);
		return NO_PERMISSIONS;
	}
}

// A "permissions" key passed via --settings replaces the persisted one, so the persisted rules are
// carried over. Headless agy denies reads outside trusted workspaces, so the working directory is
// granted explicitly. Review must never touch files: enforced here, not just by the prompt.
export function buildSessionSettings(request: RunRequest, persistedPermissions: PermissionRules): string {
	const workingDirectoryGrants =
		request.mode === "review"
			? [`read_file(${request.workingDirectory})`]
			: [`read_file(${request.workingDirectory})`, `write_file(${request.workingDirectory})`];
	const allow = [...new Set([...persistedPermissions.allow, ...workingDirectoryGrants])];
	const deny = [...new Set([...persistedPermissions.deny, ...(request.mode === "review" ? ["write_file(*)"] : [])])];
	return JSON.stringify({ permissions: { allow, deny } });
}

export function buildAgyArguments(
	agyPath: string,
	request: RunRequest,
	persistedPermissions: PermissionRules = readPersistedPermissions(),
): string[] {
	return [
		agyPath,
		"--print",
		buildPrompt(request.mode, request.prompt, request.workingDirectory),
		"--output-format",
		"json",
		"--print-timeout",
		`${request.timeoutSeconds}s`,
		"--add-dir",
		request.workingDirectory,
		"--settings",
		buildSessionSettings(request, persistedPermissions),
		...(request.model ? ["--model", request.model] : []),
	];
}
