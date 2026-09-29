import Image from "next/image";
import Link from "next/link";
import { removeProduct } from "@/app/admin/actions";
import { formatPrice } from "@/lib/format";
import { listProducts } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage({
  searchParams,
}: PageProps<"/admin/products">) {
  const params = await searchParams;
  const products = listProducts({ sort: "newest" });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">Products</h2>
          <p className="text-sm text-slate-500">
            {products.length} products in the catalog
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-700"
        >
          New product
        </Link>
      </div>

      {params.saved && (
        <p className="mt-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          Product saved.
        </p>
      )}
      {params.deleted && (
        <p className="mt-4 rounded-xl bg-slate-100 px-4 py-3 text-sm text-slate-700">
          Product deleted.
        </p>
      )}

      <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">Product</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">Price</th>
              <th className="px-4 py-3 font-medium">Stock</th>
              <th className="px-4 py-3 font-medium">Featured</th>
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {products.map((product) => (
              <tr key={product.id}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                      {product.image && (
                        <Image
                          src={product.image}
                          alt=""
                          fill
                          sizes="40px"
                          className="object-cover"
                        />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-xs text-slate-500">{product.brand}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-slate-600">{product.category}</td>
                <td className="px-4 py-3 font-medium">
                  {formatPrice(product.price)}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={
                      product.stock === 0
                        ? "text-rose-600"
                        : product.stock <= 10
                          ? "text-amber-600"
                          : "text-slate-600"
                    }
                  >
                    {product.stock}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {product.featured ? "Yes" : "—"}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-3">
                    <Link
                      href={`/products/${product.slug}`}
                      className="text-slate-500 hover:text-slate-900"
                    >
                      View
                    </Link>
                    <Link
                      href={`/admin/products/${product.id}`}
                      className="font-medium text-slate-900 hover:underline"
                    >
                      Edit
                    </Link>
                    <form action={removeProduct}>
                      <input type="hidden" name="id" value={product.id} />
                      <button
                        type="submit"
                        className="font-medium text-rose-600 hover:underline"
                      >
                        Delete
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
