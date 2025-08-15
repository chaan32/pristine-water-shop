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
  orderDate: string;
  orderStatus: 'preparing' | 'shipped' | 'delivered' | 'cancelled';
  paymentAmount: number;
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
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { toast } = useToast();

  const fetchOrderHistory = async (page: number = 1) => {
    if (!memberId) return;

    setLoading(true);
    try {
      const response = await apiFetch(`/api/admin/members/${memberId}/orders?page=${page}&memberType=${memberType}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setOrderHistory(data.data.orders);
          setTotalPages(data.data.totalPages);
          setCurrentPage(page);
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
      fetchOrderHistory(1);
    }
  }, [isOpen, memberId]);

  const getOrderStatusText = (status: string) => {
    const statusMap: { [key: string]: string } = {
      preparing: '준비중',
      shipped: '배송중',
      delivered: '배송완료',
      cancelled: '취소됨'
    };
    return statusMap[status] || status;
  };

  const getOrderStatusStyle = (status: string) => {
    const styleMap: { [key: string]: string } = {
      preparing: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      shipped: 'bg-blue-50 text-blue-700 border-blue-200',
      delivered: 'bg-green-50 text-green-700 border-green-200',
      cancelled: 'bg-red-50 text-red-700 border-red-200'
    };
    return styleMap[status] || 'bg-gray-50 text-gray-700 border-gray-200';
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      fetchOrderHistory(page);
    }
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
                    <TableHead>주문일시</TableHead>
                    <TableHead>주문상태</TableHead>
                    <TableHead className="text-right">결제금액</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orderHistory.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium max-w-xs truncate" title={order.productName}>
                        {order.productName}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(order.orderDate).toLocaleDateString('ko-KR', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`text-xs ${getOrderStatusStyle(order.orderStatus)}`}>
                          {getOrderStatusText(order.orderStatus)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        ₩{order.paymentAmount.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {totalPages > 1 && (
                <div className="mt-4 flex justify-center">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious 
                          onClick={() => handlePageChange(currentPage - 1)}
                          className={currentPage <= 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                        />
                      </PaginationItem>
                      
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                        return (
                          <PaginationItem key={pageNum}>
                            <PaginationLink
                              onClick={() => handlePageChange(pageNum)}
                              isActive={currentPage === pageNum}
                              className="cursor-pointer"
                            >
                              {pageNum}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      })}
                      
                      <PaginationItem>
                        <PaginationNext 
                          onClick={() => handlePageChange(currentPage + 1)}
                          className={currentPage >= totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
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