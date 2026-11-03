import { afterAll, describe, expect, it } from "bun:test";
import { mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { parseRunnerArguments } from "../lib/arguments";
import { redactSecrets, writeExecutionLog } from "../lib/execution_log";
import type { RunRequest, RunResult } from "../lib/types";

const temporaryDirectory = mkdtempSync(join(tmpdir(), "mesh-test-"));
afterAll(() => rmSync(temporaryDirectory, { recursive: true, force: true }));

describe("parseRunnerArguments", () => {
	it("parses a single review request with defaults", () => {
		const parsed = parseRunnerArguments(["--mode", "review", "--prompt", "Check it"], temporaryDirectory);
		expect(parsed.kind).toBe("single");
		if (parsed.kind === "single") {
			expect(parsed.request).toEqual({
				mode: "review",
				prompt: "Check it",
				workingDirectory: temporaryDirectory,
				timeoutSeconds: 600,
				model: null,
			});
		}
	});

	it("parses parallel worker tasks", () => {
		const tasksFile = join(temporaryDirectory, "tasks.json");
		writeFileSync(tasksFile, JSON.stringify(["Write tests", "Write docs"]));
		const parsed = parseRunnerArguments(["--mode", "worker", "--tasks-file", tasksFile], temporaryDirectory);
		expect(parsed.kind === "parallel" && parsed.requests.map((request) => request.prompt)).toEqual(["Write tests", "Write docs"]);
	});

	it.each([
		[["--prompt", "x"], "--mode must be one of"],
		[["--mode", "deploy", "--prompt", "x"], "--mode must be one of"],
		[["--mode", "review"], "exactly one of"],
		[["--mode", "review", "--prompt", "x", "--timeout", "5"], "--timeout must be"],
		[["--mode", "review", "--prompt", "x", "--cwd", "/does/not/exist"], "--cwd is not a directory"],
		[["--mode", "review", "--prompt", "   "], "The prompt is empty"],
	])("rejects %j", (argumentList, expectedMessage) => {
		expect(() => parseRunnerArguments(argumentList, temporaryDirectory)).toThrow(expectedMessage);
	});

	it("rejects tasks files outside worker mode and oversized task lists", () => {
		const tasksFile = join(temporaryDirectory, "many.json");
		writeFileSync(tasksFile, JSON.stringify(Array.from({ length: 7 }, (_, index) => `task ${index}`)));
		expect(() => parseRunnerArguments(["--mode", "review", "--tasks-file", tasksFile], temporaryDirectory)).toThrow("only allowed");
		expect(() => parseRunnerArguments(["--mode", "worker", "--tasks-file", tasksFile], temporaryDirectory)).toThrow("at most 6");
	});
});

describe("redactSecrets", () => {
	it.each([
		["key 21st_sk_FAKEFAKEFAKEFAKEFAKEFAKE0000", "21st_sk_"],
		["token ghp_abcdefghijklmnopqrstuvwxyz123456", "ghp_"],
		["Authorization: Bearer abcdefghijklmnop1234567890", "abcdefghijklmnop"],
		['{"api_key": "supersecretvalue123"}', "supersecretvalue123"],
		["-----BEGIN PRIVATE KEY-----\nMIIabc\n-----END PRIVATE KEY-----", "MIIabc"],
	])("redacts %s", (text, leakedFragment) => {
		const redacted = redactSecrets(text);
		expect(redacted).toContain("[REDACTED]");
		expect(redacted).not.toContain(leakedFragment);
	});

	it("leaves ordinary text intact", () => {
		expect(redactSecrets("git status passed, 12 tests green")).toBe("git status passed, 12 tests green");
	});
});

describe("writeExecutionLog", () => {
	const request: RunRequest = { mode: "execute", prompt: "use sk_live_abcdefghijklmnopqrstu", workingDirectory: "/tmp", timeoutSeconds: 60, model: null };
	const result: RunResult = {
		status: "success",
		mode: "execute",
		workingDirectory: "/tmp",
		response: "done",
		errorMessage: null,
		exitCode: 0,
		durationMilliseconds: 5,
		conversationId: "abc",
		totalTokens: 1,
		deniedActions: [],
		logFile: null,
	};

	it("writes a redacted, owner-only log file with a unique name", () => {
		const logsDirectory = join(temporaryDirectory, "logs");
		const firstLog = writeExecutionLog(request, result, logsDirectory) as string;
		const secondLog = writeExecutionLog(request, result, logsDirectory) as string;
		expect(firstLog).not.toBe(secondLog);
		expect(readFileSync(firstLog, "utf8")).not.toContain("sk_live_abcdefghijklmnopqrstu");
		expect(readdirSync(logsDirectory)).toHaveLength(2);
	});
});
