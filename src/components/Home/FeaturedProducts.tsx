import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Star, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';

type Product = {
  productId: number;
  categoryId: number;
  productName: string;
  mainCategory: string;
  subCategory: string;
  customerPrice: number;
  businessPrice: number;
  thumbnailImageUrl: string;
  expressions: string[];
  rating: number;
  reviews: number;
};

type DisplayData = {
  bestProduct: Product | null;
  newProduct: Product | null;
  recommendationProduct: Product | null;
};

const FeaturedProducts = () => {
  const [displayData, setDisplayData] = useState<DisplayData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDisplayData = async () => {
      try {
        const response = await apiFetch('/api/shop/display');
        if (response.ok) {
          const data = await response.json();
          setDisplayData(data);
        }
      } catch (error) {
        console.error('Error fetching display data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDisplayData();
  }, []);

  if (loading) {
    return (
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="text-lg text-muted-foreground">로딩 중...</div>
          </div>
        </div>
      </section>
    );
  }

  if (!displayData) {
    return null;
  }

  const featuredProducts = [
    displayData.bestProduct && { ...displayData.bestProduct, badge: 'BEST' },
    displayData.newProduct && { ...displayData.newProduct, badge: 'NEW' },
    displayData.recommendationProduct && { ...displayData.recommendationProduct, badge: null }
  ].filter(Boolean) as (Product & { badge: string | null })[];

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
            <Card key={product.productId} className="group hover:shadow-lg transition-smooth water-drop overflow-hidden flex flex-col h-full">
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
                    src={product.thumbnailImageUrl}
                    alt={product.productName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-smooth"
                  />
                </div>
              </CardHeader>

              <CardContent className="p-6 flex-1 flex flex-col">
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
                  {product.productName}
                </h3>

                {/* Expressions */}
                <div className="flex-1">
                  <ul className="space-y-1 min-h-[120px]">
                    {product.expressions.map((expression, index) => (
                      <li key={index} className="text-sm text-muted-foreground flex items-center gap-2">
                        <div className="w-1 h-1 bg-accent rounded-full" />
                        {expression}
                      </li>
                    ))}
                  </ul>
                </div>

              </CardContent>

              <CardFooter className="p-6 pt-0">
                <Link to={`/product/${product.productId}`}>
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