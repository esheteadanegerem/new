import "server-only";

import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";
import { SEED_PRODUCTS } from "./seed-data";

const DB_DIR = path.join(process.cwd(), "data");
const DB_PATH = process.env.DATABASE_PATH ?? path.join(DB_DIR, "store.db");

function createConnection(): Database.Database {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  const connection = new Database(DB_PATH);
  connection.pragma("journal_mode = WAL");
  migrate(connection);
  seed(connection);
  return connection;
}

function migrate(connection: Database.Database) {
  connection.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      brand TEXT NOT NULL,
      category TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      price INTEGER NOT NULL,
      compareAtPrice INTEGER,
      image TEXT NOT NULL DEFAULT '',
      stock INTEGER NOT NULL DEFAULT 0,
      rating REAL NOT NULL DEFAULT 0,
      reviewCount INTEGER NOT NULL DEFAULT 0,
      featured INTEGER NOT NULL DEFAULT 0,
      specs TEXT NOT NULL DEFAULT '[]',
      createdAt TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      reference TEXT NOT NULL UNIQUE,
      customerName TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL DEFAULT '',
      address TEXT NOT NULL,
      city TEXT NOT NULL,
      country TEXT NOT NULL,
      subtotal INTEGER NOT NULL,
      shipping INTEGER NOT NULL,
      tax INTEGER NOT NULL,
      total INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      createdAt TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      orderId INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      productId INTEGER NOT NULL,
      name TEXT NOT NULL,
      slug TEXT NOT NULL,
      image TEXT NOT NULL DEFAULT '',
      unitPrice INTEGER NOT NULL,
      quantity INTEGER NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(orderId);
    CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
  `);
}

function seed(connection: Database.Database) {
  const { count } = connection
    .prepare("SELECT COUNT(*) AS count FROM products")
    .get() as { count: number };
  if (count > 0) return;

  const insert = connection.prepare(`
    INSERT INTO products
      (slug, name, brand, category, description, price, compareAtPrice, image, stock, rating, reviewCount, featured, specs)
    VALUES
      (@slug, @name, @brand, @category, @description, @price, @compareAtPrice, @image, @stock, @rating, @reviewCount, @featured, @specs)
  `);

  const insertAll = connection.transaction(() => {
    for (const product of SEED_PRODUCTS) {
      insert.run({ ...product, specs: JSON.stringify(product.specs) });
    }
  });

  insertAll();
}

const globalForDb = globalThis as unknown as {
  voltixDb?: Database.Database;
};

export const db: Database.Database = globalForDb.voltixDb ?? createConnection();

if (process.env.NODE_ENV !== "production") {
  globalForDb.voltixDb = db;
}
