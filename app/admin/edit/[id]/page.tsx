import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdminHeader } from "@/components/AdminHeader";
import { PostForm } from "@/components/PostForm";
import { getPostById } from "@/lib/posts";

export const metadata: Metadata = { title: "Edit post" };
export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export default async function EditPostPage({ params }: Props) {
  const { id } = await params;
  const post = await getPostById(id);
  if (!post) notFound();

  return (
    <div className="admin-shell">
      <AdminHeader />
      <main className="editor-page">
        <div className="editor-heading"><p className="eyebrow">Edit entry</p><h1>{post.title}</h1></div>
        <PostForm post={post} />
      </main>
    </div>
  );
}
