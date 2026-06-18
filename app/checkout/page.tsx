import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { PLAN_INFO, isPurchasablePlan } from "@/lib/constants";
import { CheckoutClient } from "@/components/billing/CheckoutClient";

function won(n: number): string {
  return "₩" + n.toLocaleString("ko-KR");
}

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string }>;
}) {
  const { plan } = await searchParams;

  // 결제 가능한 플랜이 아니면 요금제로.
  if (!plan || !isPurchasablePlan(plan)) redirect("/pricing");

  if (!isSupabaseConfigured) redirect("/pricing");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  // proxy 가 이미 보호하지만 방어적으로 한 번 더.
  if (!user)
    redirect(
      `/login?redirectTo=${encodeURIComponent(`/checkout?plan=${plan}`)}`,
    );

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", user.id)
    .maybeSingle();

  const info = PLAN_INFO[plan];
  const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY ?? null;

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-line bg-paper/80">
        <div className="mx-auto flex h-14 max-w-2xl items-center justify-between px-4">
          <Link href="/" className="text-lg font-bold tracking-tight text-brand">
            DEEPWRITE
          </Link>
          <Link href="/pricing" className="text-sm text-soft hover:text-ink">
            요금제 보기
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-md flex-1 px-4 py-12">
        <h1 className="text-2xl font-bold text-ink">구독 시작</h1>
        <p className="mt-2 text-sm text-soft">
          선택하신 요금제를 확인하고 결제를 진행해 주세요.
        </p>

        <div className="mt-6 rounded-card border border-ox bg-card p-5 shadow-card ring-1 ring-ox/30">
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-ink">{info.name}</span>
            <span className="text-xl font-bold text-ink">
              {won(info.amount)}
              <span className="ml-1 text-xs font-normal text-faint">/월</span>
            </span>
          </div>
          <p className="mt-1 text-xs text-faint">{user.email}</p>
        </div>

        <div className="mt-6">
          <CheckoutClient
            clientKey={clientKey}
            customerKey={user.id}
            plan={plan}
            email={user.email ?? null}
            name={profile?.display_name ?? ""}
          />
        </div>
      </main>
    </div>
  );
}
