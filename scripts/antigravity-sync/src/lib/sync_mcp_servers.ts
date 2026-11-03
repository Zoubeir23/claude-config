import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { ANTIGRAVITY_CONFIG_DIRECTORY, CLAUDE_GLOBAL_STATE_FILE } from "./constants";
import { writeGeneratedFile } from "./generated_manifest";

const ANTIGRAVITY_MCP_CONFIG_FILE = join(ANTIGRAVITY_CONFIG_DIRECTORY, "mcp_config.json");
const OWNER_READ_WRITE_ONLY = 0o600;

interface ClaudeMcpServer {
	type?: "stdio" | "http" | "sse";
	command?: string;
	args?: string[];
	env?: Record<string, string>;
	url?: string;
	headers?: Record<string, string>;
}

type AntigravityMcpServer =
	| { command: string; args?: string[]; env?: Record<string, string> }
	| { url: string; headers?: Record<string, string> };

function readJsonObject(filePath: string): Record<string, unknown> {
	if (!existsSync(filePath)) {
		return {};
	}
	const rawContent = readFileSync(filePath, "utf8").trim();
	if (!rawContent) {
		return {};
	}
	try {
		return JSON.parse(rawContent);
	} catch (error) {
		throw new Error(`Invalid JSON in ${filePath}: ${(error as Error).message}`);
	}
}

function convertServer(serverName: string, claudeServer: ClaudeMcpServer): AntigravityMcpServer | null {
	if (claudeServer.command) {
		const hasEnvironment = claudeServer.env && Object.keys(claudeServer.env).length > 0;
		return { command: claudeServer.command, args: claudeServer.args ?? [], ...(hasEnvironment ? { env: claudeServer.env } : {}) };
	}
	if (claudeServer.url) {
		if (claudeServer.type === "sse") {
			console.warn(`  mcp ${serverName}: legacy SSE transport is unsupported by Antigravity; wrap it with mcp-remote.`);
		}
		return { url: claudeServer.url, ...(claudeServer.headers ? { headers: claudeServer.headers } : {}) };
	}
	console.warn(`  mcp ${serverName}: skipped, neither command nor url defined.`);
	return null;
}

export function syncMcpServers(): string[] {
	const claudeServers = (readJsonObject(CLAUDE_GLOBAL_STATE_FILE).mcpServers ?? {}) as Record<string, ClaudeMcpServer>;
	const existingConfig = readJsonObject(ANTIGRAVITY_MCP_CONFIG_FILE);
	const convertedServers = Object.fromEntries(
		Object.entries(claudeServers).flatMap(([serverName, claudeServer]) => {
			const convertedServer = convertServer(serverName, claudeServer);
			return convertedServer ? [[serverName, convertedServer]] : [];
		}),
	);
	const mergedConfig = {
		...existingConfig,
		mcpServers: { ...((existingConfig.mcpServers as object) ?? {}), ...convertedServers },
	};
	writeGeneratedFile(ANTIGRAVITY_MCP_CONFIG_FILE, `${JSON.stringify(mergedConfig, null, 2)}\n`, OWNER_READ_WRITE_ONLY);
	console.log(`mcp: ${Object.keys(convertedServers).join(", ")} -> ${ANTIGRAVITY_MCP_CONFIG_FILE} (mode 600, contains secrets)`);
	return [];
}
