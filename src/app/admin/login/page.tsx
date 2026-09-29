import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import { LoginForm } from "./login-form";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin sign in",
};

export default async function AdminLoginPage() {
  if (await isAdmin()) redirect("/admin");

  return (
    <div className="mx-auto max-w-md px-4 py-20 sm:px-6">
      <h1 className="text-2xl font-bold tracking-tight">Admin sign in</h1>
      <p className="mt-2 text-sm text-slate-600">
        Manage products, stock and orders.
      </p>
      <LoginForm />
    </div>
  );
}
