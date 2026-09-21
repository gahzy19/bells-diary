import Link from "next/link";
import { PublicChrome } from "@/components/PublicChrome";

export default function NotFound() {
  return (
    <PublicChrome>
      <main className="not-found container">
        <p className="eyebrow">Page not found</p>
        <h1>This page slipped between the lines.</h1>
        <p>The writing may have moved, or it may still be waiting to be published.</p>
        <Link className="btn btn-dark" href="/writings">Browse the diary</Link>
      </main>
    </PublicChrome>
  );
}
