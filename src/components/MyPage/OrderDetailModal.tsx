import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Package } from 'lucide-react';

interface OrderItem {
  productName: string;
  productPerPrice: number;
  productTotalPrice: number;
  quantity: number;
  productImageUrl?: string;
}

interface OrderDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: {
    orderName: string;
    createdAt: string;
    price: number;
    shipmentStatus: string;
    products: string;
    items: OrderItem[];
  } | null;
}

const OrderDetailModal = ({ isOpen, onClose, order }: OrderDetailModalProps) => {
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
                <p className="text-sm text-muted-foreground">{order.createdAt}</p>
              </div>
              <Badge variant={getShipmentStatusVariant(order.shipmentStatus)}>
                {getShipmentStatusText(order.shipmentStatus)}
              </Badge>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-primary">
                {order.price.toLocaleString()}원
              </p>
            </div>
          </div>

          {/* 주문 상품 목록 */}
          <div className="border rounded-lg overflow-hidden">
            <div className="bg-muted p-3">
              <h4 className="font-semibold">주문 상품</h4>
            </div>
            <div className="divide-y">
              {order.items.map((item, index) => (
                <div key={index} className="p-4 flex gap-4 items-center">
                  {item.productImageUrl && (
                    <img 
                      src={item.productImageUrl} 
                      alt={item.productName}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                  )}
                  <div className="flex-1">
                    <h5 className="font-medium">{item.productName}</h5>
                    <p className="text-sm text-muted-foreground">
                      단가: {item.productPerPrice.toLocaleString()}원 × {item.quantity}개
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">
                      {item.productTotalPrice.toLocaleString()}원
                    </p>
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