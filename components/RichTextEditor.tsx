"use client";

import LinkExtension from "@tiptap/extension-link";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useState } from "react";
import { normalizeLinkInput, parseStoredContent, sanitizeContentDocument } from "@/lib/content";

type ToolButtonProps = {
  label: string;
  title: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  italic?: boolean;
};

function ToolButton({ label, title, active, disabled, onClick, italic }: ToolButtonProps) {
  return (
    <button
      className={`editor-tool ${active ? "active" : ""} ${italic ? "italic" : ""}`}
      type="button"
      title={title}
      aria-label={title}
      aria-pressed={active}
      disabled={disabled}
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
    >
      {label}
    </button>
  );
}

export function RichTextEditor({
  initialContent,
  onChange,
}: {
  initialContent: string;
  onChange: (content: string) => void;
}) {
  const [linkError, setLinkError] = useState("");
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        code: false,
        codeBlock: false,
        horizontalRule: false,
        link: false,
        strike: false,
      }),
      LinkExtension.configure({
        openOnClick: false,
        autolink: true,
        defaultProtocol: "https",
        protocols: ["http", "https", "mailto"],
      }),
    ],
    content: parseStoredContent(initialContent),
    editorProps: {
      attributes: {
        class: "tiptap-editor",
        spellcheck: "true",
        autocapitalize: "sentences",
        "aria-label": "Article content",
      },
    },
    onUpdate: ({ editor: currentEditor }) => {
      const safeDocument = sanitizeContentDocument(currentEditor.getJSON());
      onChange(JSON.stringify(safeDocument));
    },
  }, [onChange]);

  if (!editor) {
    return <div className="editor-loading" role="status"><span />Loading editor…</div>;
  }

  const setLink = () => {
    const previous = editor.getAttributes("link").href as string | undefined;
    const input = window.prompt("Paste a link. Leave empty to remove it.", previous ?? "https://");
    if (input === null) return;
    if (!input.trim()) {
      setLinkError("");
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    const href = normalizeLinkInput(input);
    if (!href) {
      setLinkError("Use an http, https, email, page, or #anchor link.");
      return;
    }
    setLinkError("");
    editor.chain().focus().extendMarkRange("link").setLink({ href }).run();
  };

  return (
    <div className="rich-editor-shell">
      <div className="rich-toolbar" role="toolbar" aria-label="Text formatting">
        <ToolButton label="P" title="Paragraph" active={editor.isActive("paragraph")} onClick={() => editor.chain().focus().setParagraph().run()} />
        <ToolButton label="B" title="Bold" active={editor.isActive("bold")} disabled={!editor.can().chain().focus().toggleBold().run()} onClick={() => editor.chain().focus().toggleBold().run()} />
        <ToolButton label="I" title="Italic" italic active={editor.isActive("italic")} disabled={!editor.can().chain().focus().toggleItalic().run()} onClick={() => editor.chain().focus().toggleItalic().run()} />
        <ToolButton label="H2" title="Heading 2" active={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} />
        <ToolButton label="H3" title="Heading 3" active={editor.isActive("heading", { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} />
        <span className="toolbar-divider" aria-hidden="true" />
        <ToolButton label="• List" title="Bullet list" active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()} />
        <ToolButton label="1. List" title="Numbered list" active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()} />
        <ToolButton label="“”" title="Blockquote" active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()} />
        <ToolButton label="Link" title="Add or edit link" active={editor.isActive("link")} onClick={setLink} />
        <span className="toolbar-divider" aria-hidden="true" />
        <ToolButton label="↶" title="Undo" disabled={!editor.can().chain().focus().undo().run()} onClick={() => editor.chain().focus().undo().run()} />
        <ToolButton label="↷" title="Redo" disabled={!editor.can().chain().focus().redo().run()} onClick={() => editor.chain().focus().redo().run()} />
      </div>
      {linkError ? <p className="toolbar-error" role="alert">{linkError}</p> : null}
      <EditorContent editor={editor} />
    </div>
  );
}
