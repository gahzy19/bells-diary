import Link from "next/link";

export function Footer() {
  return (
    <footer className="footer">
      <div>
        <Link className="brand" href="/">Bell’s diary</Link>
        <p>A soft corner on the internet.</p>
      </div>
      <div className="footer-links" aria-label="Social links">
        <a href="https://instagram.com" target="_blank" rel="noreferrer">Instagram</a>
        <a href="mailto:hello@example.com">Email</a>
      </div>
      <p>© {new Date().getFullYear()} Bell’s Diary</p>
    </footer>
  );
}
