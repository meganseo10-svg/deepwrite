"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { signIn, signUp, signInWithGoogle, type AuthState } from "./actions";

type Mode = "signin" | "signup";

export function LoginForm({
  redirectTo,
  configured,
}: {
  redirectTo: string;
  configured: boolean;
}) {
  const [mode, setMode] = useState<Mode>("signin");
  const [state, formAction, pending] = useActionState<AuthState, FormData>(
    mode === "signin" ? signIn : signUp,
    {},
  );

  const tab = (value: Mode, label: string) => (
    <button
      type="button"
      onClick={() => setMode(value)}
      className={cn(
        "flex-1 rounded-badge px-3 py-1.5 text-sm font-medium transition-colors",
        mode === value ? "bg-card text-ink shadow-sm" : "text-soft",
      )}
    >
      {label}
    </button>
  );

  return (
    <div className="w-full max-w-sm">
      <div className="mb-6 text-center">
        <div className="text-2xl font-bold text-brand">DEEPWRITE</div>
        <p className="mt-1 text-sm text-soft">영어 작문 트레이너</p>
      </div>

      {!configured && (
        <div className="mb-4 rounded-btn border border-gold/30 bg-gold/10 px-3 py-2 text-xs text-gold">
          Supabase 환경변수가 아직 설정되지 않았습니다. <code>.env.local</code>{" "}
          에 키를 넣어주세요.
        </div>
      )}

      <div className="mb-4 flex gap-1 rounded-btn bg-paper2 p-1">
        {tab("signin", "로그인")}
        {tab("signup", "회원가입")}
      </div>

      <form action={formAction} className="space-y-3">
        <input type="hidden" name="redirectTo" value={redirectTo} />
        <div>
          <label className="mb-1 block text-xs font-medium text-soft">
            이메일
          </label>
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            className="w-full rounded-btn border border-line2 bg-card px-3 py-2 text-sm outline-none focus:border-ox focus:ring-2 focus:ring-ox/30"
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-soft">
            비밀번호
          </label>
          <input
            name="password"
            type="password"
            required
            autoComplete={mode === "signin" ? "current-password" : "new-password"}
            className="w-full rounded-btn border border-line2 bg-card px-3 py-2 text-sm outline-none focus:border-ox focus:ring-2 focus:ring-ox/30"
            placeholder="6자 이상"
          />
        </div>

        {state.error && (
          <p className="text-xs text-gold">{state.error}</p>
        )}
        {state.message && (
          <p className="text-xs text-sage">{state.message}</p>
        )}

        <Button type="submit" disabled={pending || !configured} className="w-full">
          {pending
            ? "처리 중…"
            : mode === "signin"
              ? "로그인"
              : "회원가입"}
        </Button>
      </form>

      <div className="my-4 flex items-center gap-3 text-xs text-faint">
        <div className="h-px flex-1 bg-line" />
        또는
        <div className="h-px flex-1 bg-line" />
      </div>

      <form action={signInWithGoogle}>
        <input type="hidden" name="redirectTo" value={redirectTo} />
        <Button
          type="submit"
          variant="secondary"
          disabled={!configured}
          className="w-full"
        >
          Google로 계속하기
        </Button>
      </form>
    </div>
  );
}
