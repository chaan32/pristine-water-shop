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
import { shopApi, cartApi, getUserInfo, getAccessToken } from '@/lib/api';
import { toast } from '@/hooks/use-toast';

const Shop = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('popular');
  const [filterCategory, setFilterCategory] = useState('all');
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [userType, setUserType] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hoveredCategory, setHoveredCategory] = useState<number | null>(null);

  // 사용자 type 정보 가져오기
  useEffect(() => {
    const userInfo = getUserInfo();
    const normalized = typeof userInfo?.role === 'string' ? userInfo.role.toLowerCase() : null;
    setUserType(normalized); // null이면 비로그인 상태
  }, []);

  // 상품 데이터 가져오기
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        let response;
        
        if (filterCategory === 'special') {
          // 전용 상품 조회
          const token = getAccessToken();
          if (!token) {
            toast({
              title: "로그인 필요",
              description: "전용 상품을 보려면 로그인해주세요.",
              variant: "destructive",
            });
            setFilterCategory('all');
            return;
          }
          
          response = await shopApi.getSpecializeProducts();
        } else {
          // 일반 상품 조회
          response = await shopApi.getProducts();
        }
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: 상품 데이터를 가져오는데 실패했습니다.`);
        }

        // 응답 본문을 텍스트로 먼저 읽어서 확인
        const responseText = await response.text();
        
        // 빈 응답 체크
        if (!responseText || responseText.trim() === '') {
          if (filterCategory === 'special') {
            // 전용 상품이 없는 경우 빈 배열로 처리
            setProducts([]);
            setError(null);
            toast({
              title: "전용 상품 없음",
              description: "현재 회원님을 위한 전용 상품이 준비되지 않았습니다.",
            });
            return;
          } else {
            throw new Error('서버에서 빈 응답을 받았습니다.');
          }
        }

        // JSON 파싱 시도
        let data;
        try {
          data = JSON.parse(responseText);
        } catch (jsonError) {
          throw new Error('서버 응답 형식이 올바르지 않습니다.');
        }

        // 데이터가 배열이 아닌 경우 처리
        if (!Array.isArray(data)) {
          if (filterCategory === 'special' && (data === null || data === undefined)) {
            // 전용 상품이 없는 경우
            setProducts([]);
            setError(null);
            return;
          }
          // Queue나 다른 형태일 수 있으니 배열로 변환 시도
          if (data && typeof data === 'object' && data.length !== undefined) {
            data = Array.from(data);
          } else {
            data = [];
          }
        }

        setProducts(data);
        setError(null);
      } catch (error) {
        setError(error.message);
        if (filterCategory === 'special') {
          setFilterCategory('all'); // 실패 시 일반 상품으로 돌아가기
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [filterCategory]);

  // 카테고리 데이터 가져오기
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await shopApi.getAllCategories();
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
    // 비로그인 상태: customerPrice
    if (!userType) {
      return parseInt(product.customerPrice);
    }

    // headquarters, branch: businessPrice
    if (userType === 'headquarters' || userType === 'branch') {
      return parseInt(product.businessPrice);
    }

    // individual: customerPrice
    return parseInt(product.customerPrice);
  };

  // 가격 표시 함수
  const renderPriceSection = (product) => {
    // admin: 개인가와 법인가 모두 표시
    if (userType === 'admin') {
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

    // 나머지: 해당 가격만 표시
    return (
        <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl font-bold text-primary">
          {getDisplayPrice(product).toLocaleString()}원
        </span>
        </div>
    );
  };

  const filteredProducts = products.filter(product => {
    // 전용 상품 모드일 때는 필터링 없이 모든 상품 표시
    if (filterCategory === 'special') {
      const matchesSearch = product.productName.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    }
    
    // 일반 상품 모드의 기존 필터링 로직
    // Only show ON_SALE and SOLD_OUT products
    const matchesStatus = product.salesStatus === "ON_SALE" || product.salesStatus === "SOLD_OUT";
    const matchesSearch = product.productName.toLowerCase().includes(searchTerm.toLowerCase());
    let matchesCategory = true;

    if (filterCategory !== 'all') {
      // 메인 카테고리가 선택된 경우 (main-{id} 형태)
      if (filterCategory.startsWith('main-')) {
        const mainCategoryId = parseInt(filterCategory.replace('main-', ''));
        // 해당 메인 카테고리의 모든 서브 카테고리에 속하는 상품들
        const mainCategory = categories.find(cat => cat.mainCategoryId === mainCategoryId);
        if (mainCategory) {
          const subCategoryIds = mainCategory.subCategories.map(sub => sub.categoryId);
          matchesCategory = subCategoryIds.includes(product.categoryId);
        }
      } else {
        // 서브 카테고리가 선택된 경우
        matchesCategory = product.categoryId === parseInt(filterCategory);
      }
    }

    return matchesStatus && matchesSearch && matchesCategory;
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

  const handleAddToCart = async (product: any) => {
    const token = getAccessToken();
    const userInfo = getUserInfo();
    const currentUserType = userInfo?.role;
    
    try {
      if (token) {
        const res = await cartApi.add({ productId: product.productId, quantity: 1 });
        if (!res.ok) throw new Error('장바구니 추가에 실패했습니다.');
      } else {
        const localCart = JSON.parse(localStorage.getItem('cart') || '[]');
        const existing = localCart.find((item: any) => item.productId === product.productId);
        
        // 현재 사용자 타입에 맞는 가격 계산
        const price = currentUserType === 'headquarters' || currentUserType === 'branch'
          ? parseInt(product.businessPrice)
          : parseInt(product.customerPrice);
          
        if (existing) {
          existing.quantity += 1;
        } else {
          localCart.push({
            productId: product.productId,
            name: product.productName,
            price: price,
            quantity: 1,
            image: product.thumbnailImageUrl,
          });
        }
        localStorage.setItem('cart', JSON.stringify(localCart));
      }

      window.dispatchEvent(new Event('cart:updated'));
      toast({
        title: '장바구니에 담았어요',
        description: `${product.productName}이(가) 장바구니에 추가되었습니다.`,
      });
    } catch (e: any) {
      toast({
        title: '장바구니 추가 실패',
        description: e?.message || '장바구니 추가 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    }
  };

  return (
      <div className="min-h-screen bg-background">
        <Header />

        <main className="container mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              {filterCategory === 'special' ? '전용 상품' : '쇼핑몰'}
            </h1>
            <p className="text-lg text-muted-foreground">
              {filterCategory === 'special'
                ? '회원님만을 위한 특별한 상품들을 만나보세요' 
                : 'DragonCompany의 모든 제품을 한곳에서 만나보세요'
              }
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
                       {/* 전체 제품 */}
                       <Button
                           variant={filterCategory === 'all' ? 'default' : 'ghost'}
                           className="w-full justify-start"
                           onClick={() => setFilterCategory('all')}
                       >
                         전체 제품
                       </Button>
                       
                       {/* 일반 카테고리들 */}
                       {categories.map((category) => (
                         <div key={category.mainCategoryId}>
                           {/* 메인 카테고리 */}
                           <div
                             onMouseEnter={() => setHoveredCategory(category.mainCategoryId)}
                             onMouseLeave={() => setHoveredCategory(null)}
                           >
                             <Button
                               variant={filterCategory === `main-${category.mainCategoryId}` ? 'default' : 'ghost'}
                               className="w-full justify-start font-semibold text-sm"
                               onClick={() => setFilterCategory(`main-${category.mainCategoryId}`)}
                             >
                               {category.mainCategory}
                             </Button>
                           
                             {/* 서브 카테고리들 - 클릭되었거나 hover 시 또는 해당 서브카테고리가 선택된 경우 표시 */}
                             {(filterCategory === `main-${category.mainCategoryId}` || 
                               hoveredCategory === category.mainCategoryId ||
                               category.subCategories.some(sub => filterCategory === String(sub.categoryId))) && (
                               <div className="ml-4 space-y-1 animate-fade-in">
                                 {category.subCategories.map((subCategory) => (
                                   <Button
                                     key={subCategory.categoryId}
                                     variant={filterCategory === String(subCategory.categoryId) ? 'default' : 'ghost'}
                                     className={`w-full justify-start text-xs ${
                                       filterCategory === String(subCategory.categoryId) 
                                         ? 'text-primary-foreground hover:text-primary-foreground' 
                                         : 'text-muted-foreground hover:text-foreground'
                                     }`}
                                     onClick={() => setFilterCategory(String(subCategory.categoryId))}
                                   >
                                     └ {subCategory.categoryName}
                                   </Button>
                                 ))}
                               </div>
                             )}
                           </div>
                         </div>
                       ))}
                       
                       {/* 전용 상품 - 로그인된 사용자에게만 표시, 맨 아래 위치 */}
                       {userType && (
                         <Button
                           variant={filterCategory === 'special' ? 'default' : 'ghost'}
                           className="w-full justify-start text-blue-600 font-semibold"
                           onClick={() => setFilterCategory('special')}
                         >
                           ⭐ 전용 상품
                         </Button>
                       )}
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
                  {sortedProducts.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {sortedProducts.map((product) => (
                        <Card key={product.productId} className="group hover:shadow-lg transition-smooth water-drop overflow-hidden">
                          <CardHeader className="p-0 relative">
                            {/* Status and Product Badges */}
                            <div className="absolute top-4 left-4 right-4 z-10 flex flex-wrap gap-2">
                              {product.salesStatus === "SOLD_OUT" && (
                                <Badge variant="destructive">품절</Badge>
                              )}
                              {product.isBest && (
                                <Badge className="bg-destructive text-destructive-foreground">BEST</Badge>
                              )}
                              {product.isNew && (
                                <Badge className="bg-accent text-accent-foreground">NEW</Badge>
                              )}
                              {product.isRecommendation && (
                                <Badge variant="secondary">추천</Badge>
                              )}
                            </div>
                            {/* Product Image */}
                            <div className="aspect-square bg-secondary overflow-hidden">
                              <Link to={`/product/${product.productId}`}>
                                <img
                                    src={product.thumbnailImageUrl}
                                    alt={product.productName}
                                    className="w-full h-full object-contain transition-smooth cursor-pointer hover:opacity-80"
                                    loading="lazy"
                                />
                              </Link>
                            </div>
                          </CardHeader>

                          <CardContent className="p-6">
                            {/* Rating */}
                            <div className="flex items-center gap-2 mb-3">
                              <div className="flex items-center gap-1">
                                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                <span className="text-sm font-medium">{product.rating?.toFixed(1) || '0.0'}</span>
                              </div>
                              <span className="text-sm text-muted-foreground">
                                ({product.reviews || 0}개 리뷰)
                              </span>
                            </div>

                            {/* Product Name */}
                            <h3 className="text-lg font-semibold text-foreground mb-3 group-hover:text-primary transition-smooth">
                              {product.productName}
                            </h3>

                            {/* Category */}
                            <div className="text-sm text-muted-foreground mb-3">
                              {product.mainCategory} {'>'} {product.subCategory}
                            </div>

                            {/* Expressions/Features - Fixed height for consistent button positioning */}
                            <div className="h-20 mb-4">
                              {product.expressions && product.expressions.length > 0 ? (
                                <ul className="space-y-1">
                                  {product.expressions.slice(0, 4).map((expression, index) => (
                                    <li key={index} className="text-sm text-muted-foreground flex items-center gap-2">
                                      <div className="w-1 h-1 bg-accent rounded-full" />
                                      {expression}
                                    </li>
                                  ))}
                                </ul>
                              ) : (
                                <div className="text-sm text-muted-foreground opacity-50">
                                  특징 정보 없음
                                </div>
                              )}
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
                                  onClick={() => handleAddToCart(product)}
                                  aria-label="장바구니 담기"
                              >
                                <ShoppingCart className="w-4 h-4" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                        ))}
                    </div>
                  ) : (
                    // 빈 상품 목록 처리
                    <div className="text-center py-12">
                      {filterCategory === 'special' ? (
                        <div>
                          <h3 className="text-xl font-semibold text-muted-foreground mb-2">전용 상품이 없습니다</h3>
                          <p className="text-muted-foreground">
                            현재 회원님을 위한 특별 상품이 준비되지 않았습니다.
                          </p>
                          <Button
                            onClick={() => setFilterCategory('all')}
                            className="mt-4"
                          >
                            일반 상품 보기
                          </Button>
                        </div>
                      ) : (
                        <div>
                          <h3 className="text-xl font-semibold text-muted-foreground mb-2">검색 결과가 없습니다</h3>
                          <p className="text-muted-foreground">
                            다른 검색어나 카테고리를 시도해보세요.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
          )}

        </main>

        <Footer />
      </div>
  );
};

export default Shop;