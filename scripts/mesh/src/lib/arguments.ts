import { existsSync, readFileSync, statSync } from "node:fs";
import { resolve } from "node:path";
import { parseArgs } from "node:util";
import { MESH_MODES, type MeshMode, type RunRequest } from "./types";

const DEFAULT_TIMEOUT_SECONDS = 600;
const MAXIMUM_TIMEOUT_SECONDS = 3600;
export const MAXIMUM_PARALLEL_TASKS = 6;

export const USAGE = `Usage:
  antigravity-runner --mode review|execute|worker --prompt "<task>" [--cwd <dir>] [--timeout <seconds>] [--model <name>]
  antigravity-runner --mode review|execute|worker --prompt-file <file.md>
  antigravity-runner --mode worker --tasks-file <tasks.json>   # JSON array of prompt strings, run in parallel`;

export type ParsedArguments =
	| { readonly kind: "single"; readonly request: RunRequest }
	| { readonly kind: "parallel"; readonly requests: readonly RunRequest[] };

function fail(message: string): never {
	throw new Error(`${message}\n\n${USAGE}`);
}

function readTextFile(filePath: string, label: string): string {
	if (!existsSync(filePath)) {
		fail(`${label} not found: ${filePath}`);
	}
	return readFileSync(filePath, "utf8");
}

function parseTasks(tasksFile: string): string[] {
	let parsedTasks: unknown;
	try {
		parsedTasks = JSON.parse(readTextFile(tasksFile, "--tasks-file"));
	} catch (error) {
		fail(`--tasks-file must be valid JSON: ${(error as Error).message}`);
	}
	if (!Array.isArray(parsedTasks) || parsedTasks.length === 0 || !parsedTasks.every((task) => typeof task === "string" && task.trim())) {
		fail("--tasks-file must be a non-empty JSON array of non-empty strings");
	}
	if (parsedTasks.length > MAXIMUM_PARALLEL_TASKS) {
		fail(`--tasks-file accepts at most ${MAXIMUM_PARALLEL_TASKS} tasks`);
	}
	return parsedTasks as string[];
}

export function parseRunnerArguments(argumentList: readonly string[], currentDirectory: string): ParsedArguments {
	const { values } = parseArgs({
		args: [...argumentList],
		options: {
			mode: { type: "string" },
			prompt: { type: "string" },
			"prompt-file": { type: "string" },
			"tasks-file": { type: "string" },
			cwd: { type: "string" },
			timeout: { type: "string" },
			model: { type: "string" },
		},
		strict: true,
	});
	if (!MESH_MODES.includes(values.mode as MeshMode)) {
		fail(`--mode must be one of: ${MESH_MODES.join(", ")}`);
	}
	const workingDirectory = resolve(currentDirectory, values.cwd ?? ".");
	if (!existsSync(workingDirectory) || !statSync(workingDirectory).isDirectory()) {
		fail(`--cwd is not a directory: ${workingDirectory}`);
	}
	const timeoutSeconds = values.timeout === undefined ? DEFAULT_TIMEOUT_SECONDS : Number(values.timeout);
	if (!Number.isInteger(timeoutSeconds) || timeoutSeconds < 30 || timeoutSeconds > MAXIMUM_TIMEOUT_SECONDS) {
		fail(`--timeout must be an integer between 30 and ${MAXIMUM_TIMEOUT_SECONDS}`);
	}
	const baseRequest = { mode: values.mode as MeshMode, workingDirectory, timeoutSeconds, model: values.model ?? null };
	const promptSources = [values.prompt, values["prompt-file"], values["tasks-file"]].filter((source) => source !== undefined);
	if (promptSources.length !== 1) {
		fail("Provide exactly one of --prompt, --prompt-file or --tasks-file");
	}
	if (values["tasks-file"] !== undefined) {
		if (baseRequest.mode !== "worker") {
			fail("--tasks-file is only allowed with --mode worker");
		}
		const tasks = parseTasks(resolve(currentDirectory, values["tasks-file"]));
		return { kind: "parallel", requests: tasks.map((prompt) => ({ ...baseRequest, prompt })) };
	}
	const prompt = values.prompt ?? readTextFile(resolve(currentDirectory, values["prompt-file"] as string), "--prompt-file");
	if (!prompt.trim()) {
		fail("The prompt is empty");
	}
	return { kind: "single", request: { ...baseRequest, prompt } };
}
