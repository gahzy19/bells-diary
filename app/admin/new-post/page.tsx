import type { Metadata } from "next";
import { AdminHeader } from "@/components/AdminHeader";
import { PostForm } from "@/components/PostForm";

export const metadata: Metadata = { title: "New post" };

export default function NewPostPage() {
  return (
    <div className="admin-shell">
      <AdminHeader />
      <main className="editor-page">
        <div className="editor-heading"><p className="eyebrow">New entry</p><h1>Write something worth keeping.</h1></div>
        <PostForm />
      </main>
    </div>
  );
}
