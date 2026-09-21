"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const links = [
  { href: "/", label: "Home" },
  { href: "/writings", label: "Writings" },
  { href: "/about", label: "About" },
  { href: "/#notes", label: "Little Notes" },
];

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="header">
      <Link className="brand" href="/" aria-label="Bell’s Diary home">
        Bell’s diary
        <small>words worth keeping</small>
      </Link>
      <button
        className="menu-btn"
        type="button"
        aria-expanded={open}
        aria-controls="site-navigation"
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen((value) => !value)}
      >
        <span aria-hidden="true">{open ? "×" : "☰"}</span>
      </button>
      <nav id="site-navigation" className={`nav ${open ? "open" : ""}`} aria-label="Main navigation">
        {links.map((link) => {
          const active = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href.split("#")[0]);
          return (
            <Link
              key={link.href}
              className={active ? "active" : undefined}
              href={link.href}
              onClick={() => setOpen(false)}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
