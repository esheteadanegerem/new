"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { formatPrice } from "@/lib/format";

type Props = {
  categories: { category: string; count: number }[];
  brands: string[];
  maxPrice: number;
};

export function ProductFilters({ categories, brands, maxPrice }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const activeCategory = searchParams.get("category") ?? "";
  const activeBrand = searchParams.get("brand") ?? "";
  const activeMax = Number(searchParams.get("max") ?? maxPrice);
  const inStockOnly = searchParams.get("inStock") === "1";

  function update(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === null || value === "") params.delete(key);
    else params.set(key, value);
    router.push(`/products?${params.toString()}`, { scroll: false });
  }

  return (
    <aside className="space-y-7">
      <div>
        <h3 className="text-sm font-semibold text-slate-900">Category</h3>
        <div className="mt-3 space-y-1">
          <button
            type="button"
            onClick={() => update("category", null)}
            className={`block w-full rounded-lg px-3 py-1.5 text-left text-sm transition ${
              activeCategory === ""
                ? "bg-slate-900 text-white"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            All categories
          </button>
          {categories.map(({ category, count }) => (
            <button
              key={category}
              type="button"
              onClick={() => update("category", category)}
              className={`flex w-full items-center justify-between rounded-lg px-3 py-1.5 text-left text-sm transition ${
                activeCategory === category
                  ? "bg-slate-900 text-white"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <span>{category}</span>
              <span className="text-xs opacity-70">{count}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-slate-900">Brand</h3>
        <select
          value={activeBrand}
          onChange={(event) => update("brand", event.target.value || null)}
          className="mt-3 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
        >
          <option value="">All brands</option>
          {brands.map((brand) => (
            <option key={brand} value={brand}>
              {brand}
            </option>
          ))}
        </select>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-slate-900">
          Max price:{" "}
          <span className="font-normal text-slate-600">
            {formatPrice(activeMax)}
          </span>
        </h3>
        <input
          type="range"
          min={5000}
          max={maxPrice}
          step={5000}
          defaultValue={activeMax}
          onMouseUp={(event) =>
            update("max", (event.target as HTMLInputElement).value)
          }
          onTouchEnd={(event) =>
            update("max", (event.target as HTMLInputElement).value)
          }
          className="mt-3 w-full accent-slate-900"
        />
      </div>

      <label className="flex items-center gap-2 text-sm text-slate-600">
        <input
          type="checkbox"
          checked={inStockOnly}
          onChange={(event) => update("inStock", event.target.checked ? "1" : null)}
          className="h-4 w-4 accent-slate-900"
        />
        In stock only
      </label>

      <button
        type="button"
        onClick={() => router.push("/products")}
        className="w-full rounded-lg border border-slate-200 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
      >
        Clear filters
      </button>
    </aside>
  );
}

export function SortSelect() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sort = searchParams.get("sort") ?? "featured";

  function onChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", value);
    router.push(`/products?${params.toString()}`, { scroll: false });
  }

  return (
    <select
      value={sort}
      onChange={(event) => onChange(event.target.value)}
      className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
      aria-label="Sort products"
    >
      <option value="featured">Featured</option>
      <option value="price-asc">Price: low to high</option>
      <option value="price-desc">Price: high to low</option>
      <option value="rating">Top rated</option>
      <option value="newest">Newest</option>
    </select>
  );
}
