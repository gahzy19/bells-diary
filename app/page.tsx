import Image from "next/image";
import Link from "next/link";
import { ArticleCard } from "@/components/ArticleCard";
import { PublicChrome } from "@/components/PublicChrome";
import { getPublishedPosts } from "@/lib/posts";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const posts = await getPublishedPosts(3);

  return (
    <PublicChrome>
      <main>
        <section className="hero">
          <div>
            <p className="eyebrow">A personal writing space</p>
            <h1>Little thoughts,<br /><em>kept softly.</em></h1>
            <p className="lead">
              A quiet corner for stories, feelings, unfinished sentences, books I love, and the small moments I want to remember.
            </p>
            <div className="actions">
              <Link className="btn btn-dark" href="/writings">Read my writings</Link>
              <Link className="text-link" href="/about">Tentang Bella <span>↗</span></Link>
            </div>
            <div className="micro"><i>♡</i><span>made for slow reading & soft days</span></div>
          </div>
          <div className="hero-visual" aria-label="Bella reading in front of a bookshelf">
            <div className="photo-shell">
              <Image src="/images/bell-reading.jpg" alt="Bella reading a book in front of a bookshelf" fill priority sizes="(max-width: 940px) 80vw, 42vw" />
            </div>
            <div className="float quote"><b>“</b><p>Some things deserve<br />to be written down.</p></div>
            <div className="float badge"><div><small>EST.</small><strong>2026</strong></div></div>
          </div>
        </section>

        <section className="section container">
          <div className="section-head">
            <div><p className="eyebrow">Latest entries</p><h2 className="section-title">From the diary</h2></div>
            <Link className="text-link" href="/writings">See all writings <span>↗</span></Link>
          </div>
          {posts.length ? (
            <div className="cards">{posts.map((post, index) => <ArticleCard key={post.id} post={post} index={index} />)}</div>
          ) : (
            <div className="empty-state"><span>♡</span><h3>The next page is still blank.</h3><p>Published entries will appear here.</p></div>
          )}
        </section>

        <section className="section container">
          <div className="about-panel">
            <p className="eyebrow">About Bell</p>
            <h2 className="section-title">I read to find myself.<br />I write so I don’t forget.</h2>
            <p>Bell’s Diary is a small collection of thoughts, stories, reflections, and everything in between — a place to keep words that feel too meaningful to leave unwritten.</p>
            <div className="tags"><span>books</span><span>journal</span><span>stories</span><span>slow living</span></div>
          </div>
        </section>

        <section className="section container" id="notes">
          <div className="note">
            <p className="eyebrow">Little note of the day</p>
            <blockquote>“Not every day needs to be extraordinary to be worth remembering.”</blockquote>
            <span className="sig">— Bell ♡</span>
          </div>
        </section>
      </main>
    </PublicChrome>
  );
}
