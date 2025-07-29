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
            AquaPure의 정수 필터 제품 정보를 자세히 알아보세요
          </p>
        </div>

        <div className="space-y-12">
          {categories.map((category) => (
            <section key={category.id}>
              <div className="flex items-center gap-4 mb-8">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
                  <category.icon className="w-8 h-8 text-primary-foreground" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-foreground">{category.name}</h2>
                  <p className="text-lg text-muted-foreground">{category.description}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {category.products.map((product) => (
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

                      <ul className="space-y-2 mb-4">
                        {product.features.map((feature, index) => (
                          <li key={index} className="text-sm text-muted-foreground flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                            {feature}
                          </li>
                        ))}
                      </ul>


                      <Link to={`/product/${product.id}`}>
                        <Button className="w-full water-drop">
                          제품 정보 보기
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Products;