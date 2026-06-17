"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { updatePassword, type AuthState } from "../login/actions";

export function ResetPasswordForm() {
  const [state, formAction, pending] = useActionState<AuthState, FormData>(
    updatePassword,
    {},
  );

  return (
    <div className="w-full max-w-sm">
      <div className="mb-6 text-center">
        <div className="text-2xl font-bold text-brand">DEEPWRITE</div>
        <p className="mt-1 text-sm text-soft">새 비밀번호 설정</p>
      </div>

      <form action={formAction} className="space-y-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-soft">
            새 비밀번호
          </label>
          <input
            name="password"
            type="password"
            required
            autoComplete="new-password"
            className="w-full rounded-btn border border-line2 bg-card px-3 py-2 text-sm outline-none focus:border-ox focus:ring-2 focus:ring-ox/30"
            placeholder="6자 이상"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-soft">
            새 비밀번호 확인
          </label>
          <input
            name="confirm"
            type="password"
            required
            autoComplete="new-password"
            className="w-full rounded-btn border border-line2 bg-card px-3 py-2 text-sm outline-none focus:border-ox focus:ring-2 focus:ring-ox/30"
            placeholder="다시 입력"
          />
        </div>

        {state.error && <p className="text-xs text-gold">{state.error}</p>}

        <Button type="submit" disabled={pending} className="w-full">
          {pending ? "변경 중…" : "비밀번호 변경"}
        </Button>
      </form>

      <p className="mt-4 text-center text-xs text-faint">
        이 페이지는 메일의 재설정 링크로 접속해야 동작합니다.
      </p>
    </div>
  );
}
