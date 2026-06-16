// Supabase 환경변수 (deepread와 별도 프로젝트). .env.local 에서 주입.
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// 키가 아직 안 들어왔을 때(부트스트랩 단계) 앱이 죽지 않도록 분기용 플래그.
export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
