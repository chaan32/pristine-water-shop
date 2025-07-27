import Header from '@/components/Layout/Header';
import Footer from '@/components/Layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User, Package, Heart, Settings, Truck } from 'lucide-react';
import RefundExchangeForm from '@/components/Support/RefundExchangeForm';

const MyPage = () => {
  const orders = [
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
  ];

  const wishlist = [
    {
      id: 1,
      name: '산업용 대용량 필터 IF-1000',
      price: 450000,
      image: '/placeholder.svg'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">마이페이지</h1>
          <p className="text-lg text-muted-foreground">홍길동님 (개인회원)</p>
        </div>

        <Tabs defaultValue="orders" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="orders">주문내역</TabsTrigger>
            <TabsTrigger value="shipping">배송조회</TabsTrigger>
            <TabsTrigger value="wishlist">위시리스트</TabsTrigger>
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
                          <RefundExchangeForm order={order} />
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

          <TabsContent value="wishlist" className="mt-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {wishlist.map((item) => (
                <Card key={item.id} className="water-drop">
                  <CardContent className="p-6">
                    <img src={item.image} alt={item.name} className="w-full aspect-square object-cover rounded mb-4" />
                    <h3 className="font-semibold mb-2">{item.name}</h3>
                    <p className="text-primary font-bold mb-4">{item.price.toLocaleString()}원</p>
                    <div className="flex gap-2">
                      <Button size="sm" className="flex-1">장바구니</Button>
                      <Button variant="outline" size="sm">
                        <Heart className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
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
                    <input className="w-full p-2 border rounded" value="홍길동" readOnly />
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