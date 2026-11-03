import { describe, expect, it } from "bun:test";
import { buildAgyArguments, buildPrompt } from "../lib/agy_command";
import { buildChildEnvironment, isNestedMeshCall, readMeshDepth } from "../lib/recursion_guard";
import { parseAntigravityOutput } from "../lib/run_agy";
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

describe("agy command", () => {
	it("runs headless with JSON output, timeout and workspace", () => {
		const argumentList = buildAgyArguments("/bin/agy", { ...baseRequest, mode: "execute" });
		expect(argumentList.slice(0, 2)).toEqual(["/bin/agy", "--print"]);
		expect(argumentList).toContain("json");
		expect(argumentList).toContain("300s");
		expect(argumentList).toContain("/tmp/project");
		expect(argumentList).not.toContain("--settings");
	});

	it("enforces read-only permissions in review mode", () => {
		const argumentList = buildAgyArguments("/bin/agy", baseRequest);
		const settingsValue = argumentList[argumentList.indexOf("--settings") + 1];
		expect(JSON.parse(settingsValue).permissions.deny).toEqual(["write_file(*)"]);
	});

	it("passes the model only when requested", () => {
		expect(buildAgyArguments("/bin/agy", { ...baseRequest, model: "pro" })).toContain("--model");
		expect(buildAgyArguments("/bin/agy", baseRequest)).not.toContain("--model");
	});

	it("prefixes the task with mode instructions", () => {
		expect(buildPrompt("review", "Check auth")).toContain("Do NOT modify any file");
		expect(buildPrompt("worker", "Write docs")).toEndWith("--- TASK ---\nWrite docs");
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
