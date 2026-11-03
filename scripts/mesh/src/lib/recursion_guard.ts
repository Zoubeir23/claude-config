// agy inherits the Claude config through the sync, so a delegated agy session could call the runner
// again. Each hop increments MESH_DEPTH; any nested call is refused.
export const MESH_DEPTH_VARIABLE = "MESH_DEPTH";
const MAXIMUM_MESH_DEPTH = 1;

export function readMeshDepth(environment: Readonly<Record<string, string | undefined>>): number {
	const parsedDepth = Number.parseInt(environment[MESH_DEPTH_VARIABLE] ?? "0", 10);
	return Number.isFinite(parsedDepth) && parsedDepth > 0 ? parsedDepth : 0;
}

export function isNestedMeshCall(environment: Readonly<Record<string, string | undefined>>): boolean {
	return readMeshDepth(environment) >= MAXIMUM_MESH_DEPTH;
}

export function buildChildEnvironment(
	environment: Readonly<Record<string, string | undefined>>,
): Record<string, string | undefined> {
	return { ...environment, [MESH_DEPTH_VARIABLE]: String(readMeshDepth(environment) + 1) };
}
