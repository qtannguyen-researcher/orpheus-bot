import Link from "next/link";
import { CURRENT_MILESTONE } from "@/lib/product/roadmap";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { signOut } from "@/lib/supabase/actions";

export async function SiteHeader({ tone = "ink" }: { tone?: "ink" | "paper" }) {
  const configured = isSupabaseConfigured();
  let email: string | null = null;

  if (configured) {
    const supabase = await createSupabaseServerClient();
    const { data } = await supabase.auth.getUser();
    email = data.user?.email ?? null;
  }

  const onPaper = tone === "paper";

  return (
    <header
      className={`flex items-center justify-between gap-6 border-b px-6 py-4 md:px-10 ${
        onPaper ? "border-rule/70 bg-paper text-ink" : "border-white/10 bg-ink text-paper"
      }`}
    >
      <Link href="/" className="flex items-baseline gap-3">
        <span className="font-serif text-2xl tracking-tight">Orpheus</span>
        <span className={`hidden font-mono text-[11px] sm:inline ${onPaper ? "text-muted" : "text-paper/55"}`}>
          {CURRENT_MILESTONE}
        </span>
      </Link>
      <nav className={`flex items-center gap-5 text-sm ${onPaper ? "text-ink-soft" : "text-paper/80"}`}>
        <Link href="/roadmap" className="hover:text-gold">
          Roadmap
        </Link>
        <Link href="/studio" className="hover:text-gold">
          Studio
        </Link>
        {email ? (
          <form action={signOut}>
            <button type="submit" className="hover:text-gold">
              Sign out
            </button>
          </form>
        ) : (
          <Link href="/login" className="hover:text-gold">
            Sign in
          </Link>
        )}
      </nav>
    </header>
  );
}
