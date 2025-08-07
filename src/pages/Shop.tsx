import Header from '@/components/Layout/Header';
import Footer from '@/components/Layout/Footer';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowRight, Star, Search, Filter, ShoppingCart } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Shop = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('popular');
  const [filterCategory, setFilterCategory] = useState('all');
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 사용자 role 정보 가져오기
  useEffect(() => {
    const fetchUserInfo = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await fetch('http://localhost:8080/api/auth/me', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          if (response.ok) {
            const userData = await response.json();
            console.log('현재 사용자 정보:', userData);
            console.log('사용자 role:', userData.role);
            setUserRole(userData.role || 'INDIVIDUAL');
          } else {
            setUserRole('INDIVIDUAL');
          }
        } catch (error) {
          console.error('사용자 정보 가져오기 오류:', error);
          setUserRole('INDIVIDUAL');
        }
      } else {
        setUserRole('INDIVIDUAL'); // 비로그인 시 기본값
      }
    };

    fetchUserInfo();
  }, []);

  // 상품 데이터 가져오기
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:8080/api/shop/products');
        if (!response.ok) {
          throw new Error('상품 데이터를 가져오는데 실패했습니다.');
        }
        const data = await response.json();
        setProducts(data);
        setError(null);
      } catch (error) {
        console.error('상품 데이터 가져오기 오류:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // 카테고리 데이터 가져오기
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/shop/categories');
        if (!response.ok) {
          throw new Error('카테고리 데이터를 가져오는데 실패했습니다.');
        }
        const data = await response.json();
        setCategories(data);
      } catch (error) {
        console.error('카테고리 데이터 가져오기 오류:', error);
        setError(error.message);
      }
    };

    fetchCategories();
  }, []);

  // 회원 유형에 따른 가격 계산
  const getDisplayPrice = (product) => {
    if (userRole === 'HEADQUARTERS' || userRole === 'BRANCH') {
      return parseInt(product.businessPrice);
    }
    return parseInt(product.customerPrice);
  };

  // 관리자용 가격 표시 함수
  const renderPriceSection = (product) => {
    if (userRole === 'ADMIN') {
      return (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg font-bold text-primary">
              개인가: {parseInt(product.customerPrice).toLocaleString()}원
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-primary">
              법인가: {parseInt(product.businessPrice).toLocaleString()}원
            </span>
          </div>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl font-bold text-primary">
          {getDisplayPrice(product).toLocaleString()}원
        </span>
        {userRole === 'HEADQUARTERS' || userRole === 'BRANCH' ? (
          <Badge variant="secondary" className="text-xs">
            법인가
          </Badge>
        ) : (
          <Badge variant="outline" className="text-xs">
            개인가
          </Badge>
        )}
      </div>
    );
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.productName.toLowerCase().includes(searchTerm.toLowerCase());
    let matchesCategory = true;
    
    if (filterCategory !== 'all') {
      matchesCategory = product.categoryId === filterCategory;
    }
    
    return matchesSearch && matchesCategory;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return getDisplayPrice(a) - getDisplayPrice(b);
      case 'price-high':
        return getDisplayPrice(b) - getDisplayPrice(a);
      case 'name':
        return a.productName.localeCompare(b.productName);
      case 'popular':
      default:
        return 0; // 기본 순서 유지
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

        {/* 로딩 상태 */}
        {loading && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">상품 정보를 불러오는 중...</p>
          </div>
        )}

        {/* 에러 상태 */}
        {error && (
          <div className="text-center py-12">
            <p className="text-destructive text-lg">오류가 발생했습니다: {error}</p>
            <Button 
              onClick={() => window.location.reload()} 
              className="mt-4"
            >
              다시 시도
            </Button>
          </div>
        )}

        {/* 메인 콘텐츠 */}
        {!loading && !error && (
          <div className="flex flex-col lg:flex-row gap-8 mb-8">
            {/* 카테고리 필터 (좌측) */}
            <div className="lg:w-64 flex-shrink-0">
              <Card className="p-4">
                <h3 className="font-semibold text-foreground mb-4">카테고리</h3>
                <div className="space-y-2">
                  <Button
                    variant={filterCategory === 'all' ? 'default' : 'ghost'}
                    className="w-full justify-start"
                    onClick={() => setFilterCategory('all')}
                  >
                    전체 제품
                  </Button>
                  {categories.map((category) => (
                    <Button
                      key={category.categoryId}
                      variant={filterCategory === category.categoryId ? 'default' : 'ghost'}
                      className="w-full justify-start"
                      onClick={() => setFilterCategory(category.categoryId)}
                    >
                      {category.categoryName}
                    </Button>
                  ))}
                </div>
              </Card>
            </div>

            {/* 메인 콘텐츠 영역 */}
            <div className="flex-1">
              {/* 검색 및 정렬 */}
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="제품명을 검색하세요..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="정렬" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="popular">기본순</SelectItem>
                    <SelectItem value="price-low">가격 낮은순</SelectItem>
                    <SelectItem value="price-high">가격 높은순</SelectItem>
                    <SelectItem value="name">이름순</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Product Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedProducts.map((product) => (
                  <Card key={product.productId} className="group hover:shadow-lg transition-smooth water-drop overflow-hidden">
                    <CardHeader className="p-0 relative">
                      {/* Product Image */}
                      <div className="aspect-square bg-secondary overflow-hidden">
                        <img
                          src={product.thumbnailImageUrl}
                          alt={product.productName}
                          className="w-full h-full object-cover group-hover:scale-105 transition-smooth"
                        />
                      </div>
                    </CardHeader>

                    <CardContent className="p-6">
                      {/* Product Name */}
                      <h3 className="text-lg font-semibold text-foreground mb-3 group-hover:text-primary transition-smooth">
                        {product.productName}
                      </h3>

                      {/* Category */}
                      <div className="text-sm text-muted-foreground mb-3">
                        {product.categoryName}
                      </div>

                      {/* Price */}
                      {renderPriceSection(product)}

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <Link to={`/product/${product.productId}`} className="flex-1">
                          <Button className="w-full water-drop">
                            자세히 보기
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </Button>
                        </Link>
                        <Button
                          variant="outline"
                          size="icon"
                          className="water-drop"
                        >
                          <ShoppingCart className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* No Results */}
        {!loading && !error && sortedProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">검색 결과가 없습니다.</p>
            <p className="text-muted-foreground">다른 검색어나 카테고리를 시도해보세요.</p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Shop;