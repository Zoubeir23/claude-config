import { existsSync, readFileSync } from "node:fs";
import { ANTIGRAVITY_CLI_SETTINGS_FILE, CLAUDE_SETTINGS_FILE } from "./constants";
import { writeGeneratedFile } from "./generated_manifest";

// Headless agy (-p) auto-denies any command without an allow rule. Rules match on leading tokens:
// "command(git status)" allows "git status --short" but not "git push". Destructive commands stay
// blocked by the command validator hook regardless of this list.
export const ORCHESTRATION_COMMAND_ALLOWLIST: readonly string[] = [
	"git status",
	"git diff",
	"git log",
	"git show",
	"git branch",
	"git rev-parse",
	"ls",
	"pwd",
	"cat",
	"head",
	"tail",
	"wc",
	"grep",
	"rg",
	"jq",
	"which",
	"npm test",
	"npm run test",
	"npm run lint",
	"npm run build",
	"npm run typecheck",
	"npx tsc --noEmit",
	"pnpm test",
	"pnpm run lint",
	"pnpm run build",
	"pnpm lint",
	"pnpm typecheck",
	"pnpm run typecheck",
	"pnpm build",
	"bun test",
	"bun run test",
	"bun run lint",
	"bun run build",
	"pytest",
	"python -m pytest",
	"python3 -m pytest",
	"python manage.py test",
	"python manage.py check",
	"ruff check",
	"mypy",
	"go test",
	"go vet",
	"go build",
	"cargo test",
	"cargo check",
	"cargo build",
	"cargo clippy",
];

interface PermissionLists {
	allow?: string[];
	deny?: string[];
}

function readJsonFile(filePath: string): Record<string, unknown> {
	if (!existsSync(filePath)) {
		return {};
	}
	try {
		return JSON.parse(readFileSync(filePath, "utf8") || "{}");
	} catch (error) {
		throw new Error(`Invalid JSON in ${filePath}: ${(error as Error).message}`);
	}
}

// Claude "Bash(gh api:*)" or "Bash(npm test)" -> Antigravity "command(gh api)" / "command(npm test)".
export function convertClaudePermissionRule(claudeRule: string): string | null {
	const match = claudeRule.match(/^Bash\((.+?)(?::\*)?\)$/);
	if (!match || match[1].includes("*")) {
		return null;
	}
	return `command(${match[1].trim()})`;
}

function convertRules(claudeRules: readonly string[] | undefined): string[] {
	return (claudeRules ?? []).flatMap((claudeRule) => convertClaudePermissionRule(claudeRule) ?? []);
}

export function syncPermissions(): string[] {
	const claudePermissions = (readJsonFile(CLAUDE_SETTINGS_FILE).permissions ?? {}) as PermissionLists;
	const antigravitySettings = readJsonFile(ANTIGRAVITY_CLI_SETTINGS_FILE);
	const existingPermissions = (antigravitySettings.permissions ?? {}) as PermissionLists;
	const allowRules = [
		...new Set([
			...(existingPermissions.allow ?? []),
			...ORCHESTRATION_COMMAND_ALLOWLIST.map((command) => `command(${command})`),
			...convertRules(claudePermissions.allow),
		]),
	];
	const denyRules = [...new Set([...(existingPermissions.deny ?? []), ...convertRules(claudePermissions.deny)])];
	const mergedSettings = {
		...antigravitySettings,
		permissions: { ...existingPermissions, allow: allowRules, deny: denyRules },
	};
	writeGeneratedFile(ANTIGRAVITY_CLI_SETTINGS_FILE, `${JSON.stringify(mergedSettings, null, 2)}\n`);
	console.log(`permissions: ${allowRules.length} allow / ${denyRules.length} deny rules -> ${ANTIGRAVITY_CLI_SETTINGS_FILE}`);
	return [];
}
