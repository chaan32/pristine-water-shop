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
import { Search, Package, Truck, CheckCircle, Calendar } from 'lucide-react'; // Calendar 아이콘 추가
import { apiFetch } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface Order {
  id: number;
  orderNumber: string;
  ordererName: string;
  recipientName: string;
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

const OrderManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [orders, setOrders] = useState<ProcessedOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [trackingModalOpen, setTrackingModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<ProcessedOrder | null>(null);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const fetchOrders = async () => {
    setLoading(true);
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

            return {
              ...order,
              daysSinceOrder: diffDays,
            };
          });
          setOrders(processedData);
        }
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: "오류",
        description: "주문 목록을 불러오는데 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const formatDate = (dateString: string) => {
    return dateString.split('T')[0]; // 'YYYY-MM-DD' 형식으로 변환
  };

  const filteredOrders = orders.filter(order =>
      (order.ordererName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.recipientName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.productName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.orderNumber || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const unprocessedOrders = filteredOrders.filter(order => !order.isShipmentProcessed);

  const getShippingStatusText = (status: string) => {
    const statusMap: { [key: string]: string } = {
      preparing: '준비중',
      shipped: '배송중',
      delivered: '완료'
    };
    return statusMap[status] || status;
  };

  const getShippingStatusStyle = (status: string) => {
    const styleMap: { [key: string]: string } = {
      preparing: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      shipped: 'bg-blue-50 text-blue-700 border-blue-200',
      delivered: 'bg-green-50 text-green-700 border-green-200'
    };
    return styleMap[status] || 'bg-gray-50 text-gray-700 border-gray-200';
  };

  const handleTrackingSubmit = async () => {
    if (!selectedOrder || !trackingNumber.trim()) {
      toast({ title: "입력 오류", description: "송장번호를 입력해주세요.", variant: "destructive" });
      return;
    }
    if (trackingNumber.length < 10) {
      toast({ title: "입력 오류", description: "송장번호는 최소 10자 이상이어야 합니다.", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      const response = await apiFetch(`/api/admin/orders/${selectedOrder.id}/tracking`, {
        method: 'POST',
        body: JSON.stringify({ trackingNumber: trackingNumber.trim() })
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          toast({ title: "성공", description: "송장번호가 등록되었습니다." });
          setTrackingModalOpen(false);
          setTrackingNumber('');
          setSelectedOrder(null);
          fetchOrders();
        }
      } else {
        throw new Error('Failed to update tracking number');
      }
    } catch (error) {
      console.error('Error updating tracking number:', error);
      toast({ title: "오류", description: "송장번호 등록에 실패했습니다.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const openTrackingModal = (order: ProcessedOrder) => {
    setSelectedOrder(order);
    setTrackingNumber(order.trackingNumber || '');
    setTrackingModalOpen(true);
  };

  if (loading) {
    return <div className="p-6">로딩 중...</div>;
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
            <div className="flex items-center justify-between">
              <CardTitle>주문 목록</CardTitle>
              <div className="relative max-w-sm">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                    placeholder="주문번호, 주문자, 수령인, 상품명 검색..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all">
              <TabsList>
                <TabsTrigger value="all" className="flex items-center gap-2">
                  <Package className="w-4 h-4" /> 전체 주문
                </TabsTrigger>
                <TabsTrigger value="unprocessed" className="flex items-center gap-2">
                  <Truck className="w-4 h-4" /> 미처리 주문
                </TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="mt-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>주문번호</TableHead>
                      <TableHead>주문일</TableHead> {/* 👈 주문일 컬럼 추가 */}
                      <TableHead>주문자</TableHead>
                      <TableHead>수령인</TableHead>
                      <TableHead>주문 일수</TableHead>
                      <TableHead>상품명</TableHead>
                      <TableHead>결제 금액</TableHead>
                      <TableHead>배송 상태</TableHead>
                      <TableHead>발송 처리</TableHead>
                      <TableHead className="text-right">관리</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium">{order.orderNumber}</TableCell>
                          <TableCell>{formatDate(order.orderDate)}</TableCell> {/* 👈 주문일 데이터 추가 */}
                          <TableCell>{order.ordererName}</TableCell>
                          <TableCell>{order.recipientName}</TableCell>
                          <TableCell>{order.daysSinceOrder}일</TableCell>
                          <TableCell className="max-w-xs truncate" title={order.productName}>{order.productName}</TableCell>
                          <TableCell>₩{order.totalAmount.toLocaleString()}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={`text-xs ${getShippingStatusStyle(order.shippingStatus)}`}>{getShippingStatusText(order.shippingStatus)}</Badge>
                          </TableCell>
                          <TableCell>
                            {order.isShipmentProcessed ? (
                                <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200"><CheckCircle className="w-3 h-3 mr-1" />완료</Badge>
                            ) : (
                                <Badge variant="outline" className="text-xs bg-red-50 text-red-700 border-red-200">미처리</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            {!order.isShipmentProcessed && (
                                <Button variant="outline" size="sm" onClick={() => openTrackingModal(order)}>송장번호 입력</Button>
                            )}
                          </TableCell>
                        </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TabsContent>

              <TabsContent value="unprocessed" className="mt-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>주문번호</TableHead>
                      <TableHead>주문일</TableHead> {/* 👈 주문일 컬럼 추가 */}
                      <TableHead>주문자</TableHead>
                      <TableHead>수령인</TableHead>
                      <TableHead>주문 일수</TableHead>
                      <TableHead>상품명</TableHead>
                      <TableHead>결제 금액</TableHead>
                      <TableHead className="text-right">관리</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {unprocessedOrders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium">{order.orderNumber}</TableCell>
                          <TableCell>{formatDate(order.orderDate)}</TableCell> {/* 👈 주문일 데이터 추가 */}
                          <TableCell>{order.ordererName}</TableCell>
                          <TableCell>{order.recipientName}</TableCell>
                          <TableCell>{order.daysSinceOrder}일</TableCell>
                          <TableCell className="max-w-xs truncate" title={order.productName}>{order.productName}</TableCell>
                          <TableCell>₩{order.totalAmount.toLocaleString()}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="outline" size="sm" onClick={() => openTrackingModal(order)}>송장번호 입력</Button>
                          </TableCell>
                        </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Dialog open={trackingModalOpen} onOpenChange={setTrackingModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>송장번호 입력</DialogTitle>
              <DialogDescription>
                {selectedOrder && <>주문번호: {selectedOrder.orderNumber} | 상품: {selectedOrder.productName}</>}
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Input
                  placeholder="송장번호를 입력하세요 (최소 10자)"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  className="w-full"
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setTrackingModalOpen(false)} disabled={submitting}>취소</Button>
              <Button onClick={handleTrackingSubmit} disabled={submitting || !trackingNumber.trim() || trackingNumber.length < 10}>
                {submitting ? '처리 중...' : '등록'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
  );
};

export default OrderManagement;