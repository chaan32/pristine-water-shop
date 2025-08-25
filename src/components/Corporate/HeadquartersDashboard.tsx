import { useEffect, useState, useMemo, Fragment } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Building2, Package, BarChart3, Crown, ChevronDown, ChevronRight, CreditCard } from 'lucide-react';
import PaymentModal from './PaymentModal';
import { toast } from 'sonner';
import { apiFetch, getAccessToken } from '@/lib/api';

// --- 1. INTERFACES UPDATED ---
// Individual product item within an order
interface BranchOrder {
  id: number;
  orderId: number;
  productName: string;
  quantity: number;
  productTotalPrice: number;
  productPerPrice: number;
}

// An order from a branch, which contains multiple product items
interface BranchDataItem {
  orderId: number;
  orderNumber: string;
  branchName: string;
  createdAt: string;
  shipmentFee: number;
  paymentStatus: string;
  shipmentStatus: string;
  branchOrders: BranchOrder[];
}

// The top-level dashboard data structure
interface DashboardData {
  id: number;
  branchNumber: number;
  totalOrders: number;
  totalAmount: number;
  branchesData: BranchDataItem[];
}

// A flattened structure for easier processing
interface FlattenedDataItem {
  orderId: number;
  orderNumber: string;
  branchName: string;
  createdAt: string;
  paymentStatus: string;
  shipmentStatus: string;
  productName: string;
  quantity: number;
  price: number; // Represents total price for this specific product line
}


// Generates the last 12 months for the dropdown
const generateLast12Months = () => {
  const months = [];
  const date = new Date();
  for (let i = 0; i < 12; i++) {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    months.push({
      value: `${year}-${month}`,
      label: `${year}년 ${month}월`,
    });
    date.setMonth(date.getMonth() - 1);
  }
  return months;
};


const HeadquartersDashboard = () => {
  const monthOptions = useMemo(() => generateLast12Months(), []);

  const [selectedMonth, setSelectedMonth] = useState(monthOptions[0].value);
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());
  const [paymentModal, setPaymentModal] = useState<{
    isOpen: boolean;
    orderNumber: string;
    branchName: string;
    items: { productName: string; quantity: number; price: number; }[];
    totalAmount: number;
    shipmentFee: number;
  }>({
    isOpen: false,
    orderNumber: '',
    branchName: '',
    items: [],
    totalAmount: 0,
    shipmentFee: 0,
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // API: GET /api/users/orders/headquarters
        const response = await apiFetch('/api/users/orders/headquarters');

        if (!response.ok) throw new Error('데이터를 불러오는 데 실패했습니다.');

        const result = await response.json();
        setDashboardData(result.data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // --- 2. DATA FLATTENING ---
  // Transforms the nested API response into a simple, flat array of products
  const flattenedData: FlattenedDataItem[] = useMemo(() => {
    if (!dashboardData) return [];

    const flatList: FlattenedDataItem[] = [];
    dashboardData.branchesData.forEach(order => {
      order.branchOrders.forEach(product => {
        flatList.push({
          orderId: order.orderId,
          orderNumber: order.orderNumber,
          branchName: order.branchName,
          createdAt: order.createdAt,
          paymentStatus: order.paymentStatus,
          shipmentStatus: order.shipmentStatus,
          productName: product.productName,
          quantity: product.quantity,
          price: product.productTotalPrice, // Use the total price for this product line
        });
      });
    });
    return flatList;
  }, [dashboardData]);


  const filteredData = useMemo(() => {
    return flattenedData
        .filter(item => item.createdAt.startsWith(selectedMonth))
        .filter(item => selectedStatus === 'ALL' || item.paymentStatus === selectedStatus);
  }, [flattenedData, selectedMonth, selectedStatus]);

  // --- 3. GROUPING LOGIC ADJUSTED ---
  // Groups the flattened data by order number and includes shipping fee
  const groupedData = useMemo(() => {
    const groups: { [key: string]: { items: FlattenedDataItem[], totalAmount: number, totalQuantity: number, shipmentFee: number } } = {};

    filteredData.forEach(item => {
      if (!groups[item.orderNumber]) {
        // Find the original order data to get shipment fee
        const originalOrder = dashboardData?.branchesData.find(order => order.orderNumber === item.orderNumber);
        const shipmentFee = originalOrder?.shipmentFee || 0;
        
        groups[item.orderNumber] = { items: [], totalAmount: 0, totalQuantity: 0, shipmentFee };
      }
      groups[item.orderNumber].items.push(item);
      groups[item.orderNumber].totalAmount += item.price; // Sum the pre-calculated total price
      groups[item.orderNumber].totalQuantity += item.quantity;
    });

    // Add shipping fee to total amount for each group
    Object.values(groups).forEach(group => {
      group.totalAmount += group.shipmentFee;
    });

    return Object.values(groups);
  }, [filteredData, dashboardData]);

  const handleToggleOrder = (orderNumber: string) => {
    setExpandedOrders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(orderNumber)) {
        newSet.delete(orderNumber);
      } else {
        newSet.add(orderNumber);
      }
      return newSet;
    });
  };

  const getPaymentStatusText = (status: string) => ({'PENDING': '결제대기', 'APPROVED': '결제완료', 'FAILED': '결제실패'}[status] || status);
  const getShipmentStatusText = (status: string) => ({'PENDING': '배송대기', 'PREPARING': '상품준비중', 'SHIPPED': '배송중', 'DELIVERED': '배송완료', 'CANCELLED': '주문취소'}[status] || status);
  
  const getPaymentStatusVariant = (status: string) => {
    const variants = {
      'PENDING': 'pending' as const,
      'PAID': 'paid' as const,
      'FAILED': 'failed' as const
    };
    return variants[status as keyof typeof variants] || 'outline' as const;
  };

  const getShipmentStatusVariant = (status: string) => {
    const variants = {
      'PENDING': 'pending' as const,
      'PREPARING': 'preparing' as const,
      'SHIPPED': 'shipped' as const,
      'DELIVERED': 'delivered' as const,
      'CANCELLED': 'cancelled' as const
    };
    return variants[status as keyof typeof variants] || 'outline' as const;
  };

  const handlePaymentClick = (group: { items: FlattenedDataItem[], totalAmount: number, totalQuantity: number, shipmentFee: number }) => {
    const firstItem = group.items[0];
    setPaymentModal({
      isOpen: true,
      orderNumber: firstItem.orderNumber,
      branchName: firstItem.branchName,
      items: group.items.map(item => ({
        productName: item.productName,
        quantity: item.quantity,
        price: item.price,
      })),
      totalAmount: group.totalAmount,
      shipmentFee: group.shipmentFee,
    });
  };

  const handlePayment = async (orderNumber: string) => {
    try {
      // 결제 모달을 닫고 니스페이 결제창 호출
      setPaymentModal(prev => ({ ...prev, isOpen: false }));
      
      if (!window.AUTHNICE) {
        throw new Error('결제 모듈이 로드되지 않았습니다.');
      }

      // 현재 결제 모달의 정보 사용
      const currentModal = paymentModal;
      
      window.AUTHNICE.requestPay({
        clientId: "58e3b578555e45738d6b569e53d5ae54", // 샌드박스 테스트용 클라이언트 ID
        method: 'card',
        orderId: orderNumber,
        amount: currentModal.totalAmount,
        goodsName: currentModal.items.length > 1 
          ? `${currentModal.items[0].productName} 외 ${currentModal.items.length - 1}건` 
          : currentModal.items[0].productName,
        returnUrl: `${window.location.origin}/payment/result`,
        fnError: (result: any) => {
          console.error('결제 오류:', result);
          toast.error(result.msg || "결제 중 오류가 발생했습니다.");
        }
      });

    } catch (error: any) {
      toast.error(error.message || '결제 처리 중 오류가 발생했습니다.');
      throw error;
    }
  };

  if (loading) return <div className="text-center py-10">데이터를 불러오는 중...</div>;
  if (error) return <div className="text-center py-10 text-red-500">오류: {error}</div>;
  if (!dashboardData) return <div className="text-center py-10">데이터가 없습니다.</div>;

  return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Crown className="w-6 h-6 text-yellow-500" />
            <h1 className="text-2xl font-bold">본사 관리 대시보드</h1>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Summary Cards */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">총 주문 수</CardTitle><Package className="h-4 w-4 text-muted-foreground" /></CardHeader>
            <CardContent><div className="text-2xl font-bold">{dashboardData.totalOrders}</div><p className="text-xs text-muted-foreground">전체 주문</p></CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">활성 지점</CardTitle><Building2 className="h-4 w-4 text-muted-foreground" /></CardHeader>
            <CardContent><div className="text-2xl font-bold">{dashboardData.branchNumber}</div><p className="text-xs text-muted-foreground">운영 중인 지점</p></CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">총 주문액</CardTitle><BarChart3 className="h-4 w-4 text-muted-foreground" /></CardHeader>
            <CardContent><div className="text-2xl font-bold">{dashboardData.totalAmount.toLocaleString()}원</div><p className="text-xs text-muted-foreground">전체 주문 누적</p></CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>지점 구매 내역</CardTitle>
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-40"><SelectValue placeholder="월 선택" /></SelectTrigger>
              <SelectContent>{monthOptions.map(option => (<SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>))}</SelectContent>
            </Select>
          </CardHeader>
          <CardContent>
            <Tabs value={selectedStatus} onValueChange={setSelectedStatus} className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-4">
                <TabsTrigger value="ALL">전체</TabsTrigger>
                <TabsTrigger value="PENDING">결제대기</TabsTrigger>
                <TabsTrigger value="APPROVED">결제완료</TabsTrigger>
              </TabsList>
            </Tabs>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12"></TableHead>
                  <TableHead>주문번호</TableHead>
                  <TableHead>지점명</TableHead>
                  <TableHead>주문일</TableHead>
                  <TableHead>상품명</TableHead>
                  <TableHead>수량</TableHead>
                  <TableHead>금액</TableHead>
                  <TableHead>결제/배송</TableHead>
                  <TableHead>액션</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {groupedData.length > 0 ? (
                    groupedData.map(group => {
                      const firstItem = group.items[0];
                      const isExpanded = expandedOrders.has(firstItem.orderNumber);

                      return (
                          <Fragment key={firstItem.orderNumber}>
                            {/* Main Group Row */}
                            <TableRow className="bg-slate-50 hover:bg-slate-100 cursor-pointer border-l-4 border-slate-200" onClick={() => handleToggleOrder(firstItem.orderNumber)}>
                              <TableCell><div className="flex items-center justify-center">{isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}</div></TableCell>
                              <TableCell className="font-medium">{firstItem.orderNumber}</TableCell>
                              <TableCell>{firstItem.branchName}</TableCell>
                              <TableCell>{new Date(firstItem.createdAt).toLocaleDateString('ko-KR')}</TableCell>
                              <TableCell>{firstItem.productName} {group.items.length > 1 && `외 ${group.items.length - 1}건`}</TableCell>
                              <TableCell>{group.totalQuantity}개</TableCell>
                              <TableCell className="font-semibold">{group.totalAmount.toLocaleString()}원</TableCell>
                              <TableCell>
                                <div className="flex flex-col gap-1">
                                  <Badge variant={getPaymentStatusVariant(firstItem.paymentStatus)}>{getPaymentStatusText(firstItem.paymentStatus)}</Badge>
                                  <Badge variant={getShipmentStatusVariant(firstItem.shipmentStatus)}>{getShipmentStatusText(firstItem.shipmentStatus)}</Badge>
                                </div>
                              </TableCell>
                              <TableCell>
                                {firstItem.paymentStatus === 'PENDING' && (
                                  <Button 
                                    size="sm" 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handlePaymentClick(group);
                                    }}
                                    className="flex items-center gap-1"
                                  >
                                    <CreditCard className="w-3 h-3" />
                                    결제하기
                                  </Button>
                                )}
                              </TableCell>
                            </TableRow>

                            {/* --- 4. RENDERING LOGIC UPDATED --- */}
                            {/* Expanded Rows for Individual Products */}
                            {isExpanded && group.items.map((item, index) => (
                                <TableRow key={`${item.orderNumber}-${index}`} className="bg-white">
                                  <TableCell></TableCell>
                                  <TableCell></TableCell>
                                  <TableCell></TableCell>
                                  <TableCell></TableCell>
                                  <TableCell className="pl-8 text-sm text-gray-600">{item.productName}</TableCell>
                                  <TableCell className="text-sm text-gray-600">{item.quantity}개</TableCell>
                                  <TableCell className="text-sm text-gray-600">{item.price.toLocaleString()}원</TableCell>
                                  <TableCell></TableCell>
                                  <TableCell></TableCell>
                                </TableRow>
                            ))}
                          </Fragment>
                      );
                    })
                ) : (
                    <TableRow>
                      <TableCell colSpan={9} className="h-24 text-center">해당 조건의 데이터가 없습니다.</TableCell>
                    </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* 결제 모달 */}
        <PaymentModal
          isOpen={paymentModal.isOpen}
          onClose={() => setPaymentModal(prev => ({ ...prev, isOpen: false }))}
          orderNumber={paymentModal.orderNumber}
          branchName={paymentModal.branchName}
          items={paymentModal.items}
          totalAmount={paymentModal.totalAmount}
          shipmentFee={paymentModal.shipmentFee}
          onPayment={handlePayment}
        />
      </div>
  );
};

export default HeadquartersDashboard;