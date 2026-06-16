import { redirect } from "next/navigation";

// 진입점 → 대시보드. (인증은 T02, 온보딩 분기는 T12에서 추가)
export default function Home() {
  redirect("/dashboard");
}
