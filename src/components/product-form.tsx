import Link from "next/link";
import { saveProduct } from "@/app/admin/actions";
import { CATEGORIES } from "@/lib/seed-data";
import type { Product } from "@/lib/types";

function specsToText(raw: string): string {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return "";
    return parsed
      .filter((entry): entry is [string, string] => Array.isArray(entry))
      .map(([label, value]) => `${label}: ${value}`)
      .join("\n");
  } catch {
    return "";
  }
}

export function ProductForm({ product }: { product?: Product }) {
  const priceValue = product ? (product.price / 100).toFixed(2) : "";
  const compareValue = product?.compareAtPrice
    ? (product.compareAtPrice / 100).toFixed(2)
    : "";

  return (
    <form action={saveProduct} className="mt-6 max-w-3xl space-y-5">
      {product && <input type="hidden" name="id" value={product.id} />}

      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block sm:col-span-2">
          <span className="text-sm font-medium text-slate-700">Name *</span>
          <input
            name="name"
            required
            defaultValue={product?.name}
            className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-900"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-700">
            Slug (auto from name if blank)
          </span>
          <input
            name="slug"
            defaultValue={product?.slug}
            className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-900"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-700">Brand</span>
          <input
            name="brand"
            defaultValue={product?.brand}
            className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-900"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-700">Category</span>
          <input
            name="category"
            list="category-options"
            defaultValue={product?.category}
            className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-900"
          />
          <datalist id="category-options">
            {CATEGORIES.map((category) => (
              <option key={category} value={category} />
            ))}
          </datalist>
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-700">Stock</span>
          <input
            name="stock"
            type="number"
            min={0}
            defaultValue={product?.stock ?? 0}
            className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-900"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-700">Price (USD) *</span>
          <input
            name="price"
            required
            inputMode="decimal"
            placeholder="499.00"
            defaultValue={priceValue}
            className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-900"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-700">
            Compare-at price (optional)
          </span>
          <input
            name="compareAtPrice"
            inputMode="decimal"
            placeholder="599.00"
            defaultValue={compareValue}
            className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-900"
          />
        </label>

        <label className="block sm:col-span-2">
          <span className="text-sm font-medium text-slate-700">Image path or URL</span>
          <input
            name="image"
            placeholder="/products/my-product.jpg"
            defaultValue={product?.image}
            className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-900"
          />
        </label>

        <label className="block sm:col-span-2">
          <span className="text-sm font-medium text-slate-700">Description</span>
          <textarea
            name="description"
            rows={4}
            defaultValue={product?.description}
            className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-900"
          />
        </label>

        <label className="block sm:col-span-2">
          <span className="text-sm font-medium text-slate-700">
            Specs (one per line, &quot;Label: value&quot;)
          </span>
          <textarea
            name="specs"
            rows={5}
            placeholder={"Display: 15.6\" OLED\nBattery: 12 hours"}
            defaultValue={product ? specsToText(product.specs) : ""}
            className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 font-mono text-sm outline-none focus:border-slate-900"
          />
        </label>

        <label className="flex items-center gap-2 sm:col-span-2">
          <input
            type="checkbox"
            name="featured"
            defaultChecked={Boolean(product?.featured)}
            className="h-4 w-4 accent-slate-900"
          />
          <span className="text-sm text-slate-700">
            Feature on the homepage
          </span>
        </label>
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          className="rounded-xl bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white hover:bg-slate-700"
        >
          Save product
        </button>
        <Link
          href="/admin/products"
          className="rounded-xl border border-slate-200 px-6 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
