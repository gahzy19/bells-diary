"use client";

import Image from "next/image";
import Link from "next/link";
import { useActionState, useCallback, useEffect, useRef, useState } from "react";
import { PostPreviewDialog } from "@/components/PostPreviewDialog";
import { RichTextEditor } from "@/components/RichTextEditor";
import { savePostAction } from "@/lib/actions";
import { countContentWords, serializeContentForStorage } from "@/lib/content";
import { estimateReadingTime } from "@/lib/format";
import type { Post } from "@/types/post";

function FormButtons({ pending, onPreview }: { pending: boolean; onPreview: () => void }) {
  return (
    <div className="editor-actions">
      <button className="btn btn-preview" type="button" onClick={onPreview} disabled={pending}>Preview</button>
      <button className="btn btn-ghost" type="submit" name="intent" value="draft" disabled={pending}>
        {pending ? "Saving…" : "Save draft"}
      </button>
      <button className="btn btn-dark" type="submit" name="intent" value="published" disabled={pending}>
        {pending ? "Publishing…" : "Publish"}
      </button>
    </div>
  );
}

export function PostForm({ post }: { post?: Post }) {
  const actionWithId = savePostAction.bind(null, post?.id ?? null);
  const [state, action, pending] = useActionState(actionWithId, {});
  const [title, setTitle] = useState(post?.title ?? "");
  const [category, setCategory] = useState(post?.category ?? "");
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? "");
  const [content, setContent] = useState(() => serializeContentForStorage(post?.content ?? ""));
  const [coverPreview, setCoverPreview] = useState<string | null>(post?.cover_image ?? null);
  const [newCoverSelected, setNewCoverSelected] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [version, setVersion] = useState(0);
  const [errorVersion, setErrorVersion] = useState<number | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const submittingRef = useRef(false);
  const versionRef = useRef(0);
  const objectUrlRef = useRef<string | null>(null);

  const markDirty = useCallback(() => {
    versionRef.current += 1;
    setVersion(versionRef.current);
    setDirty(true);
  }, []);

  const handleContentChange = useCallback((nextContent: string) => {
    setContent(nextContent);
    markDirty();
  }, [markDirty]);

  const closePreview = useCallback(() => setPreviewOpen(false), []);

  useEffect(() => {
    if (state.error || state.fieldErrors) {
      submittingRef.current = false;
      setErrorVersion(versionRef.current);
    }
  }, [state]);

  useEffect(() => {
    const beforeUnload = (event: BeforeUnloadEvent) => {
      if (!dirty || submittingRef.current) return;
      event.preventDefault();
      event.returnValue = "";
    };
    const guardLinks = (event: MouseEvent) => {
      if (!dirty || submittingRef.current || event.defaultPrevented) return;
      const element = event.target instanceof Element ? event.target.closest("a") : null;
      if (element && !window.confirm("You have unsaved changes. Leave this page anyway?")) event.preventDefault();
    };
    const guardOtherForms = (event: SubmitEvent) => {
      if (!dirty || submittingRef.current || event.target === formRef.current) return;
      if (!window.confirm("You have unsaved changes. Leave this page anyway?")) event.preventDefault();
    };

    window.addEventListener("beforeunload", beforeUnload);
    document.addEventListener("click", guardLinks, true);
    document.addEventListener("submit", guardOtherForms, true);
    return () => {
      window.removeEventListener("beforeunload", beforeUnload);
      document.removeEventListener("click", guardLinks, true);
      document.removeEventListener("submit", guardOtherForms, true);
    };
  }, [dirty]);

  useEffect(() => () => {
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
  }, []);

  const handleCoverChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    const file = event.target.files?.[0];
    objectUrlRef.current = file ? URL.createObjectURL(file) : null;
    setCoverPreview(objectUrlRef.current ?? post?.cover_image ?? null);
    setNewCoverSelected(Boolean(file));
    markDirty();
  };

  const wordCount = countContentWords(content);
  const readingTime = estimateReadingTime(content);
  const hasCurrentError = errorVersion === version && Boolean(state.error || state.fieldErrors);
  const saveState = pending
    ? { label: "Saving…", className: "saving" }
    : hasCurrentError
      ? { label: "Error saving", className: "error" }
      : dirty
        ? { label: "Unsaved changes", className: "unsaved" }
        : post
          ? { label: "Saved", className: "saved" }
          : { label: "Not saved", className: "idle" };

  return (
    <>
      <form
        ref={formRef}
        className="editor-form"
        action={action}
        onSubmit={() => { submittingRef.current = true; }}
      >
        <div className="editor-status-row" aria-live="polite">
          <span className={`save-indicator ${saveState.className}`}><i aria-hidden="true" />{saveState.label}</span>
          <span>{wordCount.toLocaleString()} words</span>
          <span>{readingTime} min read</span>
        </div>

        <div className="field">
          <label htmlFor="title">Title</label>
          <input id="title" name="title" value={title} minLength={3} required onChange={(event) => { setTitle(event.target.value); markDirty(); }} />
          {state.fieldErrors?.title ? <p className="field-error">{state.fieldErrors.title}</p> : null}
        </div>
        <div className="editor-grid">
          <div className="field">
            <label htmlFor="category">Category</label>
            <input id="category" name="category" value={category} placeholder="Personal Essay" required onChange={(event) => { setCategory(event.target.value); markDirty(); }} />
            {state.fieldErrors?.category ? <p className="field-error">{state.fieldErrors.category}</p> : null}
          </div>
          <div className="field">
            <label htmlFor="cover_image">Cover image <span>optional, max 5 MB</span></label>
            <input id="cover_image" name="cover_image" type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={handleCoverChange} />
          </div>
        </div>
        {coverPreview ? (
          <div className="existing-cover">
            <Image src={coverPreview} width={160} height={96} alt="Current cover" unoptimized={coverPreview.startsWith("blob:")} />
            <span>{newCoverSelected ? "New cover selected — save to upload it." : "Current cover — upload a new image to replace it."}</span>
          </div>
        ) : null}
        <div className="field">
          <label htmlFor="excerpt">Excerpt</label>
          <textarea id="excerpt" name="excerpt" rows={3} value={excerpt} required onChange={(event) => { setExcerpt(event.target.value); markDirty(); }} />
          {state.fieldErrors?.excerpt ? <p className="field-error">{state.fieldErrors.excerpt}</p> : null}
        </div>
        <div className="field content-field">
          <div className="content-label-row">
            <label>Content</label>
            <span>Formatting is preserved in the public article.</span>
          </div>
          <input type="hidden" name="content" value={content} />
          <RichTextEditor initialContent={content} onChange={handleContentChange} />
          {state.fieldErrors?.content ? <p className="field-error">{state.fieldErrors.content}</p> : null}
        </div>
        {state.error ? <p className="form-error" role="alert">{state.error}</p> : null}
        <div className="form-footer">
          <Link className="text-link" href="/admin/dashboard">← Back to dashboard</Link>
          <FormButtons pending={pending} onPreview={() => setPreviewOpen(true)} />
        </div>
      </form>

      {previewOpen ? (
        <PostPreviewDialog
          title={title}
          category={category}
          excerpt={excerpt}
          content={content}
          coverImage={coverPreview}
          onClose={closePreview}
        />
      ) : null}
    </>
  );
}
