import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Star, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

const FeaturedProducts = () => {
  const featuredProducts = [
    {
      id: 1,
      name: '프리미엄 샤워 필터',
      price: 89000,
      originalPrice: 120000,
      image: '/placeholder.svg',
      rating: 4.8,
      reviews: 234,
      badge: 'BEST',
      features: ['염소 제거 99.9%', '중금속 차단', '6개월 사용']
    },
    {
      id: 2,
      name: '주방용 직수 정수기',
      price: 195000,
      originalPrice: null,
      image: '/placeholder.svg',
      rating: 4.9,
      reviews: 156,
      badge: 'NEW',
      features: ['4단계 필터링', 'LED 교체 알림', 'NSF 인증']
    },
    {
      id: 3,
      name: '산업용 대용량 필터',
      price: 450000,
      originalPrice: null,
      image: '/placeholder.svg',
      rating: 4.7,
      reviews: 89,
      badge: null,
      features: ['1일 1000L 처리', '자동 역세척', '2년 보증']
    }
  ];

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            추천 제품
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            고객들이 가장 선호하는 Dragon Company의 베스트셀러 정수 필터를 만나보세요
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {featuredProducts.map((product) => (
            <Card key={product.id} className="group hover:shadow-lg transition-smooth water-drop overflow-hidden">
              <CardHeader className="p-0 relative">
                {/* Badge */}
                {product.badge && (
                  <Badge 
                    className={`absolute top-4 left-4 z-10 ${
                      product.badge === 'BEST' 
                        ? 'bg-destructive text-destructive-foreground' 
                        : 'bg-accent text-accent-foreground'
                    }`}
                  >
                    {product.badge}
                  </Badge>
                )}

                {/* Wishlist Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-4 right-4 z-10 w-8 h-8 p-0 bg-background/80 hover:bg-background"
                >
                  <Heart className="w-4 h-4" />
                </Button>

                {/* Product Image */}
                <div className="aspect-square bg-secondary overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-smooth"
                  />
                </div>
              </CardHeader>

              <CardContent className="p-6">
                {/* Rating */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">{product.rating}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    ({product.reviews}개 리뷰)
                  </span>
                </div>

                {/* Product Name */}
                <h3 className="text-lg font-semibold text-foreground mb-3 group-hover:text-primary transition-smooth">
                  {product.name}
                </h3>

                {/* Features */}
                <ul className="space-y-1 mb-4">
                  {product.features.map((feature, index) => (
                    <li key={index} className="text-sm text-muted-foreground flex items-center gap-2">
                      <div className="w-1 h-1 bg-accent rounded-full" />
                      {feature}
                    </li>
                  ))}
                </ul>

              </CardContent>

              <CardFooter className="p-6 pt-0">
                <Link to={`/product/${product.id}`}>
                  <Button className="w-full water-drop">
                    자세히 보기
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link to="/shop">
            <Button variant="outline" size="lg" className="water-drop">
              전체 제품 보기
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;