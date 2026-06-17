import { OnboardingFlow } from "@/components/onboarding/OnboardingFlow";

// 온보딩 진단 (T12). 보호 경로(proxy) — 미인증 시 /login 으로 리다이렉트.
export default function OnboardingPage() {
  return <OnboardingFlow />;
}
