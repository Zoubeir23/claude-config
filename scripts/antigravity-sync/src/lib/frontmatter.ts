export interface MarkdownDocument {
	readonly attributes: Readonly<Record<string, unknown>>;
	readonly body: string;
}

const FRONTMATTER_PATTERN = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/;

function parseAttributesLineByLine(rawFrontmatter: string): Record<string, unknown> {
	const attributes: Record<string, unknown> = {};
	for (const line of rawFrontmatter.split("\n")) {
		const match = line.match(/^([A-Za-z][\w-]*):\s*(.*)$/);
		if (match) {
			attributes[match[1]] = match[2].replace(/^["']|["']$/g, "");
		}
	}
	return attributes;
}

export function parseMarkdownDocument(fileContent: string): MarkdownDocument {
	const match = fileContent.match(FRONTMATTER_PATTERN);
	if (!match) {
		return { attributes: {}, body: fileContent };
	}
	const body = fileContent.slice(match[0].length);
	try {
		const parsedAttributes = Bun.YAML.parse(match[1]);
		if (parsedAttributes && typeof parsedAttributes === "object") {
			return { attributes: parsedAttributes as Record<string, unknown>, body };
		}
	} catch {
		// Hand-written frontmatter often contains unquoted colons; fall back to a lenient parser.
	}
	return { attributes: parseAttributesLineByLine(match[1]), body };
}

function serializeValue(value: unknown): string {
	if (Array.isArray(value)) {
		return value.length === 0 ? "[]" : `\n${value.map((item) => `  - ${JSON.stringify(item)}`).join("\n")}`;
	}
	return typeof value === "string" ? JSON.stringify(value) : String(value);
}

export function serializeMarkdownDocument(attributes: Readonly<Record<string, unknown>>, body: string): string {
	const frontmatterLines = Object.entries(attributes)
		.filter(([, value]) => value !== undefined)
		.map(([key, value]) => `${key}: ${serializeValue(value)}`);
	return `---\n${frontmatterLines.join("\n")}\n---\n\n${body.trimStart()}`;
}

export function toSingleLineDescription(rawDescription: unknown, fallback: string): string {
	const text = typeof rawDescription === "string" ? rawDescription : "";
	const firstParagraph = text.split(/\n\s*\n|<example>/)[0].replace(/\s+/g, " ").trim();
	return firstParagraph || fallback;
}
