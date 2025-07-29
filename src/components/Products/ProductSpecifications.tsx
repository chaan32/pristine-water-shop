import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Award, Shield, Wrench } from 'lucide-react';

interface Specification {
  label: string;
  value: string;
  unit?: string;
}

interface Certification {
  name: string;
  icon: string;
  description: string;
}

interface ProductSpecificationsProps {
  specifications: Specification[];
  certifications: Certification[];
  filterPerformance: {
    chlorine: string;
    heavyMetals: string;
    bacteria: string;
    sediment: string;
  };
  lifespan: string;
  flowRate: string;
}

const ProductSpecifications = ({
  specifications,
  certifications,
  filterPerformance,
  lifespan,
  flowRate
}: ProductSpecificationsProps) => {
  return (
    <div className="space-y-6">
      {/* 기술 사양 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wrench className="w-5 h-5 text-primary" />
            기술 사양
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {specifications.map((spec, index) => (
              <div key={index} className="flex justify-between items-center py-2 border-b border-border last:border-b-0">
                <span className="text-muted-foreground">{spec.label}</span>
                <span className="font-medium">
                  {spec.value}{spec.unit && <span className="text-muted-foreground text-sm ml-1">{spec.unit}</span>}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 필터 성능 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            필터 성능
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary mb-1">{filterPerformance.chlorine}</div>
              <div className="text-sm text-muted-foreground">염소 제거율</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary mb-1">{filterPerformance.heavyMetals}</div>
              <div className="text-sm text-muted-foreground">중금속 차단율</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary mb-1">{filterPerformance.bacteria}</div>
              <div className="text-sm text-muted-foreground">세균 제거율</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary mb-1">{filterPerformance.sediment}</div>
              <div className="text-sm text-muted-foreground">침전물 제거율</div>
            </div>
          </div>
          
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 bg-secondary rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <div>
                <div className="font-medium">사용 수명</div>
                <div className="text-sm text-muted-foreground">{lifespan}</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-secondary rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <div>
                <div className="font-medium">유량</div>
                <div className="text-sm text-muted-foreground">{flowRate}</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 인증 및 품질보증 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5 text-primary" />
            인증 및 품질보증
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {certifications.map((cert, index) => (
              <div key={index} className="flex items-center gap-3 p-3 border border-border rounded-lg">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <Award className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <div className="font-medium">{cert.name}</div>
                  <div className="text-sm text-muted-foreground">{cert.description}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductSpecifications;