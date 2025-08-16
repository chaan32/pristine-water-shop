import { useEffect, useState, useMemo, Fragment } from 'react'; // Fragment 추가
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
import { Building2, Package, BarChart3, Crown, ChevronDown, ChevronRight } from 'lucide-react'; // 아이콘 추가

// (인터페이스 정의는 기존과 동일)
// API 응답 데이터 타입을 정의합니다.
interface BranchDataItem {
  orderId: number;
  orderNumber: string;
  branchName: string;
  createdAt: string;
  productName: string;
  quantity: number;
  price: number;
  paymentStatus: string;
  shipmentStatus: string;
}

interface DashboardData {
  id: number;
  branchNumber: number;
  totalOrders: number;
  totalAmount: number;
  branchesData: BranchDataItem[];
}


// (generateLast12Months 함수는 기존과 동일)
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
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // ✅ 토글된 주문 번호들을 관리하는 상태
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());

  // (useEffect API 호출 로직은 기존과 동일)
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('accessToken');
        if (!token) throw new Error('인증 토큰이 없습니다.');

        const response = await fetch('http://localhost:8080/api/users/orders/headquarters', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

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

  const filteredData = useMemo(() => {
    if (!dashboardData) return [];
    return dashboardData.branchesData
        .filter(item => item.createdAt.startsWith(selectedMonth))
        .filter(item => selectedStatus === 'ALL' || item.paymentStatus === selectedStatus);
  }, [dashboardData, selectedMonth, selectedStatus]);

  // ✅ 데이터를 주문 번호 기준으로 그룹핑하고 금액/수량 합산
  const groupedData = useMemo(() => {
    const groups: { [key: string]: { items: BranchDataItem[], totalAmount: number, totalQuantity: number } } = {};

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

  // ✅ 토글 핸들러 함수
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

  // (상태 변환 함수, 로딩/에러 처리는 기존과 동일)
  const getPaymentStatusText = (status: string) => ({
    'PENDING': '결제대기', 'PAID': '결제완료', 'FAILED': '결제실패'
  }[status] || status);

  const getShipmentStatusText = (status: string) => ({
    'PENDING': '배송대기', 'PREPARING': '상품준비중', 'SHIPPED': '배송중',
    'DELIVERED': '배송완료', 'CANCELLED': '주문취소'
  }[status] || status);

  if (loading) return <div className="text-center py-10">데이터를 불러오는 중...</div>;
  if (error) return <div className="text-center py-10 text-red-500">오류: {error}</div>;
  if (!dashboardData) return <div className="text-center py-10">데이터가 없습니다.</div>;


  return (
      <div className="space-y-6">
        {/* (헤더와 요약 카드는 기존과 동일) */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Crown className="w-6 h-6 text-yellow-500" />
            <h1 className="text-2xl font-bold">본사 관리 대시보드</h1>
          </div>
        </div>

        {/* 요약 통계 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">총 주문 수</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData.totalOrders}</div>
              <p className="text-xs text-muted-foreground">전체 주문</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">활성 지점</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData.branchNumber}</div>
              <p className="text-xs text-muted-foreground">운영 중인 지점</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">총 주문액</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData.totalAmount.toLocaleString()}원</div>
              <p className="text-xs text-muted-foreground">전체 주문 누적</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          {/* (카드 헤더, 월 선택, 탭은 기존과 동일) */}
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>지점 구매 내역</CardTitle>
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-40">
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

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12"></TableHead> {/* 토글 버튼을 위한 공간 */}
                  <TableHead>주문번호</TableHead>
                  <TableHead>지점명</TableHead>
                  <TableHead>주문일</TableHead>
                  <TableHead>상품명</TableHead>
                  <TableHead>수량</TableHead>
                  <TableHead>금액</TableHead>
                  <TableHead>결제/배송</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {groupedData.length > 0 ? (
                    groupedData.map(group => {
                      const firstItem = group.items[0];
                      const isExpanded = expandedOrders.has(firstItem.orderNumber);

                      return (
                          <Fragment key={firstItem.orderNumber}>
                            {/* 상위 그룹 행 */}
                            <TableRow className="bg-gradient-to-r from-primary/5 to-primary/10 hover:from-primary/10 hover:to-primary/15 cursor-pointer transition-all duration-200 border-l-4 border-primary/20" onClick={() => handleToggleOrder(firstItem.orderNumber)}>
                              <TableCell className="py-4">
                                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 hover:bg-primary/20 transition-colors">
                                  {isExpanded ? <ChevronDown className="h-4 w-4 text-primary" /> : <ChevronRight className="h-4 w-4 text-primary" />}
                                </div>
                              </TableCell>
                              <TableCell className="font-bold text-primary py-4">{firstItem.orderNumber}</TableCell>
                              <TableCell className="font-medium py-4">
                                <div className="flex items-center gap-2">
                                  <Building2 className="h-4 w-4 text-muted-foreground" />
                                  {firstItem.branchName}
                                </div>
                              </TableCell>
                              <TableCell className="py-4">{new Date(firstItem.createdAt).toLocaleDateString('ko-KR')}</TableCell>
                              <TableCell className="py-4">
                                <div className="flex flex-col">
                                  <span className="font-medium">{firstItem.productName}</span>
                                  {group.items.length > 1 && (
                                    <span className="text-sm text-muted-foreground">외 {group.items.length - 1}건</span>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell className="py-4">
                                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                  {group.totalQuantity}개
                                </Badge>
                              </TableCell>
                              <TableCell className="font-bold text-lg py-4 text-green-600">
                                {group.totalAmount.toLocaleString()}원
                              </TableCell>
                              <TableCell className="py-4">
                                <div className="flex flex-col gap-2">
                                  <Badge variant={firstItem.paymentStatus === 'PAID' ? 'default' : 'destructive'} className="justify-center">
                                    {getPaymentStatusText(firstItem.paymentStatus)}
                                  </Badge>
                                  <Badge variant={firstItem.shipmentStatus === 'DELIVERED' ? 'default' : 'secondary'} className="justify-center">
                                    {getShipmentStatusText(firstItem.shipmentStatus)}
                                  </Badge>
                                </div>
                              </TableCell>
                            </TableRow>

                            {/* 하위 아이템 행 (토글 시 보임) */}
                            {isExpanded && group.items.map((item, index) => (
                                <TableRow key={`${item.orderNumber}-${index}`} className="bg-muted/30 hover:bg-muted/50 transition-colors">
                                  <TableCell className="py-3"></TableCell>
                                  <TableCell className="py-3"></TableCell>
                                  <TableCell className="py-3"></TableCell>
                                  <TableCell className="py-3"></TableCell>
                                  <TableCell className="pl-8 py-3">
                                    <div className="flex items-center gap-2">
                                      <Package className="h-3 w-3 text-muted-foreground" />
                                      <span className="text-sm">{item.productName}</span>
                                    </div>
                                  </TableCell>
                                  <TableCell className="py-3">
                                    <span className="text-sm text-muted-foreground">{item.quantity}개</span>
                                  </TableCell>
                                  <TableCell className="py-3">
                                    <span className="text-sm font-medium">{(item.price * item.quantity).toLocaleString()}원</span>
                                  </TableCell>
                                  <TableCell className="py-3"></TableCell>
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
          </CardContent>
        </Card>
      </div>
  );
};

export default HeadquartersDashboard;