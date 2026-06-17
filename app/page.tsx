import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardBody } from "@/components/ui/Card";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import { DEEPREAD_URL } from "@/lib/constants";

const STEPS = [
  {
    n: "1",
    title: "그냥 영어로 쓰기",
    desc: "톤은 안 골라도 돼요. 떠오르는 대로 편하게 영어로 써 내려가세요.",
  },
  {
    n: "2",
    title: "다양한 톤으로 피드백 받기",
    desc: "5차원 점수와 함께 격식·중립·구어 3가지 톤의 네이티브 리라이트를, 왜 그런지 이유까지 한 번에.",
  },
  {
    n: "3",
    title: "표현 모으기",
    desc: "마음에 든 네이티브 표현은 드래그 한 번으로 표현장에 쏙 담아요.",
  },
  {
    n: "4",
    title: "약점 복습",
    desc: "자주 틀리는 유형을 모아 두고, 오늘 할 맞춤 드릴을 제안해 드려요.",
  },
];

const FEATURES = [
  {
    icon: "📊",
    title: "빠짐없는 5차원 진단",
    desc: "한 문장도 대충 넘기지 않아요. 어휘·콜로케이션·구조·문법·톤을 점수로 보여주고, 왜 그렇게 써야 하는지 이유·규칙·빈도까지 설명해요. 톤은 고를 필요 없이 격식·중립·구어 3가지로 리라이트해 드려요.",
  },
  {
    icon: "💡",
    title: "라이브 콜로케이션 힌트",
    desc: "쓰는 중에 자연스러운 단어 결합과 격식 수준을 짚어주고, 한국인이 자주 틀리는 콩글리시를 바로 잡아드려요.",
  },
  {
    icon: "🎚️",
    title: "3톤 동시 변환",
    desc: "한 문장을 격식·중립·구어로 다시 쓰고, 무엇이 말투를 결정하는지 표로 비교해 드려요.",
  },
  {
    icon: "🔁",
    title: "역번역 트레이닝",
    desc: "한국어 의도를 영어로 옮기면, 그 영어를 직역해 되돌려 소실된 뉘앙스를 짚어 드려요.",
  },
  {
    icon: "📈",
    title: "약점 리포트",
    desc: "누적된 오류를 유형별 랭킹·추이로 정리하고, 오늘 집중할 맞춤 드릴을 추천해요.",
  },
  {
    icon: "🗂️",
    title: "표현장 · DEEPREAD 연동",
    desc: "마음에 든 네이티브 표현을 모아 두고 다시 써보며 익혀요. 읽기 앱 DEEPREAD와 이어집니다.",
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
          <Link href="/" className="flex items-baseline gap-2">
            <span className="text-lg font-bold tracking-tight text-brand">
              DEEPWRITE
            </span>
            <span className="hidden text-xs text-faint sm:inline">
              한 문장도 대충 쓰지 않는 영어 작문
            </span>
          </Link>
          <nav className="flex items-center gap-1 text-sm">
            <div className="hidden items-center gap-0.5 md:flex">
              {[
                { href: "/write", label: "작문" },
                { href: "/backtranslate", label: "역번역" },
                { href: "/weakness", label: "약점" },
                { href: "/expressions", label: "표현장" },
              ].map((t) => (
                <Link
                  key={t.href}
                  href={t.href}
                  className="rounded-badge px-3 py-1.5 text-soft hover:bg-paper2 hover:text-ink"
                >
                  {t.label}
                </Link>
              ))}
            </div>
            <a
              href={DEEPREAD_URL}
              className="rounded-badge px-3 py-1.5 font-medium text-read-dark hover:bg-read/10"
              title="읽기 트레이너 DEEPREAD로 이동"
            >
              읽기는 DEEPREAD ↗
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
            깊이 쓰는 영어 · 상급자용
          </Badge>
          <h1 className="mx-auto max-w-3xl text-4xl font-bold leading-tight text-ink sm:text-5xl">
            한 문장도
            <br />
            <span className="text-brand">대충 넘기지 않는</span> 영어 작문
          </h1>
          <div className="mx-auto mt-6 max-w-2xl space-y-2.5 text-lg leading-8 text-soft">
            <p>
              영어로 쓰고{" "}
              <span className="font-semibold text-ink">“뜻은 통하겠지”</span> 하고
              넘기셨죠?
            </p>
            <p>
              이제 통역사가 옆에 앉아{" "}
              <span className="font-semibold text-ink">한 겹씩 고쳐주듯</span> 봐
              드려요.
            </p>
            <p className="text-ink">
              단어 선택, 콜로케이션, 문장 구조, 그리고 말투까지.
            </p>
            <p>
              마음에 든 표현은 드래그 한 번으로 쏙, 잊어버릴 때쯤 알아서 다시
              꺼내 복습시켜 드릴게요.
            </p>
          </div>
          <div className="mt-8 flex items-center justify-center">
            <Link href={ctaHref}>
              <Button className="px-7">{ctaLabel}</Button>
            </Link>
          </div>
          <p className="mt-4 text-xs text-faint">
            부담 없이 시작하세요. 진단·3톤 비교·역번역·약점 리포트까지, 일단 다
            둘러보세요 😊
          </p>
        </section>

        {/* 실제 예시 */}
        <section className="mx-auto max-w-5xl px-4 pb-4">
          <h2 className="mb-6 text-center text-2xl font-bold text-ink">
            실제로 이렇게 고쳐 드려요
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardBody className="space-y-2 pt-5">
                <div className="text-xs font-medium text-faint">
                  문장 분석 · 말투까지
                </div>
                <p className="text-[15px] text-soft line-through decoration-gold/60">
                  I wanna change the plan.
                </p>
                <p className="text-[15px] font-medium text-ink">
                  격식: I’d like to revise the plan.
                </p>
                <p className="text-sm leading-relaxed text-soft">
                  왜 바뀔까요? <span className="text-ink">wanna</span>는 구어,
                  <span className="text-ink"> would like to·revise</span>는
                  정중·격식 — 같은 뜻도 목표 말투에 맞춰 인상을 조율해 드려요.
                </p>
              </CardBody>
            </Card>

            <Card>
              <CardBody className="space-y-3 pt-5">
                <div className="text-xs font-medium text-faint">
                  콜로케이션 · 콩글리시 교정
                </div>
                <div>
                  <div className="text-sm text-soft">물가를 자극하다</div>
                  <div className="text-[15px]">
                    <span className="text-gold line-through">stimulate prices</span>
                    <span className="mx-2 text-faint">→</span>
                    <span className="font-medium text-ink">fuel inflation</span>
                  </div>
                </div>
                <div>
                  <div className="text-sm text-soft">취약계층</div>
                  <div className="text-[15px]">
                    <span className="text-gold line-through">weak class</span>
                    <span className="mx-2 text-faint">→</span>
                    <span className="font-medium text-ink">vulnerable groups</span>
                  </div>
                </div>
                <p className="text-sm leading-relaxed text-soft">
                  한국어를 그대로 옮긴 어색한 직역·콩글리시를 잡아, 원어민이 실제로
                  쓰는 표현으로 바꿔 드려요.
                </p>
              </CardBody>
            </Card>
          </div>
        </section>

        {/* 사용법 */}
        <section className="mx-auto max-w-5xl px-4 py-16">
          <h2 className="text-center text-2xl font-bold text-ink">
            이렇게 써요
          </h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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

        {/* 기능 */}
        <section className="mx-auto max-w-5xl px-4 pb-8">
          <h2 className="mb-6 text-center text-2xl font-bold text-ink">
            무엇이 담겨 있나요
          </h2>
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

        {/* 마무리 CTA */}
        <section className="mx-auto max-w-5xl px-4 py-16">
          <div className="rounded-card bg-brand px-6 py-12 text-center text-white">
            <h2 className="text-2xl font-bold">
              지금 바로, 첫 한 편을 깊이 써볼까요?
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-white/85">
              짧은 글 3개로 내 영어의 베이스라인부터 진단해 드려요.
            </p>
            <Link href={ctaHref} className="mt-6 inline-block">
              <Button
                variant="secondary"
                className="border-transparent px-6 text-ink"
              >
                {loggedIn ? "대시보드로 가기" : "새 작문 시작"}
              </Button>
            </Link>
          </div>
        </section>
      </main>

      {/* 푸터 */}
      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-2 px-4 py-6 text-xs text-faint sm:flex-row">
          <span>
            Made by Megan, Seo · <span className="font-semibold text-brand">DEEPWRITE</span>
          </span>
          <div className="flex items-center gap-4">
            <a href={DEEPREAD_URL} className="text-read-dark hover:underline">
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
