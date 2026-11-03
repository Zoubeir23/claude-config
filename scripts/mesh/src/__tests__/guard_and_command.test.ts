import { describe, expect, it } from "bun:test";
import { buildAgyArguments, buildPrompt, buildSessionSettings, readPersistedPermissions } from "../lib/agy_command";
import { buildChildEnvironment, isNestedMeshCall, readMeshDepth } from "../lib/recursion_guard";
import { evaluateAntigravityOutput, parseAntigravityOutput } from "../lib/run_agy";
import type { RunRequest } from "../lib/types";

const baseRequest: RunRequest = {
	mode: "review",
	prompt: "Review src/app.ts",
	workingDirectory: "/tmp/project",
	timeoutSeconds: 300,
	model: null,
};

describe("recursion guard", () => {
	it("allows the first hop and refuses nested calls", () => {
		expect(isNestedMeshCall({})).toBe(false);
		expect(isNestedMeshCall({ MESH_DEPTH: "1" })).toBe(true);
	});

	it("increments depth for the child process without mutating the parent", () => {
		const parentEnvironment = { PATH: "/bin" };
		const childEnvironment = buildChildEnvironment(parentEnvironment);
		expect(childEnvironment.MESH_DEPTH).toBe("1");
		expect(childEnvironment.PATH).toBe("/bin");
		expect(parentEnvironment).toEqual({ PATH: "/bin" });
	});

	it("treats garbage depth values as zero", () => {
		expect(readMeshDepth({ MESH_DEPTH: "abc" })).toBe(0);
		expect(readMeshDepth({ MESH_DEPTH: "-3" })).toBe(0);
	});
});

const persistedPermissions = { allow: ["command(git status)"], deny: ["command(git push)"] };

function sessionPermissions(request: RunRequest) {
	return JSON.parse(buildSessionSettings(request, persistedPermissions)).permissions;
}

describe("agy command", () => {
	it("runs headless with JSON output, timeout, workspace and session settings", () => {
		const argumentList = buildAgyArguments("/bin/agy", { ...baseRequest, mode: "execute" }, persistedPermissions);
		expect(argumentList.slice(0, 2)).toEqual(["/bin/agy", "--print"]);
		expect(argumentList).toContain("json");
		expect(argumentList).toContain("300s");
		expect(argumentList).toContain("/tmp/project");
		expect(argumentList).toContain("--settings");
	});

	it("keeps persisted rules and grants reads on the working directory", () => {
		const permissions = sessionPermissions({ ...baseRequest, mode: "execute" });
		expect(permissions.allow).toEqual(["command(git status)", "read_file(/tmp/project)", "write_file(/tmp/project)"]);
		expect(sessionPermissions(baseRequest).allow).not.toContain("write_file(/tmp/project)");
		expect(permissions.deny).toEqual(["command(git push)"]);
	});

	it("enforces read-only permissions in review mode only", () => {
		expect(sessionPermissions(baseRequest).deny).toContain("write_file(*)");
		expect(sessionPermissions({ ...baseRequest, mode: "worker" }).deny).not.toContain("write_file(*)");
	});

	it("passes the model only when requested", () => {
		expect(buildAgyArguments("/bin/agy", { ...baseRequest, model: "pro" }, persistedPermissions)).toContain("--model");
		expect(buildAgyArguments("/bin/agy", baseRequest, persistedPermissions)).not.toContain("--model");
	});

	it("reads persisted permissions and tolerates a missing file", () => {
		expect(readPersistedPermissions("/does/not/exist.json")).toEqual({ allow: [], deny: [] });
	});

	it("prefixes the task with mode instructions", () => {
		expect(buildPrompt("review", "Check auth", "/tmp/project")).toContain("Do NOT modify any file");
		expect(buildPrompt("review", "Check auth", "/tmp/project")).toContain("Working directory (absolute): /tmp/project");
		expect(buildPrompt("worker", "Write docs", "/tmp/project")).toEndWith("--- TASK ---\nWrite docs");
	});
});

describe("parseAntigravityOutput", () => {
	it("reads the last JSON line of agy output", () => {
		const output = 'warning: something\n{"status":"SUCCESS","response":"pong","usage":{"total_tokens":10}}\n';
		expect(parseAntigravityOutput(output)).toEqual({ status: "SUCCESS", response: "pong", usage: { total_tokens: 10 } });
	});

	it("returns null for non-JSON output", () => {
		expect(parseAntigravityOutput("jetski: no output produced")).toBeNull();
		expect(parseAntigravityOutput("{broken")).toBeNull();
	});
});

describe("evaluateAntigravityOutput", () => {
	it("accepts a successful, non-empty response", () => {
		expect(evaluateAntigravityOutput(0, { status: "SUCCESS", response: "ok" }, "").succeeded).toBe(true);
	});

	it("flags denied actions even when agy reports SUCCESS", () => {
		const verdict = evaluateAntigravityOutput(0, { status: "SUCCESS", response: "", denied_actions: [{ action: "read_file" }] }, "");
		expect(verdict.succeeded).toBe(false);
		expect(verdict.deniedActions).toEqual(["read_file"]);
		expect(verdict.errorMessage).toContain("read_file");
	});

	it("flags an empty response reported as success", () => {
		expect(evaluateAntigravityOutput(0, { status: "SUCCESS", response: "  " }, "").errorMessage).toContain("empty response");
	});

	it("surfaces stderr on a non-zero exit", () => {
		expect(evaluateAntigravityOutput(1, null, "auth expired").errorMessage).toBe("auth expired");
	});
});
