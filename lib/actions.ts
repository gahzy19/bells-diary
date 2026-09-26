"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/config";
import { contentToPlainText, serializeContentForStorage } from "@/lib/content";
import { slugify } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import type { ActionState, Post, PostStatus } from "@/types/post";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export async function loginAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  if (!isSupabaseConfigured()) {
    return { error: "Connect Supabase first by adding the two environment variables." };
  }

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return { error: "Enter both email and password." };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: "That email and password combination was not accepted." };

  redirect("/admin/dashboard");
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

async function requireUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");
  return supabase;
}

function validatePost(formData: FormData) {
  const content = serializeContentForStorage(String(formData.get("content") ?? ""));
  const values = {
    title: String(formData.get("title") ?? "").trim(),
    category: String(formData.get("category") ?? "").trim(),
    excerpt: String(formData.get("excerpt") ?? "").trim(),
    content,
  };
  const fieldErrors: Record<string, string> = {};

  if (values.title.length < 3) fieldErrors.title = "Use at least 3 characters.";
  if (values.category.length < 2) fieldErrors.category = "Add a category.";
  if (values.excerpt.length < 10) fieldErrors.excerpt = "Write a short introduction.";
  if (contentToPlainText(values.content).length < 20) fieldErrors.content = "The post needs a little more content.";

  return { values, fieldErrors };
}

async function uniqueSlug(
  title: string,
  currentId?: string,
): Promise<string> {
  const supabase = await createClient();
  const base = slugify(title) || "untitled-entry";
  let candidate = base;
  let suffix = 2;

  while (true) {
    let query = supabase.from("posts").select("id").eq("slug", candidate);
    if (currentId) query = query.neq("id", currentId);
    const { data, error } = await query.maybeSingle();
    if (error) throw error;
    if (!data) return candidate;
    candidate = `${base}-${suffix++}`;
  }
}

async function uploadCover(file: File) {
  if (!IMAGE_TYPES.includes(file.type)) throw new Error("Cover image must be JPG, PNG, WebP, or GIF.");
  if (file.size > MAX_IMAGE_SIZE) throw new Error("Cover image must be smaller than 5 MB.");

  const supabase = await createClient();
  const extension = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
  const path = `${crypto.randomUUID()}.${extension}`;
  const { error } = await supabase.storage.from("post-images").upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });
  if (error) throw error;

  return supabase.storage.from("post-images").getPublicUrl(path).data.publicUrl;
}

function storagePathFromUrl(url: string | null) {
  if (!url) return null;
  const marker = "/storage/v1/object/public/post-images/";
  const index = url.indexOf(marker);
  return index === -1 ? null : decodeURIComponent(url.slice(index + marker.length));
}

export async function savePostAction(
  postId: string | null,
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { values, fieldErrors } = validatePost(formData);
  if (Object.keys(fieldErrors).length) return { fieldErrors };

  const intent = formData.get("intent") === "published" ? "published" : "draft";
  const status = intent as PostStatus;
  const supabase = await requireUser();
  const cover = formData.get("cover_image");

  let existing: Post | null = null;
  if (postId) {
    const { data, error } = await supabase.from("posts").select("*").eq("id", postId).single();
    if (error) return { error: error.message };
    existing = data as Post;
  }

  try {
    const slug = await uniqueSlug(values.title, postId ?? undefined);
    let coverImage = existing?.cover_image ?? null;
    if (cover instanceof File && cover.size > 0) coverImage = await uploadCover(cover);

    const payload = {
      ...values,
      slug,
      cover_image: coverImage,
      status,
      published_at:
        status === "published" ? existing?.published_at ?? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    };

    const result = postId
      ? await supabase.from("posts").update(payload).eq("id", postId)
      : await supabase.from("posts").insert(payload);

    if (result.error) return { error: result.error.message };

    if (existing?.cover_image && coverImage !== existing.cover_image) {
      const oldPath = storagePathFromUrl(existing.cover_image);
      if (oldPath) await supabase.storage.from("post-images").remove([oldPath]);
    }
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Could not save this post." };
  }

  revalidatePath("/");
  revalidatePath("/writings");
  revalidatePath("/post", "layout");
  revalidatePath("/admin/dashboard");
  redirect("/admin/dashboard?saved=1");
}

export async function deletePostAction(postId: string) {
  const supabase = await requireUser();
  const { data } = await supabase.from("posts").select("cover_image").eq("id", postId).maybeSingle();
  const { error } = await supabase.from("posts").delete().eq("id", postId);
  if (error) redirect(`/admin/dashboard?error=${encodeURIComponent(error.message)}`);

  const storagePath = storagePathFromUrl(data?.cover_image ?? null);
  if (storagePath) await supabase.storage.from("post-images").remove([storagePath]);

  revalidatePath("/");
  revalidatePath("/writings");
  revalidatePath("/admin/dashboard");
  redirect("/admin/dashboard?deleted=1");
}
