import type { Metadata } from "next";
import Link from "next/link";
import { AdminHeader } from "@/components/AdminHeader";
import { DeletePostButton } from "@/components/DeletePostButton";
import { formatPostDate } from "@/lib/format";
import { getAllPosts } from "@/lib/posts";

export const metadata: Metadata = { title: "Dashboard" };
export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ saved?: string; deleted?: string; error?: string }> };

export default async function DashboardPage({ searchParams }: Props) {
  const [posts, params] = await Promise.all([getAllPosts(), searchParams]);
  return (
    <div className="admin-shell">
      <AdminHeader />
      <main className="admin-main">
        <div className="dashboard-head">
          <div><p className="eyebrow">Your writing desk</p><h1>Bell’s Diary Dashboard</h1><p>Draft quietly. Publish when the words feel ready.</p></div>
          <Link className="btn btn-dark" href="/admin/new-post">+ New post</Link>
        </div>
        {params.saved ? <p className="notice success" role="status">Your post has been saved.</p> : null}
        {params.deleted ? <p className="notice success" role="status">The post has been deleted.</p> : null}
        {params.error ? <p className="notice error" role="alert">{params.error}</p> : null}

        {posts.length ? (
          <div className="post-table-wrap">
            <table className="post-table">
              <thead><tr><th>Title</th><th>Category</th><th>Status</th><th>Date</th><th><span className="sr-only">Actions</span></th></tr></thead>
              <tbody>
                {posts.map((post) => (
                  <tr key={post.id}>
                    <td data-label="Title"><strong>{post.title}</strong></td>
                    <td data-label="Category">{post.category}</td>
                    <td data-label="Status"><span className={`status ${post.status}`}>{post.status}</span></td>
                    <td data-label="Date">{formatPostDate(post.published_at ?? post.updated_at, true)}</td>
                    <td className="table-actions" data-label="Actions">
                      <Link className="table-action" href={`/admin/edit/${post.id}`}>Edit</Link>
                      <DeletePostButton id={post.id} title={post.title} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state admin-empty"><span>♡</span><h2>Your first page is waiting.</h2><p>Start with a thought you want to remember.</p><Link className="btn btn-dark" href="/admin/new-post">Write a new post</Link></div>
        )}
      </main>
    </div>
  );
}
