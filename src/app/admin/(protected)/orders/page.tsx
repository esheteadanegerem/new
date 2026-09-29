import Link from "next/link";
import { setOrderStatus } from "@/app/admin/actions";
import { formatDate, formatPrice } from "@/lib/format";
import { getOrderItems, listOrders } from "@/lib/queries";
import { ORDER_STATUSES } from "@/lib/types";

export const dynamic = "force-dynamic";

export default function AdminOrdersPage() {
  const orders = listOrders();

  return (
    <div>
      <h2 className="text-lg font-semibold">Orders</h2>
      <p className="text-sm text-slate-500">
        {orders.length} order{orders.length === 1 ? "" : "s"}
      </p>

      {orders.length === 0 ? (
        <p className="mt-6 rounded-2xl border border-dashed border-slate-300 p-10 text-center text-sm text-slate-500">
          No orders yet.
        </p>
      ) : (
        <div className="mt-6 space-y-4">
          {orders.map((order) => {
            const items = getOrderItems(order.id);
            return (
              <div
                key={order.id}
                className="rounded-2xl border border-slate-200 p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <Link
                      href={`/orders/${order.reference}`}
                      className="font-semibold hover:underline"
                    >
                      {order.reference}
                    </Link>
                    <p className="text-sm text-slate-600">
                      {order.customerName} · {order.email}
                    </p>
                    <p className="text-xs text-slate-500">
                      {order.address}, {order.city}, {order.country} ·{" "}
                      {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold">
                      {formatPrice(order.total)}
                    </p>
                    <form action={setOrderStatus} className="mt-2 flex gap-2">
                      <input type="hidden" name="id" value={order.id} />
                      <select
                        name="status"
                        defaultValue={order.status}
                        className="rounded-lg border border-slate-200 px-2 py-1.5 text-sm capitalize"
                      >
                        {ORDER_STATUSES.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                      <button
                        type="submit"
                        className="rounded-lg bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-700"
                      >
                        Update
                      </button>
                    </form>
                  </div>
                </div>

                <ul className="mt-4 divide-y divide-slate-100 border-t border-slate-100 text-sm">
                  {items.map((item) => (
                    <li key={item.id} className="flex justify-between py-2">
                      <span>
                        {item.name}{" "}
                        <span className="text-slate-500">× {item.quantity}</span>
                      </span>
                      <span className="font-medium">
                        {formatPrice(item.unitPrice * item.quantity)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
