import { isSupabaseConfigured } from "@/lib/config";
import { seedPosts } from "@/lib/seed-posts";
import { createClient } from "@/lib/supabase/server";
import type { Post } from "@/types/post";

export async function getPublishedPosts(limit?: number): Promise<Post[]> {
  if (!isSupabaseConfigured()) return limit ? seedPosts.slice(0, limit) : seedPosts;

  try {
    const supabase = await createClient();
    let query = supabase
      .from("posts")
      .select("*")
      .eq("status", "published")
      .order("published_at", { ascending: false });

    if (limit) query = query.limit(limit);
    const { data, error } = await query;
    if (error) throw error;
    return (data ?? []) as Post[];
  } catch (error) {
    console.error("Could not load published posts:", error);
    return limit ? seedPosts.slice(0, limit) : seedPosts;
  }
}

export async function getPublishedPostBySlug(slug: string): Promise<Post | null> {
  if (!isSupabaseConfigured()) {
    return seedPosts.find((post) => post.slug === slug) ?? null;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (error) {
    console.error("Could not load post:", error);
    return null;
  }

  return data as Post | null;
}

export async function getAllPosts(): Promise<Post[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .order("updated_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as Post[];
}

export async function getPostById(id: string): Promise<Post | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data as Post | null;
}
