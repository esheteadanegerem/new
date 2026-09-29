"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

const CartCount = dynamic(
  () => import("./cart-count").then((mod) => mod.CartCount),
  { ssr: false, loading: () => <>0</> },
);

const NAV = [
  { href: "/products", label: "All products" },
  { href: "/products?category=Laptops", label: "Laptops" },
  { href: "/products?category=Smartphones", label: "Phones" },
  { href: "/products?category=Audio", label: "Audio" },
  { href: "/products?category=Gaming", label: "Gaming" },
];

export function SiteHeader() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const query = searchParams.get("q") ?? "";

  function onSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const term = String(data.get("q") ?? "").trim();
    setMenuOpen(false);
    router.push(term ? `/products?q=${encodeURIComponent(term)}` : "/products");
  }

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6">
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-slate-900 text-lg font-black text-white">
            V
          </span>
          <span className="text-lg font-bold tracking-tight text-slate-900">
            Voltix
          </span>
        </Link>

        <form onSubmit={onSearch} className="hidden flex-1 md:block">
          <label className="relative block">
            <span className="sr-only">Search products</span>
            <input
              key={query}
              name="q"
              defaultValue={query}
              placeholder="Search laptops, phones, audio…"
              className="w-full rounded-full border border-slate-200 bg-slate-50 py-2 pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:bg-white"
            />
            <svg
              className="absolute left-3 top-2.5 h-4 w-4 text-slate-400"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden
            >
              <path
                fillRule="evenodd"
                d="M9 3.5a5.5 5.5 0 1 0 3.4 9.83l3.64 3.63a.75.75 0 1 0 1.06-1.06l-3.63-3.64A5.5 5.5 0 0 0 9 3.5ZM5 9a4 4 0 1 1 8 0 4 4 0 0 1-8 0Z"
                clipRule="evenodd"
              />
            </svg>
          </label>
        </form>

        <nav className="hidden items-center gap-5 lg:flex">
          {NAV.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="text-sm font-medium text-slate-600 transition hover:text-slate-900"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <Link
            href="/cart"
            className="relative flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
          >
            <svg
              className="h-4 w-4"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden
            >
              <path d="M1 1.75A.75.75 0 0 1 1.75 1h1.4a1.75 1.75 0 0 1 1.71 1.38l.26 1.2h11.2a1.25 1.25 0 0 1 1.22 1.53l-1.17 5.1A2.25 2.25 0 0 1 14.13 12H7.4a2.25 2.25 0 0 1-2.2-1.78L3.39 2.7a.25.25 0 0 0-.24-.2h-1.4A.75.75 0 0 1 1 1.75ZM7 18a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Zm8.5-1.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z" />
            </svg>
            Cart
            <span className="grid h-5 min-w-5 place-items-center rounded-full bg-white px-1 text-xs font-bold text-slate-900">
              <CartCount />
            </span>
          </Link>
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            className="grid h-10 w-10 place-items-center rounded-lg border border-slate-200 lg:hidden"
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
          >
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M2 5h16v1.5H2V5Zm0 4.25h16v1.5H2v-1.5ZM2 13.5h16V15H2v-1.5Z" />
            </svg>
          </button>
        </div>
      </div>

      {menuOpen && (
        <div
          className="border-t border-slate-200 bg-white px-4 py-3 lg:hidden"
          onClick={() => setMenuOpen(false)}
        >
          <form onSubmit={onSearch} className="mb-3 md:hidden">
            <input
              key={query}
              name="q"
              defaultValue={query}
              placeholder="Search products…"
              className="w-full rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm outline-none focus:border-slate-400"
            />
          </form>
          <div className="grid gap-1">
            {NAV.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
