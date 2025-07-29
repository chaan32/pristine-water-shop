import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Minus } from 'lucide-react';

interface ComparisonProduct {
  id: number;
  name: string;
  category: string;
  image: string;
  specifications: {
    filterStages: string;
    chlorineRemoval: string;
    heavyMetalRemoval: string;
    flowRate: string;
    lifespan: string;
    dimensions: string;
    weight: string;
    installation: string;
    warranty: string;
  };
  features: {
    [key: string]: boolean | string;
  };
}

interface ComparisonTableProps {
  products: ComparisonProduct[];
  category: string;
}

const ComparisonTable = ({ products, category }: ComparisonTableProps) => {
  const specificationLabels = {
    filterStages: '필터 단계',
    chlorineRemoval: '염소 제거율',
    heavyMetalRemoval: '중금속 제거율',
    flowRate: '유량',
    lifespan: '사용 수명',
    dimensions: '크기',
    weight: '무게',
    installation: '설치 방식',
    warranty: '보증 기간'
  };

  const featureLabels = {
    ledIndicator: 'LED 교체 알림',
    autoFlush: '자동 세척',
    quickConnect: '퀵 커넥터',
    certifiedNSF: 'NSF 인증',
    antibacterial: '항균 처리',
    pressureGauge: '압력 게이지',
    bypassValve: '바이패스 밸브'
  };

  const renderFeatureValue = (value: boolean | string) => {
    if (typeof value === 'boolean') {
      return value ? (
        <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
      ) : (
        <XCircle className="w-5 h-5 text-red-500 mx-auto" />
      );
    }
    return <span className="text-sm">{value}</span>;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{category} 제품 비교</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-4 px-2 font-medium">항목</th>
                {products.map((product) => (
                  <th key={product.id} className="text-center py-4 px-2 min-w-[200px]">
                    <div className="space-y-2">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-16 h-16 object-cover rounded mx-auto"
                      />
                      <h4 className="font-medium text-sm leading-tight">{product.name}</h4>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* 기술 사양 섹션 */}
              <tr>
                <td colSpan={products.length + 1} className="py-3">
                  <h3 className="font-semibold text-primary">기술 사양</h3>
                </td>
              </tr>
              {Object.entries(specificationLabels).map(([key, label]) => (
                <tr key={key} className="border-b border-border/50">
                  <td className="py-3 px-2 text-sm text-muted-foreground">{label}</td>
                  {products.map((product) => (
                    <td key={product.id} className="py-3 px-2 text-center">
                      <span className="text-sm">
                        {product.specifications[key as keyof typeof product.specifications]}
                      </span>
                    </td>
                  ))}
                </tr>
              ))}

              {/* 기능 섹션 */}
              <tr>
                <td colSpan={products.length + 1} className="py-3">
                  <h3 className="font-semibold text-primary">주요 기능</h3>
                </td>
              </tr>
              {Object.entries(featureLabels).map(([key, label]) => (
                <tr key={key} className="border-b border-border/50">
                  <td className="py-3 px-2 text-sm text-muted-foreground">{label}</td>
                  {products.map((product) => (
                    <td key={product.id} className="py-3 px-2 text-center">
                      {product.features[key] !== undefined ? (
                        renderFeatureValue(product.features[key])
                      ) : (
                        <Minus className="w-5 h-5 text-muted-foreground mx-auto" />
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 p-4 bg-secondary rounded-lg">
          <h4 className="font-medium mb-2">비교표 범례</h4>
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>지원</span>
            </div>
            <div className="flex items-center gap-2">
              <XCircle className="w-4 h-4 text-red-500" />
              <span>미지원</span>
            </div>
            <div className="flex items-center gap-2">
              <Minus className="w-4 h-4 text-muted-foreground" />
              <span>해당없음</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ComparisonTable;