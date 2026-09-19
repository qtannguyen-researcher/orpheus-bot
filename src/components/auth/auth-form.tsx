"use client";

import { useActionState, useState } from "react";
import {
  signInWithPassword,
  signUpWithPassword,
  type AuthFormState,
} from "@/lib/supabase/actions";

export function AuthForm({
  nextPath,
  configured,
}: {
  nextPath: string;
  configured: boolean;
}) {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const action = mode === "signin" ? signInWithPassword : signUpWithPassword;
  const [state, formAction, pending] = useActionState<AuthFormState, FormData>(action, {});

  return (
    <form action={formAction} className="flex flex-col gap-4 text-ink">
      <input type="hidden" name="next" value={nextPath} />
      <label className="flex flex-col gap-1 text-sm">
        <span className="text-muted">Email</span>
        <input
          name="email"
          type="email"
          autoComplete="email"
          required
          className="border border-rule bg-paper px-3 py-2 outline-none focus:border-gold"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span className="text-muted">Password</span>
        <input
          name="password"
          type="password"
          autoComplete={mode === "signin" ? "current-password" : "new-password"}
          required
          minLength={8}
          className="border border-rule bg-paper px-3 py-2 outline-none focus:border-gold"
        />
      </label>
      {!configured ? (
        <p className="text-sm text-danger">
          Supabase keys are missing. Copy `.env.example` to `.env.local` before signing in.
        </p>
      ) : null}
      {state.error ? <p className="text-sm text-danger">{state.error}</p> : null}
      <button
        type="submit"
        disabled={pending || !configured}
        className="bg-ink px-4 py-2.5 text-sm text-paper disabled:opacity-50"
      >
        {pending ? "Working…" : mode === "signin" ? "Enter the studio" : "Create account"}
      </button>
      <button
        type="button"
        className="text-sm text-muted underline-offset-4 hover:text-ink hover:underline"
        onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
      >
        {mode === "signin" ? "Need an account?" : "Already have an account?"}
      </button>
    </form>
  );
}
