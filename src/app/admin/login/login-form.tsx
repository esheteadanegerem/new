"use client";

import { useActionState } from "react";
import { login } from "../actions";

export function LoginForm() {
  const [state, formAction, pending] = useActionState(login, {});

  return (
    <form action={formAction} className="mt-8 space-y-4">
      <label className="block">
        <span className="text-sm font-medium text-slate-700">Password</span>
        <input
          name="password"
          type="password"
          required
          autoFocus
          className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-900"
        />
      </label>

      {state?.error && (
        <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-xl bg-slate-900 py-3 text-sm font-semibold text-white hover:bg-slate-700 disabled:bg-slate-400"
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>

      <p className="text-xs text-slate-500">
        Default demo password: <code>voltix-admin</code> (override with the
        ADMIN_PASSWORD environment variable).
      </p>
    </form>
  );
}
