import Header from '@/components/Layout/Header';
import Footer from '@/components/Layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Star, Minus, Plus, ShoppingCart, Heart } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';

// 백엔드 DTO 타입
interface ProductDetailDTO {
  productId: number;
  productName: string;
  customerPrice: number;
  businessPrice: number;
  discountPrice?: number | null;
  discountPercent?: number | null;
  shippingFee?: number | null;
  rating?: number | null;
  reviewCount?: number | null;
  salesStatus?: string | null;
  thumbnailImageUrl?: string | null;
  galleryImageUrls?: string[] | null;
  htmlContent?: string | null;
}

// 리뷰/문의 간단 타입 (목업 유지)
interface Review { id: number; user: string; rating: number; date: string; content: string }
interface Qna { id: number; user: string; question: string; answer: string; date: string }

const ProductDetail = () => {
  const { id } = useParams();

  // 페이지 상태
  const [product, setProduct] = useState<ProductDetailDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // UI 상태 (기존 레이아웃 유지)
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [qnas, setQnas] = useState<Qna[]>([]);

  const userType = useMemo(() => localStorage.getItem('userType'), []); // null이면 비로그인

  // 상세 데이터 로드 - DTO 기반
  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true);
        const res = await fetch(`http://localhost:8080/api/shop/${id}`);
        if (!res.ok) throw new Error('제품 상세 정보를 불러오지 못했습니다.');
        const data: ProductDetailDTO = await res.json();
        setProduct(data);
        setError(null);
      } catch (e: any) {
        setError(e?.message || '알 수 없는 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchDetail();
  }, [id]);

  // 제목 SEO
useEffect(() => {
    if (product?.productName) document.title = `${product.productName} | AquaPure 제품 상세`;
  }, [product?.productName]);

  // 목업: 기존 레이아웃 유지용 데이터 (이미지/리뷰/Q&A 등)
const images = useMemo(() => {
    const arr: string[] = [];
    if (product?.thumbnailImageUrl) arr.push(product.thumbnailImageUrl);
    if (product?.galleryImageUrls?.length) arr.push(...product.galleryImageUrls);
    if (arr.length === 0) return ['/placeholder.svg', '/placeholder.svg', '/placeholder.svg'];
    return arr;
  }, [product]);
  useEffect(() => {
    // 목업 리뷰/문의 채우기 (네트워크 요청 없이 레이아웃만 유지)
    setReviews([
      { id: 1, user: '김**', rating: 5, date: '2024.01.15', content: '설치가 간단하고 물이 부드러워졌어요.' },
      { id: 2, user: '이**', rating: 4, date: '2024.01.10', content: '가격 대비 만족스럽습니다. 염소 냄새가 줄었어요.' },
      { id: 3, user: '박**', rating: 5, date: '2024.01.08', content: '6개월째 사용 중인데 아직도 효과가 좋아요.' },
    ]);
    setQnas([
      { id: 1, user: '홍**', question: '설치 시 공구가 필요하나요?', answer: '별도 공구 없이 손으로 설치 가능합니다.', date: '2024.01.12' },
      { id: 2, user: '김**', question: '교체 주기는 언제인가요?', answer: '일반적으로 6개월 또는 15,000L 사용 시 교체 권장합니다.', date: '2024.01.05' },
    ]);
  }, []);

  // 유틸
  const clampQty = (v: number) => Math.min(10, Math.max(1, v));
  const formatCurrency = (v?: number | null) => (typeof v === 'number' ? `${v.toLocaleString()}원` : '-');

  // 가격 섹션 (요청 규칙 정확히 반영)
  const PriceSection = ({ p }: { p: ProductDetailDTO }) => {
    if (userType === 'admin') {
      return (
        <div className="space-y-1 mb-6">
          <div className="flex items-center gap-2">
            <Badge variant="outline">개인가</Badge>
            <span className="text-3xl font-bold text-primary">{formatCurrency(p.customerPrice)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">법인가</Badge>
            <span className="text-3xl font-bold text-primary">{formatCurrency(p.businessPrice)}</span>
          </div>
        </div>
      );
    }

    if (userType === 'headquarters' || userType === 'branch') {
      return (
        <div className="flex items-center gap-2 mb-6">
          <span className="text-3xl font-bold text-primary">{formatCurrency(p.businessPrice)}</span>
          <Badge variant="secondary" className="text-xs">법인가</Badge>
        </div>
      );
    }

    // 비로그인 또는 individual
    return (
      <div className="flex items-center gap-2 mb-6">
        <span className="text-3xl font-bold text-primary">{formatCurrency(p.customerPrice)}</span>
        <Badge variant="outline" className="text-xs">개인가</Badge>
      </div>
    );
  };

  // 장바구니 (기존 로직 유지, 표시 가격만 변경)
  const currentDisplayPrice = (p: ProductDetailDTO | null) => {
    if (!p) return 0;
    if (!userType) return p.customerPrice;
    if (userType === 'headquarters' || userType === 'branch') return p.businessPrice;
    if (userType === 'individual') return p.customerPrice;
    // admin은 대표가로 customerPrice 기준으로 담음 (요청에 명시 없으므로 단순화)
    return p.customerPrice;
  };

  const handleAddToCart = () => {
    if (!product) return;
    const token = localStorage.getItem('accessToken');

    if (!token) {
      const localCart = JSON.parse(localStorage.getItem('cart') || '[]');
      const existing = localCart.find((item: any) => item.productId === product.productId);
      if (existing) existing.quantity += quantity;
      else localCart.push({ id: Date.now(), productId: product.productId, name: product.productName, price: currentDisplayPrice(product), quantity, image: images[0] });
      localStorage.setItem('cart', JSON.stringify(localCart));
      alert('장바구니에 추가되었습니다.');
      return;
    }

    // 서버 연동은 추후 명세 확정 시 적용
    const localCart = JSON.parse(localStorage.getItem('cart') || '[]');
    localCart.push({ id: Date.now(), productId: product.productId, name: product.productName, price: currentDisplayPrice(product), quantity, image: images[0] });
    localStorage.setItem('cart', JSON.stringify(localCart));
    alert('장바구니에 추가되었습니다.');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">로딩 중...</div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!product || error) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-destructive text-lg">{error || '제품을 찾을 수 없습니다.'}</p>
            <Button className="mt-4" onClick={() => window.location.reload()}>다시 시도</Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
          {/* Product Images - 기존 레이아웃 */}
          <div className="space-y-4">
            <div className="aspect-square bg-secondary rounded-lg overflow-hidden">
              <img src={images[selectedImage]} alt={product.productName} className="w-full h-full object-cover" />
            </div>
            <div className="flex gap-2">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`aspect-square w-20 bg-secondary rounded-lg overflow-hidden border-2 transition-colors ${selectedImage === index ? 'border-primary' : 'border-transparent'}`}
                >
                  <img src={image} alt={`${product.productName} ${index + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info - 기존 배치 유지 */}
          <div className="space-y-6">
            <div>
              {/* 상단 뱃지/제목 */}
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline">{product.salesStatus || '제품'}</Badge>
              </div>
              <h1 className="text-3xl font-bold text-foreground mb-4">{product.productName}</h1>

              {/* 평점 목업 유지 */}
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-5 h-5 ${i < 5 ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                    ))}
                  </div>
                  <span className="font-medium">4.8</span>
                  <span className="text-muted-foreground">({product.reviewCount ?? reviews.length}개 리뷰)</span>
                </div>
              </div>

              {/* 가격 정보 - 규칙 반영 */}
              <PriceSection p={product} />
              {(product.discountPercent || product.discountPrice) && (
                <div className="flex items-center gap-3 mb-2">
                  {typeof product.discountPercent === 'number' && (
                    <Badge variant="destructive">{product.discountPercent}% 할인</Badge>
                  )}
                  {typeof product.discountPrice === 'number' && (
                    <span className="text-sm text-muted-foreground">할인 금액: {formatCurrency(product.discountPrice)}</span>
                  )}
                </div>
              )}

              {/* 수량/버튼 - 기존 레이아웃 */}
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-2 bg-secondary/30 rounded-md px-2 py-1">
                  <button aria-label="decrease" onClick={() => setQuantity(q => clampQty(q - 1))}>
                    <Minus className="w-5 h-5" />
                  </button>
                  <span className="w-10 text-center font-medium">{quantity}</span>
                  <button aria-label="increase" onClick={() => setQuantity(q => clampQty(q + 1))}>
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
                <Button className="flex-1" size="lg" onClick={handleAddToCart}>
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  장바구니 담기
                </Button>
                <Button variant="outline" size="lg">
                  <Heart className="w-5 h-5" />
                </Button>
              </div>

              <Button variant="outline" className="w-full" size="lg">
                바로 구매
              </Button>

              <p className="text-lg text-muted-foreground leading-relaxed">
                프리미엄 샤워 필터는 최신 다층 필터링 기술로 깨끗하고 건강한 물을 제공합니다.
              </p>
            </div>
          </div>
        </div>

        {/* 상세 카드 섹션 - 기존 구성 유지 (텍스트 목업) */}
        <div className="space-y-12 mb-16">
          <Card className="water-drop">
            <CardHeader>
              <CardTitle className="text-2xl">제품 상세정보</CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              {product.htmlContent && (
                  <article
                      className="prose prose-neutral dark:prose-invert max-w-none prose-headings:text-foreground prose-p:text-muted-foreground prose-a:text-primary prose-strong:text-foreground prose-img:rounded-lg"
                      dangerouslySetInnerHTML={{ __html: product.htmlContent }}
                  />
              )}
              {/*목업 데이터

              <div>
                <h3 className="text-xl font-semibold mb-6">제품 개요</h3>
                <div className="prose max-w-none text-muted-foreground">
                  <p className="text-lg leading-relaxed mb-4">
                    프리미엄 샤워 필터는 특허받은 5단계 필터링 시스템으로 유해 물질을 제거하고 필수 미네랄을 보존합니다.
                  </p>
                  <p className="text-lg leading-relaxed mb-4">
                    염소 제거율 99.9%를 목표로 피부와 모발 건강에 도움을 줍니다.
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-6">핵심 기술</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-secondary/30 rounded-lg p-6">
                    <h4 className="font-semibold text-lg mb-3 text-primary">5단계 필터링 시스템</h4>
                    <p className="text-muted-foreground">PP, 활성탄, KDF, 세라믹볼, 비타민C 필터의 조합.</p>
                  </div>
                  <div className="bg-secondary/30 rounded-lg p-6">
                    <h4 className="font-semibold text-lg mb-3 text-primary">중금속 차단</h4>
                    <p className="text-muted-foreground">납, 수은, 카드뮴 등 중금속 제거에 최적화.</p>
                  </div>
                  <div className="bg-secondary/30 rounded-lg p-6">
                    <h4 className="font-semibold text-lg mb-3 text-primary">미네랄 보존</h4>
                    <p className="text-muted-foreground">유해 물질 제거와 동시에 유익 미네랄 보존.</p>
                  </div>
                  <div className="bg-secondary/30 rounded-lg p-6">
                    <h4 className="font-semibold text-lg mb-3 text-primary">비타민C 인퓨전</h4>
                    <p className="text-muted-foreground">피부 자극 완화와 보습에 도움.</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-6">제품 사양</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[['크기', '15cm x 8cm x 8cm'], ['무게', '350g'], ['필터 수명', '6개월 (약 15,000L)'], ['적용 수압', '1~6kgf/cm²'], ['사용 온도', '5~40°C'], ['소재', 'ABS, 스테인리스 스틸']].map(([k, v]) => (
                    <div key={k} className="flex justify-between items-center border-b border-secondary pb-3">
                      <span className="font-medium text-lg">{k}</span>
                      <span className="text-muted-foreground text-lg">{v}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-6">설치 및 사용법</h3>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[1,2,3].map((n) => (
                      <div key={n} className="text-center">
                        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                          <span className="text-2xl font-bold text-primary">{n}</span>
                        </div>
                        <h4 className="font-semibold mb-2">{n === 1 ? '기존 샤워헤드 분리' : n === 2 ? '필터 연결' : '샤워헤드 재연결'}</h4>
                        <p className="text-sm text-muted-foreground">{n === 1 ? '시계 반대 방향으로 분리합니다.' : n === 2 ? '시계 방향으로 연결합니다.' : '연결 후 누수 여부를 확인합니다.'}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-6">관리 및 유지보수</h3>
                <div className="bg-secondary/20 rounded-lg p-6">
                  <ul className="space-y-3">
                    {['필터 교체 주기: 6개월 또는 약 15,000L 사용 시', '외관 청소: 중성세제로 월 1회 권장', '보관: 직사광선을 피하고 서늘한 곳', '교체 알림: 물의 맛/냄새 변화 시 교체'].map((t, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                        <span>{t}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              */}
            </CardContent>
          </Card>
        </div>

        {/* 리뷰 / Q&A - 기존 탭 레이아웃 유지 */}
        <Tabs defaultValue="reviews" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="reviews">구매후기 ({reviews.length})</TabsTrigger>
            <TabsTrigger value="qna">Q&A ({qnas.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="reviews" className="mt-8">
            <div className="space-y-6">
              {reviews.map((review) => (
                <Card key={review.id} className="water-drop">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <span className="font-medium">{review.user}</span>
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                          ))}
                        </div>
                      </div>
                      <span className="text-sm text-muted-foreground">{review.date}</span>
                    </div>
                    <p className="text-muted-foreground">{review.content}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="qna" className="mt-8">
            <div className="space-y-6">
              {qnas.map((qna) => (
                <Card key={qna.id} className="water-drop">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline">Q</Badge>
                          <span className="font-medium">{qna.user}</span>
                          <span className="text-sm text-muted-foreground">{qna.date}</span>
                        </div>
                        <p className="ml-8">{qna.question}</p>
                      </div>
                      <div className="ml-4 pl-4 border-l-2 border-secondary">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge>A</Badge>
                          <span className="font-medium text-primary">AquaPure</span>
                        </div>
                        <p className="ml-8 text-muted-foreground">{qna.answer}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              <Card className="water-drop">
                <CardHeader>
                  <CardTitle>문의하기</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea placeholder="궁금한 점을 남겨주세요..." />
                  <Button className="w-full water-drop">문의 등록</Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
};

export default ProductDetail;
