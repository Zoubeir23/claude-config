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
		deniedActions: [],
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
	const verdict = evaluateAntigravityOutput(exitCode, parsedOutput, standardError);
	return buildResult(request, startedAt, {
		status: timedOut ? "timeout" : verdict.succeeded ? "success" : "error",
		response: parsedOutput?.response ?? standardOutput.trim(),
		errorMessage: verdict.errorMessage,
		exitCode,
		conversationId: parsedOutput?.conversation_id ?? null,
		totalTokens: parsedOutput?.usage?.total_tokens ?? null,
		deniedActions: verdict.deniedActions,
	});
}

export function evaluateAntigravityOutput(
	exitCode: number,
	parsedOutput: AntigravityJsonOutput | null,
	standardError: string,
): { succeeded: boolean; errorMessage: string | null; deniedActions: string[] } {
	const deniedActions = (parsedOutput?.denied_actions ?? []).map((denied) => denied.action ?? denied.display_name ?? "unknown");
	if (deniedActions.length > 0) {
		return {
			succeeded: false,
			deniedActions,
			errorMessage: `agy was denied: ${deniedActions.join(", ")}. Headless mode cannot prompt; add an allow rule (see ORCHESTRATION_COMMAND_ALLOWLIST) or run the step yourself.`,
		};
	}
	if (exitCode !== 0 || parsedOutput?.status !== "SUCCESS") {
		return { succeeded: false, deniedActions, errorMessage: standardError.trim() || parsedOutput?.status || "agy returned no result" };
	}
	if (!parsedOutput.response?.trim()) {
		return { succeeded: false, deniedActions, errorMessage: "agy reported success but produced an empty response" };
	}
	return { succeeded: true, deniedActions, errorMessage: null };
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
