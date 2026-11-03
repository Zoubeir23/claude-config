import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, symlinkSync } from "node:fs";
import { basename, join } from "node:path";
import { listInstalledClaudePlugins, pluginSubdirectory } from "./claude_plugins";
import { ANTIGRAVITY_CONFIG_DIRECTORY, CLAUDE_DIRECTORY, EXCLUDED_SKILL_NAME_PATTERNS, GENERATED_MARKER } from "./constants";
import { parseMarkdownDocument, serializeMarkdownDocument, toSingleLineDescription } from "./frontmatter";
import { writeGeneratedFile } from "./generated_manifest";

const GENERATED_SKILLS_DIRECTORY = join(ANTIGRAVITY_CONFIG_DIRECTORY, "skills");

// Antigravity drops skills once their descriptions exceed the skill budget, and long descriptions go first.
const MAXIMUM_DESCRIPTION_LENGTH = 100;

interface SkillSource {
	readonly directory: string;
	readonly namePrefix: string;
}

function listSkillNames(skillsDirectory: string): readonly string[] {
	return readdirSync(skillsDirectory).filter((entryName) => {
		const entryPath = join(skillsDirectory, entryName);
		if (!existsSync(entryPath)) {
			console.warn(`  skill ${entryName}: dangling symlink, skipped`);
			return false;
		}
		return statSync(entryPath).isDirectory() && existsSync(join(entryPath, "SKILL.md"));
	});
}

function isExcludedSkill(skillName: string): boolean {
	return EXCLUDED_SKILL_NAME_PATTERNS.some((pattern) => pattern.test(skillName));
}

export function shortenDescription(description: string): string {
	if (description.length <= MAXIMUM_DESCRIPTION_LENGTH) {
		return description;
	}
	const truncatedDescription = description.slice(0, MAXIMUM_DESCRIPTION_LENGTH);
	const lastSentenceEnd = truncatedDescription.lastIndexOf(". ");
	return lastSentenceEnd > MAXIMUM_DESCRIPTION_LENGTH / 2
		? truncatedDescription.slice(0, lastSentenceEnd + 1)
		: `${truncatedDescription.slice(0, truncatedDescription.lastIndexOf(" "))}...`;
}

function mirrorSkill(sourceSkillDirectory: string, skillName: string): string {
	const targetSkillDirectory = join(GENERATED_SKILLS_DIRECTORY, skillName);
	mkdirSync(targetSkillDirectory, { recursive: true });
	for (const entryName of readdirSync(sourceSkillDirectory)) {
		if (entryName !== "SKILL.md") {
			symlinkSync(join(sourceSkillDirectory, entryName), join(targetSkillDirectory, entryName));
		}
	}
	const { attributes, body } = parseMarkdownDocument(readFileSync(join(sourceSkillDirectory, "SKILL.md"), "utf8"));
	const description = shortenDescription(toSingleLineDescription(attributes.description, skillName));
	const skillBody = `<!-- ${GENERATED_MARKER} Source: ${sourceSkillDirectory} -->\n\n${body.trim()}\n`;
	writeGeneratedFile(join(targetSkillDirectory, "SKILL.md"), serializeMarkdownDocument({ name: skillName, description }, skillBody));
	return targetSkillDirectory;
}

function mirrorSkillDirectories(knownSkillNames: Set<string>): string[] {
	// User skills first so they win over plugin skills with the same name.
	const skillDirectories = [
		join(CLAUDE_DIRECTORY, "skills"),
		...listInstalledClaudePlugins().flatMap((plugin) => pluginSubdirectory(plugin, "skills") ?? []),
	];
	const generatedPaths = skillDirectories.flatMap((directory) =>
		listSkillNames(directory)
			.filter((skillName) => !isExcludedSkill(skillName) && !knownSkillNames.has(skillName))
			.map((skillName) => {
				knownSkillNames.add(skillName);
				return mirrorSkill(join(directory, skillName), skillName);
			}),
	);
	console.log(`skills: ${generatedPaths.length} mirrored into ${GENERATED_SKILLS_DIRECTORY}`);
	return generatedPaths;
}

function convertCommandToSkill(commandFile: string, skillName: string): string {
	const { attributes, body } = parseMarkdownDocument(readFileSync(commandFile, "utf8"));
	const firstMeaningfulLine = body.split("\n").find((line) => line.trim() && !line.startsWith("#")) ?? skillName;
	const description = shortenDescription(toSingleLineDescription(attributes.description, firstMeaningfulLine.trim()));
	const skillBody = [
		`<!-- ${GENERATED_MARKER} Source: ${commandFile} -->`,
		"",
		`> Ported from the Claude Code slash command \`/${basename(commandFile, ".md")}\`. Wherever \`$ARGUMENTS\` appears, use the text the user typed after invoking this skill.`,
		"",
		body.trim(),
		"",
	].join("\n");
	return serializeMarkdownDocument({ name: skillName, description }, skillBody);
}

function convertCommands(knownSkillNames: Set<string>): string[] {
	const commandSources: readonly SkillSource[] = [
		{ directory: join(CLAUDE_DIRECTORY, "commands"), namePrefix: "" },
		...listInstalledClaudePlugins().flatMap((plugin) => {
			const commandsDirectory = pluginSubdirectory(plugin, "commands");
			return commandsDirectory ? [{ directory: commandsDirectory, namePrefix: `${plugin.pluginName}-` }] : [];
		}),
	];
	const generatedPaths: string[] = [];
	const skippedNames: string[] = [];
	for (const source of commandSources) {
		for (const fileName of readdirSync(source.directory).filter((name) => name.endsWith(".md"))) {
			const skillName = `${source.namePrefix}${basename(fileName, ".md")}`;
			if (isExcludedSkill(skillName)) {
				continue;
			}
			if (knownSkillNames.has(skillName)) {
				skippedNames.push(skillName);
				continue;
			}
			const skillDirectory = join(GENERATED_SKILLS_DIRECTORY, skillName);
			writeGeneratedFile(join(skillDirectory, "SKILL.md"), convertCommandToSkill(join(source.directory, fileName), skillName));
			knownSkillNames.add(skillName);
			generatedPaths.push(skillDirectory);
		}
	}
	console.log(`commands: ${generatedPaths.length} converted to skills, ${skippedNames.length} skipped (a skill with the same name exists): ${skippedNames.join(", ")}`);
	return generatedPaths;
}

export function syncSkills(): string[] {
	const knownSkillNames = new Set<string>();
	return [...mirrorSkillDirectories(knownSkillNames), ...convertCommands(knownSkillNames)];
}
