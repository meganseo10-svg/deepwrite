import { isSupabaseConfigured } from "@/lib/supabase/config";
import { LoginForm } from "./LoginForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirectTo?: string; error?: string }>;
}) {
  const { redirectTo, error } = await searchParams;
  const target =
    redirectTo && redirectTo.startsWith("/") ? redirectTo : "/dashboard";
  const oauthError =
    error === "oauth"
      ? "소셜 로그인에 실패했습니다. 다시 시도하거나 이메일로 로그인해 주세요."
      : undefined;

  return (
    <LoginForm
      redirectTo={target}
      configured={isSupabaseConfigured}
      oauthError={oauthError}
    />
  );
}
