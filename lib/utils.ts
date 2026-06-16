/** 클래스명 병합 헬퍼 (falsy 제거 후 공백 결합). */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}
