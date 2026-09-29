"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
} from "react";
import type { CartLine } from "@/lib/types";

const STORAGE_KEY = "voltix.cart.v1";
const EMPTY: CartLine[] = [];

let cachedRaw: string | null = null;
let cachedLines: CartLine[] = EMPTY;
let hydrated = false;
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

function parse(raw: string | null): CartLine[] {
  if (!raw) return EMPTY;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return EMPTY;
    return parsed.flatMap((entry) => {
      if (typeof entry !== "object" || entry === null) return [];
      const { slug, quantity } = entry as Partial<CartLine>;
      if (typeof slug !== "string" || typeof quantity !== "number") return [];
      return [{ slug, quantity: Math.max(1, Math.floor(quantity)) }];
    });
  } catch {
    return EMPTY;
  }
}

function readStorage(): CartLine[] {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedLines = parse(raw);
  }
  return cachedLines;
}

// Storage is only read after the first subscription so that the hydration
// render matches the server markup, then listeners are notified.
function getSnapshot(): CartLine[] {
  return hydrated ? readStorage() : EMPTY;
}

function getServerSnapshot(): CartLine[] {
  return EMPTY;
}

function isHydrated(): boolean {
  return hydrated;
}

function notHydrated(): boolean {
  return false;
}

function subscribe(onChange: () => void): () => void {
  listeners.add(onChange);
  window.addEventListener("storage", onChange);
  if (!hydrated) {
    hydrated = true;
    queueMicrotask(emit);
  }
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onChange);
  };
}

function write(lines: CartLine[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  emit();
}

type CartContextValue = {
  lines: CartLine[];
  count: number;
  ready: boolean;
  add: (slug: string, quantity?: number) => void;
  setQuantity: (slug: string, quantity: number) => void;
  remove: (slug: string) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const lines = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const ready = useSyncExternalStore(subscribe, isHydrated, notHydrated);

  const add = useCallback((slug: string, quantity = 1) => {
    const current = readStorage();
    const existing = current.find((line) => line.slug === slug);
    write(
      existing
        ? current.map((line) =>
            line.slug === slug
              ? { ...line, quantity: line.quantity + quantity }
              : line,
          )
        : [...current, { slug, quantity }],
    );
  }, []);

  const setQuantity = useCallback((slug: string, quantity: number) => {
    const current = readStorage();
    write(
      quantity <= 0
        ? current.filter((line) => line.slug !== slug)
        : current.map((line) =>
            line.slug === slug ? { ...line, quantity } : line,
          ),
    );
  }, []);

  const remove = useCallback((slug: string) => {
    write(readStorage().filter((line) => line.slug !== slug));
  }, []);

  const clear = useCallback(() => write([]), []);

  const value = useMemo<CartContextValue>(
    () => ({
      lines,
      count: lines.reduce((sum, line) => sum + line.quantity, 0),
      ready,
      add,
      setQuantity,
      remove,
      clear,
    }),
    [lines, ready, add, setQuantity, remove, clear],
  );

  return <CartContext value={value}>{children}</CartContext>;
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside a CartProvider");
  return context;
}
