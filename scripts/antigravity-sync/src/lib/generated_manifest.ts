import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { GENERATED_MANIFEST_FILE } from "./constants";

function readPreviouslyGeneratedPaths(): readonly string[] {
	if (!existsSync(GENERATED_MANIFEST_FILE)) {
		return [];
	}
	try {
		const parsedManifest = JSON.parse(readFileSync(GENERATED_MANIFEST_FILE, "utf8"));
		return Array.isArray(parsedManifest.generatedPaths) ? parsedManifest.generatedPaths : [];
	} catch (error) {
		throw new Error(`Corrupted manifest ${GENERATED_MANIFEST_FILE}: ${(error as Error).message}`);
	}
}

// Removes only files this sync created earlier, so deleted Claude agents/commands disappear on re-sync.
export function removePreviouslyGeneratedPaths(): number {
	const previouslyGeneratedPaths = readPreviouslyGeneratedPaths();
	for (const generatedPath of previouslyGeneratedPaths) {
		rmSync(generatedPath, { recursive: true, force: true });
	}
	return previouslyGeneratedPaths.length;
}

export function writeGeneratedFile(filePath: string, content: string, fileMode?: number): void {
	mkdirSync(dirname(filePath), { recursive: true });
	writeFileSync(filePath, content, fileMode === undefined ? undefined : { mode: fileMode });
}

export function saveGeneratedPaths(generatedPaths: readonly string[]): void {
	writeGeneratedFile(
		GENERATED_MANIFEST_FILE,
		`${JSON.stringify({ syncedAt: new Date().toISOString(), generatedPaths }, null, 2)}\n`,
	);
}
