import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-24 text-center sm:px-6">
      <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
        404
      </p>
      <h1 className="mt-3 text-3xl font-bold tracking-tight">
        We couldn&apos;t find that page
      </h1>
      <p className="mt-3 text-slate-600">
        The product may have sold out or the link may be out of date.
      </p>
      <Link
        href="/products"
        className="mt-8 inline-block rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-700"
      >
        Browse the catalog
      </Link>
    </div>
  );
}
