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

const MyPage = () => {
  const [userType, setUserType] = useState('individual');
  const [userName, setUserName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [parentCompany, setParentCompany] = useState('');
  const [isHeadquarters, setIsHeadquarters] = useState(false);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  /*
  ==================== API 요청 명세 (사용자 정보 조회) ====================
  Method: GET
  URL: http://localhost:8080/api/users/me
  Headers: {
    'Authorization': 'Bearer {accessToken}',
    'Content-Type': 'application/json'
  }
  
  ==================== 예상 응답 명세 ====================
  성공 시 (200 OK):
  {
    "success": true,
    "data": {
      "id": string,
      "username": string,
      "name": string,
      "email": string,
      "phone": string,
      "userType": "individual" | "corporate" | "headquarters" | "branch",
      "companyName": string,
      "isHeadquarters": boolean,
      "parentCompany": string,
      "address": string,
      "detailAddress": string,
      "createdAt": string,
      "lastLoginAt": string
    }
  }
  */

  /*
  ==================== API 요청 명세 (주문 내역 조회) ====================
  Method: GET
  URL: http://localhost:8080/api/orders?page={page}&limit={limit}&status={status}
  Headers: {
    'Authorization': 'Bearer {accessToken}',
    'Content-Type': 'application/json'
  }
  
  ==================== 예상 응답 명세 ====================
  성공 시 (200 OK):
  {
    "success": true,
    "data": {
      "orders": [
        {
          "id": string,
          "orderNumber": string,
          "items": [
            {
              "productId": number,
              "name": string,
              "quantity": number,
              "price": number,
              "image": string
            }
          ],
          "totalAmount": number,
          "status": "pending" | "paid" | "processing" | "shipped" | "delivered" | "cancelled",
          "trackingNumber": string,
          "deliveryAddress": string,
          "createdAt": string,
          "estimatedDelivery": string
        }
      ],
      "pagination": {
        "currentPage": number,
        "totalPages": number,
        "totalItems": number
      }
    }
  }
  */

  useEffect(() => {
    fetchUserInfo();
    fetchOrders();
  }, []);

  const fetchUserInfo = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        // 로컬 스토리지에서 기본 정보 로드
        const type = localStorage.getItem('userType') || 'individual';
        const name = localStorage.getItem('userName') || '홍길동';
        const company = localStorage.getItem('companyName') || '';
        const headquarters = localStorage.getItem('isHeadquarters') === 'true';
        
        setUserType(type);
        setUserName(name);
        setCompanyName(company);
        setIsHeadquarters(headquarters);
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
        // 비로그인 상태에서는 mock 데이터 사용
        setOrders([
          {
            id: 'ORD-2024-001',
            date: '2024.01.20',
            products: ['프리미엄 샤워 필터 SF-100'],
            total: 92000,
            status: '배송완료'
          },
          {
            id: 'ORD-2024-002', 
            date: '2024.01.15',
            products: ['주방용 직수 정수기 KF-200'],
            total: 198000,
            status: '배송중'
          }
        ]);
        setLoading(false);
        return;
      }

      const response = await fetch('http://localhost:8080/api/orders?page=1&limit=10', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        const ordersData = data.data.orders.map((order: any) => ({
          id: order.orderNumber,
          date: new Date(order.createdAt).toLocaleDateString('ko-KR'),
          products: order.items.map((item: any) => item.name),
          total: order.totalAmount,
          status: getStatusText(order.status),
          trackingNumber: order.trackingNumber || '',
          deliveryAddress: order.deliveryAddress || ''
        }));
        setOrders(ordersData);
      } else {
        throw new Error('주문 내역 조회 실패');
      }
    } catch (error) {
      console.error('Orders fetch error:', error);
      // 에러 시 mock 데이터 사용
      setOrders([
        {
          id: 'ORD-2024-001',
          date: '2024.01.20',
          products: ['프리미엄 샤워 필터 SF-100'],
          total: 92000,
          status: '배송완료'
        },
        {
          id: 'ORD-2024-002', 
          date: '2024.01.15',
          products: ['주방용 직수 정수기 KF-200'],
          total: 198000,
          status: '배송중'
        }
      ]);
    } finally {
      setLoading(false);
    }
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
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="orders">주문내역</TabsTrigger>
            <TabsTrigger value="shipping">배송조회</TabsTrigger>
            <TabsTrigger value="profile">회원정보</TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="mt-8">
            <div className="space-y-4">
              {orders.map((order) => (
                <Card key={order.id} className="water-drop">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <span className="font-semibold">{order.id}</span>
                          <Badge variant={order.status === '배송완료' ? 'default' : 'secondary'}>
                            {order.status}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground">{order.products.join(', ')}</p>
                        <p className="text-sm text-muted-foreground">{order.date}</p>
                      </div>
                       <div className="text-right">
                         <p className="text-lg font-bold">{order.total.toLocaleString()}원</p>
                         <div className="flex gap-2 mt-2">
                           <Button variant="outline" size="sm">
                             상세보기
                           </Button>
                           {order.trackingNumber && (
                             <Button 
                               variant="outline" 
                               size="sm"
                               onClick={() => window.open(`https://service.epost.go.kr/trace.RetrieveDomRigiTraceList.comm?sid1=${order.trackingNumber}`, '_blank')}
                             >
                               배송조회
                             </Button>
                           )}
                         </div>
                       </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="shipping" className="mt-8">
            <Card className="water-drop">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="w-5 h-5" />
                  배송조회
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold">ORD-2024-002</span>
                    <Badge variant="secondary">배송중</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">주방용 직수 정수기 KF-200</p>
                  <p className="text-sm">송장번호: 1234567890</p>
                  <Button variant="link" className="p-0 h-auto">배송조회 바로가기</Button>
                </div>
              </CardContent>
            </Card>
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

      <Footer />
    </div>
  );
};

export default MyPage;