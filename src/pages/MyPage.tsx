import { useEffect, useState } from 'react';
import Header from '@/components/Layout/Header';
import Footer from '@/components/Layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User, Package, Settings, Truck, Crown, Building2 } from 'lucide-react';
import RefundExchangeForm from '@/components/Support/RefundExchangeForm';
import HeadquartersDashboard from '@/components/Corporate/HeadquartersDashboard';
import OrderDetailModal from '@/components/MyPage/OrderDetailModal';

const MyPage = () => {
  const [userType, setUserType] = useState('individual');
  const [userName, setUserName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [parentCompany, setParentCompany] = useState('');
  const [isHeadquarters, setIsHeadquarters] = useState(false);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isOrderDetailOpen, setIsOrderDetailOpen] = useState(false);


  useEffect(() => {
    fetchUserInfo();
    fetchOrders();
  }, []);

  const fetchUserInfo = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        return;
      }

      const response = await fetch('http://localhost:8080/api/users/me', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        const user = data.data;
        console.log(user);
        setUserType(user.userType);
        setUserName(user.name);
        setCompanyName(user.companyName || '');
        setParentCompany(user.parentCompany || '');
        setIsHeadquarters(user.isHeadquarters || false);

        // 로컬 스토리지도 업데이트
        localStorage.setItem('userType', user.userType);
        localStorage.setItem('userName', user.name);
        if (user.companyName) {
          localStorage.setItem('companyName', user.companyName);
        }
        if (user.parentCompany) {
          localStorage.setItem('parentCompany', user.parentCompany);
        }
        if (user.isHeadquarters !== undefined) {
          localStorage.setItem('isHeadquarters', user.isHeadquarters.toString());
        }
      } else {
        throw new Error('사용자 정보 조회 실패');
      }
    } catch (error) {
      console.error('User info fetch error:', error);
      // 에러 시 로컬 스토리지 정보 사용
      const type = localStorage.getItem('userType') || 'individual';
      const name = localStorage.getItem('userName') || '홍길동';
      const company = localStorage.getItem('companyName') || '';
      const parent = localStorage.getItem('parentCompany') || '';
      const headquarters = localStorage.getItem('isHeadquarters') === 'true';

      setUserType(type);
      setUserName(name);
      setCompanyName(company);
      setParentCompany(parent);
      setIsHeadquarters(headquarters);
    }
  };

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        alert("로그인이 필요합니다.");
        return;
      }

      const response = await fetch('http://localhost:8080/api/users/orders?page=1&limit=10', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('API Response:', result);
        
        // 백엔드 응답 구조에 맞게 수정
        if (result.data && Array.isArray(result.data)) {
          const ordersData = result.data.map((order: any) => ({
            id: order.orderName,
            date: new Date(order.createdAt).toLocaleDateString('ko-KR'),
            products: order.products,
            total: order.price,
            status: getShipmentStatusText(order.shipmentStatus),
            trackingNumber: order.trackingNumber || '',
            deliveryAddress: '',
            // 상세정보용 데이터 추가
            orderName: order.orderName,
            createdAt: new Date(order.createdAt).toLocaleDateString('ko-KR'),
            price: order.price,
            shipmentStatus: order.shipmentStatus,
            items: order.items || []
          }));
          setOrders(ordersData);
          console.log('Processed orders:', ordersData);
        } else {
          console.error('Unexpected data structure:', result);
          setOrders([]);
        }
      } else {
        throw new Error('주문 내역 조회 실패');
      }
    } catch (error) {
      console.error('Orders fetch error:', error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const getShipmentStatusText = (status: string) => {
    const statusMap: { [key: string]: string } = {
      'PENDING': '배송 대기',
      'PREPARING': '발송 대기중',
      'PROCESSING': '상품 준비중',
      'SHIPPED': '배송중',
      'DELIVERED': '배송완료',
      'CANCELLED': '배송 취소'
    };
    return statusMap[status] || status;
  };

  const getStatusText = (status: string) => {
    const statusMap: { [key: string]: string } = {
      'pending': '결제 대기',
      'paid': '결제 완료',
      'processing': '상품 준비중',
      'shipped': '배송중',
      'delivered': '배송완료',
      'cancelled': '주문 취소'
    };
    return statusMap[status] || status;
  };

  const getUserTypeText = () => {
    switch (userType) {
      case 'headquarters':
        return '본사 회원';
      case 'branch':
        return '지점 회원';
      case 'corporate':
        return '법인 회원';
      default:
        return '개인 회원';
    }
  };

  const getDisplayName = () => {
    if (userType === 'branch' && parentCompany && companyName) {
      return `${parentCompany} (${companyName})`;
    }
    return companyName;
  };

  const handleOrderDetailClick = (order: any) => {
    setSelectedOrder(order);
    setIsOrderDetailOpen(true);
  };

  return (
      <div className="min-h-screen bg-background">
        <Header />

        <main className="container mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              {userType === 'branch' && <Building2 className="w-6 h-6 text-blue-500" />}
              <h1 className="text-4xl font-bold text-foreground">마이페이지</h1>
            </div>
            <p className="text-lg text-muted-foreground">
              {userName} ({getUserTypeText()})
              {getDisplayName() && ` - ${getDisplayName()}`}
            </p>
          </div>

          <Tabs defaultValue="orders" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="orders">주문내역</TabsTrigger>
              <TabsTrigger value="profile">회원정보</TabsTrigger>
            </TabsList>

            <TabsContent value="orders" className="mt-8">
              {loading ? (
                <div className="text-center py-8">
                  <p>주문 내역을 불러오는 중...</p>
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">주문 내역이 없습니다.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {orders.map((order) => (
                    <Card key={order.id} className="water-drop">
                      <CardContent className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                          <div className="md:col-span-3">
                            <div className="flex flex-col gap-1">
                              <span className="font-semibold text-sm">{order.id}</span>
                              <span className="text-xs text-muted-foreground">{order.date}</span>
                            </div>
                          </div>
                          <div className="md:col-span-4">
                            <p className="text-sm font-medium">
                              {typeof order.products === 'string' ? order.products : order.products?.join(', ')}
                            </p>
                          </div>
                          <div className="md:col-span-2">
                            <Badge variant={order.status === '배송완료' ? 'default' : 'secondary'}>
                              {order.status}
                            </Badge>
                          </div>
                          <div className="md:col-span-2">
                            <p className="text-sm font-bold">{order.total?.toLocaleString()}원</p>
                          </div>
                          <div className="md:col-span-1 flex gap-1">
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="h-8 px-2 text-xs"
                              onClick={() => handleOrderDetailClick(order)}
                            >
                              상세
                            </Button>
                            {order.trackingNumber && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 px-2 text-xs"
                                onClick={() => window.open(`https://service.epost.go.kr/trace.RetrieveDomRigiTraceList.comm?sid1=${order.trackingNumber}`, '_blank')}
                              >
                                배송
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>



            <TabsContent value="profile" className="mt-8">
              <Card className="water-drop">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    회원정보 수정
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">이름</label>
                      <input className="w-full p-2 border rounded" value={userName} readOnly />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">아이디</label>
                      <input className="w-full p-2 border rounded" value="hong123" readOnly />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">이메일</label>
                    <input className="w-full p-2 border rounded" value="hong@example.com" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">휴대폰</label>
                    <input className="w-full p-2 border rounded" value="010-1234-5678" />
                  </div>
                  <Button className="water-drop">
                    <Settings className="w-4 h-4 mr-2" />
                    정보 수정
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>

        <OrderDetailModal
          isOpen={isOrderDetailOpen}
          onClose={() => setIsOrderDetailOpen(false)}
          order={selectedOrder}
        />

        <Footer />
      </div>
  );
};

export default MyPage;