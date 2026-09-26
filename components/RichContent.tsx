import type { ReactNode } from "react";
import { parseStoredContent, safeLinkHref, type ContentMark, type ContentNode } from "@/lib/content";

function applyMarks(content: ReactNode, marks: ContentMark[] = [], key: string): ReactNode {
  return marks.reduce<ReactNode>((child, mark, index) => {
    if (mark.type === "bold") return <strong key={`${key}-bold-${index}`}>{child}</strong>;
    if (mark.type === "italic") return <em key={`${key}-italic-${index}`}>{child}</em>;
    if (mark.type === "link") {
      const href = safeLinkHref(mark.attrs?.href);
      if (!href) return child;
      const external = href.startsWith("http://") || href.startsWith("https://");
      return <a key={`${key}-link-${index}`} href={href} target={external ? "_blank" : undefined} rel={external ? "noreferrer noopener" : undefined}>{child}</a>;
    }
    return child;
  }, content);
}

function renderNode(node: ContentNode, key: string): ReactNode {
  if (node.type === "text") return applyMarks(node.text ?? "", node.marks, key);
  if (node.type === "hardBreak") return <br key={key} />;

  const children = (node.content ?? []).map((child, index) => renderNode(child, `${key}-${index}`));
  switch (node.type) {
    case "paragraph": return <p key={key}>{children}</p>;
    case "heading": return node.attrs?.level === 3 ? <h3 key={key}>{children}</h3> : <h2 key={key}>{children}</h2>;
    case "bulletList": return <ul key={key}>{children}</ul>;
    case "orderedList": return <ol key={key}>{children}</ol>;
    case "listItem": return <li key={key}>{children}</li>;
    case "blockquote": return <blockquote key={key}>{children}</blockquote>;
    default: return <span key={key}>{children}</span>;
  }
}

export function RichContent({ content, className = "article-content" }: { content: string; className?: string }) {
  const document = parseStoredContent(content);
  return <div className={className}>{(document.content ?? []).map((node, index) => renderNode(node, `content-${index}`))}</div>;
}
