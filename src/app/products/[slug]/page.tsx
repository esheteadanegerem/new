import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductCard } from "@/components/product-card";
import { ProductPurchase } from "@/components/product-purchase";
import { Stars } from "@/components/stars";
import { formatPrice } from "@/lib/format";
import { getProductBySlug, getRelatedProducts } from "@/lib/queries";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: PageProps<"/products/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) return { title: "Product not found" };
  return { title: product.name, description: product.description };
}

function parseSpecs(raw: string): [string, string][] {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (entry): entry is [string, string] =>
        Array.isArray(entry) &&
        entry.length === 2 &&
        typeof entry[0] === "string" &&
        typeof entry[1] === "string",
    );
  } catch {
    return [];
  }
}

export default async function ProductPage({
  params,
}: PageProps<"/products/[slug]">) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) notFound();

  const related = getRelatedProducts(product);
  const specs = parseSpecs(product.specs);
  const savings =
    product.compareAtPrice && product.compareAtPrice > product.price
      ? product.compareAtPrice - product.price
      : 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <nav className="text-sm text-slate-500">
        <Link href="/" className="hover:text-slate-900">
          Home
        </Link>{" "}
        /{" "}
        <Link
          href={`/products?category=${encodeURIComponent(product.category)}`}
          className="hover:text-slate-900"
        >
          {product.category}
        </Link>{" "}
        / <span className="text-slate-900">{product.name}</span>
      </nav>

      <div className="mt-6 grid gap-10 lg:grid-cols-2">
        <div className="relative aspect-square overflow-hidden rounded-3xl border border-slate-200 bg-slate-100">
          <Image
            src={product.image}
            alt={product.name}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
          />
        </div>

        <div>
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            {product.brand}
          </span>
          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            {product.name}
          </h1>
          <div className="mt-3">
            <Stars rating={product.rating} reviewCount={product.reviewCount} />
          </div>

          <div className="mt-5 flex flex-wrap items-baseline gap-3">
            <span className="text-3xl font-black">
              {formatPrice(product.price)}
            </span>
            {savings > 0 && (
              <>
                <span className="text-lg text-slate-400 line-through">
                  {formatPrice(product.compareAtPrice ?? 0)}
                </span>
                <span className="rounded-full bg-rose-50 px-2.5 py-1 text-xs font-bold text-rose-600">
                  Save {formatPrice(savings)}
                </span>
              </>
            )}
          </div>

          <p className="mt-5 text-slate-600">{product.description}</p>

          <p className="mt-4 text-sm font-medium">
            {product.stock > 10 ? (
              <span className="text-emerald-600">In stock — ships today</span>
            ) : product.stock > 0 ? (
              <span className="text-amber-600">
                Only {product.stock} left in stock
              </span>
            ) : (
              <span className="text-rose-600">Out of stock</span>
            )}
          </p>

          <ProductPurchase slug={product.slug} stock={product.stock} />

          <dl className="mt-8 divide-y divide-slate-200 rounded-2xl border border-slate-200">
            {specs.map(([label, value]) => (
              <div key={label} className="flex justify-between gap-6 px-4 py-3">
                <dt className="text-sm text-slate-500">{label}</dt>
                <dd className="text-right text-sm font-medium text-slate-900">
                  {value}
                </dd>
              </div>
            ))}
          </dl>

          <ul className="mt-6 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
            <li>✓ Free shipping over $500</li>
            <li>✓ 30-day returns</li>
            <li>✓ 2-year warranty</li>
            <li>✓ Secure checkout</li>
          </ul>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="text-2xl font-bold tracking-tight">
            More in {product.category}
          </h2>
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
