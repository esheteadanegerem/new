"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getCartSummary, placeOrder, type CartSummary } from "@/app/actions";
import { useCart } from "@/components/cart-provider";
import { formatPrice } from "@/lib/format";

const FIELDS = [
  { name: "customerName", label: "Full name", type: "text", required: true },
  { name: "email", label: "Email", type: "email", required: true },
  { name: "phone", label: "Phone", type: "tel", required: false },
  { name: "address", label: "Street address", type: "text", required: true },
  { name: "city", label: "City", type: "text", required: true },
  { name: "country", label: "Country", type: "text", required: true },
] as const;

export default function CheckoutPage() {
  const { lines, ready, clear } = useCart();
  const router = useRouter();
  const [summary, setSummary] = useState<CartSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!ready) return;
    void getCartSummary(lines).then(setSummary);
  }, [lines, ready]);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    const data = new FormData(event.currentTarget);
    const result = await placeOrder({
      customerName: String(data.get("customerName") ?? ""),
      email: String(data.get("email") ?? ""),
      phone: String(data.get("phone") ?? ""),
      address: String(data.get("address") ?? ""),
      city: String(data.get("city") ?? ""),
      country: String(data.get("country") ?? ""),
      cart: lines,
    });

    if (!result.ok) {
      setError(result.error);
      setSubmitting(false);
      return;
    }

    clear();
    router.push(`/orders/${result.reference}`);
  }

  if (!ready || !summary) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="h-64 animate-pulse rounded-2xl bg-slate-100" />
      </div>
    );
  }

  if (summary.lines.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center sm:px-6">
        <h1 className="text-3xl font-bold tracking-tight">Nothing to check out</h1>
        <p className="mt-3 text-slate-600">Add a product to your cart first.</p>
        <Link
          href="/products"
          className="mt-8 inline-block rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white"
        >
          Browse products
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight">Checkout</h1>
      <p className="mt-2 text-sm text-slate-600">
        Demo store — no card is charged and no payment details are collected.
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">
        <form onSubmit={onSubmit} className="rounded-2xl border border-slate-200 p-6">
          <h2 className="text-lg font-semibold">Delivery details</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {FIELDS.map((field) => (
              <label
                key={field.name}
                className={
                  field.name === "address" ? "sm:col-span-2 block" : "block"
                }
              >
                <span className="text-sm font-medium text-slate-700">
                  {field.label}
                  {field.required && <span className="text-rose-500"> *</span>}
                </span>
                <input
                  name={field.name}
                  type={field.type}
                  required={field.required}
                  autoComplete="on"
                  className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-900"
                />
              </label>
            ))}
          </div>

          <h2 className="mt-8 text-lg font-semibold">Payment</h2>
          <div className="mt-3 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
            Simulated payment. Your order is recorded and marked paid so you can
            see the full flow end to end.
          </div>

          {error && (
            <p className="mt-4 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="mt-6 w-full rounded-xl bg-slate-900 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:bg-slate-400"
          >
            {submitting
              ? "Placing order…"
              : `Place order · ${formatPrice(summary.total)}`}
          </button>
        </form>

        <aside className="h-fit rounded-2xl border border-slate-200 p-6">
          <h2 className="text-lg font-semibold">Your order</h2>
          <ul className="mt-4 space-y-4">
            {summary.lines.map((line) => (
              <li key={line.slug} className="flex gap-3">
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                  <Image
                    src={line.image}
                    alt={line.name}
                    fill
                    sizes="56px"
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 text-sm">
                  <p className="font-medium">{line.name}</p>
                  <p className="text-slate-500">Qty {line.quantity}</p>
                </div>
                <p className="text-sm font-semibold">
                  {formatPrice(line.lineTotal)}
                </p>
              </li>
            ))}
          </ul>

          <dl className="mt-6 space-y-3 border-t border-slate-200 pt-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-slate-600">Subtotal</dt>
              <dd>{formatPrice(summary.subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-600">Shipping</dt>
              <dd>
                {summary.shipping === 0 ? "Free" : formatPrice(summary.shipping)}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-600">Tax</dt>
              <dd>{formatPrice(summary.tax)}</dd>
            </div>
            <div className="flex justify-between border-t border-slate-200 pt-3 text-base font-bold">
              <dt>Total</dt>
              <dd>{formatPrice(summary.total)}</dd>
            </div>
          </dl>
        </aside>
      </div>
    </div>
  );
}
