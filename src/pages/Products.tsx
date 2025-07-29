import Header from '@/components/Layout/Header';
import Footer from '@/components/Layout/Footer';
import ProductSpecifications from '@/components/Products/ProductSpecifications';
import TechnicalDetails from '@/components/Products/TechnicalDetails';
import ComparisonTable from '@/components/Products/ComparisonTable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowRight, Star, Droplets, Shield, Filter, Factory } from 'lucide-react';
import { Link } from 'react-router-dom';

const Products = () => {
  const categories = [
    {
      id: 'shower',
      name: '샤워 필터',
      icon: Droplets,
      description: '피부와 모발을 위한 깨끗한 샤워수',
      products: [
        {
          id: 1,
          name: '프리미엄 샤워 필터 SF-100',
          image: '/placeholder.svg',
          rating: 4.8,
          reviews: 234,
          badge: 'BEST',
          features: ['염소 제거 99.9%', '중금속 차단', '6개월 사용', '간편 설치'],
          specifications: [
            { label: '모델명', value: 'SF-100' },
            { label: '크기', value: '15 × 8 × 8', unit: 'cm' },
            { label: '무게', value: '850', unit: 'g' },
            { label: '연결 방식', value: '표준 1/2인치' },
            { label: '재질', value: '스테인리스 스틸' },
            { label: '최대 압력', value: '8', unit: 'bar' }
          ],
          certifications: [
            { name: 'NSF/ANSI 177', icon: 'shield', description: '샤워 필터 성능 인증' },
            { name: 'KTL 인증', icon: 'award', description: '한국산업기술시험원 인증' },
            { name: 'ISO 9001', icon: 'check', description: '품질경영시스템 인증' }
          ],
          filterPerformance: {
            chlorine: '99.9%',
            heavyMetals: '95%',
            bacteria: '99.5%',
            sediment: '98%'
          },
          lifespan: '6개월 또는 30,000L',
          flowRate: '분당 8-12L',
          technology: {
            title: '다층 KDF-55 필터 기술',
            description: '고성능 KDF-55 구리-아연 합금 미디어와 활성탄을 결합한 다층 필터링 시스템으로, 염소와 중금속을 효과적으로 제거하면서 유익한 미네랄은 보존합니다.',
            advantages: [
              '염소 99.9% 제거로 피부와 모발 보호',
              '중금속 95% 차단으로 안전한 샤워수 제공',
              '항균 효과로 세균 번식 억제',
              '미네랄 보존으로 부드러운 물질감',
              '장기간 사용 가능한 내구성'
            ]
          },
          installation: {
            time: '10-15분',
            difficulty: '쉬움',
            tools: ['렌치', '테프론 테이프'],
            steps: [
              {
                step: 1,
                title: '기존 샤워헤드 분리',
                description: '기존 샤워헤드를 반시계 방향으로 돌려 분리합니다.'
              },
              {
                step: 2,
                title: '필터 연결',
                description: '샤워 필터를 샤워 암에 시계 방향으로 단단히 연결합니다.',
                warning: '과도하게 조이지 마세요. 누수가 발생할 수 있습니다.'
              },
              {
                step: 3,
                title: '샤워헤드 재연결',
                description: '기존 샤워헤드를 필터에 연결합니다.'
              },
              {
                step: 4,
                title: '테스트',
                description: '물을 틀어 누수가 없는지 확인합니다.'
              }
            ]
          },
          maintenance: [
            {
              item: '필터 카트리지 교체',
              frequency: '6개월마다',
              description: '정수 성능 유지를 위해 정기적으로 교체하세요.',
              difficulty: 'Easy' as const
            },
            {
              item: '외관 청소',
              frequency: '월 1회',
              description: '중성 세제로 외관을 깨끗하게 닦아주세요.',
              difficulty: 'Easy' as const
            },
            {
              item: '연결부 점검',
              frequency: '3개월마다',
              description: '연결부의 느슨함이나 누수를 점검하세요.',
              difficulty: 'Easy' as const
            }
          ],
          troubleshooting: [
            {
              issue: '물 압력이 낮아졌어요',
              solution: '필터가 막혔을 수 있습니다. 카트리지를 교체해 주세요.'
            },
            {
              issue: '연결부에서 물이 새요',
              solution: '연결부를 더 단단히 조이거나 테프론 테이프를 새로 감아주세요.'
            },
            {
              issue: '물맛이 이상해요',
              solution: '새 필터의 경우 처음 5분간 물을 흘려보낸 후 사용하세요.'
            }
          ]
        },
        {
          id: 2,
          name: '기본형 샤워 필터 SF-50',
          image: '/placeholder.svg',
          rating: 4.5,
          reviews: 187,
          badge: null,
          features: ['염소 제거 95%', '3개월 사용', '경제적', '간편 교체'],
          specifications: [
            { label: '모델명', value: 'SF-50' },
            { label: '크기', value: '12 × 6 × 6', unit: 'cm' },
            { label: '무게', value: '450', unit: 'g' },
            { label: '연결 방식', value: '표준 1/2인치' },
            { label: '재질', value: 'ABS 플라스틱' },
            { label: '최대 압력', value: '6', unit: 'bar' }
          ],
          certifications: [
            { name: 'KTL 인증', icon: 'award', description: '한국산업기술시험원 인증' },
            { name: '품질보증', icon: 'check', description: '1년 품질보증' }
          ],
          filterPerformance: {
            chlorine: '95%',
            heavyMetals: '85%',
            bacteria: '90%',
            sediment: '95%'
          },
          lifespan: '3개월 또는 15,000L',
          flowRate: '분당 10-15L',
          technology: {
            title: '활성탄 기반 필터링',
            description: '고품질 활성탄과 세디먼트 필터를 조합한 경제적이면서도 효과적인 필터링 시스템입니다.',
            advantages: [
              '경제적인 가격으로 기본적인 정수 효과 제공',
              '간편한 설치와 교체',
              '염소 냄새 제거',
              '컴팩트한 디자인'
            ]
          },
          installation: {
            time: '5-10분',
            difficulty: '매우 쉬움',
            tools: ['별도 도구 불필요'],
            steps: [
              {
                step: 1,
                title: '샤워헤드 분리',
                description: '기존 샤워헤드를 분리합니다.'
              },
              {
                step: 2,
                title: '필터 연결',
                description: '필터를 손으로 단단히 연결합니다.'
              },
              {
                step: 3,
                title: '샤워헤드 연결',
                description: '샤워헤드를 필터에 연결합니다.'
              }
            ]
          },
          maintenance: [
            {
              item: '필터 카트리지 교체',
              frequency: '3개월마다',
              description: '경제적인 교체 주기로 부담 없이 관리하세요.',
              difficulty: 'Easy' as const
            }
          ],
          troubleshooting: [
            {
              issue: '설치가 어려워요',
              solution: '별도 도구 없이 손으로만 설치 가능합니다. 너무 세게 조이지 마세요.'
            }
          ]
        }
      ]
    },
    {
      id: 'kitchen',
      name: '주방 정수 필터',
      icon: Filter,
      description: '요리와 음용수를 위한 고품질 정수 시스템',
      products: [
        {
          id: 3,
          name: '주방용 직수 정수기 KF-200',
          image: '/placeholder.svg',
          rating: 4.9,
          reviews: 156,
          badge: 'NEW',
          features: ['4단계 필터링', 'LED 교체 알림', 'NSF 인증', '1년 보증'],
          specifications: [
            { label: '모델명', value: 'KF-200' },
            { label: '크기', value: '30 × 15 × 40', unit: 'cm' },
            { label: '무게', value: '3.2', unit: 'kg' },
            { label: '연결 방식', value: '3/8인치 압축 피팅' },
            { label: '필터 단계', value: '4단계' },
            { label: '정수 용량', value: '일 150L' }
          ],
          certifications: [
            { name: 'NSF/ANSI 42', icon: 'shield', description: '염소 제거 성능 인증' },
            { name: 'NSF/ANSI 53', icon: 'shield', description: '중금속 제거 성능 인증' },
            { name: 'NSF/ANSI 401', icon: 'shield', description: '신종 오염물질 제거 인증' }
          ],
          filterPerformance: {
            chlorine: '99.9%',
            heavyMetals: '99%',
            bacteria: '99.9%',
            sediment: '99%'
          },
          lifespan: '12개월 또는 3,800L',
          flowRate: '분당 2.5L',
          technology: {
            title: '4단계 정밀 필터링 시스템',
            description: '1단계 세디먼트 필터, 2단계 프리카본 필터, 3단계 울트라파인 멤브레인, 4단계 포스트카본 필터로 구성된 정밀 정수 시스템입니다.',
            advantages: [
              '99.9% 이상의 높은 정수 성능',
              'LED 알림으로 필터 교체 시기 자동 안내',
              'NSF 3개 기준 모두 충족하는 검증된 성능',
              '미네랄 보존으로 건강한 물맛',
              '컴팩트한 언더싱크 설계'
            ]
          },
          installation: {
            time: '30-45분',
            difficulty: '보통',
            tools: ['드릴', '렌치 세트', '드라이버'],
            steps: [
              {
                step: 1,
                title: '설치 위치 확인',
                description: '싱크대 하부의 설치 공간과 배관을 확인합니다.'
              },
              {
                step: 2,
                title: '급수 라인 연결',
                description: '냉수 공급 라인에 분기 밸브를 설치합니다.',
                warning: '급수 밸브를 먼저 잠그고 작업하세요.'
              },
              {
                step: 3,
                title: '정수기 고정',
                description: '싱크대 하부에 정수기를 안전하게 고정합니다.'
              },
              {
                step: 4,
                title: '수전 설치',
                description: '싱크대 상판에 정수 전용 수전을 설치합니다.'
              },
              {
                step: 5,
                title: '배관 연결 및 테스트',
                description: '모든 배관을 연결하고 누수 테스트를 실시합니다.'
              }
            ]
          },
          maintenance: [
            {
              item: '1,2단계 필터 교체',
              frequency: '6개월마다',
              description: '세디먼트와 프리카본 필터를 교체합니다.',
              difficulty: 'Easy' as const
            },
            {
              item: '3,4단계 필터 교체',
              frequency: '12개월마다',
              description: '멤브레인과 포스트카본 필터를 교체합니다.',
              difficulty: 'Medium' as const
            }
          ],
          troubleshooting: [
            {
              issue: '물이 나오지 않아요',
              solution: '급수 밸브가 열려있는지, 필터가 올바르게 설치되었는지 확인하세요.'
            },
            {
              issue: 'LED가 빨간색으로 점등되어요',
              solution: '필터 교체 시기입니다. 해당 단계의 필터를 교체해 주세요.'
            }
          ]
        }
      ]
    },
    {
      id: 'industrial',
      name: '산업용 필터',
      icon: Factory,
      description: '대용량 처리가 가능한 산업용 정수 시스템',
      products: [
        {
          id: 4,
          name: '산업용 대용량 필터 IF-1000',
          image: '/placeholder.svg',
          rating: 4.7,
          reviews: 89,
          badge: null,
          features: ['1일 1000L 처리', '자동 역세척', '스테인리스 스틸', '2년 보증'],
          specifications: [
            { label: '모델명', value: 'IF-1000' },
            { label: '크기', value: '60 × 40 × 120', unit: 'cm' },
            { label: '무게', value: '45', unit: 'kg' },
            { label: '처리 용량', value: '1,000', unit: 'L/일' },
            { label: '재질', value: '스테인리스 스틸 316L' },
            { label: '전원', value: 'AC 220V' }
          ],
          certifications: [
            { name: 'ISO 14001', icon: 'shield', description: '환경경영시스템 인증' },
            { name: 'CE 마킹', icon: 'award', description: '유럽 안전 기준 충족' },
            { name: '산업용 품질인증', icon: 'check', description: '산업용 등급 품질 보증' }
          ],
          filterPerformance: {
            chlorine: '99.9%',
            heavyMetals: '99.5%',
            bacteria: '99.99%',
            sediment: '99.8%'
          },
          lifespan: '24개월 또는 500,000L',
          flowRate: '시간당 40-50L',
          technology: {
            title: '자동 역세척 대용량 필터링 시스템',
            description: '산업용 등급의 스테인리스 스틸 하우징과 자동 역세척 기능을 갖춘 대용량 정수 시스템으로, 지속적인 고품질 정수 공급이 가능합니다.',
            advantages: [
              '대용량 처리로 산업용 요구사항 충족',
              '자동 역세척으로 유지보수 최소화',
              '스테인리스 스틸 재질로 내구성 극대화',
              '연속 운전 가능한 안정성',
              '모니터링 시스템으로 실시간 상태 확인'
            ]
          },
          installation: {
            time: '2-3시간',
            difficulty: '어려움',
            tools: ['전문 설치 도구', '크레인(선택사항)'],
            steps: [
              {
                step: 1,
                title: '설치 위치 준비',
                description: '견고한 바닥과 충분한 공간을 확보합니다.',
                warning: '전문 설치팀의 설치를 권장합니다.'
              },
              {
                step: 2,
                title: '급수/배수 라인 연결',
                description: '산업용 급수 라인과 배수 라인을 연결합니다.'
              },
              {
                step: 3,
                title: '전원 연결',
                description: 'AC 220V 전원을 안전하게 연결합니다.'
              },
              {
                step: 4,
                title: '시스템 초기화',
                description: '자동 제어 시스템을 초기화하고 테스트합니다.'
              }
            ]
          },
          maintenance: [
            {
              item: '필터 미디어 교체',
              frequency: '24개월마다',
              description: '산업용 필터 미디어를 전문가가 교체합니다.',
              difficulty: 'Hard' as const
            },
            {
              item: '자동 역세척 점검',
              frequency: '6개월마다',
              description: '역세척 시스템의 정상 작동을 점검합니다.',
              difficulty: 'Medium' as const
            }
          ],
          troubleshooting: [
            {
              issue: '역세척이 작동하지 않아요',
              solution: '전원과 급수 압력을 확인하고, 필요시 서비스팀에 연락하세요.'
            },
            {
              issue: '처리량이 감소했어요',
              solution: '필터 미디어의 교체 시기일 수 있습니다. 전문가 점검을 받으세요.'
            }
          ]
        }
      ]
    }
  ];

  // 제품 비교를 위한 데이터 준비
  const comparisonProducts = categories.map(category => ({
    category: category.name,
    products: category.products.map(product => ({
      id: product.id,
      name: product.name,
      category: category.id,
      image: product.image,
      specifications: {
        filterStages: product.specifications.find(s => s.label === '필터 단계')?.value || 
                     (category.id === 'shower' ? '2단계' : category.id === 'kitchen' ? '4단계' : '다단계'),
        chlorineRemoval: product.filterPerformance.chlorine,
        heavyMetalRemoval: product.filterPerformance.heavyMetals,
        flowRate: product.flowRate,
        lifespan: product.lifespan,
        dimensions: product.specifications.find(s => s.label === '크기')?.value + 
                   product.specifications.find(s => s.label === '크기')?.unit || '',
        weight: product.specifications.find(s => s.label === '무게')?.value + 
               product.specifications.find(s => s.label === '무게')?.unit || '',
        installation: product.installation.difficulty,
        warranty: category.id === 'industrial' ? '2년' : '1년'
      },
      features: {
        ledIndicator: category.id === 'kitchen',
        autoFlush: category.id === 'industrial',
        quickConnect: category.id === 'shower',
        certifiedNSF: product.certifications.some(c => c.name.includes('NSF')),
        antibacterial: true,
        pressureGauge: category.id === 'industrial',
        bypassValve: category.id === 'industrial'
      }
    }))
  }));

  const renderProductCard = (product: any, categoryIcon: any) => {
    const IconComponent = categoryIcon;
    
    return (
      <Card key={product.id} className="h-full">
        <CardHeader>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <IconComponent className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg font-semibold">{product.name}</h3>
                {product.badge && (
                  <Badge variant={product.badge === 'BEST' ? 'destructive' : 'default'}>
                    {product.badge}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-medium">{product.rating}</span>
                <span className="text-sm text-muted-foreground">({product.reviews}개 리뷰)</span>
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* 주요 특징 */}
          <div>
            <h4 className="font-medium mb-3">주요 특징</h4>
            <ul className="space-y-2">
              {product.features.map((feature: string, index: number) => (
                <li key={index} className="flex items-center gap-2 text-sm">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          {/* 필터 성능 요약 */}
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center p-3 bg-secondary rounded-lg">
              <div className="text-lg font-bold text-primary">{product.filterPerformance.chlorine}</div>
              <div className="text-xs text-muted-foreground">염소 제거</div>
            </div>
            <div className="text-center p-3 bg-secondary rounded-lg">
              <div className="text-lg font-bold text-primary">{product.filterPerformance.heavyMetals}</div>
              <div className="text-xs text-muted-foreground">중금속 차단</div>
            </div>
          </div>

          {/* 기술 정보 미리보기 */}
          <div className="p-3 border border-border rounded-lg">
            <h5 className="font-medium text-sm mb-1">{product.technology.title}</h5>
            <p className="text-xs text-muted-foreground line-clamp-2">
              {product.technology.description}
            </p>
          </div>

          <Link to={`/product/${product.id}`}>
            <Button className="w-full">
              상세 정보 보기
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">제품 기술 소개</h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            AquaPure의 혁신적인 정수 기술과 상세한 제품 정보를 확인하세요. 
            각 제품의 기술 사양, 성능 데이터, 설치 가이드를 제공합니다.
          </p>
        </div>

        <Tabs defaultValue="overview" className="space-y-8">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">제품 개요</TabsTrigger>
            <TabsTrigger value="specifications">기술 사양</TabsTrigger>
            <TabsTrigger value="installation">설치 가이드</TabsTrigger>
            <TabsTrigger value="comparison">제품 비교</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-12">
            {categories.map((category) => (
              <section key={category.id} className="space-y-6">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
                    <category.icon className="w-8 h-8 text-primary-foreground" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-foreground">{category.name}</h2>
                    <p className="text-lg text-muted-foreground">{category.description}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {category.products.map((product) => renderProductCard(product, category.icon))}
                </div>
              </section>
            ))}
          </TabsContent>

          <TabsContent value="specifications" className="space-y-8">
            {categories.map((category) => (
              <div key={category.id} className="space-y-6">
                <h2 className="text-2xl font-bold text-foreground">{category.name} 상세 사양</h2>
                {category.products.map((product) => (
                  <div key={product.id} className="space-y-6">
                    <h3 className="text-xl font-semibold">{product.name}</h3>
                    <ProductSpecifications
                      specifications={product.specifications}
                      certifications={product.certifications}
                      filterPerformance={product.filterPerformance}
                      lifespan={product.lifespan}
                      flowRate={product.flowRate}
                    />
                  </div>
                ))}
              </div>
            ))}
          </TabsContent>

          <TabsContent value="installation" className="space-y-8">
            {categories.map((category) => (
              <div key={category.id} className="space-y-6">
                <h2 className="text-2xl font-bold text-foreground">{category.name} 설치 및 유지보수</h2>
                {category.products.map((product) => (
                  <div key={product.id} className="space-y-6">
                    <h3 className="text-xl font-semibold">{product.name}</h3>
                    <TechnicalDetails
                      technology={product.technology}
                      installation={product.installation}
                      maintenance={product.maintenance}
                      troubleshooting={product.troubleshooting}
                    />
                  </div>
                ))}
              </div>
            ))}
          </TabsContent>

          <TabsContent value="comparison" className="space-y-8">
            {comparisonProducts.map((categoryData) => (
              <ComparisonTable
                key={categoryData.category}
                category={categoryData.category}
                products={categoryData.products}
              />
            ))}
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
};

export default Products;