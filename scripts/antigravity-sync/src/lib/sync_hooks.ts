import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { ANTIGRAVITY_CONFIG_DIRECTORY, CLAUDE_DIRECTORY, COMMAND_VALIDATOR_ADAPTER_FILE } from "./constants";
import { writeGeneratedFile } from "./generated_manifest";

const ANTIGRAVITY_HOOKS_FILE = join(ANTIGRAVITY_CONFIG_DIRECTORY, "hooks.json");
const BUN_EXECUTABLE = Bun.which("bun") ?? "bun";
const FINISH_SOUND_FILE = join(CLAUDE_DIRECTORY, "song/finish.mp3");

// Only portable hooks are synced. ECC session/cost hooks depend on the Claude Code transcript format,
// and Antigravity has no Notification or PreCompact events.
const SYNCED_HOOKS = {
	"claude-command-validator": {
		PreToolUse: [
			{
				matcher: "run_command",
				hooks: [
					{
						type: "command",
						command: `${BUN_EXECUTABLE} ${COMMAND_VALIDATOR_ADAPTER_FILE}`,
						timeout: 15,
					},
				],
			},
		],
	},
	"claude-finish-sound": {
		Stop: [
			{
				type: "command",
				command: `(afplay -v 0.1 ${FINISH_SOUND_FILE} >/dev/null 2>&1 &); echo '{}'`,
				timeout: 5,
			},
		],
	},
};

export function syncHooks(): string[] {
	const existingHooks = existsSync(ANTIGRAVITY_HOOKS_FILE)
		? JSON.parse(readFileSync(ANTIGRAVITY_HOOKS_FILE, "utf8") || "{}")
		: {};
	const mergedHooks = { ...existingHooks, ...SYNCED_HOOKS };
	writeGeneratedFile(ANTIGRAVITY_HOOKS_FILE, `${JSON.stringify(mergedHooks, null, 2)}\n`);
	console.log(`hooks: ${Object.keys(SYNCED_HOOKS).join(", ")} -> ${ANTIGRAVITY_HOOKS_FILE}`);
	return [];
}
