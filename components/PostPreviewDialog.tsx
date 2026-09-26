"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { RichContent } from "@/components/RichContent";
import { estimateReadingTime } from "@/lib/format";

export function PostPreviewDialog({
  title,
  category,
  excerpt,
  content,
  coverImage,
  onClose,
}: {
  title: string;
  category: string;
  excerpt: string;
  content: string;
  coverImage: string | null;
  onClose: () => void;
}) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKey);
    };
  }, [onClose]);

  return (
    <div className="preview-backdrop" onMouseDown={(event) => { if (event.currentTarget === event.target) onClose(); }}>
      <section className="preview-dialog" role="dialog" aria-modal="true" aria-labelledby="preview-title">
        <header className="preview-dialog-header">
          <div><span className="preview-label">Private draft preview</span><strong>Article preview</strong></div>
          <button ref={closeButtonRef} type="button" onClick={onClose} aria-label="Close preview">×</button>
        </header>
        <div className="preview-scroll">
          <article className="article-wrap preview-article">
            <p className="eyebrow">{category || "Uncategorized"} · Draft preview · {estimateReadingTime(content)} min read</p>
            <h1 className="article-title" id="preview-title">{title || "Untitled entry"}</h1>
            <p className="article-intro">{excerpt || "Your excerpt will appear here."}</p>
            {coverImage ? <div className="article-cover preview-cover"><Image src={coverImage} alt="Draft cover preview" fill sizes="(max-width: 820px) 100vw, 780px" unoptimized={coverImage.startsWith("blob:")} /></div> : null}
            <RichContent content={content} />
          </article>
        </div>
      </section>
    </div>
  );
}
