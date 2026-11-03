import { buildAgyArguments, resolveAgyPath } from "./agy_command";
import { writeExecutionLog } from "./execution_log";
import { buildChildEnvironment, isNestedMeshCall } from "./recursion_guard";
import type { AntigravityJsonOutput, RunRequest, RunResult } from "./types";

// agy enforces --print-timeout itself; this hard kill only covers a hung process.
const HARD_KILL_GRACE_SECONDS = 30;

function buildResult(request: RunRequest, startedAt: number, fields: Partial<RunResult>): RunResult {
	return {
		status: "error",
		mode: request.mode,
		workingDirectory: request.workingDirectory,
		response: "",
		errorMessage: null,
		exitCode: null,
		durationMilliseconds: Date.now() - startedAt,
		conversationId: null,
		totalTokens: null,
		logFile: null,
		...fields,
	};
}

export function parseAntigravityOutput(standardOutput: string): AntigravityJsonOutput | null {
	const jsonLine = standardOutput
		.split("\n")
		.reverse()
		.find((line) => line.trim().startsWith("{"));
	if (!jsonLine) {
		return null;
	}
	try {
		return JSON.parse(jsonLine);
	} catch {
		return null;
	}
}

async function spawnAgy(agyPath: string, request: RunRequest, startedAt: number): Promise<RunResult> {
	const agyProcess = Bun.spawn(buildAgyArguments(agyPath, request), {
		cwd: request.workingDirectory,
		env: buildChildEnvironment(process.env),
		stdin: "ignore",
		stdout: "pipe",
		stderr: "pipe",
	});
	let timedOut = false;
	const hardKillTimer = setTimeout(() => {
		timedOut = true;
		agyProcess.kill();
	}, (request.timeoutSeconds + HARD_KILL_GRACE_SECONDS) * 1000);
	const [standardOutput, standardError, exitCode] = await Promise.all([
		new Response(agyProcess.stdout).text(),
		new Response(agyProcess.stderr).text(),
		agyProcess.exited,
	]);
	clearTimeout(hardKillTimer);
	const parsedOutput = parseAntigravityOutput(standardOutput);
	const succeeded = exitCode === 0 && parsedOutput?.status === "SUCCESS";
	return buildResult(request, startedAt, {
		status: timedOut ? "timeout" : succeeded ? "success" : "error",
		response: parsedOutput?.response ?? standardOutput.trim(),
		errorMessage: succeeded ? null : standardError.trim() || parsedOutput?.status || "agy returned no result",
		exitCode,
		conversationId: parsedOutput?.conversation_id ?? null,
		totalTokens: parsedOutput?.usage?.total_tokens ?? null,
	});
}

export async function runAgy(request: RunRequest): Promise<RunResult> {
	const startedAt = Date.now();
	if (isNestedMeshCall(process.env)) {
		return buildResult(request, startedAt, {
			status: "recursion_blocked",
			errorMessage: "Nested mesh call refused: this process was itself started by the orchestrator.",
		});
	}
	const agyPath = resolveAgyPath();
	const result = agyPath
		? await spawnAgy(agyPath, request, startedAt)
		: buildResult(request, startedAt, { status: "not_found", errorMessage: "agy binary not found in PATH or ~/.local/bin" });
	return { ...result, logFile: writeExecutionLog(request, result) };
}
