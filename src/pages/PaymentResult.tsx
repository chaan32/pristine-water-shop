import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '@/components/Layout/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { apiFetch, getAccessToken } from '@/lib/api';

interface PaymentResult {
  authResultCode: string;
  authResultMsg: string;
  tid: string;
  clientId: string;
  orderId: string;
  amount: string;
  mallReserved: string;
  authToken: string;
  signature: string;
}

const PaymentResult = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(true);
  const [result, setResult] = useState<{ success: boolean; message: string; orderNumber?: string } | null>(null);

  useEffect(() => {
    const processPaymentResult = async () => {
      try {
        // URL 파라미터에서 결제 결과 파싱
        const urlParams = new URLSearchParams(location.search);
        const authResultCode = urlParams.get('authResultCode');
        const tid = urlParams.get('tid');
        const orderId = urlParams.get('orderId');
        const amount = urlParams.get('amount');

        console.log('Payment result params:', { authResultCode, tid, orderId, amount });

        if (!authResultCode || !tid || !orderId) {
          throw new Error('필수 결제 정보가 누락되었습니다.');
        }

        if (authResultCode !== '0000') {
          const authResultMsg = urlParams.get('authResultMsg') || '결제 인증에 실패했습니다.';
          throw new Error(authResultMsg);
        }

        // 서버에 승인 요청
        const token = getAccessToken();
        if (!token) {
          throw new Error('인증 토큰이 없습니다. 다시 로그인해주세요.');
        }

        const approvalResponse = await apiFetch(`/api/payment/approve`, {
          method: 'POST',
          body: JSON.stringify({
            tid,
            orderId,
            amount: parseInt(amount || '0')
          })
        });

        if (!approvalResponse.ok) {
          const errorData = await approvalResponse.text();
          throw new Error(`결제 승인 실패: ${errorData}`);
        }

        const approvalData = await approvalResponse.json();
        
        if (approvalData.resultCode === '0000') {
          setResult({
            success: true,
            message: '결제가 성공적으로 완료되었습니다.',
            orderNumber: orderId
          });
          toast.success('결제가 완료되었습니다.');
        } else {
          throw new Error(approvalData.resultMsg || '결제 승인에 실패했습니다.');
        }

      } catch (error: any) {
        console.error('Payment processing error:', error);
        setResult({
          success: false,
          message: error.message || '결제 처리 중 오류가 발생했습니다.'
        });
        toast.error(error.message || '결제 처리 중 오류가 발생했습니다.');
      } finally {
        setIsProcessing(false);
      }
    };

    processPaymentResult();
  }, [location]);

  const handleGoHome = () => {
    navigate('/');
  };

  const handleGoMyPage = () => {
    navigate('/mypage');
  };

  if (isProcessing) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <Card className="w-full max-w-md">
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <Loader2 className="w-12 h-12 mx-auto animate-spin text-primary" />
                  <h2 className="text-xl font-semibold">결제 처리 중...</h2>
                  <p className="text-muted-foreground">
                    결제 결과를 확인하고 있습니다.<br />
                    잠시만 기다려주세요.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-center">
                {result?.success ? '결제 완료' : '결제 실패'}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-6">
              {result?.success ? (
                <>
                  <CheckCircle className="w-16 h-16 mx-auto text-green-500" />
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-green-700">
                      결제가 완료되었습니다!
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
                      결제에 실패했습니다
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