"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE, adminPassword, isAdmin } from "@/lib/auth";
import { parsePriceInput, slugify } from "@/lib/format";
import {
  deleteProduct,
  insertProduct,
  updateOrderStatus,
  updateProduct,
  type ProductInput,
} from "@/lib/queries";
import { ORDER_STATUSES, type OrderStatus } from "@/lib/types";

export async function login(
  _prev: { error?: string } | undefined,
  formData: FormData,
): Promise<{ error?: string }> {
  const password = String(formData.get("password") ?? "");
  if (password !== adminPassword()) {
    return { error: "Incorrect password." };
  }
  const store = await cookies();
  store.set(ADMIN_COOKIE, "1", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8,
    secure: process.env.NODE_ENV === "production",
  });
  redirect("/admin");
}

export async function logout() {
  const store = await cookies();
  store.delete(ADMIN_COOKIE);
  redirect("/admin/login");
}

async function requireAdmin() {
  if (!(await isAdmin())) redirect("/admin/login");
}

function readProductForm(formData: FormData): ProductInput {
  const name = String(formData.get("name") ?? "").trim();
  const slugRaw = String(formData.get("slug") ?? "").trim();
  const specsRaw = String(formData.get("specs") ?? "").trim();

  const specs = specsRaw
    .split("\n")
    .map((line) => line.split(":"))
    .filter((parts) => parts.length >= 2)
    .map(
      (parts) =>
        [parts[0].trim(), parts.slice(1).join(":").trim()] as [string, string],
    );

  const compareAtRaw = String(formData.get("compareAtPrice") ?? "").trim();

  return {
    name,
    slug: slugify(slugRaw || name),
    brand: String(formData.get("brand") ?? "").trim(),
    category: String(formData.get("category") ?? "").trim(),
    description: String(formData.get("description") ?? "").trim(),
    price: parsePriceInput(String(formData.get("price") ?? "0")),
    compareAtPrice: compareAtRaw ? parsePriceInput(compareAtRaw) : null,
    image: String(formData.get("image") ?? "").trim(),
    stock: Number.parseInt(String(formData.get("stock") ?? "0"), 10) || 0,
    featured: formData.get("featured") ? 1 : 0,
    specs: JSON.stringify(specs),
  };
}

export async function saveProduct(formData: FormData) {
  await requireAdmin();

  const idRaw = String(formData.get("id") ?? "").trim();
  const input = readProductForm(formData);

  if (!input.name || !input.slug || input.price <= 0) {
    redirect("/admin/products?error=invalid");
  }

  if (idRaw) updateProduct(Number(idRaw), input);
  else insertProduct(input);

  revalidatePath("/admin/products");
  revalidatePath("/products");
  redirect("/admin/products?saved=1");
}

export async function removeProduct(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  if (Number.isFinite(id)) deleteProduct(id);
  revalidatePath("/admin/products");
  revalidatePath("/products");
  redirect("/admin/products?deleted=1");
}

export async function setOrderStatus(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  const status = String(formData.get("status") ?? "");
  if (
    Number.isFinite(id) &&
    (ORDER_STATUSES as readonly string[]).includes(status)
  ) {
    updateOrderStatus(id, status as OrderStatus);
  }
  revalidatePath("/admin/orders");
  redirect("/admin/orders");
}
