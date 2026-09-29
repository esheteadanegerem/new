export type Product = {
  id: number;
  slug: string;
  name: string;
  brand: string;
  category: string;
  description: string;
  price: number;
  compareAtPrice: number | null;
  image: string;
  stock: number;
  rating: number;
  reviewCount: number;
  featured: number;
  specs: string;
  createdAt: string;
};

export type OrderItem = {
  id: number;
  orderId: number;
  productId: number;
  name: string;
  slug: string;
  image: string;
  unitPrice: number;
  quantity: number;
};

export type Order = {
  id: number;
  reference: string;
  customerName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  status: OrderStatus;
  createdAt: string;
};

export const ORDER_STATUSES = [
  "pending",
  "paid",
  "shipped",
  "delivered",
  "cancelled",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export type CartLine = {
  slug: string;
  quantity: number;
};
