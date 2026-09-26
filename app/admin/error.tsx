"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function AdminError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="admin-error-page">
      <div className="empty-state">
        <span>♡</span>
        <h1>The writing desk could not open.</h1>
        <p>Your post has not been changed. Check the connection, then try again.</p>
        <div className="admin-error-actions">
          <button className="btn btn-dark" type="button" onClick={reset}>Try again</button>
          <Link className="btn btn-ghost" href="/admin/dashboard">Dashboard</Link>
        </div>
      </div>
    </main>
  );
}
