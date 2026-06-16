# 🎬 KICKOFF — Claude Code에 복붙할 프롬프트

---

## STEP 0. 폴더 준비 (터미널)
```bash
cd C:\Users\Megan\Documents
mkdir deepwrite
cd deepwrite
# 이 specs 폴더(00~07)를 deepwrite 안에 복사해 넣기
claude
```

---

## STEP 1. 시작 프롬프트 (Claude Code에 그대로 붙여넣기)

```
DEEPWRITE라는 영어 작문 트레이너 앱을 새로 만들 거야.
이 폴더의 specs/ 안에 00_README.md ~ 07_TICKETS.md 사양서가 있어.

먼저 00_README.md → 01_PRD.md → 02_TECH_SPEC.md 순서로 다 읽고,
나머지 03~07도 훑은 다음, 전체 계획을 3~4줄로 요약해서 나한테 확인받아.

규칙:
- 07_TICKETS.md의 T01부터 위에서부터 한 티켓씩 구현해.
- 한 티켓 끝낼 때마다 멈추고 "T0X 완료"라고 보고하고, 내가 확인하면 다음으로 가.
- 사양이 모호하면 절대 임의로 정하지 말고 나한테 질문해.
- 디자인은 C:\Users\Megan\Documents\deepread 의 tailwind 설정·디자인 토큰·
  공통 컴포넌트를 '복사'해서 deepread와 똑같은 룩으로 맞춰. deepread 코드를 import하진 마.
- Anthropic 모델 ID는 네가 임의로 정하지 말고, 어떤 모델을 쓸지 나한테 물어봐서 .env로 관리해.

T01부터 시작하기 전에, 먼저 위 요약부터 보여줘.
```

---

## STEP 2. 티켓 진행용 프롬프트 (필요할 때)
- 다음 티켓: `좋아, 확인했어. 다음 티켓(T0X) 진행해.`
- 막혔을 때: `에러 메시지 원문이랑 네가 시도한 것들 정리해서 보여줘. 추측으로 고치지 마.`
- 미리보기: `여기까지 Vercel preview로 배포해서 폰에서 확인할 수 있게 해줘.`
- 핵심 검증 시점: `T06까지 끝났으니, 실제로 영어 글 하나 넣어서 5차원 진단이 제대로 나오는지 같이 테스트하자.`

---

## STEP 3. 환경변수 받기
T02·T04 즈음 Claude Code가 요청하면, `.env.local`에:
```
NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY / SUPABASE_SERVICE_ROLE_KEY
ANTHROPIC_API_KEY
```
(Supabase는 deepread 것과 **별도 프로젝트** 권장 — 데이터 분리.)

---

## 🧭 진행 체크리스트
```
[ ] T01 부트스트랩 (deepread 룩 동일)
[ ] T02 인증
[ ] T03 DB
[ ] T04 LLM 클라이언트
[ ] T05 에디터 + 톤 선택
[ ] T06 5차원 진단 + 리라이트 ← 여기서 1차 가치 검증
[ ] T07 콜로케이션 힌트
[ ] T08 비교 단어 카드
[ ] T09 3톤 변환
[ ] T10 역번역
[ ] T11 약점 리포트
[ ] T12 온보딩
[ ] T13 대시보드
[ ] T14 결제
[ ] T15 배포 + QA
```
