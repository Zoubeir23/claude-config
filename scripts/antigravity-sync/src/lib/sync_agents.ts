import { readdirSync, readFileSync } from "node:fs";
import { basename, join } from "node:path";
import { listInstalledClaudePlugins, pluginSubdirectory } from "./claude_plugins";
import {
	ALL_ANTIGRAVITY_TOOLS,
	ANTIGRAVITY_CONFIG_DIRECTORY,
	CLAUDE_DIRECTORY,
	CLAUDE_TO_ANTIGRAVITY_MODEL,
	CLAUDE_TO_ANTIGRAVITY_TOOLS,
	GENERATED_MARKER,
} from "./constants";
import { parseMarkdownDocument, serializeMarkdownDocument, toSingleLineDescription } from "./frontmatter";
import { writeGeneratedFile } from "./generated_manifest";

const ANTIGRAVITY_AGENTS_DIRECTORY = join(ANTIGRAVITY_CONFIG_DIRECTORY, "agents");

interface AgentConversionReport {
	readonly droppedTools: readonly string[];
}

export function parseClaudeToolList(rawTools: unknown): readonly string[] | null {
	if (Array.isArray(rawTools)) {
		return rawTools.map(String);
	}
	if (typeof rawTools === "string" && rawTools.trim() && rawTools.trim() !== "*") {
		return rawTools.split(",").map((toolName) => toolName.trim()).filter(Boolean);
	}
	return null;
}

export function mapTools(claudeTools: readonly string[] | null): { tools: readonly string[]; droppedTools: readonly string[] } {
	if (claudeTools === null) {
		return { tools: ALL_ANTIGRAVITY_TOOLS, droppedTools: [] };
	}
	const droppedTools = claudeTools.filter((toolName) => !CLAUDE_TO_ANTIGRAVITY_TOOLS[toolName]);
	const tools = [...new Set(claudeTools.flatMap((toolName) => CLAUDE_TO_ANTIGRAVITY_TOOLS[toolName] ?? []))];
	return { tools, droppedTools };
}

function convertAgent(agentFile: string, agentName: string): { content: string; report: AgentConversionReport } {
	const { attributes, body } = parseMarkdownDocument(readFileSync(agentFile, "utf8"));
	const { tools, droppedTools } = mapTools(parseClaudeToolList(attributes.tools));
	const claudeModel = typeof attributes.model === "string" ? attributes.model.toLowerCase() : "inherit";
	const content = serializeMarkdownDocument(
		{
			name: agentName,
			description: toSingleLineDescription(attributes.description, agentName),
			tools,
			model: CLAUDE_TO_ANTIGRAVITY_MODEL[claudeModel] ?? "inherit",
		},
		`<!-- ${GENERATED_MARKER} Source: ${agentFile} -->\n\n${body.trim()}\n`,
	);
	return { content, report: { droppedTools } };
}

export function syncAgents(): string[] {
	const agentSources = [
		{ directory: join(CLAUDE_DIRECTORY, "agents"), namePrefix: "" },
		...listInstalledClaudePlugins().flatMap((plugin) => {
			const agentsDirectory = pluginSubdirectory(plugin, "agents");
			return agentsDirectory ? [{ directory: agentsDirectory, namePrefix: `${plugin.pluginName}-` }] : [];
		}),
	];
	const generatedPaths: string[] = [];
	for (const source of agentSources) {
		for (const fileName of readdirSync(source.directory).filter((name) => name.endsWith(".md"))) {
			const agentName = `${source.namePrefix}${basename(fileName, ".md")}`;
			const { content, report } = convertAgent(join(source.directory, fileName), agentName);
			const targetFile = join(ANTIGRAVITY_AGENTS_DIRECTORY, `${agentName}.md`);
			writeGeneratedFile(targetFile, content);
			generatedPaths.push(targetFile);
			if (report.droppedTools.length > 0) {
				console.warn(`  agent ${agentName}: dropped unmapped tools ${report.droppedTools.join(", ")}`);
			}
		}
	}
	console.log(`agents: ${generatedPaths.length} written to ${ANTIGRAVITY_AGENTS_DIRECTORY}`);
	return generatedPaths;
}
