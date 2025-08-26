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

interface PaymentOrder {
  orderNumber: string;
  branchName: string;
  items: PaymentItem[];
  totalAmount: number;
  shipmentFee: number;
}

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: PaymentOrder[];
  totalAmount: number;
  onPayment: (orderNumbers: string[]) => Promise<void>;
}

const PaymentModal = ({ 
  isOpen, 
  onClose, 
  orders, 
  totalAmount,
  onPayment 
}: PaymentModalProps) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayment = async () => {
    try {
      setIsProcessing(true);
      await onPayment(orders.map(order => order.orderNumber));
    } catch (error: any) {
      console.error('결제 처리 중 오류:', error);
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
              <CardTitle className="text-lg">선택된 주문 정보</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {orders.map((order, index) => (
                <div key={order.orderNumber} className="space-y-3">
                  {index > 0 && <Separator />}
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">주문번호</span>
                      <span className="font-medium">{order.orderNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">지점명</span>
                      <span className="font-medium">{order.branchName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">결제상태</span>
                      <Badge variant="unpaid">미결제</Badge>
                    </div>
                  </div>
                  
                  {/* 해당 주문의 상품들 */}
                  <div className="ml-4 space-y-2 border-l-2 border-primary/20 pl-4">
                    <div className="font-medium text-sm text-primary">주문 상품</div>
                    {order.items.map((item, itemIndex) => (
                      <div key={itemIndex} className="flex justify-between items-center py-1 text-sm">
                        <div className="flex-1">
                          <span className="font-medium">{item.productName}</span>
                          <span className="text-muted-foreground ml-2">× {item.quantity}개</span>
                        </div>
                        <span className="font-medium">{item.price.toLocaleString()}원</span>
                      </div>
                    ))}
                    {order.shipmentFee > 0 && (
                      <div className="flex justify-between items-center py-1 text-sm">
                        <span className="font-medium">배송비</span>
                        <span className="font-medium">{order.shipmentFee.toLocaleString()}원</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center pt-1 border-t">
                      <span className="font-semibold text-sm">주문 소계</span>
                      <span className="font-bold text-sm text-primary">{order.totalAmount.toLocaleString()}원</span>
                    </div>
                  </div>
                </div>
              ))}
              
              <Separator className="my-4" />
              <div className="flex justify-between items-center pt-2">
                <span className="text-lg font-semibold">총 결제금액</span>
                <span className="text-xl font-bold text-primary">{totalAmount.toLocaleString()}원</span>
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