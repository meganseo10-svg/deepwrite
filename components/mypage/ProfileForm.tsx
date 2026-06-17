"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { updateDisplayName } from "@/app/(app)/write/actions";

export function ProfileForm({ initialName }: { initialName: string }) {
  const [name, setName] = useState(initialName);
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  function save() {
    setSaved(false);
    startTransition(async () => {
      const res = await updateDisplayName(name);
      if ("ok" in res) {
        setSaved(true);
        setTimeout(() => setSaved(false), 1500);
      }
    });
  }

  return (
    <div className="flex items-end gap-2">
      <label className="flex-1">
        <span className="mb-1 block text-xs font-medium text-soft">
          표시 이름
        </span>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-btn border border-line2 bg-card px-3 py-2 text-sm outline-none focus:border-ox focus:ring-2 focus:ring-ox/30"
          placeholder="이름"
        />
      </label>
      <Button
        size="sm"
        onClick={save}
        disabled={pending || !name.trim() || name.trim() === initialName}
      >
        {pending ? "저장 중…" : saved ? "저장됨 ✓" : "저장"}
      </Button>
    </div>
  );
}
