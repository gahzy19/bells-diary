export type ContentMark = {
  type: "bold" | "italic" | "link";
  attrs?: { href?: string };
};

export type ContentNode = {
  type: string;
  attrs?: { level?: number };
  content?: ContentNode[];
  marks?: ContentMark[];
  text?: string;
};

export type ContentDocument = ContentNode & { type: "doc" };

const TOP_LEVEL_TYPES = new Set(["paragraph", "heading", "bulletList", "orderedList", "blockquote"]);

const CHILD_TYPES: Record<string, Set<string>> = {
  doc: TOP_LEVEL_TYPES,
  paragraph: new Set(["text", "hardBreak"]),
  heading: new Set(["text", "hardBreak"]),
  bulletList: new Set(["listItem"]),
  orderedList: new Set(["listItem"]),
  listItem: TOP_LEVEL_TYPES,
  blockquote: TOP_LEVEL_TYPES,
};

export function safeLinkHref(value: unknown) {
  if (typeof value !== "string") return null;
  const href = value.trim();
  if (!href) return null;
  if (href.startsWith("/") || href.startsWith("#")) return href;

  try {
    const url = new URL(href);
    return ["http:", "https:", "mailto:"].includes(url.protocol) ? url.toString() : null;
  } catch {
    return null;
  }
}

export function normalizeLinkInput(value: string) {
  const input = value.trim();
  if (!input) return "";
  if (input.startsWith("/") || input.startsWith("#") || input.startsWith("mailto:")) return input;
  const withProtocol = /^[a-z][a-z0-9+.-]*:/i.test(input) ? input : `https://${input}`;
  return safeLinkHref(withProtocol) ?? "";
}

function sanitizeMarks(value: unknown): ContentMark[] | undefined {
  if (!Array.isArray(value)) return undefined;

  const marks = value.flatMap<ContentMark>((mark) => {
    if (!mark || typeof mark !== "object" || !("type" in mark)) return [];
    if (mark.type === "bold" || mark.type === "italic") return [{ type: mark.type }];
    if (mark.type === "link") {
      const attrs = "attrs" in mark && mark.attrs && typeof mark.attrs === "object" ? mark.attrs : {};
      const href = safeLinkHref("href" in attrs ? attrs.href : null);
      return href ? [{ type: "link", attrs: { href } }] : [];
    }
    return [];
  });

  return marks.length ? marks : undefined;
}

function sanitizeNode(value: unknown, parentType: string | null = null, depth = 0): ContentNode | null {
  if (depth > 20 || !value || typeof value !== "object" || !("type" in value)) return null;
  const node = value as Record<string, unknown>;
  const type = typeof node.type === "string" ? node.type : "";
  if (parentType && !CHILD_TYPES[parentType]?.has(type)) return null;

  if (type === "text") {
    const text = typeof node.text === "string" ? node.text : "";
    if (!text) return null;
    return { type: "text", text, marks: sanitizeMarks(node.marks) };
  }

  if (type === "hardBreak") return { type: "hardBreak" };
  if (!(type in CHILD_TYPES)) return null;

  const children = Array.isArray(node.content)
    ? node.content
        .map((child) => sanitizeNode(child, type, depth + 1))
        .filter((child): child is ContentNode => Boolean(child))
    : [];

  if (type === "heading") {
    const attrs = node.attrs && typeof node.attrs === "object" ? node.attrs as Record<string, unknown> : {};
    const level = attrs.level === 3 ? 3 : 2;
    return { type, attrs: { level }, content: children };
  }

  if (type === "listItem" && children[0]?.type !== "paragraph") {
    children.unshift({ type: "paragraph", content: [] });
  }

  return { type, content: children };
}

function paragraphFromLines(value: string): ContentNode {
  const lines = value.split("\n");
  const content: ContentNode[] = [];
  lines.forEach((line, index) => {
    if (line) content.push({ type: "text", text: line });
    if (index < lines.length - 1) content.push({ type: "hardBreak" });
  });
  return { type: "paragraph", content };
}

export function legacyTextToDocument(value: string): ContentDocument {
  const normalized = value.replace(/\r\n?/g, "\n").trim();
  const paragraphs = normalized ? normalized.split(/\n\s*\n/) : [""];
  return { type: "doc", content: paragraphs.map(paragraphFromLines) };
}

export function sanitizeContentDocument(value: unknown): ContentDocument {
  const sanitized = sanitizeNode(value);
  if (!sanitized || sanitized.type !== "doc") return legacyTextToDocument("");
  const content = sanitized.content ?? [];
  return { type: "doc", content: content.length ? content : [{ type: "paragraph", content: [] }] };
}

export function parseStoredContent(value: string): ContentDocument {
  const trimmed = value.trim();
  if (trimmed.startsWith("{")) {
    try {
      const parsed = JSON.parse(trimmed) as unknown;
      if (parsed && typeof parsed === "object" && "type" in parsed && parsed.type === "doc") {
        return sanitizeContentDocument(parsed);
      }
    } catch {
      // Existing plain text can begin with a brace; fall through to the legacy adapter.
    }
  }
  return legacyTextToDocument(value);
}

export function serializeContentForStorage(value: string) {
  return JSON.stringify(parseStoredContent(value));
}

function nodeToText(node: ContentNode): string {
  if (node.type === "text") return node.text ?? "";
  if (node.type === "hardBreak") return "\n";

  const childText = (node.content ?? []).map(nodeToText).join("");
  if (["paragraph", "heading", "listItem", "blockquote"].includes(node.type)) return `${childText}\n`;
  return childText;
}

export function contentToPlainText(value: string | ContentDocument) {
  const document = typeof value === "string" ? parseStoredContent(value) : sanitizeContentDocument(value);
  return nodeToText(document).replace(/\n{3,}/g, "\n\n").trim();
}

export function countContentWords(value: string | ContentDocument) {
  const text = contentToPlainText(value);
  return text ? text.split(/\s+/).filter(Boolean).length : 0;
}
