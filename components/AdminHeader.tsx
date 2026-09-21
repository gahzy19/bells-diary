import Link from "next/link";
import { logoutAction } from "@/lib/actions";

export function AdminHeader() {
  return (
    <header className="admin-header">
      <Link className="brand" href="/admin/dashboard">
        Bell’s diary
        <small>writing desk</small>
      </Link>
      <nav aria-label="Admin navigation">
        <Link href="/" target="_blank">View site ↗</Link>
        <form action={logoutAction}>
          <button className="plain-button" type="submit">Log out</button>
        </form>
      </nav>
    </header>
  );
}
