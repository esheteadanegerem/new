"use client";

import { useState } from "react";
import { useCart } from "./cart-provider";

export function AddToCartButton({
  slug,
  quantity = 1,
  disabled = false,
  className,
  label = "Add to cart",
}: {
  slug: string;
  quantity?: number;
  disabled?: boolean;
  className?: string;
  label?: string;
}) {
  const { add } = useCart();
  const [added, setAdded] = useState(false);

  function onClick() {
    add(slug, quantity);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1400);
  }

  return (
    <button type="button" onClick={onClick} disabled={disabled} className={className}>
      {disabled ? "Out of stock" : added ? "Added ✓" : label}
    </button>
  );
}
