// 관리자 판별 — env ADMIN_EMAILS(쉼표 구분) 우선, 없으면 운영자 이메일 폴백.
// (별도 is_admin 컬럼 없이 이메일 화이트리스트로 게이트.)
const ADMIN_EMAILS = (
  process.env.ADMIN_EMAILS ?? "megan.seo@cyberdigm.co.kr"
)
  .split(",")
  .map((s) => s.trim().toLowerCase())
  .filter(Boolean);

export function isAdminEmail(email: string | null | undefined): boolean {
  return !!email && ADMIN_EMAILS.includes(email.toLowerCase());
}
