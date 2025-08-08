import Header from '@/components/Layout/Header';
import Footer from '@/components/Layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';

// DTO 타입 정의 (백엔드 명세 기반)
interface ProductDetailDTO {
  id: number;
  name: string;
  category: string;
  categoryId: number;
  customerPrice: number;
  businessPrice: number;
  discountPrice?: number | null;
  discountPercent?: number | null;
  stock: number;
  status: string;
  createdAt: string;
}

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState<ProductDetailDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const userType = useMemo(() => localStorage.getItem('userType'), []); // null이면 비로그인

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

  useEffect(() => {
    if (product?.name) {
      document.title = `${product.name} 상세 | AquaPure`;
    }
  }, [product?.name]);

  const formatCurrency = (value?: number | null) =>
    typeof value === 'number' ? `${value.toLocaleString()}원` : '-';

  const PriceSection = ({ p }: { p: ProductDetailDTO }) => {
    if (userType === 'admin') {
      return (
        <div className="space-y-1 mb-4">
          <div className="flex items-center gap-2">
            <Badge variant="outline">개인가</Badge>
            <span className="text-xl font-semibold text-primary">{formatCurrency(p.customerPrice)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">법인가</Badge>
            <span className="text-xl font-semibold text-primary">{formatCurrency(p.businessPrice)}</span>
          </div>
        </div>
      );
    }

    if (userType === 'headquarters' || userType === 'branch') {
      return (
        <div className="flex items-center gap-2 mb-4">
          <span className="text-3xl font-bold text-primary">{formatCurrency(p.businessPrice)}</span>
          <Badge variant="secondary" className="text-xs">법인가</Badge>
        </div>
      );
    }

    // 비로그인 또는 individual
    return (
      <div className="flex items-center gap-2 mb-4">
        <span className="text-3xl font-bold text-primary">{formatCurrency(p.customerPrice)}</span>
        <Badge variant="outline" className="text-xs">개인가</Badge>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        {loading && (
          <div className="text-center py-16">
            <p className="text-lg text-muted-foreground">제품 정보를 불러오는 중...</p>
          </div>
        )}

        {!loading && error && (
          <div className="text-center py-16">
            <p className="text-destructive text-lg">{error}</p>
            <Button className="mt-4" onClick={() => window.location.reload()}>다시 시도</Button>
          </div>
        )}

        {!loading && !error && product && (
          <article className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* 정보 카드 */}
            <section className="lg:col-span-2">
              <Card className="water-drop">
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline">{product.category}</Badge>
                  </div>
<h1 className="text-3xl font-bold text-foreground">{product.name}</h1>
                </CardHeader>
                <CardContent className="space-y-4">
                  <PriceSection p={product} />

                  {(product.discountPercent || product.discountPrice) && (
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      {typeof product.discountPercent === 'number' && (
                        <Badge variant="destructive">{product.discountPercent}% 할인</Badge>
                      )}
                      {typeof product.discountPrice === 'number' && (
                        <span>할인 금액: {formatCurrency(product.discountPrice)}</span>
                      )}
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="rounded-md bg-secondary/30 p-4">
                      <p className="text-sm text-muted-foreground">재고</p>
                      <p className="text-lg font-semibold">{product.stock.toLocaleString()} 개</p>
                    </div>
                    <div className="rounded-md bg-secondary/30 p-4">
                      <p className="text-sm text-muted-foreground">상태</p>
                      <p className="text-lg font-semibold">{product.status}</p>
                    </div>
                    <div className="rounded-md bg-secondary/30 p-4 col-span-2">
                      <p className="text-sm text-muted-foreground">등록일</p>
                      <p className="text-lg font-semibold">
                        {new Date(product.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button className="water-drop">장바구니</Button>
                    <Button variant="outline" className="water-drop">바로 구매</Button>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* 요약 카드 */}
            <aside className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>상품 요약</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">카테고리</span>
                    <span className="font-medium">{product.category}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">상품 ID</span>
                    <span className="font-medium">{product.id}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">카테고리 ID</span>
                    <span className="font-medium">{product.categoryId}</span>
                  </div>
                  <div className="pt-2">
                    <Link to="/shop">
                      <Button variant="ghost" className="w-full">목록으로</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </aside>
          </article>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default ProductDetail;
