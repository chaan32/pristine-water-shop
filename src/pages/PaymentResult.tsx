import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '@/components/Layout/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { apiFetch, getAccessToken } from '@/lib/api';

const PaymentResult = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [result, setResult] = useState<{ success: boolean; message: string; orderNumber?: string } | null>(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const status = urlParams.get('status');
    const orderId = urlParams.get('orderId');
    const tid = urlParams.get('tid');
    const msg = urlParams.get('msg');

    if (status === 'success') {
      setResult({
        success: true,
        message: '주문이 성공적으로 완료되었습니다.',
        orderNumber: orderId || undefined
      });
      toast.success('주문이 완료되었습니다.');
      
      // 결제 성공 시 장바구니 비우기
      clearCart();
    } else {
      setResult({
        success: false,
        message: msg || '주문 처리 중 오류가 발생했습니다.'
      });
      toast.error(msg || '주문 처리 중 오류가 발생했습니다.');
    }
  }, [location]);

  // 장바구니 비우기 함수
  const clearCart = async () => {
    try {
      const token = getAccessToken();
      if (token) {
        // 로그인된 사용자: 서버 장바구니 비우기
        await apiFetch('/api/cart', { method: 'DELETE' });
      }
      // 로컬 장바구니도 비우기
      localStorage.removeItem('cart');
      // 장바구니 업데이트 이벤트 발생
      window.dispatchEvent(new Event('cart:updated'));
    } catch (error) {
      console.error('장바구니 비우기 실패:', error);
    }
  };

  const handleGoHome = () => {
    navigate('/');
  };

  const handleGoMyPage = () => {
    navigate('/mypage');
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-center">
                {result?.success ? '주문 완료' : '주문 실패'}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-6">
              {result?.success ? (
                <>
                  <CheckCircle className="w-16 h-16 mx-auto text-green-500" />
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-green-700">
                      주문이 성공적으로 완료되었습니다!
                    </h3>
                    <p className="text-muted-foreground">
                      {result.message}
                    </p>
                    {result.orderNumber && (
                      <p className="text-sm text-muted-foreground">
                        주문번호: {result.orderNumber}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-3">
                    <Button variant="outline" onClick={handleGoHome} className="flex-1">
                      홈으로
                    </Button>
                    <Button onClick={handleGoMyPage} className="flex-1">
                      주문 확인
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <XCircle className="w-16 h-16 mx-auto text-red-500" />
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-red-700">
                      주문에 실패했습니다
                    </h3>
                    <p className="text-muted-foreground">
                      {result?.message}
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <Button variant="outline" onClick={handleGoHome} className="flex-1">
                      홈으로
                    </Button>
                    <Button onClick={() => navigate('/cart')} className="flex-1">
                      장바구니로
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default PaymentResult;