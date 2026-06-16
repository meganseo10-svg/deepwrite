import { isSupabaseConfigured } from "@/lib/supabase/config";
import { LoginForm } from "./LoginForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirectTo?: string }>;
}) {
  const { redirectTo } = await searchParams;
  const target =
    redirectTo && redirectTo.startsWith("/") ? redirectTo : "/dashboard";

  return <LoginForm redirectTo={target} configured={isSupabaseConfigured} />;
}
