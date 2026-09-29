import "server-only";

import { db } from "./db";
import type { CartLine, Order, OrderItem, OrderStatus, Product } from "./types";

export type ProductFilters = {
  search?: string;
  category?: string;
  brand?: string;
  maxPrice?: number;
  sort?: string;
  inStockOnly?: boolean;
};

const SORTS: Record<string, string> = {
  featured: "featured DESC, rating DESC",
  "price-asc": "price ASC",
  "price-desc": "price DESC",
  rating: "rating DESC, reviewCount DESC",
  newest: "id DESC",
};

export function listProducts(filters: ProductFilters = {}): Product[] {
  const where: string[] = [];
  const params: Record<string, string | number> = {};

  if (filters.search) {
    where.push(
      "(name LIKE @search OR brand LIKE @search OR category LIKE @search OR description LIKE @search)",
    );
    params.search = `%${filters.search}%`;
  }
  if (filters.category) {
    where.push("category = @category");
    params.category = filters.category;
  }
  if (filters.brand) {
    where.push("brand = @brand");
    params.brand = filters.brand;
  }
  if (filters.maxPrice) {
    where.push("price <= @maxPrice");
    params.maxPrice = filters.maxPrice;
  }
  if (filters.inStockOnly) {
    where.push("stock > 0");
  }

  const orderBy = SORTS[filters.sort ?? "featured"] ?? SORTS.featured;
  const sql = `SELECT * FROM products ${
    where.length ? `WHERE ${where.join(" AND ")}` : ""
  } ORDER BY ${orderBy}`;

  return db.prepare(sql).all(params) as Product[];
}

export function getProductBySlug(slug: string): Product | undefined {
  return db.prepare("SELECT * FROM products WHERE slug = ?").get(slug) as
    | Product
    | undefined;
}

export function getProductById(id: number): Product | undefined {
  return db.prepare("SELECT * FROM products WHERE id = ?").get(id) as
    | Product
    | undefined;
}

export function getFeaturedProducts(limit = 8): Product[] {
  return db
    .prepare(
      "SELECT * FROM products WHERE featured = 1 ORDER BY rating DESC LIMIT ?",
    )
    .all(limit) as Product[];
}

export function getRelatedProducts(product: Product, limit = 4): Product[] {
  return db
    .prepare(
      "SELECT * FROM products WHERE category = ? AND id != ? ORDER BY rating DESC LIMIT ?",
    )
    .all(product.category, product.id, limit) as Product[];
}

export function listCategories(): { category: string; count: number }[] {
  return db
    .prepare(
      "SELECT category, COUNT(*) AS count FROM products GROUP BY category ORDER BY category",
    )
    .all() as { category: string; count: number }[];
}

export function listBrands(): string[] {
  const rows = db
    .prepare("SELECT DISTINCT brand FROM products ORDER BY brand")
    .all() as { brand: string }[];
  return rows.map((row) => row.brand);
}

export function getPriceRange(): { min: number; max: number } {
  const row = db
    .prepare("SELECT MIN(price) AS min, MAX(price) AS max FROM products")
    .get() as { min: number | null; max: number | null };
  return { min: row.min ?? 0, max: row.max ?? 0 };
}

export function getProductsBySlugs(slugs: string[]): Product[] {
  if (slugs.length === 0) return [];
  const placeholders = slugs.map(() => "?").join(",");
  return db
    .prepare(`SELECT * FROM products WHERE slug IN (${placeholders})`)
    .all(...slugs) as Product[];
}

export type ResolvedCart = {
  lines: { product: Product; quantity: number; lineTotal: number }[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
};

export const FREE_SHIPPING_THRESHOLD = 50000;
export const SHIPPING_FEE = 1499;
export const TAX_RATE = 0.08;

export function resolveCart(cart: CartLine[]): ResolvedCart {
  const products = getProductsBySlugs(cart.map((line) => line.slug));
  const bySlug = new Map(products.map((product) => [product.slug, product]));

  const lines = cart
    .map((line) => {
      const product = bySlug.get(line.slug);
      if (!product) return null;
      const quantity = Math.max(
        1,
        Math.min(Math.floor(line.quantity), Math.max(product.stock, 1)),
      );
      return { product, quantity, lineTotal: product.price * quantity };
    })
    .filter((line): line is NonNullable<typeof line> => line !== null);

  const subtotal = lines.reduce((sum, line) => sum + line.lineTotal, 0);
  const shipping =
    subtotal === 0 || subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  const tax = Math.round(subtotal * TAX_RATE);

  return { lines, subtotal, shipping, tax, total: subtotal + shipping + tax };
}

export type NewOrderInput = {
  customerName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  cart: CartLine[];
};

export function createOrder(input: NewOrderInput): Order {
  const resolved = resolveCart(input.cart);
  if (resolved.lines.length === 0) {
    throw new Error("Cart is empty");
  }

  const reference = `VLT-${Date.now().toString(36).toUpperCase()}`;

  const insertOrder = db.prepare(`
    INSERT INTO orders
      (reference, customerName, email, phone, address, city, country, subtotal, shipping, tax, total, status)
    VALUES
      (@reference, @customerName, @email, @phone, @address, @city, @country, @subtotal, @shipping, @tax, @total, 'paid')
  `);
  const insertItem = db.prepare(`
    INSERT INTO order_items (orderId, productId, name, slug, image, unitPrice, quantity)
    VALUES (@orderId, @productId, @name, @slug, @image, @unitPrice, @quantity)
  `);
  const decrementStock = db.prepare(
    "UPDATE products SET stock = MAX(0, stock - ?) WHERE id = ?",
  );

  const run = db.transaction(() => {
    const result = insertOrder.run({
      reference,
      customerName: input.customerName,
      email: input.email,
      phone: input.phone,
      address: input.address,
      city: input.city,
      country: input.country,
      subtotal: resolved.subtotal,
      shipping: resolved.shipping,
      tax: resolved.tax,
      total: resolved.total,
    });
    const orderId = Number(result.lastInsertRowid);

    for (const line of resolved.lines) {
      insertItem.run({
        orderId,
        productId: line.product.id,
        name: line.product.name,
        slug: line.product.slug,
        image: line.product.image,
        unitPrice: line.product.price,
        quantity: line.quantity,
      });
      decrementStock.run(line.quantity, line.product.id);
    }

    return orderId;
  });

  const orderId = run();
  return db.prepare("SELECT * FROM orders WHERE id = ?").get(orderId) as Order;
}

export function getOrderByReference(reference: string): Order | undefined {
  return db.prepare("SELECT * FROM orders WHERE reference = ?").get(reference) as
    | Order
    | undefined;
}

export function getOrderItems(orderId: number): OrderItem[] {
  return db
    .prepare("SELECT * FROM order_items WHERE orderId = ? ORDER BY id")
    .all(orderId) as OrderItem[];
}

export function listOrders(): Order[] {
  return db
    .prepare("SELECT * FROM orders ORDER BY id DESC")
    .all() as Order[];
}

export function updateOrderStatus(id: number, status: OrderStatus) {
  db.prepare("UPDATE orders SET status = ? WHERE id = ?").run(status, id);
}

export type ProductInput = {
  slug: string;
  name: string;
  brand: string;
  category: string;
  description: string;
  price: number;
  compareAtPrice: number | null;
  image: string;
  stock: number;
  featured: number;
  specs: string;
};

export function insertProduct(input: ProductInput) {
  db.prepare(`
    INSERT INTO products
      (slug, name, brand, category, description, price, compareAtPrice, image, stock, featured, specs, rating, reviewCount)
    VALUES
      (@slug, @name, @brand, @category, @description, @price, @compareAtPrice, @image, @stock, @featured, @specs, 0, 0)
  `).run(input);
}

export function updateProduct(id: number, input: ProductInput) {
  db.prepare(`
    UPDATE products SET
      slug = @slug, name = @name, brand = @brand, category = @category,
      description = @description, price = @price, compareAtPrice = @compareAtPrice,
      image = @image, stock = @stock, featured = @featured, specs = @specs
    WHERE id = @id
  `).run({ ...input, id });
}

export function deleteProduct(id: number) {
  db.prepare("DELETE FROM products WHERE id = ?").run(id);
}

export type DashboardStats = {
  productCount: number;
  orderCount: number;
  revenue: number;
  lowStock: number;
};

export function getDashboardStats(): DashboardStats {
  const products = db
    .prepare("SELECT COUNT(*) AS count FROM products")
    .get() as { count: number };
  const orders = db
    .prepare(
      "SELECT COUNT(*) AS count, COALESCE(SUM(total), 0) AS revenue FROM orders WHERE status != 'cancelled'",
    )
    .get() as { count: number; revenue: number };
  const lowStock = db
    .prepare("SELECT COUNT(*) AS count FROM products WHERE stock <= 10")
    .get() as { count: number };

  return {
    productCount: products.count,
    orderCount: orders.count,
    revenue: orders.revenue,
    lowStock: lowStock.count,
  };
}
