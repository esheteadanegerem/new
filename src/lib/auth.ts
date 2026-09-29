import "server-only";

import { cookies } from "next/headers";

export const ADMIN_COOKIE = "voltix_admin";

export function adminPassword(): string {
  return process.env.ADMIN_PASSWORD ?? "voltix-admin";
}

export async function isAdmin(): Promise<boolean> {
  const store = await cookies();
  return store.get(ADMIN_COOKIE)?.value === "1";
}
