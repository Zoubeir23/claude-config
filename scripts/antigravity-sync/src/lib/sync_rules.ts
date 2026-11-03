import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { ANTIGRAVITY_GLOBAL_RULES_FILE, CLAUDE_DIRECTORY, GENERATED_MARKER } from "./constants";
import { writeGeneratedFile } from "./generated_manifest";

const RULE_FILE_BYTE_LIMIT = 24_000;
const COMMON_RULES_DIRECTORY = join(CLAUDE_DIRECTORY, "rules/common");
const LANGUAGE_RULES_DIRECTORY = join(CLAUDE_DIRECTORY, "rules");

function rewriteRelativeLinks(markdown: string, baseDirectory: string): string {
	return markdown.replace(/\]\((?!https?:|#|\/)([^)]+)\)/g, (_, relativePath) => `](${join(baseDirectory, relativePath)})`);
}

function buildCommonRulesSection(): string {
	return readdirSync(COMMON_RULES_DIRECTORY)
		.filter((fileName) => fileName.endsWith(".md"))
		.sort()
		.map((fileName) => {
			const ruleContent = readFileSync(join(COMMON_RULES_DIRECTORY, fileName), "utf8");
			const demotedHeadings = ruleContent.replace(/^(#+)/gm, "$1#");
			return `\n<!-- source: rules/common/${fileName} -->\n${rewriteRelativeLinks(demotedHeadings, COMMON_RULES_DIRECTORY)}`;
		})
		.join("\n");
}

function buildLanguageRulesIndex(): string {
	const languageDirectories = readdirSync(LANGUAGE_RULES_DIRECTORY)
		.filter((name) => name !== "common" && statSync(join(LANGUAGE_RULES_DIRECTORY, name)).isDirectory())
		.sort();
	const indexLines = languageDirectories.map((name) => `- ${name}: ${join(LANGUAGE_RULES_DIRECTORY, name)}/`);
	return [
		"## Language-specific rules (read on demand)",
		"",
		"Before editing code in one of these languages, read every .md file in the matching folder and apply it on top of the common rules:",
		"",
		...indexLines,
	].join("\n");
}

export function syncGlobalRules(): string[] {
	if (existsSync(ANTIGRAVITY_GLOBAL_RULES_FILE)) {
		const existingContent = readFileSync(ANTIGRAVITY_GLOBAL_RULES_FILE, "utf8");
		if (!existingContent.includes(GENERATED_MARKER)) {
			writeGeneratedFile(`${ANTIGRAVITY_GLOBAL_RULES_FILE}.backup-${Date.now()}`, existingContent);
		}
	}
	const claudeInstructions = rewriteRelativeLinks(readFileSync(join(CLAUDE_DIRECTORY, "CLAUDE.md"), "utf8"), CLAUDE_DIRECTORY);
	const globalRules = [
		`<!-- ${GENERATED_MARKER} -->`,
		claudeInstructions.trim(),
		"",
		"---",
		"",
		"# Common rules (inlined from ~/.claude/rules/common)",
		buildCommonRulesSection(),
		"",
		buildLanguageRulesIndex(),
		"",
	].join("\n");
	const byteLength = Buffer.byteLength(globalRules);
	if (byteLength > RULE_FILE_BYTE_LIMIT) {
		console.warn(`WARNING: GEMINI.md is ${byteLength} bytes; Antigravity truncates rule files above ${RULE_FILE_BYTE_LIMIT}.`);
	}
	writeGeneratedFile(ANTIGRAVITY_GLOBAL_RULES_FILE, globalRules);
	console.log(`rules: ${ANTIGRAVITY_GLOBAL_RULES_FILE} (${byteLength} bytes)`);
	return [];
}
