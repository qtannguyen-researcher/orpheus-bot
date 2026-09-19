import { AuthForm } from "@/components/auth/auth-form";
import { SiteFooter } from "@/components/brand/site-footer";
import { SiteHeader } from "@/components/brand/site-header";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export const metadata = {
  title: "Sign in",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const params = await searchParams;
  const nextPath = params.next?.startsWith("/") ? params.next : "/studio";

  return (
    <div className="flex min-h-full flex-col">
      <SiteHeader />
      <main className="flex flex-1 items-center justify-center px-6 py-16">
        <div className="w-full max-w-md border border-white/10 bg-paper px-8 py-10">
          <p className="text-xs uppercase tracking-[0.22em] text-muted">Account</p>
          <h1 className="mt-2 font-serif text-3xl text-ink">Sign in to Orpheus</h1>
          <p className="mt-2 text-sm text-muted">
            Uploads are private to your account. Magic-link and OAuth can wait; password is the M0
            path.
          </p>
          <div className="mt-8">
            <AuthForm nextPath={nextPath} configured={isSupabaseConfigured()} />
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
