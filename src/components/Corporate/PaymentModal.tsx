import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { CreditCard, Package } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface PaymentItem {
  productName: string;
  quantity: number;
  price: number;
}

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderNumber: string;
  branchName: string;
  items: PaymentItem[];
  totalAmount: number;
  shipmentFee: number;
  onPayment: (orderNumber: string) => Promise<void>;
}

const PaymentModal = ({ 
  isOpen, 
  onClose, 
  orderNumber, 
  branchName, 
  items, 
  totalAmount,
  shipmentFee,
  onPayment 
}: PaymentModalProps) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayment = async () => {
    try {
      setIsProcessing(true);
      
      // 니스페이 결제창 호출
      if (!window.AUTHNICE) {
        throw new Error('결제 모듈이 로드되지 않았습니다.');
      }

      // 랜덤 주문 ID 생성 (실제로는 서버에서 받아와야 함)
      const randomOrderId = Math.random().toString(16).substr(2, 8);

      window.AUTHNICE.requestPay({
        clientId: "YOUR_REAL_SANDBOX_CLIENT_ID", // 실제 샌드박스에서 발급받은 클라이언트키로 교체 필요
        method: 'card',
        orderId: randomOrderId,
        amount: totalAmount,
        goodsName: items.length > 1 ? `${items[0].productName} 외 ${items.length - 1}건` : items[0].productName,
        returnUrl: window.location.origin + '/payment/result',
        fnError: (result: any) => {
          console.error('결제 오류:', result);
          throw new Error(result.msg || "결제 중 오류가 발생했습니다.");
        }
      });

    } catch (error: any) {
      console.error('결제 처리 중 오류:', error);
      alert(`결제 오류: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-primary" />
            주문 결제
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* 주문 정보 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">주문 정보</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">주문번호</span>
                <span className="font-medium">{orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">지점명</span>
                <span className="font-medium">{branchName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">결제상태</span>
                <Badge variant="pending">결제대기</Badge>
              </div>
            </CardContent>
          </Card>

          {/* 주문 상품 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Package className="w-5 h-5" />
                주문 상품
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {items.map((item, index) => (
                  <div key={index} className="flex justify-between items-center py-2">
                    <div className="flex-1">
                      <span className="font-medium">{item.productName}</span>
                      <span className="text-muted-foreground ml-2">× {item.quantity}개</span>
                    </div>
                    <span className="font-medium">{item.price.toLocaleString()}원</span>
                  </div>
                ))}
                {shipmentFee > 0 && (
                  <div className="flex justify-between items-center py-2">
                    <div className="flex-1">
                      <span className="font-medium">배송비</span>
                    </div>
                    <span className="font-medium">{shipmentFee.toLocaleString()}원</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between items-center pt-2">
                  <span className="text-lg font-semibold">총 결제금액</span>
                  <span className="text-lg font-bold text-primary">{totalAmount.toLocaleString()}원</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 결제 버튼 */}
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={onClose} disabled={isProcessing}>
              취소
            </Button>
            <Button 
              onClick={handlePayment} 
              disabled={isProcessing}
              className="min-w-32"
            >
              {isProcessing ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                  처리중...
                </div>
              ) : (
                `${totalAmount.toLocaleString()}원 결제하기`
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentModal;