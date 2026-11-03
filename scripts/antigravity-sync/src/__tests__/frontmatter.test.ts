import { describe, expect, it } from "bun:test";
import { parseMarkdownDocument, serializeMarkdownDocument, toSingleLineDescription } from "../lib/frontmatter";

describe("parseMarkdownDocument", () => {
	it("parses YAML frontmatter and body", () => {
		const document = parseMarkdownDocument('---\nname: planner\ntools: ["Read", "Grep"]\n---\n\n# Body');
		expect(document.attributes.name).toBe("planner");
		expect(document.attributes.tools).toEqual(["Read", "Grep"]);
		expect(document.body.trim()).toBe("# Body");
	});

	it("falls back to a lenient parser when YAML is invalid", () => {
		const document = parseMarkdownDocument("---\nname: seo\ndescription: Audit: pages: et liens\n---\nBody");
		expect(document.attributes.name).toBe("seo");
		expect(document.attributes.description).toBe("Audit: pages: et liens");
	});

	it("returns the whole content as body without frontmatter", () => {
		expect(parseMarkdownDocument("# Title").body).toBe("# Title");
	});
});

describe("serializeMarkdownDocument", () => {
	it("round-trips through the parser", () => {
		const serialized = serializeMarkdownDocument({ name: "agent", tools: ["view_file"], model: "pro" }, "Prompt");
		const document = parseMarkdownDocument(serialized);
		expect(document.attributes).toEqual({ name: "agent", tools: ["view_file"], model: "pro" });
		expect(document.body.trim()).toBe("Prompt");
	});

	it("serializes empty lists as []", () => {
		expect(serializeMarkdownDocument({ tools: [] }, "")).toContain("tools: []");
	});
});

describe("toSingleLineDescription", () => {
	it("keeps the first paragraph and drops examples", () => {
		expect(toSingleLineDescription("Use this agent\nfor Django.\n\n<example>x</example>", "fallback")).toBe(
			"Use this agent for Django.",
		);
	});

	it("uses the fallback for missing descriptions", () => {
		expect(toSingleLineDescription(undefined, "fallback")).toBe("fallback");
	});
});
