import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Search, Package, Truck, CheckCircle, RefreshCw } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

// --- 타입 정의 ---
interface Order {
  id: number;
  orderNumber: string;
  ordererName: string;
  recipientName: string;
  recipientPhone: string;
  shippingAddress: string;
  orderDate: string;
  daysSinceOrder: number | null;
  productName: string;
  totalAmount: number;
  shippingStatus: 'preparing' | 'shipped' | 'delivered';
  isShipmentProcessed: boolean;
  trackingNumber?: string | null;
}

interface ProcessedOrder extends Omit<Order, 'daysSinceOrder'> {
  daysSinceOrder: number;
}


// --- 재사용 가능한 테이블 컴포넌트 (Whitespace 경고 최종 수정) ---
interface OrderTableProps {
  orders: ProcessedOrder[];
  onOpenModal: (order: ProcessedOrder) => void;
  showStatusColumns?: boolean;
}

const OrderTable = ({ orders, onOpenModal, showStatusColumns = true }: OrderTableProps) => {
  const formatDate = (dateString: string) => dateString ? dateString.split('T')[0] : '';
  const getShippingStatusText = (status: string) => ({ preparing: '준비중', shipped: '배송중', delivered: '완료' }[status] || status);
  const getShippingStatusStyle = (status: string) => ({ preparing: 'bg-yellow-50 text-yellow-700 border-yellow-200', shipped: 'bg-blue-50 text-blue-700 border-blue-200', delivered: 'bg-green-50 text-green-700 border-green-200' }[status] || 'bg-gray-50 text-gray-700 border-gray-200');

  if (orders.length === 0) {
    return (
        <div className="text-center py-10 text-gray-500">
          <Package size={48} className="mx-auto mb-2" />
          <p>해당하는 주문이 없습니다.</p>
        </div>
    );
  }

  return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[150px]">주문번호</TableHead>
            <TableHead className="w-[120px]">주문일자</TableHead>
            <TableHead>주문자</TableHead>
            <TableHead>수령인</TableHead>
            <TableHead className="w-[130px]">수령인 번호</TableHead>
            <TableHead>배송지</TableHead>
            <TableHead>상품명</TableHead>
            <TableHead>결제 금액</TableHead>
            {showStatusColumns && <><TableHead>배송 상태</TableHead><TableHead>발송 처리</TableHead></>}
            <TableHead className="text-right">관리</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">{order.orderNumber}</TableCell>
                <TableCell>{formatDate(order.orderDate)}</TableCell>
                <TableCell>{order.ordererName}</TableCell>
                <TableCell>{order.recipientName}</TableCell>
                <TableCell>{order.recipientPhone}</TableCell>
                <TableCell className="max-w-xs truncate" title={order.shippingAddress}>{order.shippingAddress}</TableCell>
                <TableCell className="max-w-xs truncate" title={order.productName}>{order.productName}</TableCell>
                <TableCell>₩{order.totalAmount.toLocaleString()}</TableCell>
                {showStatusColumns && (
                    <>
                      <TableCell><Badge variant="outline" className={`text-xs ${getShippingStatusStyle(order.shippingStatus)}`}>{getShippingStatusText(order.shippingStatus)}</Badge></TableCell>
                      <TableCell>{order.isShipmentProcessed ? (<Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200"><CheckCircle className="w-3 h-3 mr-1" />완료</Badge>) : (<Badge variant="outline" className="text-xs bg-red-50 text-red-700 border-red-200">미처리</Badge>)}</TableCell>
                    </>
                )}
                <TableCell className="text-right">{!order.isShipmentProcessed && (<Button variant="outline" size="sm" onClick={() => onOpenModal(order)}>송장번호 입력</Button>)}</TableCell>
              </TableRow>
          ))}
        </TableBody>
      </Table>
  );
};


// --- 메인 컴포넌트 ---
const OrderManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [orders, setOrders] = useState<ProcessedOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [trackingModalOpen, setTrackingModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<ProcessedOrder | null>(null);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const fetchOrders = async () => {
    if (!loading) setIsRefreshing(true);
    try {
      const response = await apiFetch('/api/admin/orders');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          const processedData = data.data.map((order: Order) => {
            const orderDate = new Date(order.orderDate);
            const today = new Date();
            const diffTime = Math.abs(today.getTime() - orderDate.getTime());
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
            return { ...order, daysSinceOrder: diffDays };
          });
          setOrders(processedData);
        }
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({ title: "오류", description: "주문 목록을 불러오는데 실패했습니다.", variant: "destructive" });
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const filteredOrders = orders.filter(order =>
      (order.ordererName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.recipientName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.productName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.orderNumber || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const unprocessedOrders = filteredOrders.filter(order => !order.isShipmentProcessed);

  const handleTrackingSubmit = async () => { /* ... */ };
  const openTrackingModal = (order: ProcessedOrder) => { /* ... */ };

  if (loading) {
    return <div className="p-6 text-center">로딩 중...</div>;
  }

  return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">주문 관리</h1>
          <div className="flex gap-2">
            <Badge variant="secondary">전체 주문: {orders.length}건</Badge>
            <Badge variant="destructive">미처리: {unprocessedOrders.length}건</Badge>
          </div>
        </div>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-4">
              <CardTitle>주문 목록</CardTitle>
              <div className="flex items-center gap-2">
                <div className="relative max-w-sm">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="통합 검색..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-8" />
                </div>
                <Button variant="outline" size="icon" onClick={fetchOrders} disabled={isRefreshing}>
                  <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all">
              <TabsList>
                <TabsTrigger value="all" className="flex items-center gap-2"><Package className="w-4 h-4" /> 전체 주문</TabsTrigger>
                <TabsTrigger value="unprocessed" className="flex items-center gap-2"><Truck className="w-4 h-4" /> 미처리 주문</TabsTrigger>
              </TabsList>
              <TabsContent value="all" className="mt-6">
                <OrderTable orders={filteredOrders} onOpenModal={openTrackingModal} showStatusColumns={true} />
              </TabsContent>
              <TabsContent value="unprocessed" className="mt-6">
                <OrderTable orders={unprocessedOrders} onOpenModal={openTrackingModal} showStatusColumns={false} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        <Dialog open={trackingModalOpen} onOpenChange={setTrackingModalOpen}>{/* ... */}</Dialog>
      </div>
  );
};

export default OrderManagement;