import Link from "next/link";
import { buttonClass } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import { DEEPREAD_URL, isPurchasablePlan } from "@/lib/constants";
import { isAdminEmail } from "@/lib/admin";
import { HeaderMenu } from "@/components/layout/HeaderMenu";

const NAV = [
  { href: "/write", label: "작문" },
  { href: "/backtranslate", label: "역번역" },
  { href: "/weakness", label: "약점" },
  { href: "/expressions", label: "표현장" },
];

type Plan = {
  key: string;
  name: string;
  price: string;
  unit?: string;
  tagline: string;
  features: string[];
  highlight?: boolean;
};

const PLANS: Plan[] = [
  {
    key: "free",
    name: "Free",
    price: "₩0",
    tagline: "부담 없이 시작",
    features: ["하루 작문 3편", "5차원 진단 요약", "약점 미리보기"],
  },
  {
    key: "basic",
    name: "Basic",
    price: "₩9,900",
    unit: "/월",
    tagline: "매일 쓰는 사람",
    features: ["작문 무제한", "5차원 진단 전체", "약점 추적·추이"],
  },
  {
    key: "pro",
    name: "Pro",
    price: "₩19,900",
    unit: "/월",
    tagline: "가장 인기",
    highlight: true,
    features: [
      "Basic의 모든 기능",
      "역번역 트레이닝",
      "3톤 멀티톤 전체",
      "라이브 힌트·비교 단어 카드",
      "장르 트랙 · 개작",
      "DEEPREAD 연동",
    ],
  },
  {
    key: "master",
    name: "Master",
    price: "₩39,900",
    unit: "/월",
    tagline: "학술·통번역 특화",
    features: ["Pro의 모든 기능", "학술/통대 심층 피드백", "CEFR 리포트"],
  },
  {
    key: "business",
    name: "Business",
    price: "₩15,000",
    unit: "/인",
    tagline: "팀·기업",
    features: ["회사 문체 가이드", "관리자 대시보드", "팀 시트 관리"],
  },
];

export default async function PricingPage() {
  let email: string | null = null;
  let isAdmin = false;
  let currentPlan = "free";
  if (isSupabaseConfigured) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    email = user?.email ?? null;
    isAdmin = isAdminEmail(email);
    if (user) {
      const { data } = await supabase
        .from("profiles")
        .select("plan")
        .eq("id", user.id)
        .maybeSingle();
      currentPlan = data?.plan ?? "free";
    }
  }
  const loggedIn = !!email;

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b border-line bg-paper/80 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <Link href="/" className="flex items-baseline gap-2">
            <span className="text-lg font-bold tracking-tight text-brand">
              DEEPWRITE
            </span>
            <span className="hidden text-xs text-faint sm:inline">요금제</span>
          </Link>
          <nav className="flex items-center gap-1 text-sm">
            <a
              href={DEEPREAD_URL}
              className="rounded-badge px-3 py-1.5 font-medium text-read-dark hover:bg-read/10"
            >
              읽기는 DEEPREAD ↗
            </a>
            {loggedIn ? (
              <HeaderMenu email={email} navItems={NAV} isAdmin={isAdmin} />
            ) : (
              <Link href="/login" className={buttonClass({ size: "sm" })}>
                로그인
              </Link>
            )}
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-16">
        <div className="text-center">
          <Badge tone="ox" className="mb-4">
            요금제
          </Badge>
          <h1 className="text-3xl font-bold text-ink sm:text-4xl">
            깊이만큼만, 필요한 만큼
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm text-soft">
            무료로 충분히 둘러보고, 더 깊이 쓰고 싶을 때 올리면 돼요.
          </p>
        </div>

        <div className="mt-10 grid items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PLANS.map((p) => (
            <div
              key={p.key}
              className={
                "flex flex-col rounded-card border bg-card p-5 shadow-card " +
                (p.highlight
                  ? "border-ox ring-1 ring-ox/30"
                  : "border-line2")
              }
            >
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-ink">{p.name}</h2>
                {p.highlight && <Badge tone="ox">{p.tagline}</Badge>}
              </div>
              {!p.highlight && (
                <div className="mt-0.5 text-xs text-faint">{p.tagline}</div>
              )}
              <div className="mt-3 flex items-baseline gap-1">
                <span className="text-2xl font-bold text-ink">{p.price}</span>
                {p.unit && <span className="text-xs text-faint">{p.unit}</span>}
              </div>

              <ul className="mt-4 flex-1 space-y-1.5">
                {p.features.map((f, i) => (
                  <li key={i} className="flex gap-2 text-sm text-soft">
                    <span className="text-ox-dark">✓</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-5">
                {loggedIn && p.key === currentPlan ? (
                  <span
                    className={buttonClass({
                      variant: "secondary",
                      className: "w-full cursor-default opacity-60",
                    })}
                    aria-disabled="true"
                  >
                    현재 이용 중
                  </span>
                ) : p.key === "free" ? (
                  <Link
                    href={loggedIn ? "/write" : "/login"}
                    className={buttonClass({
                      variant: p.highlight ? "primary" : "secondary",
                      className: "w-full",
                    })}
                  >
                    {loggedIn ? "작문 시작" : "무료로 시작"}
                  </Link>
                ) : isPurchasablePlan(p.key) ? (
                  <Link
                    href={
                      loggedIn
                        ? `/checkout?plan=${p.key}`
                        : `/login?redirectTo=${encodeURIComponent(`/checkout?plan=${p.key}`)}`
                    }
                    className={buttonClass({
                      variant: p.highlight ? "primary" : "secondary",
                      className: "w-full",
                    })}
                  >
                    {p.name} 시작하기
                  </Link>
                ) : (
                  // Business: 인당 과금이라 자가결제 대신 문의.
                  <a
                    href="mailto:megan.seo@cyberdigm.co.kr?subject=DEEPWRITE Business 문의"
                    className={buttonClass({ variant: "secondary", className: "w-full" })}
                  >
                    문의하기
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>

        <p className="mt-8 text-center text-xs text-faint">
          결제는 토스페이먼츠로 안전하게 처리되며, 언제든 마이페이지에서 해지할 수
          있어요. · MVP 게이트: 비교 단어 카드·역번역은 Pro 전용. · Business는 문의해
          주세요.
        </p>
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-6 text-xs text-faint">
          <Link href="/" className="hover:text-soft">
            ← 홈으로
          </Link>
          <span>Made by Megan, Seo</span>
        </div>
      </footer>
    </div>
  );
}
