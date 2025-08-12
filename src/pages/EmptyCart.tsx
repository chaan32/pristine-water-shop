import Header from '@/components/Layout/Header';
import Footer from '@/components/Layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ShoppingBag } from 'lucide-react';
import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const EmptyCart = () => {
  const navigate = useNavigate();

  // Basic SEO tags per page
  useEffect(() => {
    document.title = '장바구니 비어있음 | 쇼핑 계속하기';
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute('content', '장바구니가 비어 있습니다. 인기 상품을 둘러보고 마음에 드는 제품을 담아보세요.');
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-16">
        <section className="max-w-2xl mx-auto text-center">
          <Card className="water-drop">
            <CardContent className="p-10 flex flex-col items-center gap-6">
              <div className="rounded-full p-4 bg-primary/10 text-primary">
                <ShoppingBag className="w-10 h-10" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">장바구니가 비어 있어요</h1>
              <p className="text-muted-foreground">
                마음에 드는 상품을 담아보세요. 다양한 제품을 합리적인 가격으로 만나보실 수 있어요.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 mt-2">
                <Button onClick={() => navigate('/shop')} className="min-w-40">
                  지금 쇼핑하러 가기
                </Button>
                <Button variant="secondary" asChild className="min-w-40">
                  <Link to="/products">전체 상품 보기</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default EmptyCart;
