"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { getCartSummary, type CartSummary } from "@/app/actions";
import { useCart } from "@/components/cart-provider";
import { formatPrice } from "@/lib/format";

export default function CartPage() {
  const { lines, ready, setQuantity, remove } = useCart();
  const [summary, setSummary] = useState<CartSummary | null>(null);
  const [, startTransition] = useTransition();

  useEffect(() => {
    if (!ready) return;
    startTransition(async () => {
      setSummary(await getCartSummary(lines));
    });
  }, [lines, ready]);

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
        <h1 className="text-3xl font-bold tracking-tight">Your cart is empty</h1>
        <p className="mt-3 text-slate-600">
          Browse laptops, phones, audio gear and more.
        </p>
        <Link
          href="/products"
          className="mt-8 inline-block rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-700"
        >
          Start shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight">Your cart</h1>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
        <ul className="h-fit divide-y divide-slate-200 rounded-2xl border border-slate-200">
          {summary.lines.map((line) => (
            <li key={line.slug} className="flex gap-4 p-4">
              <Link
                href={`/products/${line.slug}`}
                className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-slate-100"
              >
                <Image
                  src={line.image}
                  alt={line.name}
                  fill
                  sizes="96px"
                  className="object-cover"
                />
              </Link>

              <div className="flex flex-1 flex-col">
                <div className="flex justify-between gap-4">
                  <div>
                    <Link
                      href={`/products/${line.slug}`}
                      className="font-semibold hover:underline"
                    >
                      {line.name}
                    </Link>
                    <p className="text-sm text-slate-500">{line.brand}</p>
                  </div>
                  <p className="font-semibold">{formatPrice(line.lineTotal)}</p>
                </div>

                <div className="mt-auto flex items-center gap-4 pt-3">
                  <div className="flex items-center rounded-lg border border-slate-200">
                    <button
                      type="button"
                      onClick={() => setQuantity(line.slug, line.quantity - 1)}
                      className="px-3 py-1 text-slate-600 hover:text-slate-900"
                      aria-label={`Decrease quantity of ${line.name}`}
                    >
                      −
                    </button>
                    <span className="w-8 text-center text-sm font-semibold">
                      {line.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setQuantity(
                          line.slug,
                          Math.min(line.stock, line.quantity + 1),
                        )
                      }
                      className="px-3 py-1 text-slate-600 hover:text-slate-900"
                      aria-label={`Increase quantity of ${line.name}`}
                    >
                      +
                    </button>
                  </div>
                  <span className="text-sm text-slate-500">
                    {formatPrice(line.price)} each
                  </span>
                  <button
                    type="button"
                    onClick={() => remove(line.slug)}
                    className="ml-auto text-sm font-medium text-slate-500 hover:text-rose-600"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <aside className="h-fit rounded-2xl border border-slate-200 p-6">
          <h2 className="text-lg font-semibold">Order summary</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-slate-600">Subtotal</dt>
              <dd className="font-medium">{formatPrice(summary.subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-600">Shipping</dt>
              <dd className="font-medium">
                {summary.shipping === 0 ? "Free" : formatPrice(summary.shipping)}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-600">Estimated tax</dt>
              <dd className="font-medium">{formatPrice(summary.tax)}</dd>
            </div>
            <div className="flex justify-between border-t border-slate-200 pt-3 text-base">
              <dt className="font-semibold">Total</dt>
              <dd className="font-bold">{formatPrice(summary.total)}</dd>
            </div>
          </dl>

          <Link
            href="/checkout"
            className="mt-6 block rounded-xl bg-slate-900 py-3 text-center text-sm font-semibold text-white hover:bg-slate-700"
          >
            Proceed to checkout
          </Link>
          <Link
            href="/products"
            className="mt-3 block text-center text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            Continue shopping
          </Link>
        </aside>
      </div>
    </div>
  );
}
