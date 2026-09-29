"use client";

import Link from "next/link";
import { useState } from "react";
import { useCart } from "./cart-provider";

export function ProductPurchase({
  slug,
  stock,
}: {
  slug: string;
  stock: number;
}) {
  const { add } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const soldOut = stock === 0;

  function onAdd() {
    add(slug, quantity);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 2500);
  }

  return (
    <div className="mt-6 space-y-4">
      <div className="flex items-center gap-3">
        <div className="flex items-center rounded-xl border border-slate-200">
          <button
            type="button"
            onClick={() => setQuantity((value) => Math.max(1, value - 1))}
            className="px-3 py-2 text-lg text-slate-600 hover:text-slate-900"
            aria-label="Decrease quantity"
          >
            −
          </button>
          <span className="w-10 text-center text-sm font-semibold">
            {quantity}
          </span>
          <button
            type="button"
            onClick={() =>
              setQuantity((value) => Math.min(Math.max(stock, 1), value + 1))
            }
            className="px-3 py-2 text-lg text-slate-600 hover:text-slate-900"
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>
        <button
          type="button"
          onClick={onAdd}
          disabled={soldOut}
          className="flex-1 rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {soldOut ? "Out of stock" : "Add to cart"}
        </button>
      </div>

      {added && (
        <div className="flex items-center justify-between rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          <span>Added to your cart.</span>
          <Link href="/cart" className="font-semibold underline">
            View cart
          </Link>
        </div>
      )}
    </div>
  );
}
