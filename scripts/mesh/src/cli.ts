#!/usr/bin/env bun

// Bridge used by the orchestrator skill: Claude Code delegates review, execution or parallel
// subtasks to Antigravity CLI (agy) and reads back a single JSON result on stdout.

import { parseRunnerArguments } from "./lib/arguments";
import { runAgy } from "./lib/run_agy";
import type { RunResult } from "./lib/types";

function printJson(payload: unknown): void {
	console.log(JSON.stringify(payload, null, 2));
}

async function main(): Promise<number> {
	let parsedArguments: ReturnType<typeof parseRunnerArguments>;
	try {
		parsedArguments = parseRunnerArguments(process.argv.slice(2), process.cwd());
	} catch (error) {
		printJson({ status: "invalid_arguments", errorMessage: (error as Error).message });
		return 2;
	}
	if (parsedArguments.kind === "single") {
		const result = await runAgy(parsedArguments.request);
		printJson(result);
		return result.status === "success" ? 0 : 1;
	}
	const results: RunResult[] = await Promise.all(parsedArguments.requests.map((request) => runAgy(request)));
	const allSucceeded = results.every((result) => result.status === "success");
	printJson({ status: allSucceeded ? "success" : "partial_failure", results });
	return allSucceeded ? 0 : 1;
}

main()
	.then((exitCode) => process.exit(exitCode))
	.catch((error) => {
		printJson({ status: "error", errorMessage: `mesh runner crashed: ${(error as Error).message}` });
		process.exit(1);
	});
