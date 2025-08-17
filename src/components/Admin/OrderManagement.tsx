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
import { Search, Package, Truck, CheckCircle, RefreshCw, ExternalLink, ChevronDown, ChevronRight } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

// --- 타입 정의 ---
interface OrderItem {
  orderItemId: number;
  productId: number;
  quantity: number;
  perPrice: number;
  productName: string;
  productImageUrl: string;
}

interface Order {
  id: number;
  orderNumber: string;
  ordererName: string;
  recipientName: string;
  recipientPhone: string;
  shippingAddress: string;
  postalCode?: string;
  orderDate: string;
  daysSinceOrder: number | null;
  productName: string;
  totalAmount: number;
  shippingStatus: 'preparing' | 'shipped' | 'delivered';
  isShipmentProcessed: boolean;
  trackingNumber?: string | null;
  ordererType: 'individual' | 'headquarters' | 'branch';
  branchName?: string | null;
  items: OrderItem[];
}

interface ProcessedOrder extends Omit<Order, 'daysSinceOrder'> {
  daysSinceOrder: number;
}


// --- 재사용 가능한 테이블 컴포넌트 (Whitespace 경고 최종 수정) ---
interface OrderTableProps {
  orders: ProcessedOrder[];
  onOpenModal: (order: ProcessedOrder) => void;
  showStatusColumns?: boolean;
  showTrackingInput?: boolean;
}

const OrderTable = ({ orders, onOpenModal, showStatusColumns = true, showTrackingInput = false }: OrderTableProps) => {
  const [selectedOrderForDetail, setSelectedOrderForDetail] = useState<ProcessedOrder | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  
  const formatDate = (dateString: string) => dateString ? dateString.split('T')[0] : '';
  const getShippingStatusText = (status: string) => ({ preparing: '준비중', shipped: '배송중', delivered: '완료' }[status] || status);
  const getShippingStatusStyle = (status: string) => ({ preparing: 'bg-yellow-50 text-yellow-700 border-yellow-200', shipped: 'bg-blue-50 text-blue-700 border-blue-200', delivered: 'bg-green-50 text-green-700 border-green-200' }[status] || 'bg-gray-50 text-gray-700 border-gray-200');
  
  const getOrdererTypeText = (type: string) => ({ individual: '개인', headquarters: '본사', branch: '지점' }[type] || type);
  const getOrdererTypeStyle = (type: string) => ({ individual: 'bg-blue-50 text-blue-700 border-blue-200', headquarters: 'bg-purple-50 text-purple-700 border-purple-200', branch: 'bg-orange-50 text-orange-700 border-orange-200' }[type] || 'bg-gray-50 text-gray-700 border-gray-200');

  const openDetailModal = (order: ProcessedOrder) => {
    setSelectedOrderForDetail(order);
    setDetailModalOpen(true);
  };

  if (orders.length === 0) {
    return (
        <div className="text-center py-10 text-gray-500">
          <Package size={48} className="mx-auto mb-2" />
          <p>해당하는 주문이 없습니다.</p>
        </div>
    );
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[150px]">주문번호</TableHead>
            <TableHead className="w-[120px]">주문일자</TableHead>
            <TableHead>주문자</TableHead>
            <TableHead>상품명</TableHead>
            <TableHead>배송상태</TableHead>
            <TableHead>발송처리</TableHead>
            <TableHead className="text-right">관리</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id} className="hover:bg-muted/50">
              <TableCell className="font-medium">{order.orderNumber}</TableCell>
              <TableCell>{formatDate(order.orderDate)}</TableCell>
              <TableCell>
                <div>
                  <div className="flex items-center gap-2">
                    <span>{order.ordererName}</span>
                    <Badge variant="outline" className={`text-xs ${getOrdererTypeStyle(order.ordererType)}`}>
                      {getOrdererTypeText(order.ordererType)}
                    </Badge>
                  </div>
                  {order.ordererType === 'branch' && order.branchName && (
                    <div className="text-xs text-gray-500 mt-1">
                      {order.branchName}
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell className="max-w-xs truncate" title={order.productName}>{order.productName}</TableCell>
              <TableCell>
                <Badge variant="outline" className={`text-xs ${getShippingStatusStyle(order.shippingStatus)}`}>
                  {getShippingStatusText(order.shippingStatus)}
                </Badge>
              </TableCell>
              <TableCell>
                {order.isShipmentProcessed ? (
                  <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                    <CheckCircle className="w-3 h-3 mr-1" />완료
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-xs bg-red-50 text-red-700 border-red-200">
                    미처리
                  </Badge>
                )}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" size="sm" onClick={() => openDetailModal(order)}>
                    상세보기
                  </Button>
                  {showTrackingInput && !order.isShipmentProcessed && (
                    <Button variant="outline" size="sm" onClick={() => onOpenModal(order)}>
                      송장입력
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* 상세보기 모달 */}
      <Dialog open={detailModalOpen} onOpenChange={setDetailModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>주문 상세 정보</DialogTitle>
          </DialogHeader>
          {selectedOrderForDetail && (
            <div className="space-y-6">
              {/* 주문 기본 정보 */}
              <div className="grid grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">주문 정보</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">주문번호:</span>
                      <span>{selectedOrderForDetail.orderNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">주문일자:</span>
                      <span>{formatDate(selectedOrderForDetail.orderDate)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">주문자:</span>
                      <div className="text-right">
                        <div className="flex items-center gap-2">
                          <span>{selectedOrderForDetail.ordererName}</span>
                          <Badge variant="outline" className={`text-xs ${getOrdererTypeStyle(selectedOrderForDetail.ordererType)}`}>
                            {getOrdererTypeText(selectedOrderForDetail.ordererType)}
                          </Badge>
                        </div>
                        {selectedOrderForDetail.ordererType === 'branch' && selectedOrderForDetail.branchName && (
                          <div className="text-xs text-gray-500 mt-1">
                            {selectedOrderForDetail.branchName}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">총 결제금액:</span>
                      <span className="font-bold">₩{selectedOrderForDetail.totalAmount.toLocaleString()}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">배송 정보</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">수령인:</span>
                      <span>{selectedOrderForDetail.recipientName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">연락처:</span>
                      <span>{selectedOrderForDetail.recipientPhone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">배송지:</span>
                      <div className="text-right max-w-xs">
                        <div>{selectedOrderForDetail.shippingAddress}</div>
                        {selectedOrderForDetail.postalCode && (
                          <div className="text-xs text-gray-500">({selectedOrderForDetail.postalCode})</div>
                        )}
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">배송상태:</span>
                      <Badge variant="outline" className={`text-xs ${getShippingStatusStyle(selectedOrderForDetail.shippingStatus)}`}>
                        {getShippingStatusText(selectedOrderForDetail.shippingStatus)}
                      </Badge>
                    </div>
                    {selectedOrderForDetail.trackingNumber && (
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-600">송장번호:</span>
                        <div className="flex items-center gap-2">
                          <span>{selectedOrderForDetail.trackingNumber}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(`https://service.epost.go.kr/trace.RetrieveDomRigiTraceList.comm?sid1=${selectedOrderForDetail.trackingNumber}`, '_blank')}
                            className="flex items-center gap-1"
                          >
                            <ExternalLink className="w-3 h-3" />
                            조회
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* 주문 상품 목록 */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">주문 상품 목록</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {selectedOrderForDetail.items.map((item) => (
                      <div key={item.orderItemId} className="flex items-center gap-4 p-4 border rounded-lg">
                        <img 
                          src={item.productImageUrl} 
                          alt={item.productName}
                          className="w-16 h-16 object-cover rounded-md"
                          onError={(e) => {
                            e.currentTarget.src = '/placeholder.svg';
                          }}
                        />
                        <div className="flex-1">
                          <div className="font-medium">{item.productName}</div>
                          <div className="text-sm text-gray-600">
                            개당 ₩{item.perPrice.toLocaleString()} × {item.quantity}개
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">
                            ₩{(item.perPrice * item.quantity).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
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
        console.log(data);
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

  const handleTrackingSubmit = async () => {
    if (!selectedOrder || !trackingNumber.trim()) {
      toast({ title: "오류", description: "송장번호를 입력해주세요.", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    try {
      const response = await apiFetch(`/api/admin/orders/${selectedOrder.id}/tracking`, {
        method: 'POST',
        body: JSON.stringify({ trackingNumber: trackingNumber.trim() }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          toast({ title: "성공", description: "송장번호가 등록되었습니다." });
          setTrackingModalOpen(false);
          setTrackingNumber('');
          setSelectedOrder(null);
          fetchOrders(); // 목록 새로고침
        } else {
          throw new Error(data.message || '송장번호 등록에 실패했습니다.');
        }
      } else {
        throw new Error('서버 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('Error submitting tracking:', error);
      toast({ 
        title: "오류", 
        description: error instanceof Error ? error.message : "송장번호 등록에 실패했습니다.", 
        variant: "destructive" 
      });
    } finally {
      setSubmitting(false);
    }
  };

  const openTrackingModal = (order: ProcessedOrder) => {
    setSelectedOrder(order);
    setTrackingNumber(order.trackingNumber || '');
    setTrackingModalOpen(true);
  };

  const getTrackingUrl = (trackingNumber: string) => {
    // 일반적인 택배사 추적 URL (실제로는 택배사에 따라 다름)
    return `https://service.epost.go.kr/trace.RetrieveDomRigiTraceList.comm?sid1=${trackingNumber}`;
  };

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
                <OrderTable orders={unprocessedOrders} onOpenModal={openTrackingModal} showStatusColumns={false} showTrackingInput={true} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        <Dialog open={trackingModalOpen} onOpenChange={setTrackingModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>송장번호 관리</DialogTitle>
              <DialogDescription>
                주문 정보를 확인하고 송장번호를 입력하거나 배송 상태를 확인하세요.
              </DialogDescription>
            </DialogHeader>
            {selectedOrder && (
              <div className="space-y-6">
                {/* 주문 정보 */}
                <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                  <h3 className="font-semibold text-lg">주문 정보</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-600">주문번호:</span>
                      <span className="ml-2">{selectedOrder.orderNumber}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">주문일자:</span>
                      <span className="ml-2">{selectedOrder.orderDate.split('T')[0]}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">상품명:</span>
                      <span className="ml-2">{selectedOrder.productName}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">결제금액:</span>
                      <span className="ml-2">₩{selectedOrder.totalAmount.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* 배송 정보 */}
                <div className="bg-blue-50 p-4 rounded-lg space-y-3">
                  <h3 className="font-semibold text-lg">배송 정보</h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium text-gray-600">수령인:</span>
                      <span className="ml-2">{selectedOrder.recipientName}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">연락처:</span>
                      <span className="ml-2">{selectedOrder.recipientPhone}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">배송지:</span>
                      <span className="ml-2">{selectedOrder.shippingAddress}</span>
                    </div>
                  </div>
                </div>

                {/* 송장번호 입력 */}
                <div className="space-y-3">
                  <label htmlFor="tracking-input" className="text-sm font-medium">
                    송장번호
                  </label>
                  <Input
                    id="tracking-input"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder="송장번호를 입력하세요"
                    disabled={submitting}
                  />
                  
                  {/* 기존 송장번호가 있는 경우 배송 조회 링크 표시 */}
                  {selectedOrder.trackingNumber && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-gray-600">현재 송장번호:</span>
                      <span className="font-medium">{selectedOrder.trackingNumber}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(getTrackingUrl(selectedOrder.trackingNumber!), '_blank')}
                        className="flex items-center gap-1"
                      >
                        <ExternalLink className="w-3 h-3" />
                        배송 조회
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setTrackingModalOpen(false)}>
                취소
              </Button>
              <Button onClick={handleTrackingSubmit} disabled={submitting}>
                {submitting ? '처리 중...' : '저장'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
  );
};

export default OrderManagement;