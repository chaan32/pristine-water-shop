import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { salesApi, ordersApi, getCumulativeStats, ChartData, CumulativeStats } from '@/lib/statisticsApi';
import { Loader2, TrendingUp, ShoppingCart, DollarSign } from 'lucide-react';
import { toast } from 'sonner';

type ViewType = 'yearly' | 'monthly' | 'daily';
type DataType = 'sales' | 'orders';

interface ChartDisplayData {
  name: string;
  value: number;
}

export default function StatisticsDashboard() {
  const [viewType, setViewType] = useState<ViewType>('yearly');
  const [dataType, setDataType] = useState<DataType>('sales');
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  
  const [totalSales, setTotalSales] = useState<number>(0);
  const [totalOrders, setTotalOrders] = useState<number>(0);
  const [cumulativeStats, setCumulativeStats] = useState<CumulativeStats>({ orders: 0, sales: 0 });
  const [chartData, setChartData] = useState<ChartDisplayData[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Generate year options (current year and previous 4 years)
  const yearOptions = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);
  const monthOptions = Array.from({ length: 12 }, (_, i) => ({
    value: i + 1,
    label: new Date(2024, i).toLocaleDateString('ko-KR', { month: 'long' })
  }));

  const formatChartData = (data: ChartData, type: ViewType): ChartDisplayData[] => {
    return data.map(([key, value]) => ({
      name: type === 'yearly' ? `${key}년` 
            : type === 'monthly' ? `${key}월`
            : `${key}일`,
      value
    }));
  };

  const loadTotalStats = async () => {
    try {
      const [salesTotal, ordersTotal, cumulative] = await Promise.all([
        salesApi.getTotal(),
        ordersApi.getTotal(),
        getCumulativeStats()
      ]);
      
      setTotalSales(salesTotal);
      setTotalOrders(ordersTotal);
      setCumulativeStats(cumulative);
    } catch (err) {
      console.error('Failed to load total stats:', err);
      toast.error('총계 데이터를 불러오는데 실패했습니다.');
    }
  };

  const loadChartData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      let data: ChartData;
      const api = dataType === 'sales' ? salesApi : ordersApi;
      
      switch (viewType) {
        case 'yearly':
          data = await api.getYearly();
          break;
        case 'monthly':
          data = await api.getMonthly(selectedYear);
          break;
        case 'daily':
          data = await api.getDaily(selectedYear, selectedMonth);
          break;
        default:
          throw new Error('Invalid view type');
      }
      
      setChartData(formatChartData(data, viewType));
    } catch (err) {
      console.error('Failed to load chart data:', err);
      setError('차트 데이터를 불러오는데 실패했습니다.');
      toast.error('차트 데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTotalStats();
  }, []);

  useEffect(() => {
    loadChartData();
  }, [viewType, dataType, selectedYear, selectedMonth]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW'
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('ko-KR').format(value);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">매출 통계 대시보드</h1>
        <Button onClick={() => { loadTotalStats(); loadChartData(); }} disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
          새로고침
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 매출</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalSales)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 주문수</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(totalOrders)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">누적 매출</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(cumulativeStats.sales)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">누적 주문수</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(cumulativeStats.orders)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Chart Controls */}
      <Card>
        <CardHeader>
          <CardTitle>차트 설정</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">데이터 유형</label>
              <Select value={dataType} onValueChange={(value: DataType) => setDataType(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sales">매출</SelectItem>
                  <SelectItem value="orders">주문수</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">기간</label>
              <Select value={viewType} onValueChange={(value: ViewType) => setViewType(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yearly">연도별</SelectItem>
                  <SelectItem value="monthly">월별</SelectItem>
                  <SelectItem value="daily">일별</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {(viewType === 'monthly' || viewType === 'daily') && (
              <div className="space-y-2">
                <label className="text-sm font-medium">연도</label>
                <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {yearOptions.map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}년
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {viewType === 'daily' && (
              <div className="space-y-2">
                <label className="text-sm font-medium">월</label>
                <Select value={selectedMonth.toString()} onValueChange={(value) => setSelectedMonth(parseInt(value))}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {monthOptions.map((month) => (
                      <SelectItem key={month.value} value={month.value.toString()}>
                        {month.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Chart Display */}
      <Card>
        <CardHeader>
          <CardTitle>
            {dataType === 'sales' ? '매출' : '주문수'} 
            {viewType === 'yearly' ? ' 연도별' : viewType === 'monthly' ? ' 월별' : ' 일별'} 
            통계
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-96">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-96 text-destructive">
              {error}
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={400}>
              {viewType === 'yearly' ? (
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={dataType === 'sales' ? formatCurrency : formatNumber} />
                  <Tooltip 
                    formatter={(value: number) => dataType === 'sales' ? formatCurrency(value) : formatNumber(value)}
                    labelFormatter={(label) => `${label}`}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--primary))" }}
                  />
                </LineChart>
              ) : (
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={dataType === 'sales' ? formatCurrency : formatNumber} />
                  <Tooltip 
                    formatter={(value: number) => dataType === 'sales' ? formatCurrency(value) : formatNumber(value)}
                    labelFormatter={(label) => `${label}`}
                  />
                  <Bar 
                    dataKey="value" 
                    fill="hsl(var(--primary))"
                  />
                </BarChart>
              )}
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}