import { useEffect, useState, useMemo, Fragment } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
import { Building2, Package, BarChart3, Crown, ChevronDown, ChevronRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';


// 1. API 응답에 맞춰 프론트엔드에서 사용할 데이터 타입을 명확하게 정의합니다.
// 개별 상품 아이템 타입
interface BranchOrderItem {
  id: number;
  productName: string;
  quantity: number;
  productTotalPrice: number;
  productPerPrice: number;
}

// 하나의 주문(지점 데이터) 타입
interface BranchOrder {
  orderId: number;
  orderNumber: string;
  branchName: string;
  createdAt: string;
  paymentStatus: string;
  shipmentStatus: string;
  branchOrders: BranchOrderItem[];
}

// 전체 대시보드 데이터 타입
interface DashboardData {
  id: number;
  branchNumber: number;
  totalOrders: number;
  totalAmount: number;
  branchesData: BranchOrder[];
}

// 2. 화면에 표시하기 위해 평탄화된 데이터 타입을 정의합니다.
interface FlatBranchDataItem {
  orderId: number;
  orderNumber: string;
  branchName: string;
  createdAt: string;
  productName: string;
  quantity: number;
  price: number; // productPerPrice를 이 필드로 매핑
  paymentStatus: string;
  shipmentStatus: string;
}


// 지난 12개월을 동적으로 생성하는 함수
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

  // 전체 요약 데이터를 위한 상태
  const [summaryData, setSummaryData] = useState<{ totalOrders: number; branchNumber: number; totalAmount: number; } | null>(null);
  // 테이블에 표시될 평탄화된 주문 아이템 목록 상태
  const [flatOrderItems, setFlatOrderItems] = useState<FlatBranchDataItem[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem('accessToken');
        if (!token) throw new Error('인증 토큰이 없습니다.');

        const response = await fetch('http://localhost:8080/api/users/orders/headquarters', {
          headers: { 'Authorization': `Bearer ${token}` },
        });

        if (!response.ok) throw new Error('데이터를 불러오는 데 실패했습니다.');

        const result = await response.json();
        const data: DashboardData = result.data;

        // 3. API 응답 데이터를 가공합니다.
        // 요약 정보 저장
        setSummaryData({
          totalOrders: data.totalOrders,
          branchNumber: data.branchNumber,
          totalAmount: data.totalAmount,
        });

        // 중첩된 branchesData를 평탄화하여 flatOrderItems 상태에 저장
        const flattenedData = data.branchesData.flatMap(order =>
            order.branchOrders.map(item => ({
              orderId: order.orderId,
              orderNumber: order.orderNumber,
              branchName: order.branchName,
              createdAt: order.createdAt,
              paymentStatus: order.paymentStatus,
              shipmentStatus: order.shipmentStatus,
              productName: item.productName,
              quantity: item.quantity,
              price: item.productPerPrice, // productPerPrice를 price로 매핑
            }))
        );
        setFlatOrderItems(flattenedData);

      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // 평탄화된 데이터를 기반으로 필터링 로직 수행
  const filteredData = useMemo(() => {
    return flatOrderItems
        .filter(item => item.createdAt.startsWith(selectedMonth))
        .filter(item => selectedStatus === 'ALL' || item.paymentStatus === selectedStatus);
  }, [flatOrderItems, selectedMonth, selectedStatus]);

  // 필터링된 데이터를 주문 번호 기준으로 그룹핑
  const groupedData = useMemo(() => {
    const groups: { [key: string]: { items: FlatBranchDataItem[], totalAmount: number, totalQuantity: number } } = {};

    filteredData.forEach(item => {
      if (!groups[item.orderNumber]) {
        groups[item.orderNumber] = { items: [], totalAmount: 0, totalQuantity: 0 };
      }
      groups[item.orderNumber].items.push(item);
      groups[item.orderNumber].totalAmount += item.price * item.quantity;
      groups[item.orderNumber].totalQuantity += item.quantity;
    });

    return Object.values(groups);
  }, [filteredData]);

  const handleToggleOrder = (orderNumber: string) => {
    setExpandedOrders(prev => {
      const newSet = new Set(prev);
      newSet.has(orderNumber) ? newSet.delete(orderNumber) : newSet.add(orderNumber);
      return newSet;
    });
  };

  const getPaymentStatusText = (status: string) => ({
    'PENDING': '결제대기', 'PAID': '결제완료', 'FAILED': '결제실패'
  }[status] || status);

  const getShipmentStatusText = (status: string) => ({
    'PENDING': '배송대기', 'PREPARING': '상품준비중', 'SHIPPED': '배송중',
    'DELIVERED': '배송완료', 'CANCELLED': '주문취소'
  }[status] || status);

  if (loading) {
    return (
        <div className="space-y-6">
          <Skeleton className="h-8 w-1/3" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
          <Skeleton className="h-96 w-full" />
        </div>
    )
  }
  if (error) return <div className="text-center py-10 text-red-500">오류: {error}</div>;
  if (!summaryData) return <div className="text-center py-10">데이터가 없습니다.</div>;


  return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Crown className="w-6 h-6 text-yellow-500" />
            <h1 className="text-2xl font-bold">본사 관리 대시보드</h1>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">총 주문 수</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summaryData.totalOrders}</div>
              <p className="text-xs text-muted-foreground">전체 주문</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">활성 지점</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summaryData.branchNumber}</div>
              <p className="text-xs text-muted-foreground">운영 중인 지점</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">총 주문액</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summaryData.totalAmount.toLocaleString()}원</div>
              <p className="text-xs text-muted-foreground">전체 주문 누적</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <CardTitle>지점 구매 내역</CardTitle>
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="월 선택" />
              </SelectTrigger>
              <SelectContent>
                {monthOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent>
            <Tabs value={selectedStatus} onValueChange={setSelectedStatus} className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-4">
                <TabsTrigger value="ALL">전체</TabsTrigger>
                <TabsTrigger value="PENDING">결제대기</TabsTrigger>
                <TabsTrigger value="PAID">결제완료</TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12"></TableHead>
                    <TableHead>주문번호</TableHead>
                    <TableHead>지점명</TableHead>
                    <TableHead>주문일</TableHead>
                    <TableHead>상품명</TableHead>
                    <TableHead className="text-center">수량</TableHead>
                    <TableHead className="text-right">금액</TableHead>
                    <TableHead className="text-center">결제/배송</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {groupedData.length > 0 ? (
                      groupedData.map(group => {
                        const firstItem = group.items[0];
                        const isExpanded = expandedOrders.has(firstItem.orderNumber);

                        return (
                            <Fragment key={firstItem.orderNumber}>
                              <TableRow className="bg-muted/30 hover:bg-muted/50 cursor-pointer" onClick={() => handleToggleOrder(firstItem.orderNumber)}>
                                <TableCell>
                                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10">
                                    {isExpanded ? <ChevronDown className="h-4 w-4 text-primary" /> : <ChevronRight className="h-4 w-4 text-primary" />}
                                  </div>
                                </TableCell>
                                <TableCell className="font-bold text-primary">{firstItem.orderNumber}</TableCell>
                                <TableCell className="font-medium">{firstItem.branchName}</TableCell>
                                <TableCell>{new Date(firstItem.createdAt).toLocaleDateString()}</TableCell>
                                <TableCell>
                                  {firstItem.productName}
                                  {group.items.length > 1 && ` 외 ${group.items.length - 1}건`}
                                </TableCell>
                                <TableCell className="text-center">
                                  <Badge variant="secondary">{group.totalQuantity}개</Badge>
                                </TableCell>
                                <TableCell className="text-right font-semibold">{group.totalAmount.toLocaleString()}원</TableCell>
                                <TableCell className="text-center">
                                  <div className="flex flex-col gap-1 items-center">
                                    <Badge variant={firstItem.paymentStatus === 'PAID' ? 'default' : 'secondary'} className="w-20 justify-center">
                                      {getPaymentStatusText(firstItem.paymentStatus)}
                                    </Badge>
                                    <Badge variant={firstItem.shipmentStatus === 'DELIVERED' ? 'outline' : 'secondary'} className="w-20 justify-center">
                                      {getShipmentStatusText(firstItem.shipmentStatus)}
                                    </Badge>
                                  </div>
                                </TableCell>
                              </TableRow>

                              {isExpanded && group.items.map((item) => (
                                  <TableRow key={`${item.orderNumber}-${item.productName}`} className="bg-white hover:bg-gray-50">
                                    <TableCell colSpan={4}></TableCell>
                                    <TableCell className="pl-8 text-sm text-muted-foreground">{item.productName}</TableCell>
                                    <TableCell className="text-center text-sm text-muted-foreground">{item.quantity}개</TableCell>
                                    <TableCell className="text-right text-sm text-muted-foreground">{(item.price * item.quantity).toLocaleString()}원</TableCell>
                                    <TableCell></TableCell>
                                  </TableRow>
                              ))}
                            </Fragment>
                        );
                      })
                  ) : (
                      <TableRow>
                        <TableCell colSpan={8} className="h-24 text-center">해당 조건의 데이터가 없습니다.</TableCell>
                      </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
  );
};

export default HeadquartersDashboard;