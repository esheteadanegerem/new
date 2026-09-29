import type { Metadata } from "next";
import Link from "next/link";
import { ProductCard } from "@/components/product-card";
import { ProductFilters, SortSelect } from "@/components/product-filters";
import {
  getPriceRange,
  listBrands,
  listCategories,
  listProducts,
} from "@/lib/queries";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "All products",
};

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function ProductsPage({ searchParams }: PageProps<"/products">) {
  const params = await searchParams;
  const search = first(params.q);
  const category = first(params.category);
  const brand = first(params.brand);
  const sort = first(params.sort);
  const max = first(params.max);
  const inStockOnly = first(params.inStock) === "1";

  const products = listProducts({
    search,
    category,
    brand,
    sort,
    maxPrice: max ? Number(max) : undefined,
    inStockOnly,
  });

  const categories = listCategories();
  const brands = listBrands();
  const { max: maxPrice } = getPriceRange();

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <nav className="text-sm text-slate-500">
        <Link href="/" className="hover:text-slate-900">
          Home
        </Link>{" "}
        / <span className="text-slate-900">{category ?? "All products"}</span>
      </nav>

      <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {search
              ? `Results for “${search}”`
              : (category ?? "All products")}
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            {products.length} product{products.length === 1 ? "" : "s"}
          </p>
        </div>
        <SortSelect />
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[240px_1fr]">
        <ProductFilters
          categories={categories}
          brands={brands}
          maxPrice={maxPrice}
        />

        {products.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 p-12 text-center">
            <p className="text-lg font-semibold">No products match your filters</p>
            <p className="mt-1 text-sm text-slate-600">
              Try widening the price range or clearing the category filter.
            </p>
            <Link
              href="/products"
              className="mt-5 inline-block rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white"
            >
              Reset filters
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {products.map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                priority={index < 3}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
