import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { DEEPREAD_URL } from "@/lib/constants";
import { isAdminEmail } from "@/lib/admin";
import { HeaderMenu } from "@/components/layout/HeaderMenu";

const NAV = [
  { href: "/write", label: "작문" },
  { href: "/writings", label: "기록" },
  { href: "/backtranslate", label: "역번역" },
  { href: "/expressions", label: "어휘장" },
  { href: "/weakness", label: "약점" },
];

export async function AppHeader() {
  let email: string | null = null;
  let isAdmin = false;
  if (isSupabaseConfigured) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    email = user?.email ?? null;
    isAdmin = isAdminEmail(email);
  }

  return (
    <header className="sticky top-0 z-10 border-b border-line bg-paper/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <Link href="/" className="flex items-baseline gap-1.5">
          <span className="text-lg font-bold tracking-tight text-brand">
            DEEPWRITE
          </span>
          <span className="hidden text-xs text-faint sm:inline">
            작문 트레이너
          </span>
        </Link>

        <nav className="flex items-center gap-1 text-sm">
          <div className="hidden items-center gap-1 md:flex">
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className="rounded-badge px-3 py-1.5 text-soft hover:bg-paper2 hover:text-ink"
              >
                {n.label}
              </Link>
            ))}
          </div>
          <a
            href={DEEPREAD_URL}
            className="rounded-badge px-3 py-1.5 font-medium text-read-dark hover:bg-read/10"
          >
            ← DEEPREAD로
          </a>
          {email ? (
            <HeaderMenu email={email} navItems={NAV} isAdmin={isAdmin} />
          ) : (
            <Link
              href="/login"
              className="rounded-badge px-3 py-1.5 text-soft hover:bg-paper2 hover:text-ink"
            >
              로그인
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
