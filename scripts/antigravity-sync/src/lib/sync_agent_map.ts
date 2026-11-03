import { readdirSync, readFileSync } from "node:fs";
import { basename, join } from "node:path";
import { listInstalledClaudePlugins, pluginSubdirectory } from "./claude_plugins";
import { CLAUDE_DIRECTORY, GENERATED_MARKER } from "./constants";
import { parseMarkdownDocument, toSingleLineDescription } from "./frontmatter";
import { writeGeneratedFile } from "./generated_manifest";

const AGENT_MAP_FILE = join(CLAUDE_DIRECTORY, "skills/orchestrator/references/agents-map.md");
const MAXIMUM_ROLE_LENGTH = 140;

export interface AgentMapEntry {
	readonly claudeName: string;
	readonly antigravityName: string;
	readonly role: string;
	readonly model: string;
}

const AGENT_CATEGORIES: ReadonlyArray<{ title: string; matches: (agentName: string) => boolean }> = [
	{ title: "Planning and architecture", matches: (name) => /^(planner|architect|blueprint)$/.test(name) },
	{ title: "Reviewers (validation step)", matches: (name) => /reviewer$/.test(name) },
	{ title: "Build and error resolvers", matches: (name) => /build-(error-)?resolver$/.test(name) },
	{ title: "Testing", matches: (name) => /^(tdd-guide|e2e-runner)$/.test(name) },
	{ title: "SEO team", matches: (name) => /(^|-)seo-/.test(name) || name.startsWith("seo") },
	{ title: "Vercel", matches: (name) => name.startsWith("vercel") },
	{ title: "Documentation and research", matches: (name) => /^(doc-updater|docs-lookup|explore-.*|websearch)$/.test(name) },
];

export function categorizeAgent(agentName: string): string {
	const leafName = agentName.split(":").pop() ?? agentName;
	return AGENT_CATEGORIES.find((category) => category.matches(leafName))?.title ?? "Specialists";
}

function readAgentEntries(directory: string, pluginName: string | null): AgentMapEntry[] {
	return readdirSync(directory)
		.filter((fileName) => fileName.endsWith(".md"))
		.map((fileName) => {
			const agentName = basename(fileName, ".md");
			const { attributes } = parseMarkdownDocument(readFileSync(join(directory, fileName), "utf8"));
			const role = toSingleLineDescription(attributes.description, agentName);
			return {
				claudeName: pluginName ? `${pluginName}:${agentName}` : agentName,
				antigravityName: pluginName ? `${pluginName}-${agentName}` : agentName,
				role: role.length > MAXIMUM_ROLE_LENGTH ? `${role.slice(0, MAXIMUM_ROLE_LENGTH).trimEnd()}...` : role,
				model: typeof attributes.model === "string" ? attributes.model : "inherit",
			};
		});
}

export function renderAgentMap(entries: readonly AgentMapEntry[]): string {
	const categoryTitles = [...AGENT_CATEGORIES.map((category) => category.title), "Specialists"];
	const sections = categoryTitles.flatMap((title) => {
		const categoryEntries = entries.filter((entry) => categorizeAgent(entry.claudeName) === title);
		if (categoryEntries.length === 0) {
			return [];
		}
		const rows = categoryEntries.map(
			(entry) => `| \`${entry.claudeName}\` | \`${entry.antigravityName}\` | ${entry.model} | ${entry.role.replace(/\|/g, "\\|")} |`,
		);
		return [`## ${title}`, "", "| Claude Code | Antigravity | Model | Role |", "|---|---|---|---|", ...rows, ""];
	});
	return [
		`<!-- ${GENERATED_MARKER} -->`,
		"# Agent map",
		"",
		`${entries.length} global agents. Project agents in \`./.claude/agents/\` are not listed: run \`ls .claude/agents\` in the current project.`,
		"",
		...sections,
	].join("\n");
}

export function syncAgentMap(): string[] {
	const entries = [
		...readAgentEntries(join(CLAUDE_DIRECTORY, "agents"), null),
		...listInstalledClaudePlugins().flatMap((plugin) => {
			const agentsDirectory = pluginSubdirectory(plugin, "agents");
			return agentsDirectory ? readAgentEntries(agentsDirectory, plugin.pluginName) : [];
		}),
	].sort((first, second) => first.claudeName.localeCompare(second.claudeName));
	writeGeneratedFile(AGENT_MAP_FILE, renderAgentMap(entries));
	console.log(`agent map: ${entries.length} agents -> ${AGENT_MAP_FILE}`);
	return [];
}
