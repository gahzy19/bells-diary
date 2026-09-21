import Image from "next/image";
import Link from "next/link";
import { formatPostDate } from "@/lib/format";
import type { Post } from "@/types/post";

export function ArticleCard({ post, index }: { post: Post; index: number }) {
  return (
    <article className={`card ${index === 0 ? "featured" : ""} ${post.cover_image ? "with-cover" : ""}`}>
      {post.cover_image ? (
        <div className="card-cover">
          <Image src={post.cover_image} alt="" fill sizes="(max-width: 940px) 100vw, 34vw" />
        </div>
      ) : null}
      <div className="index">{String(index + 1).padStart(2, "0")}</div>
      <div>
        <div className="meta">
          <span>{post.category}</span>
          <span>{formatPostDate(post.published_at, true)}</span>
        </div>
        <h3>{post.title}</h3>
        <p>{post.excerpt}</p>
        <Link className="text-link" href={`/post/${post.slug}`}>
          Read entry <span aria-hidden="true">→</span>
        </Link>
      </div>
    </article>
  );
}
