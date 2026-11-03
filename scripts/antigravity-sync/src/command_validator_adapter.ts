#!/usr/bin/env bun

// Bridges Antigravity's PreToolUse hook contract to the Claude Code command validator.
// Antigravity input:  { toolCall: { name: "run_command", args: { CommandLine } }, conversationId }
// Validator input:    { tool_name: "Bash", tool_input: { command }, session_id }

import { homedir } from "node:os";
import { join } from "node:path";

const VALIDATOR_PATH = join(homedir(), ".claude/scripts/command-validator/src/cli.ts");
// Antigravity treats an empty PreToolUse output as a denial; "ask" defers to the normal permission flow
// (it honours "Always Allow"), which matches the Claude Code behaviour when the validator passes.
const NO_OPINION = JSON.stringify({ decision: "ask" });

interface AntigravityHookInput {
	toolCall?: { name?: string; args?: { CommandLine?: string } };
	conversationId?: string;
}

interface ValidatorOutput {
	hookSpecificOutput?: {
		permissionDecision?: "deny" | "ask";
		permissionDecisionReason?: string;
	};
}

async function readStandardInput(): Promise<string> {
	const chunks: Buffer[] = [];
	for await (const chunk of process.stdin) {
		chunks.push(chunk);
	}
	return Buffer.concat(chunks).toString();
}

async function runValidator(command: string, conversationId: string | null): Promise<string> {
	const validatorProcess = Bun.spawn(["bun", VALIDATOR_PATH], {
		stdin: new TextEncoder().encode(
			JSON.stringify({ tool_name: "Bash", tool_input: { command }, session_id: conversationId }),
		),
		stdout: "pipe",
		stderr: "inherit",
	});
	const validatorStandardOutput = await new Response(validatorProcess.stdout).text();
	const exitCode = await validatorProcess.exited;
	if (exitCode !== 0) {
		throw new Error(`Validator exited with code ${exitCode}`);
	}
	return validatorStandardOutput;
}

function translateValidatorOutput(validatorStandardOutput: string): string {
	const jsonLine = validatorStandardOutput
		.split("\n")
		.find((line) => line.trim().startsWith("{"));
	if (!jsonLine) {
		return NO_OPINION;
	}
	const parsedOutput: ValidatorOutput = JSON.parse(jsonLine);
	const decision = parsedOutput.hookSpecificOutput?.permissionDecision;
	if (!decision) {
		return NO_OPINION;
	}
	return JSON.stringify({
		decision: decision === "deny" ? "deny" : "force_ask",
		reason: parsedOutput.hookSpecificOutput?.permissionDecisionReason ?? "Blocked by command validator",
	});
}

async function main() {
	try {
		const hookInput: AntigravityHookInput = JSON.parse(await readStandardInput());
		const command = hookInput.toolCall?.args?.CommandLine;
		if (hookInput.toolCall?.name !== "run_command" || !command) {
			console.log(NO_OPINION);
			return;
		}
		const validatorStandardOutput = await runValidator(command, hookInput.conversationId ?? null);
		console.log(translateValidatorOutput(validatorStandardOutput));
	} catch (error) {
		console.error("command_validator_adapter error:", error);
		console.log(
			JSON.stringify({ decision: "force_ask", reason: "Command validator failed; manual confirmation required" }),
		);
	}
}

main();
