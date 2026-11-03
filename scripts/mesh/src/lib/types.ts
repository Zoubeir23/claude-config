export const MESH_MODES = ["review", "execute", "worker"] as const;
export type MeshMode = (typeof MESH_MODES)[number];

export type RunStatus = "success" | "error" | "timeout" | "recursion_blocked" | "not_found" | "invalid_arguments";

export interface RunRequest {
	readonly mode: MeshMode;
	readonly prompt: string;
	readonly workingDirectory: string;
	readonly timeoutSeconds: number;
	readonly model: string | null;
}

export interface RunResult {
	readonly status: RunStatus;
	readonly mode: MeshMode | null;
	readonly workingDirectory: string;
	readonly response: string;
	readonly errorMessage: string | null;
	readonly exitCode: number | null;
	readonly durationMilliseconds: number;
	readonly conversationId: string | null;
	readonly totalTokens: number | null;
	readonly deniedActions: readonly string[];
	readonly logFile: string | null;
}

export interface PermissionRules {
	readonly allow: readonly string[];
	readonly deny: readonly string[];
}

// Shape of `agy -p ... --output-format json`. Headless agy reports SUCCESS even when it was denied
// a permission it needed; denied_actions is the only signal.
export interface AntigravityJsonOutput {
	conversation_id?: string;
	status?: string;
	response?: string;
	usage?: { total_tokens?: number };
	denied_actions?: Array<{ action?: string; display_name?: string }>;
}
