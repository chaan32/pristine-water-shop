import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Calendar, TrendingUp, TrendingDown } from 'lucide-react';

const SalesChart = () => {
  const [activeFilter, setActiveFilter] = useState<'year' | 'month' | 'product'>('month');

  const monthlyData = [
    { name: '1월', sales: 2400000, orders: 45 },
    { name: '2월', sales: 1398000, orders: 32 },
    { name: '3월', sales: 3800000, orders: 67 },
    { name: '4월', sales: 3908000, orders: 72 },
    { name: '5월', sales: 4800000, orders: 89 },
    { name: '6월', sales: 3800000, orders: 68 },
    { name: '7월', sales: 4300000, orders: 78 },
  ];

  const yearlyData = [
    { name: '2022', sales: 24000000, orders: 450 },
    { name: '2023', sales: 32000000, orders: 620 },
    { name: '2024', sales: 28000000, orders: 510 },
  ];

  const productData = [
    { name: '샤워 필터', sales: 8900000, orders: 180 },
    { name: '주방 필터', sales: 12000000, orders: 240 },
    { name: '산업용 필터', sales: 7000000, orders: 90 },
    { name: '휴대용 필터', sales: 4500000, orders: 150 },
  ];

  const getCurrentData = () => {
    switch (activeFilter) {
      case 'year': return yearlyData;
      case 'product': return productData;
      default: return monthlyData;
    }
  };

  const totalSales = getCurrentData().reduce((sum, item) => sum + item.sales, 0);
  const totalOrders = getCurrentData().reduce((sum, item) => sum + item.orders, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">매출 그래프</h1>
        <div className="flex gap-2">
          <Button
            variant={activeFilter === 'year' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveFilter('year')}
          >
            연도별
          </Button>
          <Button
            variant={activeFilter === 'month' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveFilter('month')}
          >
            월별
          </Button>
          <Button
            variant={activeFilter === 'product' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveFilter('product')}
          >
            제품별
          </Button>
        </div>
      </div>

      {/* 요약 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 매출</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₩{totalSales.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              전월 대비 +12.5%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 주문 수</CardTitle>
            <Calendar className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrders.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              전월 대비 +8.2%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">평균 주문 금액</CardTitle>
            <TrendingDown className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₩{Math.round(totalSales / totalOrders).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              전월 대비 -2.1%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 차트 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            매출 현황
            <Badge variant="secondary">
              {activeFilter === 'year' ? '연도별' : activeFilter === 'month' ? '월별' : '제품별'} 조회
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={getCurrentData()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis tickFormatter={(value) => `₩${(value / 1000000).toFixed(0)}M`} />
              <Tooltip 
                formatter={(value: number) => [`₩${value.toLocaleString()}`, '매출']}
                labelFormatter={(label) => `${label}`}
              />
              <Bar dataKey="sales" fill="hsl(var(--primary))" radius={4} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default SalesChart;