"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { signOut } from "@/app/(auth)/login/actions";

type NavItem = { href: string; label: string };

// 우측 햄버거(☰) 드롭다운 — 마이페이지·대시보드·(모바일)섹션 네비·로그아웃.
export function HeaderMenu({
  email,
  navItems,
}: {
  email: string | null;
  navItems: NavItem[];
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="메뉴"
        aria-expanded={open}
        className="flex h-9 w-9 items-center justify-center rounded-badge text-soft hover:bg-paper2 hover:text-ink"
      >
        <span className="flex flex-col gap-[3px]">
          <span className="block h-0.5 w-4 rounded bg-current" />
          <span className="block h-0.5 w-4 rounded bg-current" />
          <span className="block h-0.5 w-4 rounded bg-current" />
        </span>
      </button>

      {open && (
        <div className="absolute right-0 top-11 z-20 w-52 overflow-hidden rounded-card border border-line2 bg-card py-1 shadow-card">
          {email && (
            <div className="truncate px-3 py-2 text-xs text-faint">{email}</div>
          )}

          {/* 모바일: 섹션 네비 (데스크톱은 헤더에 이미 노출) */}
          <div className="md:hidden">
            {navItems.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                onClick={() => setOpen(false)}
                className="block px-3 py-2 text-sm text-soft hover:bg-paper2 hover:text-ink"
              >
                {n.label}
              </Link>
            ))}
            <div className="my-1 border-t border-line" />
          </div>

          <Link
            href="/mypage"
            onClick={() => setOpen(false)}
            className="block px-3 py-2 text-sm text-soft hover:bg-paper2 hover:text-ink"
          >
            마이페이지
          </Link>
          <Link
            href="/dashboard"
            onClick={() => setOpen(false)}
            className="block px-3 py-2 text-sm text-soft hover:bg-paper2 hover:text-ink"
          >
            대시보드
          </Link>

          <div className="my-1 border-t border-line" />
          <form action={signOut}>
            <button
              type="submit"
              className="block w-full px-3 py-2 text-left text-sm text-soft hover:bg-paper2 hover:text-ink"
            >
              로그아웃
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
