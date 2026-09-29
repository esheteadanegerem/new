import Link from "next/link";
import { formatDate, formatPrice } from "@/lib/format";
import { getDashboardStats, listOrders, listProducts } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default function AdminDashboard() {
  const stats = getDashboardStats();
  const recentOrders = listOrders().slice(0, 5);
  const lowStock = listProducts({ sort: "newest" })
    .filter((product) => product.stock <= 10)
    .slice(0, 6);

  const cards = [
    ["Revenue", formatPrice(stats.revenue)],
    ["Orders", String(stats.orderCount)],
    ["Products", String(stats.productCount)],
    ["Low stock", String(stats.lowStock)],
  ];

  return (
    <div className="space-y-10">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-slate-200 p-5">
            <p className="text-sm text-slate-500">{label}</p>
            <p className="mt-2 text-2xl font-bold">{value}</p>
          </div>
        ))}
      </div>

      <section>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recent orders</h2>
          <Link
            href="/admin/orders"
            className="text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            View all →
          </Link>
        </div>
        {recentOrders.length === 0 ? (
          <p className="mt-4 rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
            No orders yet. Place one from the storefront to see it here.
          </p>
        ) : (
          <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Reference</th>
                  <th className="px-4 py-3 font-medium">Customer</th>
                  <th className="px-4 py-3 font-medium">Placed</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 text-right font-medium">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {recentOrders.map((order) => (
                  <tr key={order.id}>
                    <td className="px-4 py-3 font-medium">{order.reference}</td>
                    <td className="px-4 py-3">{order.customerName}</td>
                    <td className="px-4 py-3 text-slate-500">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="px-4 py-3 capitalize">{order.status}</td>
                    <td className="px-4 py-3 text-right font-semibold">
                      {formatPrice(order.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section>
        <h2 className="text-lg font-semibold">Low stock</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {lowStock.map((product) => (
            <div
              key={product.id}
              className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-3"
            >
              <div>
                <p className="text-sm font-medium">{product.name}</p>
                <p className="text-xs text-slate-500">{product.category}</p>
              </div>
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                  product.stock === 0
                    ? "bg-rose-50 text-rose-700"
                    : "bg-amber-50 text-amber-700"
                }`}
              >
                {product.stock} left
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
