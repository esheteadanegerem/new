import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatDate, formatPrice } from "@/lib/format";
import { getOrderByReference, getOrderItems } from "@/lib/queries";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Order confirmation",
};

export default async function OrderPage({
  params,
}: PageProps<"/orders/[reference]">) {
  const { reference } = await params;
  const order = getOrderByReference(reference);
  if (!order) notFound();

  const items = getOrderItems(order.id);

  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6">
        <h1 className="text-2xl font-bold text-emerald-900">
          Thank you, {order.customerName.split(" ")[0]}!
        </h1>
        <p className="mt-2 text-sm text-emerald-800">
          Your order <span className="font-semibold">{order.reference}</span> was
          placed on {formatDate(order.createdAt)}. A confirmation was sent to{" "}
          {order.email}.
        </p>
      </div>

      <div className="mt-8 rounded-2xl border border-slate-200">
        <div className="border-b border-slate-200 px-6 py-4">
          <h2 className="font-semibold">Items</h2>
        </div>
        <ul className="divide-y divide-slate-200">
          {items.map((item) => (
            <li key={item.id} className="flex items-center gap-4 px-6 py-4">
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              </div>
              <div className="flex-1">
                <Link
                  href={`/products/${item.slug}`}
                  className="font-medium hover:underline"
                >
                  {item.name}
                </Link>
                <p className="text-sm text-slate-500">
                  {formatPrice(item.unitPrice)} × {item.quantity}
                </p>
              </div>
              <p className="font-semibold">
                {formatPrice(item.unitPrice * item.quantity)}
              </p>
            </li>
          ))}
        </ul>

        <dl className="space-y-2 border-t border-slate-200 px-6 py-4 text-sm">
          <div className="flex justify-between">
            <dt className="text-slate-600">Subtotal</dt>
            <dd>{formatPrice(order.subtotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-slate-600">Shipping</dt>
            <dd>{order.shipping === 0 ? "Free" : formatPrice(order.shipping)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-slate-600">Tax</dt>
            <dd>{formatPrice(order.tax)}</dd>
          </div>
          <div className="flex justify-between border-t border-slate-200 pt-2 text-base font-bold">
            <dt>Total paid</dt>
            <dd>{formatPrice(order.total)}</dd>
          </div>
        </dl>
      </div>

      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 p-6">
          <h2 className="font-semibold">Shipping to</h2>
          <address className="mt-2 text-sm not-italic text-slate-600">
            {order.customerName}
            <br />
            {order.address}
            <br />
            {order.city}, {order.country}
            {order.phone && (
              <>
                <br />
                {order.phone}
              </>
            )}
          </address>
        </div>
        <div className="rounded-2xl border border-slate-200 p-6">
          <h2 className="font-semibold">Status</h2>
          <p className="mt-2 inline-flex rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
            {order.status}
          </p>
          <p className="mt-3 text-sm text-slate-600">
            Estimated delivery in 3–5 business days.
          </p>
        </div>
      </div>

      <Link
        href="/products"
        className="mt-10 inline-block rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-700"
      >
        Continue shopping
      </Link>
    </div>
  );
}
