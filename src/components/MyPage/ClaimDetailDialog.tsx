import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, ShoppingCart, Calendar, Package } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';

interface OrderInfo {
  orderId: number;
  orderName: string;
  createdAt: string;
  price: number;
  shipmentFee: number;
  shipmentStatus: string;
  paymentStatus: string;
  trackingNumber?: string;
  products: string;
  items: Array<{
    productName: string;
    productId: number;
    productPerPrice: number;
    productTotalPrice: number;
    quantity: number;
    productImageUrl: string;
  }>;
}

interface ClaimDetailDialogProps {
  isOpen: boolean;
  onClose: () => void;
  claim: any;
}

const ClaimDetailDialog = ({ isOpen, onClose, claim }: ClaimDetailDialogProps) => {
  const [orderInfo, setOrderInfo] = useState<OrderInfo | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && claim?.orderNumber) {
      fetchOrderInfo();
    }
  }, [isOpen, claim]);

  const fetchOrderInfo = async () => {
    try {
      setLoading(true);
      // API: GET /api/users/orders/{orderName} - Get order details by order name
      const response = await apiFetch(`/api/users/orders/${claim.orderNumber}`);
      
      if (response.ok) {
        const result = await response.json();
        setOrderInfo(result.data);
      }
    } catch (error) {
      console.error('Error fetching order info:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING': return '답변대기';
      case 'ANSWERED': return '답변완료';
      case 'CLOSED': return '처리완료';
      default: return status;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'PENDING': return 'destructive' as const;
      case 'ANSWERED': return 'default' as const;
      case 'CLOSED': return 'secondary' as const;
      default: return 'outline' as const;
    }
  };

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

  const getPaymentStatusText = (status: string) => {
    const statusMap: { [key: string]: string } = {
      'PENDING': '결제 대기',
      'PAID': '결제 완료',
      'UNPAID': '결제 실패',
      'REFUNDED': '환불 완료'
    };
    return statusMap[status] || status;
  };

  if (!claim) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            클레임 상세내용
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* 클레임 정보 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">클레임 정보</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant="outline">클레임</Badge>
                <Badge variant={getStatusVariant(claim.status)}>
                  {getStatusText(claim.status)}
                </Badge>
                {claim.orderNumber && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <ShoppingCart className="h-3 w-3" />
                    {claim.orderNumber}
                  </Badge>
                )}
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2">{claim.title}</h3>
                {claim.createdAt && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    {new Date(claim.createdAt).toLocaleDateString('ko-KR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                )}
              </div>

              <div>
                <h4 className="font-semibold mb-2">내용</h4>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="whitespace-pre-wrap">{claim.content}</p>
                </div>
              </div>

              {claim.answer && (
                <div>
                  <h4 className="font-semibold mb-2 text-primary">답변내용</h4>
                  <div className="bg-primary/5 border border-primary/20 p-4 rounded-lg">
                    <p className="whitespace-pre-wrap">{claim.answer}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 주문 정보 */}
          {claim.orderNumber && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  주문 정보
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-3">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ) : orderInfo ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-semibold">주문번호:</span>
                        <span className="ml-2 text-muted-foreground">{orderInfo.orderName}</span>
                      </div>
                      <div>
                        <span className="font-semibold">주문일:</span>
                        <span className="ml-2 text-muted-foreground">
                          {new Date(orderInfo.createdAt).toLocaleDateString('ko-KR')}
                        </span>
                      </div>
                      <div>
                        <span className="font-semibold">결제상태:</span>
                        <Badge variant={orderInfo.paymentStatus === 'PAID' ? 'default' : 'outline'} className="ml-2">
                          {getPaymentStatusText(orderInfo.paymentStatus)}
                        </Badge>
                      </div>
                      <div>
                        <span className="font-semibold">배송상태:</span>
                        <Badge variant="secondary" className="ml-2">
                          {getShipmentStatusText(orderInfo.shipmentStatus)}
                        </Badge>
                      </div>
                      {orderInfo.trackingNumber && (
                        <div>
                          <span className="font-semibold">송장번호:</span>
                          <span className="ml-2 text-muted-foreground">{orderInfo.trackingNumber}</span>
                        </div>
                      )}
                      <div>
                        <span className="font-semibold">총 금액:</span>
                        <span className="ml-2 font-bold text-lg">
                          {(orderInfo.price + orderInfo.shipmentFee).toLocaleString()}원
                        </span>
                      </div>
                    </div>

                    {/* 주문 상품 목록 */}
                    <div>
                      <h4 className="font-semibold mb-3">주문 상품</h4>
                      <div className="space-y-3">
                        {orderInfo.items.map((item, index) => (
                          <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                            <img 
                              src={item.productImageUrl} 
                              alt={item.productName}
                              className="w-16 h-16 object-cover rounded"
                            />
                            <div className="flex-1">
                              <h5 className="font-medium">{item.productName}</h5>
                              <p className="text-sm text-muted-foreground">
                                수량: {item.quantity}개 × {item.productPerPrice.toLocaleString()}원
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold">{item.productTotalPrice.toLocaleString()}원</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">주문 정보를 불러올 수 없습니다.</p>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ClaimDetailDialog;