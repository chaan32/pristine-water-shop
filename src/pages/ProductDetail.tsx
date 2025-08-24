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
import { apiFetch, shopApi, cartApi, getUserInfo } from '@/lib/api';
import { toast } from '@/hooks/use-toast';

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
  salesStatus?: "ON_SALE" | "SOLD_OUT" | "DISCONTINUED" | null;
  thumbnailImageUrl?: string | null;
  galleryImageUrls?: string[] | null;
  htmlContent?: string | null;
  title: string;
  isBest?: boolean;
  isNew?: boolean;
  isRecommendation?: boolean;
}
// 백엔드 DTO Review
interface ReviewDTO {
  commentId: number;
  userId: number;
  rating: number;
  comment: string;
  authorName: string;
  createdAt: string;
}

// 백엔드 DTO Q&A
interface QnaDTO {
  id: number;
  question: string;
  answer: string | null;
  isAnswered: boolean;
  createdAt: string;
}


// 리뷰/문의 간단 타입 (목업 유지)
interface Review { id: number; user: string; rating: number; date: string; content: string }
interface Qna {
  id: number;
  date: string;
  question: string;
  answer: string;
  isAnswered: boolean;
}

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
  const [visibleReviewsCount, setVisibleReviewsCount] = useState(5); // 리뷰 표시 개수

  // 리뷰 전용 로딩 및 에러 상태 추가
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [reviewsError, setReviewsError] = useState<string | null>(null);

  const [qnasLoading, setQnasLoading] = useState(true);
  const [qnasError, setQnasError] = useState<string | null>(null);

  const [newQuestion, setNewQuestion] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);



  const userInfo = getUserInfo();
  const userType = userInfo?.role; // null이면 비로그인

  // 상세 데이터 로드 - DTO 기반
  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true);
        const res = await shopApi.getProduct(id);

        if (!res.ok) {
          throw new Error('제품 상세 정보를 불러오지 못했습니다.');
        }
        const data: ProductDetailDTO = await res.json();
        setProduct(data);
        setError(null);

      }
      catch (e: any) {
        setError(e?.message || '알 수 없는 오류가 발생했습니다.');
      }
      finally {
        setLoading(false);
      }
    };

    if (id) fetchDetail();
  }, [id]);

  // 제목 SEO
  useEffect(() => {
    if (product?.productName) document.title = `${product.productName} | 제품 상세`;
  }, [product?.productName]);

// 리뷰 데이터 로드 - DTO 기반
  useEffect(() =>{
    const fetchReviews = async () => {
      if (!id) return;

      try{
        setReviewsLoading(true);
        const res = await shopApi.getProductReviews(id);
        if (!res.ok) throw new Error('리뷰를 불러오지 못했습니다.');
        const data: ReviewDTO[] = await res.json();

        // 데이터를 변환하기
        const formattedReviews : Review[] = data.map((dto) => ({
          id: dto.commentId,
          user: dto.authorName || '익명',
          rating: dto.rating,
          date: dto.createdAt.slice(0, 10),
          content: dto.comment,
        }));
        setReviews(formattedReviews);
        setReviewsError(null);
      }
      catch (e: any){
        setReviewsError(e?.message || '알 수 없는 오류가 발생했습니다.');
      }
      finally {
        setReviewsLoading(false);
      }
    };
    fetchReviews();
  }, [id]);

  useEffect(() => {
    const fetchQnas = async () => {
      if (!id) return;

      try {
        setQnasLoading(true); // Q&A 로딩 시작
        const res = await shopApi.getProductInquiries(id);
        if (!res.ok) throw new Error('Q&A 목록을 불러오지 못했습니다.');
        const data: QnaDTO[] = await res.json();

        // Q&A 데이터를 변환하기
        const formattedQnas: Qna[] = data.map((dto) => ({
          id: dto.id,
          date: dto.createdAt.slice(0, 10),
          question: dto.question,
          answer: dto.answer ?? "아직 답변이 등록되지 않았습니다.",
          isAnswered: dto.isAnswered,
        }));

        setQnas(formattedQnas);
        setQnasError(null); // 성공 시 에러 초기화
      } catch (e: any) {
        setQnasError(e?.message || '알 수 없는 오류가 발생했습니다.');
      } finally {
        setQnasLoading(false); // Q&A 로딩 종료
      }
    };

    fetchQnas();
  }, [id]);
  // 목업: 기존 레이아웃 유지용 데이터 (이미지/리뷰/Q&A 등)
  const images = useMemo(() => {
    const arr: string[] = [];
    if (product?.thumbnailImageUrl) arr.push(product.thumbnailImageUrl);
    if (product?.galleryImageUrls?.length) arr.push(...product.galleryImageUrls);
    if (arr.length === 0) return ['/placeholder.svg', '/placeholder.svg', '/placeholder.svg'];
    return arr;
  }, [product]);

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

  const handleAddToCart = async () => {
    if (!product) return;
    const token = localStorage.getItem('accessToken');

    try {
      if (token) {
        const res = await cartApi.add({
          productId: product.productId,
          quantity,
        });
        if (!res.ok) throw new Error('장바구니 추가에 실패했습니다.');
        window.dispatchEvent(new Event('cart:updated'));
        toast({ title: '장바구니에 담았어요', description: `${product.productName} x ${quantity}` });
        return;
      }

      // 비로그인: 로컬 스토리지 사용 유지
      const localCart = JSON.parse(localStorage.getItem('cart') || '[]');
      const existing = localCart.find((item: any) => item.productId === product.productId);
      if (existing) existing.quantity += quantity;
      else localCart.push({ id: Date.now(), productId: product.productId, name: product.productName, price: currentDisplayPrice(product), quantity, image: images[0] });
      localStorage.setItem('cart', JSON.stringify(localCart));
      window.dispatchEvent(new Event('cart:updated'));
      toast({ title: '장바구니에 담았어요', description: `${product.productName} x ${quantity}` });
    } catch (e: any) {
      console.error(e);
      toast({ title: '장바구니 추가 실패', description: e?.message || '장바구니 추가 중 오류가 발생했습니다.', variant: 'destructive' });
    }
  };

  // 문의 등록 핸들러 함수 작성하기
  const handleInquirySubmit = async () =>{
    const userInfo = getUserInfo();
    const userId = userInfo?.id;

    if (!newQuestion.trim()){
      alert('문의 내용을 입력해주세요');
      return;
    }

    if (!userInfo) {
      alert('로그인이 필요합니다');
      return;
    }

    // 보낼 데이터
    const inquiryData = {
      userId: Number(userId),
      productId: Number(id),
      question: newQuestion,
    };

    // API 호출
    setIsSubmitting(true);

    try{
      const res = await shopApi.createInquiry(inquiryData);

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData?.message || '문의 등록에 실패했습니다');
      }

      alert('문의가 성공적으로 등록되었습니다')
      setNewQuestion(''); // 입력 필드 초기화
      window.location.reload();
    } catch(e: any){
        alert(e?.message || '알 수 없는 오류가 발생했습니다');
    } finally{
        setIsSubmitting(false); // 로딩 상태 해제
    }
  };

  const handleShowMoreReviews = () => {
    setVisibleReviewsCount(prevCount => prevCount + 5);
  }
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
                <h1 className="text-3xl font-bold text-foreground mb-4">{product.productName}</h1>

                {/* 평점 ㅇㅇ*/}
                <div className="flex items-center gap-4 mb-6">
                  {/* 리뷰가 1개 이상 있을 때만 평점을 표시 */}
                  {product.reviewCount && product.reviewCount > 0 ? (
                      <div className="flex items-center gap-2">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => {
                            const ratingValue = product.rating ?? 0;
                            // 1. 현재 별이 평점보다 작으면 꽉 찬 별을 표시
                            if (i < Math.floor(ratingValue)) {
                              return (
                                  <Star
                                      key={i}
                                      className="w-5 h-5 fill-yellow-400 text-yellow-400"
                                  />
                              );
                            }
                            // 2. 현재 별이 평점의 정수 부분과 같다면 부분 별을 표시
                            if (i === Math.floor(ratingValue)) {
                              // 소수점 부분만 계산 (예: 4.3 -> 0.3)
                              const fraction = ratingValue - i;
                              const fillPercentage = fraction * 100;

                              return (
                                  <div key={i} className="relative">
                                    {/* 배경이 될 빈 별 */}
                                    <Star className="w-5 h-5 text-gray-300" />
                                    {/* 채워질 부분 (절대 위치로 겹치기) */}
                                    <div
                                        className="absolute top-0 left-0 h-full overflow-hidden"
                                        style={{ width: `${fillPercentage}%` }}
                                    >
                                      <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                                    </div>
                                  </div>
                              );
                            }
                            // 3. 그 외에는 빈 별을 표시
                            return <Star key={i} className="w-5 h-5 text-gray-300" />;
                          })}
                        </div>
                        <span className="font-medium">{(product.rating ?? 0).toFixed(1)}</span>
                        <span className="text-muted-foreground">({product.reviewCount}개 리뷰)</span>
                      </div>
                  ) : (
                      <div className="text-muted-foreground">아직 작성된 리뷰가 없습니다.</div>
                  )}
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
                  {product.title}
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
              </CardContent>
            </Card>
          </div>

          {/* 리뷰 / Q&A - 기존 탭 레이아웃 유지 */}
          <Tabs defaultValue="reviews" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="reviews">구매후기 ({product.reviewCount})</TabsTrigger>
              <TabsTrigger value="qna">Q&A ({qnas.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="reviews" className="mt-8">
              {reviewsLoading ? (
                  <div className="text-center py-8">리뷰를 불러오는 중입니다...</div>
              ) : reviewsError ? (
                  <div className="text-center py-8 text-destructive">{reviewsError}</div>
              ) : reviews.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">작성된 구매후기가 없습니다.</div>
              ) : (
                  <div>
                    <div className="space-y-6">
                      {reviews.slice(0, visibleReviewsCount).map((review) => (
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
                    {visibleReviewsCount < reviews.length && (
                        <div className="mt-8 text-center">
                          <Button variant="outline" onClick={handleShowMoreReviews}>더 보기</Button>
                        </div>
                    )}
                  </div>
              )}
            </TabsContent>

            {/* Q&A 탭 콘텐츠 */}
            <TabsContent value="qna" className="mt-8">
              <div className="space-y-6">
                {/* 로딩/에러 상태 처리 */}
                {qnasLoading ? (
                    <div className="text-center py-8">Q&A 목록을 불러오는 중입니다...</div>
                ) : qnasError ? (
                    <div className="text-center py-8 text-destructive">{qnasError}</div>
                ) : qnas.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">작성된 Q&A가 없습니다.</div>
                ) : (
                    <div className="space-y-6">
                      {qnas.map((qna) => (
                          <Card key={qna.id} className="water-drop">
                            <CardContent className="p-6">
                              <div className="space-y-4">
                                {/* 질문 섹션 */}
                                <div>
                                  <div className="flex items-center gap-2 mb-2">
                                    <Badge variant="outline">Q</Badge>
                                    <span className="text-sm text-muted-foreground">{qna.date}</span>
                                  </div>
                                  <p className="ml-8">{qna.question}</p>
                                </div>

                                {/* 답변이 있을 때만 답변 섹션 렌더링 */}
                                {qna.isAnswered && (
                                    <div className="ml-4 pl-4 border-l-2 border-secondary">
                                      <div className="flex items-center gap-2 mb-2">
                                        <Badge>A</Badge>
                                        <span className="font-medium text-primary">관리자</span>
                                      </div>
                                      <p className="ml-8 text-muted-foreground">{qna.answer}</p>
                                    </div>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                      ))}
                    </div>
                )}

                {/* 문의하기 카드 - 항상 표시 */}
                <Card className="water-drop">
                  <CardHeader>
                    <CardTitle>문의하기</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Textarea
                        placeholder="궁금한 점을 남겨주세요..."
                        value={newQuestion}
                        onChange={(e) => setNewQuestion(e.target.value)}
                        disabled={isSubmitting}
                    />
                    <Button
                        className="w-full water-drop"
                        onClick={handleInquirySubmit}
                        disabled={isSubmitting}
                    >
                      {isSubmitting ?'등록 중...' : '문의 등록' }
                    </Button>
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
