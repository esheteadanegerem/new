"use server";

import { revalidatePath } from "next/cache";
import { createOrder, resolveCart } from "@/lib/queries";
import type { CartLine } from "@/lib/types";

export type CartSummary = {
  lines: {
    slug: string;
    name: string;
    brand: string;
    image: string;
    price: number;
    stock: number;
    quantity: number;
    lineTotal: number;
  }[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
};

function sanitize(cart: CartLine[]): CartLine[] {
  return cart
    .filter(
      (line) =>
        typeof line?.slug === "string" && Number.isFinite(line?.quantity),
    )
    .map((line) => ({
      slug: line.slug,
      quantity: Math.max(1, Math.min(99, Math.floor(line.quantity))),
    }))
    .slice(0, 50);
}

export async function getCartSummary(cart: CartLine[]): Promise<CartSummary> {
  const resolved = resolveCart(sanitize(cart));
  return {
    lines: resolved.lines.map((line) => ({
      slug: line.product.slug,
      name: line.product.name,
      brand: line.product.brand,
      image: line.product.image,
      price: line.product.price,
      stock: line.product.stock,
      quantity: line.quantity,
      lineTotal: line.lineTotal,
    })),
    subtotal: resolved.subtotal,
    shipping: resolved.shipping,
    tax: resolved.tax,
    total: resolved.total,
  };
}

export type CheckoutInput = {
  customerName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  cart: CartLine[];
};

export type CheckoutResult =
  | { ok: true; reference: string }
  | { ok: false; error: string };

export async function placeOrder(
  input: CheckoutInput,
): Promise<CheckoutResult> {
  const cart = sanitize(input.cart);
  if (cart.length === 0) return { ok: false, error: "Your cart is empty." };

  const required: [keyof CheckoutInput, string][] = [
    ["customerName", "Full name"],
    ["email", "Email"],
    ["address", "Address"],
    ["city", "City"],
    ["country", "Country"],
  ];
  for (const [field, label] of required) {
    if (!String(input[field] ?? "").trim()) {
      return { ok: false, error: `${label} is required.` };
    }
  }
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(input.email.trim())) {
    return { ok: false, error: "Enter a valid email address." };
  }

  try {
    const order = createOrder({
      customerName: input.customerName.trim(),
      email: input.email.trim(),
      phone: input.phone.trim(),
      address: input.address.trim(),
      city: input.city.trim(),
      country: input.country.trim(),
      cart,
    });
    revalidatePath("/products");
    revalidatePath("/admin");
    return { ok: true, reference: order.reference };
  } catch {
    return { ok: false, error: "We could not place this order. Try again." };
  }
}
