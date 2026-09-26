import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PublicChrome } from "@/components/PublicChrome";
import { RichContent } from "@/components/RichContent";
import { estimateReadingTime, formatPostDate } from "@/lib/format";
import { getPublishedPostBySlug } from "@/lib/posts";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug);
  if (!post) return { title: "Writing not found" };
  return { title: post.title, description: post.excerpt };
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug);
  if (!post) notFound();

  return (
    <PublicChrome>
      <main className="article-wrap">
        <p className="eyebrow">{post.category} · {formatPostDate(post.published_at)} · {estimateReadingTime(post.content)} min read</p>
        <h1 className="article-title">{post.title}</h1>
        <p className="article-intro">{post.excerpt}</p>
        {post.cover_image ? (
          <div className="article-cover"><Image src={post.cover_image} alt="" fill priority sizes="(max-width: 820px) 100vw, 780px" /></div>
        ) : null}
        <RichContent content={post.content} />
        <hr className="article-divider" />
        <div className="article-nav"><Link href="/writings">← Back to all writings</Link><Link href="/">Bell’s Diary →</Link></div>
      </main>
    </PublicChrome>
  );
}
