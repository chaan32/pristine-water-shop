import Header from '@/components/Layout/Header';
import Footer from '@/components/Layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowRight, Star, Droplets, Shield, Zap, Filter } from 'lucide-react';
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
          price: 89000,
          originalPrice: 120000,
          image: '/placeholder.svg',
          rating: 4.8,
          reviews: 234,
          badge: 'BEST',
          features: ['염소 제거 99.9%', '중금속 차단', '6개월 사용', '간편 설치']
        },
        {
          id: 2,
          name: '기본형 샤워 필터 SF-50',
          price: 45000,
          originalPrice: null,
          image: '/placeholder.svg',
          rating: 4.5,
          reviews: 187,
          badge: null,
          features: ['염소 제거 95%', '3개월 사용', '경제적', '간편 교체']
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
          price: 195000,
          originalPrice: null,
          image: '/placeholder.svg',
          rating: 4.9,
          reviews: 156,
          badge: 'NEW',
          features: ['4단계 필터링', 'LED 교체 알림', 'NSF 인증', '1년 보증']
        },
        {
          id: 4,
          name: '언더싱크 정수기 KF-300',
          price: 320000,
          originalPrice: 380000,
          image: '/placeholder.svg',
          rating: 4.7,
          reviews: 98,
          badge: 'SALE',
          features: ['5단계 필터링', '자동 세척', '싱크대 하부 설치', '2년 보증']
        }
      ]
    },
    {
      id: 'industrial',
      name: '산업용 필터',
      icon: Shield,
      description: '대용량 처리가 가능한 산업용 정수 시스템',
      products: [
        {
          id: 5,
          name: '산업용 대용량 필터 IF-1000',
          price: 450000,
          originalPrice: null,
          image: '/placeholder.svg',
          rating: 4.7,
          reviews: 89,
          badge: null,
          features: ['1일 1000L 처리', '자동 역세척', '스테인리스 스틸', '2년 보증']
        },
        {
          id: 6,
          name: '업무용 정수기 IF-500',
          price: 280000,
          originalPrice: null,
          image: '/placeholder.svg',
          rating: 4.6,
          reviews: 67,
          badge: null,
          features: ['1일 500L 처리', '컴팩트 설계', '필터 교체 알림', '1년 보증']
        }
      ]
    }
  ];

  const bestProducts = categories.flatMap(cat => cat.products)
    .filter(product => product.badge === 'BEST')
    .slice(0, 6);

  const newProducts = categories.flatMap(cat => cat.products)
    .filter(product => product.badge === 'NEW')
    .slice(0, 6);

  const renderProductGrid = (products: any[]) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product) => (
        <Card key={product.id} className="group hover:shadow-lg transition-smooth water-drop overflow-hidden">
          <CardHeader className="p-0 relative">
            {product.badge && (
              <Badge 
                className={`absolute top-4 left-4 z-10 ${
                  product.badge === 'BEST' 
                    ? 'bg-destructive text-destructive-foreground' 
                    : product.badge === 'NEW'
                    ? 'bg-accent text-accent-foreground'
                    : 'bg-primary text-primary-foreground'
                }`}
              >
                {product.badge}
              </Badge>
            )}

            <div className="aspect-square bg-secondary overflow-hidden">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-smooth"
              />
            </div>
          </CardHeader>

          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-3">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-medium">{product.rating}</span>
              </div>
              <span className="text-sm text-muted-foreground">
                ({product.reviews}개 리뷰)
              </span>
            </div>

            <h3 className="text-lg font-semibold text-foreground mb-3 group-hover:text-primary transition-smooth">
              {product.name}
            </h3>

            <ul className="space-y-1 mb-4">
              {product.features.map((feature, index) => (
                <li key={index} className="text-sm text-muted-foreground flex items-center gap-2">
                  <div className="w-1 h-1 bg-accent rounded-full" />
                  {feature}
                </li>
              ))}
            </ul>

            <div className="flex items-center gap-2 mb-4">
              {product.originalPrice && (
                <span className="text-sm text-muted-foreground line-through">
                  {product.originalPrice.toLocaleString()}원
                </span>
              )}
              <span className="text-2xl font-bold text-primary">
                {product.price.toLocaleString()}원
              </span>
            </div>

            <Link to={`/product/${product.id}`}>
              <Button className="w-full water-drop">
                자세히 보기
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">제품소개</h1>
          <p className="text-lg text-muted-foreground">
            다양한 용도에 맞는 AquaPure의 정수 필터 제품을 만나보세요
          </p>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="all">전체</TabsTrigger>
            <TabsTrigger value="shower">샤워 필터</TabsTrigger>
            <TabsTrigger value="kitchen">주방 정수 필터</TabsTrigger>
            <TabsTrigger value="industrial">산업용 필터</TabsTrigger>
            <TabsTrigger value="best">Best 제품</TabsTrigger>
            <TabsTrigger value="new">New 제품</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-8">
            <div className="space-y-12">
              {categories.map((category) => (
                <section key={category.id}>
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                      <category.icon className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-foreground">{category.name}</h2>
                      <p className="text-muted-foreground">{category.description}</p>
                    </div>
                  </div>
                  {renderProductGrid(category.products)}
                </section>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="shower" className="mt-8">
            {renderProductGrid(categories.find(cat => cat.id === 'shower')?.products || [])}
          </TabsContent>

          <TabsContent value="kitchen" className="mt-8">
            {renderProductGrid(categories.find(cat => cat.id === 'kitchen')?.products || [])}
          </TabsContent>

          <TabsContent value="industrial" className="mt-8">
            {renderProductGrid(categories.find(cat => cat.id === 'industrial')?.products || [])}
          </TabsContent>

          <TabsContent value="best" className="mt-8">
            {bestProducts.length > 0 ? renderProductGrid(bestProducts) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">현재 베스트 제품이 없습니다.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="new" className="mt-8">
            {newProducts.length > 0 ? renderProductGrid(newProducts) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">현재 신제품이 없습니다.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
};

export default Products;