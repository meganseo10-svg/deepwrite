import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { signOut } from "@/app/(auth)/login/actions";
import { DEEPREAD_URL } from "@/lib/constants";

export async function AppHeader() {
  let email: string | null = null;
  if (isSupabaseConfigured) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    email = user?.email ?? null;
  }

  return (
    <header className="sticky top-0 z-10 border-b border-line bg-paper/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="flex items-baseline gap-1.5">
            <span className="text-lg font-bold tracking-tight text-brand">
              DEEPWRITE
            </span>
            <span className="text-xs text-faint">작문 트레이너</span>
          </Link>
        </div>
        <nav className="flex items-center gap-1 text-sm">
          <Link
            href="/write"
            className="rounded-badge px-3 py-1.5 text-soft hover:bg-paper2 hover:text-ink"
          >
            작문
          </Link>
          <Link
            href="/backtranslate"
            className="rounded-badge px-3 py-1.5 text-soft hover:bg-paper2 hover:text-ink"
          >
            역번역
          </Link>
          <Link
            href="/expressions"
            className="rounded-badge px-3 py-1.5 text-soft hover:bg-paper2 hover:text-ink"
          >
            표현장
          </Link>
          <Link
            href="/weakness"
            className="rounded-badge px-3 py-1.5 text-soft hover:bg-paper2 hover:text-ink"
          >
            약점
          </Link>
          <a
            href={DEEPREAD_URL}
            className="rounded-badge px-3 py-1.5 text-ox-dark hover:bg-ox/10"
          >
            ← DEEPREAD로
          </a>
          {email ? (
            <form action={signOut} className="ml-2 flex items-center gap-2">
              <span className="hidden text-xs text-faint sm:inline">
                {email}
              </span>
              <button
                type="submit"
                className="rounded-badge px-3 py-1.5 text-soft hover:bg-paper2 hover:text-ink"
              >
                로그아웃
              </button>
            </form>
          ) : (
            <Link
              href="/login"
              className="ml-2 rounded-badge px-3 py-1.5 text-soft hover:bg-paper2 hover:text-ink"
            >
              로그인
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
