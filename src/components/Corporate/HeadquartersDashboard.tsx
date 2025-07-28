import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Building2, Package, BarChart3, Crown } from 'lucide-react';

const HeadquartersDashboard = () => {
  const [selectedMonth, setSelectedMonth] = useState('2025-01');

  // 임시 데이터
  const branchPurchases = [
    {
      id: 1,
      branchName: '강남점',
      date: '2024.01.20',
      products: ['프리미엄 샤워 필터 SF-100'],
      quantity: 5,
      total: 460000,
      paymentStatus: '결제완료',
      status: '배송완료'
    },
    {
      id: 2,
      branchName: '서초점',
      date: '2024.01.18',
      products: ['주방용 직수 정수기 KF-200'],
      quantity: 3,
      total: 594000,
      paymentStatus: '결제완료',
      status: '배송중'
    },
    {
      id: 3,
      branchName: '송파점',
      date: '2024.01.15',
      products: ['산업용 대용량 필터 IF-1000'],
      quantity: 2,
      total: 900000,
      paymentStatus: '결제대기',
      status: '배송완료'
    }
  ];

  const totalAmount = branchPurchases.reduce((sum, purchase) => sum + purchase.total, 0);
  const totalOrders = branchPurchases.length;

  return (
    <div className="space-y-6">
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
            <div className="text-2xl font-bold">{totalOrders}</div>
            <p className="text-xs text-muted-foreground">이번 달 주문</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">활성 지점</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">운영 중인 지점</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 주문액</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAmount.toLocaleString()}원</div>
            <p className="text-xs text-muted-foreground">전체 주문 누적</p>
          </CardContent>
        </Card>
      </div>

      {/* 지점별 구매내역 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>지점 구매 내역</CardTitle>
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2025-01">2025년 1월</SelectItem>
              <SelectItem value="2024-12">2024년 12월</SelectItem>
              <SelectItem value="2024-11">2024년 11월</SelectItem>
              <SelectItem value="2024-10">2024년 10월</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>지점명</TableHead>
                <TableHead>주문일</TableHead>
                <TableHead>상품명</TableHead>
                <TableHead>수량</TableHead>
                <TableHead>금액</TableHead>
                <TableHead>결제상태</TableHead>
                <TableHead>배송상태</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {branchPurchases.map((purchase) => (
                <TableRow key={purchase.id}>
                  <TableCell className="font-medium">{purchase.branchName}</TableCell>
                  <TableCell>{purchase.date}</TableCell>
                  <TableCell>{purchase.products.join(', ')}</TableCell>
                  <TableCell>{purchase.quantity}개</TableCell>
                  <TableCell className="font-semibold">{purchase.total.toLocaleString()}원</TableCell>
                  <TableCell>
                    <Badge variant={purchase.paymentStatus === '결제완료' ? 'default' : 'destructive'}>
                      {purchase.paymentStatus}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={purchase.status === '배송완료' ? 'default' : 'secondary'}>
                      {purchase.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default HeadquartersDashboard;