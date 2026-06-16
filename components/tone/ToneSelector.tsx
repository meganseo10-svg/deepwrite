"use client";

import { Segmented } from "@/components/editor/Segmented";
import { TONE_OPTIONS, type Tone } from "@/lib/constants";

// 작문 전 목표 톤 선택 (PRD 4.2). 선택값이 5차원 진단의 채점 기준이 됨.
export function ToneSelector({
  value,
  onChange,
}: {
  value: Tone;
  onChange: (t: Tone) => void;
}) {
  return (
    <Segmented
      label="목표 톤"
      options={TONE_OPTIONS}
      value={value}
      onChange={onChange}
    />
  );
}
