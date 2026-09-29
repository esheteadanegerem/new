"use client";

import { useCart } from "./cart-provider";

export function CartCount() {
  const { count, ready } = useCart();
  return <>{ready ? count : 0}</>;
}
