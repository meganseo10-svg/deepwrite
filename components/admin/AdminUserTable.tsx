"use client";

import { useState, useTransition } from "react";
import { setUserPlan } from "@/app/(app)/admin/actions";

export type AdminUser = {
  id: string;
  email: string | null;
  name: string | null;
  plan: string;
  cefr: string | null;
  joined: string;
};

const PLAN_OPTIONS = ["free", "basic", "pro", "master", "business"];

function PlanSelect({ user }: { user: AdminUser }) {
  const [plan, setPlan] = useState(user.plan);
  const [pending, startTransition] = useTransition();
  const [err, setErr] = useState(false);

  function change(next: string) {
    const prev = plan;
    setPlan(next);
    setErr(false);
    startTransition(async () => {
      const res = await setUserPlan(user.id, next);
      if (!("ok" in res)) {
        setPlan(prev); // 롤백
        setErr(true);
      }
    });
  }

  return (
    <select
      value={plan}
      disabled={pending}
      onChange={(e) => change(e.target.value)}
      className={
        "rounded-badge border bg-card px-2 py-1 text-xs outline-none focus:border-ox " +
        (err ? "border-gold text-gold" : "border-line2 text-ink")
      }
      title={err ? "변경 실패" : "요금제 변경"}
    >
      {PLAN_OPTIONS.map((p) => (
        <option key={p} value={p}>
          {p}
        </option>
      ))}
    </select>
  );
}

export function AdminUserTable({ users }: { users: AdminUser[] }) {
  if (users.length === 0)
    return <p className="py-2 text-sm text-faint">사용자가 없습니다.</p>;

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="text-left text-xs text-faint">
            <th className="border-b border-line py-2 pr-3 font-medium">이메일</th>
            <th className="border-b border-line py-2 pr-3 font-medium">이름</th>
            <th className="border-b border-line py-2 pr-3 font-medium">요금제</th>
            <th className="border-b border-line py-2 pr-3 font-medium">CEFR</th>
            <th className="border-b border-line py-2 pr-3 font-medium">가입</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} className="align-middle">
              <td className="border-b border-line py-2 pr-3">
                <span className="block max-w-[200px] truncate text-ink">
                  {u.email ?? "—"}
                </span>
              </td>
              <td className="border-b border-line py-2 pr-3 text-soft">
                {u.name ?? "—"}
              </td>
              <td className="border-b border-line py-2 pr-3">
                <PlanSelect user={u} />
              </td>
              <td className="border-b border-line py-2 pr-3 text-soft">
                {u.cefr ?? "—"}
              </td>
              <td className="border-b border-line py-2 pr-3 text-xs text-faint">
                {u.joined}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
