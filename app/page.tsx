import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardBody } from "@/components/ui/Card";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

const DEEPREAD_URL = process.env.NEXT_PUBLIC_DEEPREAD_URL ?? "#";

const FEATURES = [
  {
    icon: "📊",
    title: "5차원 진단 + 네이티브 리라이트",
    desc: "어휘·콜로케이션·구조·응집·톤을 점수로 보여주고, 왜 그렇게 써야 하는지 이유·규칙·빈도까지 설명합니다.",
  },
  {
    icon: "💡",
    title: "라이브 콜로케이션 힌트",
    desc: "쓰는 중에 자연스러운 단어 결합과 격식 수준, 한국인이 자주 틀리는 Konglish 경고를 바로 띄워줍니다.",
  },
  {
    icon: "🎚️",
    title: "3톤 동시 변환",
    desc: "한 문장을 격식·중립·구어 세 가지로 다시 쓰고, 무엇이 톤을 결정하는지 표로 비교합니다.",
  },
  {
    icon: "🔁",
    title: "역번역 트레이닝",
    desc: "한국어 의도를 영어로 옮기면, 그 영어를 직역해 되돌려 소실된 뉘앙스를 짚어줍니다.",
  },
  {
    icon: "📈",
    title: "약점 리포트",
    desc: "누적된 오류를 유형별 랭킹·추이로 정리하고, 오늘 집중할 맞춤 드릴을 제안합니다.",
  },
  {
    icon: "🗂️",
    title: "표현장",
    desc: "마음에 드는 네이티브 표현을 저장해 두고 다시 써보며 익힙니다. DEEPREAD와 연동됩니다.",
  },
];

const STEPS = [
  {
    n: "1",
    title: "톤 정하고 영어로 쓰기",
    desc: "격식·중립·구어 중 목표 톤을 고르고 자유롭게 작문하세요.",
  },
  {
    n: "2",
    title: "진단받기",
    desc: "5차원 점수, 네이티브 리라이트, ‘왜 이 표현인가’ 설명을 한 번에.",
  },
  {
    n: "3",
    title: "약점 보완하며 반복",
    desc: "누적 약점과 맞춤 드릴로 다음 글을 더 단단하게.",
  },
];

export default async function LandingPage() {
  let loggedIn = false;
  if (isSupabaseConfigured) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    loggedIn = !!user;
  }

  const ctaHref = loggedIn ? "/dashboard" : "/login";
  const ctaLabel = loggedIn ? "대시보드로 가기" : "무료로 시작하기";

  return (
    <div className="flex min-h-screen flex-col">
      {/* 헤더 */}
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
            <a
              href={DEEPREAD_URL}
              className="rounded-badge px-3 py-1.5 text-ox-dark hover:bg-ox/10"
            >
              DEEPREAD
            </a>
            <Link href={ctaHref}>
              <Button size="sm">{loggedIn ? "대시보드" : "로그인"}</Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* 히어로 */}
        <section className="mx-auto max-w-5xl px-4 py-16 text-center sm:py-24">
          <Badge tone="ox" className="mb-5">
            AI 영어 작문 트레이너
          </Badge>
          <h1 className="mx-auto max-w-3xl text-4xl font-bold leading-tight text-ink sm:text-5xl">
            통역사가 옆에서 고쳐주듯,
            <br />
            <span className="text-brand">5차원으로 분석하는</span> 영어 작문
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-soft">
            내가 쓴 영어를 어휘·콜로케이션·구조·응집·톤으로 진단하고, 네이티브
            리라이트와 ‘왜 그렇게 써야 하는지’까지 알려드립니다.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link href={ctaHref}>
              <Button className="px-6">{ctaLabel}</Button>
            </Link>
            <a href={DEEPREAD_URL}>
              <Button variant="secondary" className="px-6">
                읽기는 DEEPREAD에서
              </Button>
            </a>
          </div>
          <p className="mt-4 text-xs text-faint">
            무료 플랜으로 하루 3편까지 진단 · 카드 등록 없이 시작
          </p>
        </section>

        {/* 기능 */}
        <section className="mx-auto max-w-5xl px-4 pb-8">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <Card key={f.title}>
                <CardBody className="pt-5">
                  <div className="text-2xl">{f.icon}</div>
                  <h3 className="mt-3 text-sm font-semibold text-ink">
                    {f.title}
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-soft">
                    {f.desc}
                  </p>
                </CardBody>
              </Card>
            ))}
          </div>
        </section>

        {/* 사용법 */}
        <section className="mx-auto max-w-5xl px-4 py-16">
          <h2 className="text-center text-2xl font-bold text-ink">
            이렇게 쓰면 됩니다
          </h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {STEPS.map((s) => (
              <div
                key={s.n}
                className="rounded-card border border-line2 bg-card p-5 shadow-card"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-ox/10 text-sm font-bold text-ox-dark">
                  {s.n}
                </div>
                <h3 className="mt-3 text-sm font-semibold text-ink">
                  {s.title}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-soft">
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* 마무리 CTA */}
        <section className="mx-auto max-w-5xl px-4 pb-20">
          <div className="rounded-card bg-brand px-6 py-12 text-center text-white">
            <h2 className="text-2xl font-bold">
              오늘 한 편, 통역사의 시선으로 고쳐보세요
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-white/85">
              짧은 글 3개로 내 영어의 베이스라인부터 진단해 드립니다.
            </p>
            <Link href={ctaHref} className="mt-6 inline-block">
              <Button
                variant="secondary"
                className="border-transparent px-6 text-ink"
              >
                {ctaLabel}
              </Button>
            </Link>
          </div>
        </section>
      </main>

      {/* 푸터 */}
      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-2 px-4 py-6 text-xs text-faint sm:flex-row">
          <span className="font-semibold text-brand">DEEPWRITE</span>
          <div className="flex items-center gap-4">
            <a href={DEEPREAD_URL} className="hover:text-soft">
              DEEPREAD (읽기 트레이너)
            </a>
            <Link href="/login" className="hover:text-soft">
              로그인
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
