import { describe, expect, it } from "bun:test";
import { ALL_ANTIGRAVITY_TOOLS, EXCLUDED_SKILL_NAME_PATTERNS } from "../lib/constants";
import { categorizeAgent, renderAgentMap } from "../lib/sync_agent_map";
import { mapTools, parseClaudeToolList } from "../lib/sync_agents";
import { convertClaudePermissionRule, ORCHESTRATION_COMMAND_ALLOWLIST } from "../lib/sync_permissions";
import { shortenDescription } from "../lib/sync_skills";

describe("shortenDescription", () => {
	it("keeps short descriptions unchanged", () => {
		expect(shortenDescription("Short description.")).toBe("Short description.");
	});

	it("cuts long descriptions to at most 100 characters plus ellipsis", () => {
		const shortened = shortenDescription("word ".repeat(60));
		expect(shortened.length).toBeLessThanOrEqual(103);
		expect(shortened.endsWith("...")).toBe(true);
	});

	it("prefers a sentence boundary when one exists past the midpoint", () => {
		const description = `${"a".repeat(70)}. ${"b".repeat(80)}`;
		expect(shortenDescription(description)).toBe(`${"a".repeat(70)}.`);
	});
});

describe("mapTools", () => {
	it("maps Claude tools to verified Antigravity tools", () => {
		expect(mapTools(["Read", "Bash"]).tools).toEqual(["view_file", "run_command", "command_status", "send_command_input"]);
	});

	it("reports unmapped tools instead of passing them through", () => {
		const { tools, droppedTools } = mapTools(["Read", "mcp__context7__query-docs"]);
		expect(tools).toEqual(["view_file"]);
		expect(droppedTools).toEqual(["mcp__context7__query-docs"]);
	});

	it("grants every tool when the Claude agent declares none", () => {
		expect(mapTools(null).tools).toEqual(ALL_ANTIGRAVITY_TOOLS);
	});

	it("parses comma-separated and array tool lists", () => {
		expect(parseClaudeToolList("Read, WebFetch")).toEqual(["Read", "WebFetch"]);
		expect(parseClaudeToolList(["Grep"])).toEqual(["Grep"]);
		expect(parseClaudeToolList(undefined)).toBeNull();
	});
});

describe("convertClaudePermissionRule", () => {
	it("converts prefix rules", () => {
		expect(convertClaudePermissionRule("Bash(gh api:*)")).toBe("command(gh api)");
	});

	it("converts exact rules", () => {
		expect(convertClaudePermissionRule("Bash(npm test)")).toBe("command(npm test)");
	});

	it("skips rules it cannot express", () => {
		expect(convertClaudePermissionRule("Read(~/.ssh/**)")).toBeNull();
		expect(convertClaudePermissionRule("Bash(git * --force)")).toBeNull();
	});
});

describe("skill exclusions", () => {
	const isExcluded = (name: string) => EXCLUDED_SKILL_NAME_PATTERNS.some((pattern) => pattern.test(name));

	it("never mirrors the orchestrator skill (recursion guard)", () => {
		expect(isExcluded("orchestrator")).toBe(true);
	});

	it("keeps daily-use skills", () => {
		for (const name of ["django-tdd", "seo", "golang-patterns", "security-audit", "orchestrate"]) {
			expect(isExcluded(name)).toBe(false);
		}
	});
});

describe("agent map", () => {
	it("categorizes agents by role", () => {
		expect(categorizeAgent("python-reviewer")).toBe("Reviewers (validation step)");
		expect(categorizeAgent("claude-seo:seo-technical")).toBe("SEO team");
		expect(categorizeAgent("go-build-resolver")).toBe("Build and error resolvers");
		expect(categorizeAgent("chief-of-staff")).toBe("Specialists");
	});

	it("renders both Claude and Antigravity names and escapes pipes", () => {
		const rendered = renderAgentMap([
			{ claudeName: "vercel:ai-architect", antigravityName: "vercel-ai-architect", role: "A | B", model: "inherit" },
		]);
		expect(rendered).toContain("| `vercel:ai-architect` | `vercel-ai-architect` | inherit | A \\| B |");
	});
});

describe("orchestration allowlist", () => {
	it("lets agy verify pnpm projects with short and run forms", () => {
		for (const command of ["pnpm lint", "pnpm typecheck", "pnpm test", "pnpm build", "pnpm run lint", "pnpm run typecheck", "pnpm run build"]) {
			expect(ORCHESTRATION_COMMAND_ALLOWLIST).toContain(command);
		}
	});

	it("contains no duplicates", () => {
		expect(new Set(ORCHESTRATION_COMMAND_ALLOWLIST).size).toBe(ORCHESTRATION_COMMAND_ALLOWLIST.length);
	});
});
