import { mkdirSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import type { RunRequest, RunResult } from "./types";

export const MESH_LOGS_DIRECTORY = join(homedir(), ".claude/mesh/logs");
const MAXIMUM_LOG_FILES = 200;
const MAXIMUM_LOGGED_CHARACTERS = 20_000;

const SECRET_PATTERNS: readonly RegExp[] = [
	/-----BEGIN [A-Z ]*PRIVATE KEY-----[\s\S]*?-----END [A-Z ]*PRIVATE KEY-----/g,
	/\b(?:sk|21st_sk|sk-ant|sk-proj)[-_][A-Za-z0-9_-]{16,}/g,
	/\bgh[pousr]_[A-Za-z0-9]{20,}/g,
	/\bAKIA[0-9A-Z]{16}\b/g,
	/\bxox[abprs]-[A-Za-z0-9-]{10,}/g,
	/(Bearer\s+)[A-Za-z0-9._~+/=-]{16,}/gi,
	/("?(?:api[_-]?key|secret|token|password|private_key)"?\s*[:=]\s*"?)[^"\s,}]{8,}/gi,
];

export function redactSecrets(text: string): string {
	return SECRET_PATTERNS.reduce(
		(redactedText, pattern) =>
			redactedText.replace(pattern, (match, prefix) => (typeof prefix === "string" && prefix !== match ? `${prefix}[REDACTED]` : "[REDACTED]")),
		text,
	);
}

function truncate(text: string): string {
	return text.length > MAXIMUM_LOGGED_CHARACTERS ? `${text.slice(0, MAXIMUM_LOGGED_CHARACTERS)}\n[truncated]` : text;
}

function rotateLogs(logsDirectory: string): void {
	const logFiles = readdirSync(logsDirectory).filter((fileName) => fileName.endsWith(".json")).sort();
	for (const staleFile of logFiles.slice(0, Math.max(0, logFiles.length - MAXIMUM_LOG_FILES))) {
		rmSync(join(logsDirectory, staleFile), { force: true });
	}
}

export function writeExecutionLog(request: RunRequest, result: RunResult, logsDirectory = MESH_LOGS_DIRECTORY): string | null {
	try {
		mkdirSync(logsDirectory, { recursive: true });
		const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
		const logFile = join(logsDirectory, `run_${timestamp}_${crypto.randomUUID().slice(0, 8)}.json`);
		const logEntry = {
			...result,
			logFile,
			prompt: truncate(redactSecrets(request.prompt)),
			response: truncate(redactSecrets(result.response)),
			errorMessage: result.errorMessage ? truncate(redactSecrets(result.errorMessage)) : null,
		};
		writeFileSync(logFile, `${JSON.stringify(logEntry, null, 2)}\n`, { mode: 0o600 });
		rotateLogs(logsDirectory);
		return logFile;
	} catch (error) {
		console.error(`mesh: failed to write execution log: ${(error as Error).message}`);
		return null;
	}
}
