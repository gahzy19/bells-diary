import type { Metadata } from "next";
import Link from "next/link";
import { PublicChrome } from "@/components/PublicChrome";
import { estimateReadingTime, formatPostDate } from "@/lib/format";
import { getPublishedPosts } from "@/lib/posts";

export const metadata: Metadata = { title: "Writings" };
export const dynamic = "force-dynamic";

export default async function WritingsPage() {
  const posts = await getPublishedPosts();
  return (
    <PublicChrome>
      <main className="container">
        <section className="page-hero">
          <p className="eyebrow">Archive</p>
          <h1 className="page-title">Writings.</h1>
          <p className="page-sub">Notes, reflections, stories, and the thoughts that felt too important to let disappear.</p>
        </section>
        {posts.length ? (
          <section className="archive" aria-label="Published writings">
            {posts.map((post) => (
              <article className="archive-item" key={post.id}>
                <div className="archive-date">{formatPostDate(post.published_at, true).toUpperCase()}</div>
                <div><h2>{post.title}</h2><p>{post.category} · {estimateReadingTime(post.content)} min read</p></div>
                <Link className="text-link" href={`/post/${post.slug}`}>Read <span>→</span></Link>
              </article>
            ))}
          </section>
        ) : (
          <div className="empty-state archive-empty"><span>♡</span><h2>No published writings yet.</h2><p>Come back after Bell adds the first entry.</p></div>
        )}
      </main>
    </PublicChrome>
  );
}
