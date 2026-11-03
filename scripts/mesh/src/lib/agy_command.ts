import { existsSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import type { MeshMode, RunRequest } from "./types";

const DEFAULT_AGY_PATH = join(homedir(), ".local/bin/agy");

// Review must never touch files: enforced by a session-only permission override, not just by the prompt.
const READ_ONLY_SETTINGS = JSON.stringify({ permissions: { deny: ["write_file(*)"] } });

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

export function buildPrompt(mode: MeshMode, taskPrompt: string): string {
	return `${MODE_INSTRUCTIONS[mode]}\n\n--- TASK ---\n${taskPrompt}`;
}

export function buildAgyArguments(agyPath: string, request: RunRequest): string[] {
	return [
		agyPath,
		"--print",
		buildPrompt(request.mode, request.prompt),
		"--output-format",
		"json",
		"--print-timeout",
		`${request.timeoutSeconds}s`,
		"--add-dir",
		request.workingDirectory,
		...(request.model ? ["--model", request.model] : []),
		...(request.mode === "review" ? ["--settings", READ_ONLY_SETTINGS] : []),
	];
}
