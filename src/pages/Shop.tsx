import Header from '@/components/Layout/Header';
import Footer from '@/components/Layout/Footer';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowRight, Star, Search, Filter, Heart, ShoppingCart } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

const Shop = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('popular');
  const [filterCategory, setFilterCategory] = useState('all');

  const products = [
    {
      id: 1,
      name: '프리미엄 샤워 필터 SF-100',
      price: 89000,
      originalPrice: 120000,
      image: '/placeholder.svg',
      rating: 4.8,
      reviews: 234,
      badge: 'BEST',
      category: 'shower',
      status: 'available'
    },
    {
      id: 2,
      name: '주방용 직수 정수기 KF-200',
      price: 195000,
      originalPrice: null,
      image: '/placeholder.svg',
      rating: 4.9,
      reviews: 156,
      badge: 'NEW',
      category: 'kitchen',
      status: 'available'
    },
    {
      id: 3,
      name: '산업용 대용량 필터 IF-1000',
      price: 450000,
      originalPrice: null,
      image: '/placeholder.svg',
      rating: 4.7,
      reviews: 89,
      badge: null,
      category: 'industrial',
      status: 'available'
    },
    {
      id: 4,
      name: '기본형 샤워 필터 SF-50',
      price: 45000,
      originalPrice: 65000,
      image: '/placeholder.svg',
      rating: 4.5,
      reviews: 187,
      badge: 'SALE',
      category: 'shower',
      status: 'available'
    },
    {
      id: 5,
      name: '언더싱크 정수기 KF-300',
      price: 320000,
      originalPrice: 380000,
      image: '/placeholder.svg',
      rating: 4.7,
      reviews: 98,
      badge: 'SALE',
      category: 'kitchen',
      status: 'soldout'
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
      category: 'industrial',
      status: 'available'
    },
    {
      id: 7,
      name: '휴대용 정수 보틀 PF-100',
      price: 25000,
      originalPrice: null,
      image: '/placeholder.svg',
      rating: 4.3,
      reviews: 312,
      badge: 'NEW',
      category: 'portable',
      status: 'available'
    },
    {
      id: 8,
      name: '전체 주택용 정수 시스템 HF-2000',
      price: 890000,
      originalPrice: 1200000,
      image: '/placeholder.svg',
      rating: 4.9,
      reviews: 45,
      badge: 'BEST',
      category: 'whole-house',
      status: 'available'
    },
    {
      id: 9,
      name: '교체용 필터 카트리지 세트',
      price: 35000,
      originalPrice: null,
      image: '/placeholder.svg',
      rating: 4.4,
      reviews: 523,
      badge: null,
      category: 'accessory',
      status: 'available'
    }
  ];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || product.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'rating':
        return b.rating - a.rating;
      case 'popular':
      default:
        return b.reviews - a.reviews;
    }
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">쇼핑몰</h1>
          <p className="text-lg text-muted-foreground">
            AquaPure의 모든 제품을 한곳에서 만나보세요
          </p>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="제품명을 검색하세요..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-full md:w-48">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="카테고리" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">전체</SelectItem>
              <SelectItem value="shower">샤워 필터</SelectItem>
              <SelectItem value="kitchen">주방 정수기</SelectItem>
              <SelectItem value="industrial">산업용 필터</SelectItem>
              <SelectItem value="portable">휴대용</SelectItem>
              <SelectItem value="whole-house">전체 주택용</SelectItem>
              <SelectItem value="accessory">부속품</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="정렬" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="popular">인기순</SelectItem>
              <SelectItem value="price-low">가격 낮은순</SelectItem>
              <SelectItem value="price-high">가격 높은순</SelectItem>
              <SelectItem value="rating">평점순</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedProducts.map((product) => (
            <Card key={product.id} className="group hover:shadow-lg transition-smooth water-drop overflow-hidden">
              <CardHeader className="p-0 relative">
                {/* Badge */}
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

                {/* Status Badge */}
                {product.status === 'soldout' && (
                  <Badge 
                    variant="secondary"
                    className="absolute top-4 right-4 z-10"
                  >
                    SOLDOUT
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
                    className={`w-full h-full object-cover group-hover:scale-105 transition-smooth ${
                      product.status === 'soldout' ? 'grayscale opacity-60' : ''
                    }`}
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

                {/* Price */}
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

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Link to={`/product/${product.id}`} className="flex-1">
                    <Button 
                      className="w-full water-drop"
                      disabled={product.status === 'soldout'}
                    >
                      {product.status === 'soldout' ? '품절' : '자세히 보기'}
                      {product.status !== 'soldout' && <ArrowRight className="w-4 h-4 ml-2" />}
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="icon"
                    disabled={product.status === 'soldout'}
                    className="water-drop"
                  >
                    <ShoppingCart className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* No Results */}
        {sortedProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">검색 결과가 없습니다.</p>
            <p className="text-muted-foreground">다른 검색어나 필터를 시도해보세요.</p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Shop;