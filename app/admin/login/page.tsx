import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "@/components/LoginForm";

export const metadata: Metadata = { title: "Writer login" };

type Props = { searchParams: Promise<{ setup?: string }> };

export default async function LoginPage({ searchParams }: Props) {
  const { setup } = await searchParams;
  return (
    <main className="auth-page">
      <section className="auth-card">
        <Link className="brand auth-brand" href="/">
          Bell’s diary
          <small>words worth keeping</small>
        </Link>
        <div>
          <p className="eyebrow">Private writing space</p>
          <h1>Welcome back, Bell.</h1>
          <p className="auth-intro">Sign in to write, save a draft, or publish a new entry.</p>
        </div>
        {setup === "required" ? (
          <div className="setup-note" role="status">
            Supabase is not connected yet. Add the environment variables from <code>.env.example</code>, then create Bell’s account in Supabase Auth.
          </div>
        ) : null}
        <LoginForm />
        <Link className="text-link auth-back" href="/">← Back to the diary</Link>
      </section>
      <div className="auth-photo" aria-hidden="true" />
    </main>
  );
}
