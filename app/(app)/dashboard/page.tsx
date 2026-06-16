import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";

// T01: deepread 룩을 검증하기 위한 빈 대시보드 골격.
// 실제 데이터(과제·streak·점수 추이)는 T13에서 채운다.
export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">대시보드</h1>
          <p className="mt-1 text-sm text-soft">
            오늘도 한 편 써볼까요? 통역사처럼 5차원으로 분석해 드립니다.
          </p>
        </div>
        <Button>새 작문 시작</Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>오늘의 과제</CardTitle>
          </CardHeader>
          <CardBody>
            <p className="text-sm text-soft">
              약점 맞춤 과제가 여기에 표시됩니다.
            </p>
            <Badge tone="ox" className="mt-3">
              온보딩 후 활성화
            </Badge>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>연속 작성</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="text-3xl font-bold text-brand">0일</div>
            <p className="mt-1 text-sm text-soft">streak을 쌓아보세요.</p>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>5차원 점수 추이</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="flex flex-wrap gap-1.5">
              <Badge>어휘</Badge>
              <Badge>콜로케이션</Badge>
              <Badge>구조</Badge>
              <Badge>응집</Badge>
              <Badge tone="gold">톤</Badge>
            </div>
            <p className="mt-3 text-sm text-soft">
              첫 진단을 받으면 추이가 그려집니다.
            </p>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>최근 작문</CardTitle>
        </CardHeader>
        <CardBody>
          <div className="rounded-btn border border-dashed border-line2 bg-paper2 px-4 py-10 text-center text-sm text-faint">
            아직 작문이 없습니다. 첫 글을 작성해 보세요.
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
