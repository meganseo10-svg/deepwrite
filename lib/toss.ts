import "server-only";

// 토스페이먼츠 빌링(자동결제) 서버 헬퍼. 시크릿 키는 서버에서만 사용.
//   - 인증: Basic base64(`${secretKey}:`)  (비밀번호 빈 문자열)
//   - 빌링키 발급: authKey(클라 requestBillingAuth 결과) + customerKey → billingKey
//   - 결제 승인: billingKey 로 금액 청구
// 문서: https://docs.tosspayments.com/reference (빌링)

const TOSS_API = "https://api.tosspayments.com/v1";

// 키 미설정 시 결제 UI 를 '준비 중'으로 안전하게 비활성화하기 위한 플래그.
export const isTossConfigured = !!process.env.TOSS_SECRET_KEY;

export class TossError extends Error {
  code?: string;
  constructor(message: string, code?: string) {
    super(message);
    this.name = "TossError";
    this.code = code;
  }
}

function authHeader(): string {
  const secret = process.env.TOSS_SECRET_KEY ?? "";
  const token = Buffer.from(`${secret}:`).toString("base64");
  return `Basic ${token}`;
}

async function tossPost(path: string, body: unknown): Promise<Record<string, unknown>> {
  const res = await fetch(`${TOSS_API}${path}`, {
    method: "POST",
    headers: {
      Authorization: authHeader(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok) {
    const msg = typeof data.message === "string" ? data.message : "토스 요청 실패";
    const code = typeof data.code === "string" ? data.code : undefined;
    throw new TossError(msg, code);
  }
  return data;
}

// authKey + customerKey → 빌링키 발급
export async function issueBillingKey(
  authKey: string,
  customerKey: string,
): Promise<{ billingKey: string }> {
  const data = await tossPost("/billing/authorizations/issue", {
    authKey,
    customerKey,
  });
  const billingKey = data.billingKey;
  if (typeof billingKey !== "string")
    throw new TossError("빌링키 응답이 올바르지 않습니다.");
  return { billingKey };
}

// 빌링키로 결제 승인 (첫 결제 / 향후 재결제 공용)
export async function chargeBilling(
  billingKey: string,
  opts: { customerKey: string; amount: number; orderId: string; orderName: string },
): Promise<{ orderId: string; approvedAt?: string }> {
  const data = await tossPost(`/billing/${billingKey}`, {
    customerKey: opts.customerKey,
    amount: opts.amount,
    orderId: opts.orderId,
    orderName: opts.orderName,
  });
  return {
    orderId: typeof data.orderId === "string" ? data.orderId : opts.orderId,
    approvedAt: typeof data.approvedAt === "string" ? data.approvedAt : undefined,
  };
}
