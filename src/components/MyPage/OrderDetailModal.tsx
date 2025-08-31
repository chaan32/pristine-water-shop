import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Package, MessageSquare } from 'lucide-react';

interface OrderItem {
  productId?: number;
  productName: string;
  productPerPrice: number;
  productTotalPrice: number;
  quantity: number;
  productImageUrl?: string;
}

// ✅ 1. order 타입에 shipmentFee 추가
interface OrderDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: {
    orderName: string;
    createdAt: string;
    price: number;
    shipmentFee: number;
    shipmentStatus: string;
    products: string;
    items: OrderItem[];
  } | null;
  onReviewClick?: (product: OrderItem, orderName: string) => void;
}

const OrderDetailModal = ({ isOpen, onClose, order, onReviewClick }: OrderDetailModalProps) => {
  if (!order) return null;

  const getShipmentStatusText = (status: string) => {
    const statusMap: { [key: string]: string } = {
      'PENDING': '배송 대기',
      'PREPARING': '발송 대기중',
      'PROCESSING': '상품 준비중',
      'SHIPPED': '배송중',
      'DELIVERED': '배송완료',
      'CANCELLED': '배송 취소'
    };
    return statusMap[status] || status;
  };

  const getShipmentStatusVariant = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return 'default';
      case 'SHIPPED':
        return 'secondary';
      case 'PROCESSING':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  // ✅ 2. 상품 금액 계산 로직 추가
  const productsTotal = order.price - order.shipmentFee;

  return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              주문 상세정보
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* 주문 기본 정보 */}
            <div className="border rounded-lg p-4 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-lg">{order.orderName}</h3>
                  <p className="text-sm text-muted-foreground">{new Date(order.createdAt).toLocaleString('ko-KR')}</p>
                </div>
                <Badge variant={getShipmentStatusVariant(order.shipmentStatus)}>
                  {getShipmentStatusText(order.shipmentStatus)}
                </Badge>
              </div>

              {/* ✅ 3. 금액 정보를 상품 금액, 배송비, 총 금액으로 분리해서 표시 */}
              <div className="border-t pt-4 mt-2 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">상품 금액</span>
                  <span className="font-medium">{productsTotal.toLocaleString()}원</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">배송비</span>
                  <span className="font-medium">{order.shipmentFee.toLocaleString()}원</span>
                </div>
              </div>
              <div className="border-t pt-4 mt-2 flex justify-between items-center">
                <span className="text-base font-semibold">총 결제 금액</span>
                <p className="text-2xl font-bold text-primary">
                  {order.price.toLocaleString()}원
                </p>
              </div>
            </div>

            {/* 주문 상품 목록 */}
            <div className="border rounded-lg">
              <div className="bg-muted p-3 flex justify-between text-sm font-medium">
                <h4>주문 상품</h4>
              </div>
              {/* ✅ 4. 항목(칼럼)명 헤더 추가 */}
              <div className="flex px-4 py-2 border-b text-sm font-medium text-muted-foreground bg-muted/50">
                <div className="flex-1">상품 정보</div>
                <div className="w-32 text-right">상품 금액</div>
              </div>
              <div className="divide-y">
                {order.items.map((item, index) => (
                    <div key={index} className="p-4 flex gap-4 items-center">
                      {item.productImageUrl ? (
                          <img
                              src={item.productImageUrl}
                              alt={item.productName}
                              className="w-16 h-16 object-cover rounded-lg border"
                          />
                      ) : (
                          <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                            <Package className="w-8 h-8 text-muted-foreground" />
                          </div>
                      )}
                      <div className="flex-1">
                        <h5 className="font-medium">{item.productName}</h5>
                        <p className="text-sm text-muted-foreground">
                          {item.productPerPrice.toLocaleString()}원 × {item.quantity}개
                        </p>
                      </div>
                      <div className="w-32 text-right flex flex-col items-end gap-2">
                        <p className="font-semibold">
                          {item.productTotalPrice.toLocaleString()}원
                        </p>
                         {order.shipmentStatus === 'DELIVERED' && onReviewClick && (
                           <Button
                             variant="outline"
                             size="sm"
                             className="h-7 px-2 text-xs"
                             onClick={() => onReviewClick(item, order.orderName)}
                           >
                             <MessageSquare className="w-3 h-3 mr-1" />
                             후기 작성
                           </Button>
                         )}
                      </div>
                    </div>
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
  );
};

export default OrderDetailModal;