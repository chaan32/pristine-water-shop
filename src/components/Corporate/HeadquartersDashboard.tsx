import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
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
import { Building2, Calendar, TrendingUp, Package, Users, BarChart3, Crown } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const HeadquartersDashboard = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedBranch, setSelectedBranch] = useState('all');

  // 임시 데이터
  const branchPurchases = [
    {
      id: 1,
      branchName: '강남점',
      contactName: '김지점장',
      orderId: 'ORD-2024-BR001',
      date: '2024.01.20',
      products: ['프리미엄 샤워 필터 SF-100'],
      quantity: 5,
      total: 460000,
      status: '배송완료'
    },
    {
      id: 2,
      branchName: '서초점',
      contactName: '이매니저',
      orderId: 'ORD-2024-BR002',
      date: '2024.01.18',
      products: ['주방용 직수 정수기 KF-200'],
      quantity: 3,
      total: 594000,
      status: '배송중'
    },
    {
      id: 3,
      branchName: '송파점',
      contactName: '박대리',
      orderId: 'ORD-2024-BR003',
      date: '2024.01.15',
      products: ['산업용 대용량 필터 IF-1000'],
      quantity: 2,
      total: 900000,
      status: '배송완료'
    }
  ];

  const monthlyData = [
    { month: '1월', amount: 1954000, orders: 8 },
    { month: '2월', amount: 2340000, orders: 12 },
    { month: '3월', amount: 1890000, orders: 7 },
    { month: '4월', amount: 2780000, orders: 15 },
  ];

  const productData = [
    { name: '샤워 필터', value: 40, color: '#0088FE' },
    { name: '주방 정수기', value: 35, color: '#00C49F' },
    { name: '산업용 필터', value: 25, color: '#FFBB28' },
  ];

  const branchSummary = [
    { branchName: '강남점', orders: 12, total: 980000 },
    { branchName: '서초점', orders: 8, total: 720000 },
    { branchName: '송파점', orders: 15, total: 1200000 },
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
        <div className="flex gap-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">주간</SelectItem>
              <SelectItem value="month">월간</SelectItem>
              <SelectItem value="quarter">분기</SelectItem>
              <SelectItem value="year">연간</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedBranch} onValueChange={setSelectedBranch}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">전체 지점</SelectItem>
              <SelectItem value="gangnam">강남점</SelectItem>
              <SelectItem value="seocho">서초점</SelectItem>
              <SelectItem value="songpa">송파점</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 요약 통계 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
            <CardTitle className="text-sm font-medium">총 매출</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAmount.toLocaleString()}원</div>
            <p className="text-xs text-muted-foreground">이번 달 매출</p>
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
            <CardTitle className="text-sm font-medium">평균 주문액</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(totalAmount / totalOrders).toLocaleString()}원</div>
            <p className="text-xs text-muted-foreground">지점당 평균</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="purchases" className="w-full">
        <TabsList>
          <TabsTrigger value="purchases">지점별 구매내역</TabsTrigger>
          <TabsTrigger value="analytics">매출 분석</TabsTrigger>
          <TabsTrigger value="summary">지점 요약</TabsTrigger>
        </TabsList>

        <TabsContent value="purchases" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>지점 구매 내역</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>지점명</TableHead>
                    <TableHead>담당자</TableHead>
                    <TableHead>주문번호</TableHead>
                    <TableHead>주문일</TableHead>
                    <TableHead>상품명</TableHead>
                    <TableHead>수량</TableHead>
                    <TableHead>금액</TableHead>
                    <TableHead>상태</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {branchPurchases.map((purchase) => (
                    <TableRow key={purchase.id}>
                      <TableCell className="font-medium">{purchase.branchName}</TableCell>
                      <TableCell>{purchase.contactName}</TableCell>
                      <TableCell className="font-mono text-sm">{purchase.orderId}</TableCell>
                      <TableCell>{purchase.date}</TableCell>
                      <TableCell>{purchase.products.join(', ')}</TableCell>
                      <TableCell>{purchase.quantity}개</TableCell>
                      <TableCell className="font-semibold">{purchase.total.toLocaleString()}원</TableCell>
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
        </TabsContent>

        <TabsContent value="analytics" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>월별 매출 추이</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => `${Number(value).toLocaleString()}원`} />
                    <Bar dataKey="amount" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>제품별 구매 비율</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={productData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {productData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="summary" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>지점별 요약</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {branchSummary.map((branch, index) => (
                  <Card key={index} className="border">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Building2 className="w-5 h-5" />
                        {branch.branchName}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">총 주문</span>
                          <span className="font-semibold">{branch.orders}건</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">총 매출</span>
                          <span className="font-semibold text-primary">{branch.total.toLocaleString()}원</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">평균 주문액</span>
                          <span className="font-semibold">{Math.round(branch.total / branch.orders).toLocaleString()}원</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HeadquartersDashboard;