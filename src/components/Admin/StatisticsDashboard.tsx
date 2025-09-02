import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ShoppingCart, 
  Calendar,
  BarChart3,
  AlertCircle
} from 'lucide-react';
import { adminApi } from '@/lib/api';
import { StatisticsPairArray, CumulativeStats, ChartDataPoint, TimeRange } from '@/types/statistics';
import { toast } from 'sonner';

const StatisticsDashboard = () => {
  // State management
  const [timeRange, setTimeRange] = useState<TimeRange>('monthly');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Data states
  const [totalSales, setTotalSales] = useState<number>(0);
  const [totalOrders, setTotalOrders] = useState<number>(0);
  const [cumulativeStats, setCumulativeStats] = useState<CumulativeStats>({ orders: 0, sales: 0 });
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);

  // Helper function to format pair arrays to chart data
  const formatPairArrayToChart = (salesData: StatisticsPairArray, ordersData: StatisticsPairArray, periodType: string) => {
    return salesData.map((salesPoint, index) => {
      const ordersPoint = ordersData[index] || [salesPoint[0], 0];
      let period = '';
      
      if (periodType === 'yearly') {
        period = salesPoint[0].toString();
      } else if (periodType === 'monthly') {
        const months = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];
        period = months[salesPoint[0] - 1] || `${salesPoint[0]}월`;
      } else if (periodType === 'daily') {
        period = `${salesPoint[0]}일`;
      }
      
      return {
        period,
        sales: salesPoint[1],
        orders: ordersPoint[1]
      };
    });
  };

  // Fetch data based on selected time range
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch basic stats
      const [totalSalesRes, totalOrdersRes, cumulativeRes] = await Promise.all([
        adminApi.getTotalSales(),
        adminApi.getTotalOrders(),
        adminApi.getCumulativeStats()
      ]);

      const totalSalesData = await totalSalesRes.json();
      const totalOrdersData = await totalOrdersRes.json();
      const cumulativeData = await cumulativeRes.json();

      setTotalSales(totalSalesData);
      setTotalOrders(totalOrdersData);
      setCumulativeStats(cumulativeData);

      // Fetch chart data based on time range
      let salesData: StatisticsPairArray = [];
      let ordersData: StatisticsPairArray = [];

      if (timeRange === 'yearly') {
        const [yearSalesRes, yearOrdersRes] = await Promise.all([
          adminApi.getYearlySales(),
          adminApi.getYearlyOrders()
        ]);
        salesData = await yearSalesRes.json();
        ordersData = await yearOrdersRes.json();
      } else if (timeRange === 'monthly') {
        const [monthSalesRes, monthOrdersRes] = await Promise.all([
          adminApi.getMonthlySales(selectedYear),
          adminApi.getMonthlyOrders(selectedYear)
        ]);
        salesData = await monthSalesRes.json();
        ordersData = await monthOrdersRes.json();
      } else if (timeRange === 'daily') {
        const [daySalesRes, dayOrdersRes] = await Promise.all([
          adminApi.getDailySales(selectedYear, selectedMonth),
          adminApi.getDailyOrders(selectedYear, selectedMonth)
        ]);
        salesData = await daySalesRes.json();
        ordersData = await dayOrdersRes.json();
      }

      const formattedData = formatPairArrayToChart(salesData, ordersData, timeRange);
      setChartData(formattedData);

    } catch (error) {
      console.error('Statistics fetch error:', error);
      setError('데이터를 불러오는 중 오류가 발생했습니다.');
      toast.error('통계 데이터를 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [timeRange, selectedYear, selectedMonth]);

  // Generate year options (last 5 years)
  const yearOptions = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);
  const monthOptions = Array.from({ length: 12 }, (_, i) => ({
    value: i + 1,
    label: `${i + 1}월`
  }));

  // Calculate growth percentages (mock data - replace with real calculation)
  const salesGrowth = 12.5;
  const ordersGrowth = 8.2;
  const avgOrderGrowth = -2.1;

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">데이터 로딩 오류</h3>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={fetchData}>다시 시도</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          매출 통계 대시보드
        </h1>
        
        {/* Controls */}
        <div className="flex gap-3 items-center">
          <div className="flex gap-2">
            <Button
              variant={timeRange === 'yearly' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeRange('yearly')}
            >
              연도별
            </Button>
            <Button
              variant={timeRange === 'monthly' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeRange('monthly')}
            >
              월별
            </Button>
            <Button
              variant={timeRange === 'daily' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeRange('daily')}
            >
              일별
            </Button>
          </div>

          {timeRange !== 'yearly' && (
            <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {yearOptions.map(year => (
                  <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {timeRange === 'daily' && (
            <Select value={selectedMonth.toString()} onValueChange={(value) => setSelectedMonth(parseInt(value))}>
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {monthOptions.map(month => (
                  <SelectItem key={month.value} value={month.value.toString()}>{month.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/10" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
            <CardTitle className="text-sm font-medium">총 매출</CardTitle>
            <DollarSign className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent className="relative">
            {loading ? (
              <Skeleton className="h-8 w-24 mb-2" />
            ) : (
              <div className="text-2xl font-bold">₩{totalSales.toLocaleString()}</div>
            )}
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 mr-1 text-success" />
              전월 대비 +{salesGrowth}%
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-chart-2/5 to-chart-2/10" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
            <CardTitle className="text-sm font-medium">총 주문 수</CardTitle>
            <ShoppingCart className="h-5 w-5 text-chart-2" />
          </CardHeader>
          <CardContent className="relative">
            {loading ? (
              <Skeleton className="h-8 w-20 mb-2" />
            ) : (
              <div className="text-2xl font-bold">{totalOrders.toLocaleString()}</div>
            )}
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 mr-1 text-success" />
              전월 대비 +{ordersGrowth}%
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-chart-3/5 to-chart-3/10" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
            <CardTitle className="text-sm font-medium">평균 주문 금액</CardTitle>
            <BarChart3 className="h-5 w-5 text-chart-3" />
          </CardHeader>
          <CardContent className="relative">
            {loading ? (
              <Skeleton className="h-8 w-24 mb-2" />
            ) : (
              <div className="text-2xl font-bold">
                ₩{totalOrders > 0 ? Math.round(totalSales / totalOrders).toLocaleString() : '0'}
              </div>
            )}
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingDown className="h-3 w-3 mr-1 text-destructive" />
              전월 대비 {avgOrderGrowth}%
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-chart-4/5 to-chart-4/10" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
            <CardTitle className="text-sm font-medium">누적 통계</CardTitle>
            <Calendar className="h-5 w-5 text-chart-4" />
          </CardHeader>
          <CardContent className="relative">
            {loading ? (
              <Skeleton className="h-8 w-24 mb-2" />
            ) : (
              <div className="space-y-1">
                <div className="text-lg font-semibold">₩{cumulativeStats.sales.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">{cumulativeStats.orders.toLocaleString()} 건</div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Chart */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              매출 현황
              <Badge variant="secondary">
                {timeRange === 'yearly' ? '연도별' : timeRange === 'monthly' ? '월별' : '일별'} 조회
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted-foreground) / 0.2)" />
                  <XAxis 
                    dataKey="period" 
                    fontSize={12}
                    stroke="hsl(var(--muted-foreground))"
                  />
                  <YAxis 
                    tickFormatter={(value) => `₩${(value / 1000000).toFixed(0)}M`}
                    fontSize={12}
                    stroke="hsl(var(--muted-foreground))"
                  />
                  <Tooltip 
                    formatter={(value: number) => [`₩${value.toLocaleString()}`, '매출']}
                    labelFormatter={(label) => `${label}`}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="sales" 
                    stroke="hsl(var(--primary))" 
                    fillOpacity={1}
                    fill="url(#salesGradient)"
                    strokeWidth={3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Orders Chart */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              주문 현황
              <Badge variant="outline">
                주문 건수
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted-foreground) / 0.2)" />
                  <XAxis 
                    dataKey="period" 
                    fontSize={12}
                    stroke="hsl(var(--muted-foreground))"
                  />
                  <YAxis 
                    fontSize={12}
                    stroke="hsl(var(--muted-foreground))"
                  />
                  <Tooltip 
                    formatter={(value: number) => [`${value.toLocaleString()}건`, '주문 수']}
                    labelFormatter={(label) => `${label}`}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar 
                    dataKey="orders" 
                    fill="hsl(var(--primary))" 
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Combined Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            매출 & 주문 통합 차트
            <Badge variant="secondary">
              이중 축 차트
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-[400px] w-full" />
          ) : (
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted-foreground) / 0.2)" />
                <XAxis 
                  dataKey="period" 
                  fontSize={12}
                  stroke="hsl(var(--muted-foreground))"
                />
                <YAxis 
                  yAxisId="sales"
                  orientation="left"
                  tickFormatter={(value) => `₩${(value / 1000000).toFixed(0)}M`}
                  fontSize={12}
                  stroke="hsl(var(--primary))"
                />
                <YAxis 
                  yAxisId="orders"
                  orientation="right"
                  fontSize={12}
                  stroke="hsl(var(--chart-2))"
                />
                <Tooltip 
                  formatter={(value: number, name: string) => [
                    name === 'sales' ? `₩${value.toLocaleString()}` : `${value.toLocaleString()}건`,
                    name === 'sales' ? '매출' : '주문 수'
                  ]}
                  labelFormatter={(label) => `${label}`}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Line 
                  yAxisId="sales"
                  type="monotone" 
                  dataKey="sales" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={3}
                  dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 6 }}
                  activeDot={{ r: 8, stroke: 'hsl(var(--primary))', strokeWidth: 2 }}
                />
                  <Line 
                  yAxisId="orders"
                  type="monotone" 
                  dataKey="orders" 
                  stroke="hsl(var(--chart-2))" 
                  strokeWidth={3}
                  strokeDasharray="5 5"
                  dot={{ fill: 'hsl(var(--chart-2))', strokeWidth: 2, r: 6 }}
                  activeDot={{ r: 8, stroke: 'hsl(var(--chart-2))', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StatisticsDashboard;