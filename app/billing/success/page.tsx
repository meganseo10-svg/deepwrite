import { redirect } from "next/navigation";
import { BillingConfirm } from "@/components/billing/BillingConfirm";

// 토스 빌링 인증 성공 콜백. 토스가 customerKey·authKey 를 쿼리로 붙여 보낸다.
export default async function BillingSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string; customerKey?: string; authKey?: string }>;
}) {
  const { plan, customerKey, authKey } = await searchParams;
  if (!plan || !customerKey || !authKey) redirect("/pricing");

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <BillingConfirm plan={plan} customerKey={customerKey} authKey={authKey} />
      </div>
    </div>
  );
}
