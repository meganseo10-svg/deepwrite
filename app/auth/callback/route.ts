import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// OAuth(예: Google) 콜백: code 를 세션으로 교환 후 원래 목적지로.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const redirectToParam = searchParams.get("redirectTo");
  const redirectTo =
    redirectToParam && redirectToParam.startsWith("/")
      ? redirectToParam
      : "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}${redirectTo}`);
  }

  return NextResponse.redirect(`${origin}/login?error=oauth`);
}
