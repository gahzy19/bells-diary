"use client";

import Image from "next/image";
import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { savePostAction } from "@/lib/actions";
import type { Post } from "@/types/post";

function FormButtons() {
  const { pending } = useFormStatus();
  return (
    <div className="editor-actions">
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
  const [state, action] = useActionState(actionWithId, {});

  return (
    <form className="editor-form" action={action}>
      <div className="field">
        <label htmlFor="title">Title</label>
        <input id="title" name="title" defaultValue={post?.title} minLength={3} required />
        {state.fieldErrors?.title ? <p className="field-error">{state.fieldErrors.title}</p> : null}
      </div>
      <div className="editor-grid">
        <div className="field">
          <label htmlFor="category">Category</label>
          <input id="category" name="category" defaultValue={post?.category} placeholder="Personal Essay" required />
          {state.fieldErrors?.category ? <p className="field-error">{state.fieldErrors.category}</p> : null}
        </div>
        <div className="field">
          <label htmlFor="cover_image">Cover image <span>optional, max 5 MB</span></label>
          <input id="cover_image" name="cover_image" type="file" accept="image/jpeg,image/png,image/webp,image/gif" />
        </div>
      </div>
      {post?.cover_image ? (
        <div className="existing-cover">
          <Image src={post.cover_image} width={160} height={96} alt="Current cover" />
          <span>Current cover — upload a new image to replace it.</span>
        </div>
      ) : null}
      <div className="field">
        <label htmlFor="excerpt">Excerpt</label>
        <textarea id="excerpt" name="excerpt" rows={3} defaultValue={post?.excerpt} required />
        {state.fieldErrors?.excerpt ? <p className="field-error">{state.fieldErrors.excerpt}</p> : null}
      </div>
      <div className="field">
        <label htmlFor="content">Content <span>separate paragraphs with a blank line</span></label>
        <textarea id="content" name="content" rows={18} defaultValue={post?.content} required />
        {state.fieldErrors?.content ? <p className="field-error">{state.fieldErrors.content}</p> : null}
      </div>
      {state.error ? <p className="form-error" role="alert">{state.error}</p> : null}
      <div className="form-footer">
        <Link className="text-link" href="/admin/dashboard">← Back to dashboard</Link>
        <FormButtons />
      </div>
    </form>
  );
}
