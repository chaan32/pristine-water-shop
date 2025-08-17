import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { apiFetch } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface OrderHistory {
  id: number;
  productName: string;
  paymentStatus: string;
  paymentMethod: string;
  productPrice: number;
  shipmentFee: number;
  shipmentStatus: 'PREPARING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
}

interface OrderHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  memberId: number | null;
  memberName: string;
  memberType: 'individual' | 'corporate';
}

const OrderHistoryModal = ({ isOpen, onClose, memberId, memberName, memberType }: OrderHistoryModalProps) => {
  const [orderHistory, setOrderHistory] = useState<OrderHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchOrderHistory = async () => {
    if (!memberId) return;

    setLoading(true);
    try {
      const response = await apiFetch(`/api/admin/members/${memberId}/orders`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setOrderHistory(data.data);
        }
      } else {
        throw new Error('Failed to fetch order history');
      }
    } catch (error) {
      console.error('Error fetching order history:', error);
      toast({
        title: "오류",
        description: "주문 내역을 불러오는데 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && memberId) {
      fetchOrderHistory();
    }
  }, [isOpen, memberId]);

  const getOrderStatusText = (status: string) => {
    const statusMap: { [key: string]: string } = {
      PREPARING: '준비중',
      SHIPPED: '배송중',
      DELIVERED: '배송완료',
      CANCELLED: '취소됨'
    };
    return statusMap[status] || status;
  };

  const getOrderStatusStyle = (status: string) => {
    const styleMap: { [key: string]: string } = {
      PREPARING: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      SHIPPED: 'bg-blue-50 text-blue-700 border-blue-200',
      DELIVERED: 'bg-green-50 text-green-700 border-green-200',
      CANCELLED: 'bg-red-50 text-red-700 border-red-200'
    };
    return styleMap[status] || 'bg-gray-50 text-gray-700 border-gray-200';
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{memberName}님의 주문 내역</DialogTitle>
          <DialogDescription>
            {memberType === 'individual' ? '개인 회원' : '법인 회원'}의 주문 내역을 확인할 수 있습니다.
          </DialogDescription>
        </DialogHeader>
        
        <div className="mt-4">
          {loading ? (
            <div className="text-center py-8">로딩 중...</div>
          ) : orderHistory.length > 0 ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>상품명</TableHead>
                    <TableHead>배송상태</TableHead>
                    <TableHead>결제상태</TableHead>
                    <TableHead className="text-right">결제금액</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orderHistory.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium max-w-xs truncate" title={order.productName}>
                        {order.productName}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`text-xs ${getOrderStatusStyle(order.shipmentStatus)}`}>
                          {getOrderStatusText(order.shipmentStatus)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {order.paymentStatus}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        ₩{(order.productPrice + order.shipmentFee).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              주문 내역이 없습니다.
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OrderHistoryModal;