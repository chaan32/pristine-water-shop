import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Droplets, 
  Shield, 
  Leaf, 
  Users,
  ArrowRight,
  CheckCircle
} from 'lucide-react';

const BrandPhilosophy = () => {
  const philosophyItems = [
    {
      icon: Droplets,
      title: '순수함의 추구',
      description: '99.9%의 정수율로 가장 깨끗한 물을 제공합니다',
      color: 'text-accent'
    },
    {
      icon: Shield,
      title: '안전성 보장',
      description: '국제 인증을 받은 필터로 안전성을 보장합니다',
      color: 'text-primary'
    },
    {
      icon: Leaf,
      title: '환경 친화',
      description: '지속가능한 소재와 공정으로 환경을 생각합니다',
      color: 'text-green-500'
    },
    {
      icon: Users,
      title: '고객 중심',
      description: '20년간 쌓은 노하우로 최고의 서비스를 제공합니다',
      color: 'text-orange-500'
    }
  ];

  const benefits = [
    '99.9% 불순물 제거',
    '중금속 및 염소 완전 차단',
    '미네랄 성분 보존',
    '친환경 소재 사용',
    '간편한 설치 및 교체',
    '전국 AS 서비스'
  ];

  return (
    <section className="py-16 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              필터란 무엇인가?
            </h2>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              AquaPure는 단순한 필터가 아닙니다. 
              우리는 건강한 삶의 시작이자, 가족을 위한 안전한 선택입니다.
              <br /><br />
              20년간의 연구와 개발을 통해 완성된 정수 기술로 
              물 속 유해물질을 99.9% 제거하면서도 
              인체에 필요한 미네랄은 그대로 보존합니다.
            </p>

            {/* Benefits List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-accent flex-shrink-0" />
                  <span className="text-sm text-foreground">{benefit}</span>
                </div>
              ))}
            </div>

            <Button size="lg" className="water-drop">
              브랜드 스토리 자세히 보기
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>

          {/* Right Content - Philosophy Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {philosophyItems.map((item, index) => (
              <Card key={index} className="water-drop hover:shadow-lg transition-smooth">
                <CardContent className="p-6 text-center">
                  <div className={`w-16 h-16 ${item.color} bg-current/10 rounded-full flex items-center justify-center mx-auto mb-4`}>
                    <item.icon className={`w-8 h-8 ${item.color}`} />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-3">
                    {item.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {item.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Bottom Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16 pt-12 border-t border-border">
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-2">20+</div>
            <div className="text-sm text-muted-foreground">운영 경력</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-2">99.9%</div>
            <div className="text-sm text-muted-foreground">정수율</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-2">50K+</div>
            <div className="text-sm text-muted-foreground">고객 수</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-2">100%</div>
            <div className="text-sm text-muted-foreground">고객 만족도</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BrandPhilosophy;