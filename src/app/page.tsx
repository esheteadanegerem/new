import Image from "next/image";
import Link from "next/link";
import { ProductCard } from "@/components/product-card";
import { getFeaturedProducts, listCategories, listProducts } from "@/lib/queries";

export const dynamic = "force-dynamic";

const CATEGORY_IMAGES: Record<string, string> = {
  Laptops: "/products/probook-16.jpg",
  Smartphones: "/products/nova-x-pro.jpg",
  Audio: "/products/sonicwave-studio.jpg",
  Wearables: "/products/chrono-fit.jpg",
  Tablets: "/products/slate-pro-12.jpg",
  Cameras: "/products/optica-z6.jpg",
  Gaming: "/products/vertex-console-x.jpg",
  Accessories: "/products/lumen-keyboard.jpg",
  "Smart Home": "/products/homehub-voice.jpg",
};

export default function Home() {
  const featured = getFeaturedProducts(8);
  const categories = listCategories();
  const deals = listProducts({ sort: "price-asc" })
    .filter((product) => product.compareAtPrice)
    .slice(0, 4);

  return (
    <div>
      <section className="relative overflow-hidden bg-slate-900 text-white">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:py-24">
          <div>
            <span className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide">
              New season · up to 20% off
            </span>
            <h1 className="mt-5 text-4xl font-black leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              Electronics that keep up with you.
            </h1>
            <p className="mt-5 max-w-xl text-lg text-slate-300">
              Laptops, phones, audio, cameras and gaming gear — hand-picked,
              genuinely stocked, and shipped free on orders over $500.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/products"
                className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-200"
              >
                Shop all products
              </Link>
              <Link
                href="/products?category=Laptops"
                className="rounded-full border border-white/30 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Browse laptops
              </Link>
            </div>
          </div>
          <div className="relative aspect-4/3 overflow-hidden rounded-3xl border border-white/10">
            <Image
              src="/products/nitro-blade-gaming.jpg"
              alt="Gaming laptop"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-slate-50">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
          {[
            ["Free shipping", "On every order over $500"],
            ["2-year warranty", "On all new devices"],
            ["30-day returns", "No-questions-asked"],
            ["Genuine stock", "Authorised retailer"],
          ].map(([title, copy]) => (
            <div key={title}>
              <p className="text-sm font-semibold text-slate-900">{title}</p>
              <p className="text-sm text-slate-600">{copy}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <h2 className="text-2xl font-bold tracking-tight">Shop by category</h2>
        <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
          {categories.map(({ category, count }) => (
            <Link
              key={category}
              href={`/products?category=${encodeURIComponent(category)}`}
              className="group relative aspect-4/3 overflow-hidden rounded-2xl border border-slate-200"
            >
              <Image
                src={CATEGORY_IMAGES[category] ?? "/products/desk-bundle.jpg"}
                alt={category}
                fill
                sizes="(max-width: 768px) 50vw, 20vw"
                className="object-cover transition duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-linear-to-t from-slate-900/80 to-slate-900/10" />
              <div className="absolute bottom-3 left-3 text-white">
                <p className="font-semibold">{category}</p>
                <p className="text-xs text-slate-200">{count} products</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-14 sm:px-6">
        <div className="flex items-end justify-between">
          <h2 className="text-2xl font-bold tracking-tight">Featured this week</h2>
          <Link
            href="/products"
            className="text-sm font-semibold text-slate-600 hover:text-slate-900"
          >
            View all →
          </Link>
        </div>
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {deals.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6">
          <div className="rounded-3xl bg-slate-900 px-6 py-10 text-white sm:px-10">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">
                  Under-$300 deals
                </h2>
                <p className="mt-1 text-slate-300">
                  Accessories and audio gear currently discounted.
                </p>
              </div>
              <Link
                href="/products?sort=price-asc"
                className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-slate-900"
              >
                See all deals
              </Link>
            </div>
            <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {deals.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
