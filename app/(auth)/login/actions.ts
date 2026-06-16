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
  const origin = (await headers()).get("origin") ?? "";
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

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
