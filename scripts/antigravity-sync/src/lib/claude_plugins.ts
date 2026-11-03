import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { CLAUDE_INSTALLED_PLUGINS_FILE } from "./constants";

export interface InstalledClaudePlugin {
	readonly pluginName: string;
	readonly installPath: string;
}

interface InstalledPluginsFile {
	plugins?: Record<string, Array<{ installPath?: string }>>;
}

export function listInstalledClaudePlugins(): readonly InstalledClaudePlugin[] {
	if (!existsSync(CLAUDE_INSTALLED_PLUGINS_FILE)) {
		return [];
	}
	const installedPlugins: InstalledPluginsFile = JSON.parse(readFileSync(CLAUDE_INSTALLED_PLUGINS_FILE, "utf8"));
	return Object.entries(installedPlugins.plugins ?? {}).flatMap(([pluginKey, installations]) => {
		const installPath = installations[0]?.installPath;
		if (!installPath || !existsSync(installPath)) {
			return [];
		}
		return [{ pluginName: pluginKey.split("@")[0], installPath }];
	});
}

export function pluginSubdirectory(plugin: InstalledClaudePlugin, subdirectoryName: string): string | null {
	const subdirectoryPath = join(plugin.installPath, subdirectoryName);
	return existsSync(subdirectoryPath) ? subdirectoryPath : null;
}
