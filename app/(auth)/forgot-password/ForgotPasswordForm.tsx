"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { requestPasswordReset, type AuthState } from "../login/actions";

export function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState<AuthState, FormData>(
    requestPasswordReset,
    {},
  );

  return (
    <div className="w-full max-w-sm">
      <div className="mb-6 text-center">
        <div className="text-2xl font-bold text-brand">DEEPWRITE</div>
        <p className="mt-1 text-sm text-soft">비밀번호 재설정</p>
      </div>

      <p className="mb-4 text-sm text-soft">
        가입한 이메일을 입력하시면 비밀번호를 재설정할 수 있는 링크를 보내
        드립니다.
      </p>

      <form action={formAction} className="space-y-3">
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

        {state.error && <p className="text-xs text-gold">{state.error}</p>}
        {state.message && <p className="text-xs text-sage">{state.message}</p>}

        <Button type="submit" disabled={pending} className="w-full">
          {pending ? "보내는 중…" : "재설정 메일 보내기"}
        </Button>
      </form>

      <div className="mt-4 text-center">
        <Link href="/login" className="text-xs text-soft hover:text-ink">
          ← 로그인으로 돌아가기
        </Link>
      </div>
    </div>
  );
}
