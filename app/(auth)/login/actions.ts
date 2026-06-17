"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";

export type AuthState = { error?: string; message?: string };

function sanitizeRedirect(value: FormDataEntryValue | null): string {
  const v = typeof value === "string" ? value : "";
  // 오픈 리다이렉트 방지: 같은 사이트 경로만 허용.
  return v.startsWith("/") && !v.startsWith("//") ? v : "/dashboard";
}

// OAuth/메일 콜백용 절대 origin. 프로덕션(Vercel)에서 origin 헤더가 없을 때
// 프록시 헤더로 폴백 (NEXT_PUBLIC_APP_URL 미사용 — 실제 요청 호스트 우선).
async function getOrigin(): Promise<string> {
  const h = await headers();
  const origin = h.get("origin");
  if (origin) return origin;
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "https";
  return host ? `${proto}://${host}` : "";
}

export async function signIn(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const redirectTo = sanitizeRedirect(formData.get("redirectTo"));

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: "이메일 또는 비밀번호가 올바르지 않습니다." };

  redirect(redirectTo);
}

export async function signUp(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  if (password.length < 6)
    return { error: "비밀번호는 6자 이상이어야 합니다." };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) return { error: error.message };

  // 이메일 확인이 꺼져 있으면 세션이 바로 생성됨 → 대시보드로.
  if (data.session) redirect("/dashboard");

  return {
    message: "확인 메일을 보냈습니다. 메일의 링크를 눌러 가입을 완료하세요.",
  };
}

export async function signInWithGoogle(formData: FormData) {
  const redirectTo = sanitizeRedirect(formData.get("redirectTo"));
  const origin = await getOrigin();
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origin}/auth/callback?redirectTo=${encodeURIComponent(redirectTo)}`,
    },
  });
  if (error) redirect("/login?error=oauth");
  if (data.url) redirect(data.url);
}

// 비밀번호 재설정 메일 발송. (보안상 계정 존재 여부는 노출하지 않음 — 항상 성공 안내)
export async function requestPasswordReset(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "");
  if (!email) return { error: "이메일을 입력해 주세요." };

  const origin = await getOrigin();
  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?redirectTo=/reset-password`,
  });
  if (error)
    return { error: "메일 발송에 실패했습니다. 잠시 후 다시 시도해 주세요." };

  return {
    message:
      "비밀번호 재설정 메일을 보냈습니다. 메일의 링크를 눌러 새 비밀번호를 설정하세요.",
  };
}

// 재설정 링크로 들어온 세션에서 새 비밀번호 설정.
export async function updatePassword(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");
  if (password.length < 6)
    return { error: "비밀번호는 6자 이상이어야 합니다." };
  if (password !== confirm)
    return { error: "비밀번호가 일치하지 않습니다." };

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error)
    return {
      error:
        "비밀번호 변경에 실패했습니다. 재설정 링크가 만료되었을 수 있어요. 다시 요청해 주세요.",
    };

  redirect("/dashboard");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
