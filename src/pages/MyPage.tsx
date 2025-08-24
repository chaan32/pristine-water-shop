import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Layout/Header';
import Footer from '@/components/Layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import RefundExchangeForm from '@/components/Support/RefundExchangeForm';
import HeadquartersDashboard from '@/components/Corporate/HeadquartersDashboard';
import OrderDetailModal from '@/components/MyPage/OrderDetailModal';
import { userApi, getAccessToken, clearTokens } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import InquiriesTab from '@/components/MyPage/InquiriesTab';
import ReviewModal from '@/components/MyPage/ReviewModal';
import { User, Package, Settings, Truck, Crown, Building2, Search, Lock, MessageSquare } from 'lucide-react';
import ReAuthDialog from '@/components/MyPage/ReAuthDialog';
import PasswordChangeDialog from '@/components/MyPage/PasswordChangeDialog';

const MyPage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState<any>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isOrderDetailOpen, setIsOrderDetailOpen] = useState(false);
  const [isReAuthOpen, setIsReAuthOpen] = useState(false);
  const [isPasswordChangeOpen, setIsPasswordChangeOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedProductForReview, setSelectedProductForReview] = useState(null);
  const [selectedOrderName, setSelectedOrderName] = useState('');



  useEffect(() => {
    fetchUserInfo();
    fetchOrders();
  }, []);

  const fetchUserInfo = async () => {
    try {
    const token = getAccessToken();
      if (!token) {
        return;
      }

      // API: GET /api/users/me
      const response = await userApi.getMe();

      if (response.ok) {
        const result = await response.json();
        console.log('User data:', result);

        if (result.data) {
          setUserInfo(result.data);
          setEditForm(result.data);
        }
      } else {
        throw new Error('사용자 정보 조회 실패');
      }
    } catch (error) {
      console.error('User info fetch error:', error);
      toast({
        title: "오류",
        description: "사용자 정보를 불러오는데 실패했습니다.",
        variant: "destructive",
      });
    }
  };

  const fetchOrders = async () => {
    try {
      const token = getAccessToken();
      if (!token) {
        alert("로그인이 필요합니다.");
        return;
      }

      // API: GET /api/users/orders?page=1&limit=10
      const response = await userApi.getOrders(1, 10);

      if (response.ok) {
        const result = await response.json();
        console.log('API Response:', result);

        if (result.data && Array.isArray(result.data)) {
          // ✅ API 응답 데이터를 매핑하는 이 부분을 수정합니다.
          const ordersData = result.data.map((order: any) => ({
            id: order.orderName,
            date: new Date(order.createdAt).toLocaleDateString('ko-KR'),
            products: order.products,
            total: order.price,
            status: getShipmentStatusText(order.shipmentStatus),
            paymentStatus: order.paymentStatus,
            trackingNumber: order.trackingNumber || '',
            deliveryAddress: '',
            // 상세정보용 데이터 추가
            orderName: order.orderName,
            createdAt: new Date(order.createdAt).toLocaleDateString('ko-KR'),
            price: order.price,
            shipmentStatus: order.shipmentStatus,
            shipmentFee: order.shipmentFee || 0, // << 이 줄을 추가해주세요!
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
  const getPaymentStatusText = (status: string) =>{
    const statusMap: { [key: string]: string } = {
      'PENDING': '결제 대기',
      'PAID': '결제 완료',
      'UNPAID': '결제 실패',
      'REFUNDED': '환불 완료'
    };
    return statusMap[status] || status;
  }
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

  const getShipmentStatusVariant = (status: string) => {
    const variantMap: { [key: string]: 'default' | 'secondary' | 'outline' | 'preparing' } = {
      'PENDING': 'outline',
      'PREPARING': 'preparing',
      'PROCESSING': 'secondary',
      'SHIPPED': 'default',
      'DELIVERED': 'default',
      'CANCELLED': 'outline'
    };
    return variantMap[status] || 'secondary';
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
    if (!userInfo) return '회원';

    switch (userInfo.userType) {
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
    if (!userInfo) return '';

    if (userInfo.userType === 'branch' && userInfo.parentCompany && userInfo.companyName) {
      return `${userInfo.parentCompany} (${userInfo.companyName})`;
    }
    return userInfo.companyName || '';
  };

  const handleOrderDetailClick = (order: any) => {
    setSelectedOrder(order);
    setIsOrderDetailOpen(true);
  };

  const handleReviewClick = (product: any, orderName: string) => {
    setSelectedProductForReview(product);
    setSelectedOrderName(orderName);
    setIsReviewModalOpen(true);
  };

  const handleReviewSubmitted = () => {
    fetchOrders();
  };

  // 주소 검색 함수
  const handleAddressSearch = () => {
    new (window as any).daum.Postcode({
      oncomplete: function(data: any) {
        let addr = '';
        if (data.userSelectedType === 'R') {
          addr = data.roadAddress;
        } else {
          addr = data.jibunAddress;
        }
        setEditForm((prev: any) => ({
          ...prev,
          address: addr,
          postalNumber: data.zonecode
        }));
      }
    }).open();
  };
  const handlePasswordChangeClick = () => {
    setIsReAuthOpen(true);
  };

  const handleReAuthSuccess = () => {
    setIsReAuthOpen(true); // 재인증 성공 시 비밀번호 변경 창 열기
    setIsPasswordChangeOpen(true);
  };

  const handlePasswordChangeSuccess = () => {
    // 비밀번호 변경 성공시 로그아웃
    clearTokens();
    toast({
      title: "비밀번호 변경 완료",
      description: "보안을 위해 로그아웃됩니다. 다시 로그인해주세요.",
    });
    setTimeout(() => {
      navigate('/login');
    }, 2000);
  };
  // 폼 입력 핸들러
  const handleFormChange = (field: string, value: string) => {
    setEditForm((prev: any) => ({
      ...prev,
      [field]: value
    }));
  };

  // 정보 수정 제출 (중앙화 API)
  const handleUpdateInfo = async () => {
    try {
      // API: PUT /api/users/me
      const response = await userApi.updateMe(editForm);

      if (response.ok) {
        toast({
          title: "성공",
          description: "회원 정보가 수정되었습니다.",
        });
      } else {
        throw new Error('정보 수정 실패');
      }
    } catch (error) {
      console.error('Update error:', error);
      toast({
        title: "오류",
        description: "정보 수정 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    }
  };

  return (
      <div className="min-h-screen bg-background">
        <Header />

        <main className="container mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              {userInfo?.userType === 'branch' && <Building2 className="w-6 h-6 text-blue-500" />}
              <h1 className="text-4xl font-bold text-foreground">마이페이지</h1>
            </div>
            <p className="text-lg text-muted-foreground">
              {userInfo ? `${userInfo.name} (${getUserTypeText()})` : '사용자 정보 로딩 중...'}
              {getDisplayName() && ` - ${getDisplayName()}`}
            </p>
          </div>

          <Tabs defaultValue="orders" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="orders">주문내역</TabsTrigger>
              <TabsTrigger value="inquiries">문의내역</TabsTrigger>
              <TabsTrigger value="info">회원정보</TabsTrigger>
            </TabsList>

            <TabsContent value="info" className="mt-8">
              <Card className="water-drop">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    회원정보 수정
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {userInfo && editForm ? (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium mb-2 block">로그인 아이디</label>
                          <input
                            className="w-full p-2 border rounded bg-gray-50 text-gray-600"
                            value={editForm.userLoginId || ''}
                            readOnly
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-2 block">이름</label>
                          <input
                            className="w-full p-2 border rounded bg-gray-50 text-gray-600"
                            value={editForm.name || ''}
                            readOnly
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-2 block">회원 유형</label>
                          <input
                            className="w-full p-2 border rounded bg-gray-50 text-gray-600"
                            value={getUserTypeText()}
                            readOnly
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-2 block">비밀번호</label>
                          <div className="flex gap-2">
                            <input 
                              className="flex-1 p-2 border rounded bg-gray-50 text-gray-600" 
                              value="••••••••" 
                              readOnly 
                            />
                            <Button 
                              onClick={handlePasswordChangeClick} 
                              variant="outline" 
                              className="px-3"
                            >
                              <Lock className="w-4 h-4 mr-1" />
                              변경
                            </Button>
                          </div>
                        </div>

                        {editForm.companyName && (
                          <div>
                            <label className="text-sm font-medium mb-2 block">
                              {editForm.userType === 'branch' ? '지점명' : '회사명'}
                            </label>
                            <input
                              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                              value={editForm.companyName || ''}
                              onChange={(e) => handleFormChange('companyName', e.target.value)}
                            />
                          </div>
                        )}
                        {editForm.parentCompany && (
                          <div>
                            <label className="text-sm font-medium mb-2 block">소속 본사</label>
                            <input
                              className="w-full p-2 border rounded bg-gray-50 text-gray-600"
                              value={editForm.parentCompany || ''}
                              readOnly
                            />
                          </div>
                        )}
                        {editForm.userType === 'headquarters' && (
                          <div>
                            <label className="text-sm font-medium mb-2 block">본사 여부</label>
                            <input
                              className="w-full p-2 border rounded bg-gray-50 text-gray-600"
                              value={editForm.headquarters ? '본사' : '일반 회원'}
                              readOnly
                            />
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium mb-2 block">이메일</label>
                          <input
                            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                            value={editForm.email || ''}
                            type="email"
                            onChange={(e) => handleFormChange('email', e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-2 block">전화번호</label>
                          <input
                            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                            value={editForm.phone || ''}
                            type="tel"
                            onChange={(e) => handleFormChange('phone', e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-2 block">우편번호</label>
                          <div className="flex gap-2">
                            <input
                              className="flex-1 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                              value={editForm.postalNumber || ''}
                              placeholder="우편번호"
                              readOnly
                            />
                            <Button
                              type="button"
                              variant="outline"
                              onClick={handleAddressSearch}
                              className="px-3"
                            >
                              <Search className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-2 block">주소</label>
                          <input
                            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                            value={editForm.address || ''}
                            placeholder="주소"
                            readOnly
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="text-sm font-medium mb-2 block">상세주소</label>
                          <input
                            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                            value={editForm.detailAddress || ''}
                            placeholder="상세주소"
                            onChange={(e) => handleFormChange('detailAddress', e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="flex justify-center pt-4">
                        <Button onClick={handleUpdateInfo} className="px-8">
                          정보 수정
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <p>사용자 정보를 불러오는 중...</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

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
                          <div className="md:col-span-4 flex flex-wrap gap-1">
                            <p className="text-sm font-medium">
                              {typeof order.products === 'string' ? order.products : order.products?.join(', ')}
                            </p>
                          </div>
                          <div className="md:col-span-2 flex flex-col gap-2">
                            <Badge 
                              variant={order.paymentStatus === 'PAID' ? 'default' : 'outline'}
                              className="w-fit"
                            >
                              {getPaymentStatusText(order.paymentStatus)}
                            </Badge>
                            <Badge 
                              variant={getShipmentStatusVariant(order.shipmentStatus)}
                              className="w-fit"
                            >
                              {order.status}
                            </Badge>
                          </div>
                          <div className="md:col-span-2">
                            <p className="text-sm font-bold">{order.total?.toLocaleString()}원</p>
                          </div>
                          <div className="md:col-span-1 flex flex-col gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full text-xs"
                              onClick={() => handleOrderDetailClick(order)}
                            >
                              상세보기
                            </Button>
                            {order.trackingNumber && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full text-xs"
                                onClick={() => window.open(`https://service.epost.go.kr/trace.RetrieveDomRigiTraceList.comm?sid1=${order.trackingNumber}`, '_blank')}
                              >
                                배송추적
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



            <TabsContent value="inquiries" className="space-y-4">
              <InquiriesTab />
            </TabsContent>
          </Tabs>
        </main>

        <OrderDetailModal
          isOpen={isOrderDetailOpen}
          onClose={() => setIsOrderDetailOpen(false)}
          order={selectedOrder}
          onReviewClick={handleReviewClick}
        />

        <ReAuthDialog
          isOpen={isReAuthOpen}
          onClose={() => setIsReAuthOpen(false)}
          onSuccess={handleReAuthSuccess}
          userLoginId={userInfo?.userLoginId || ''}
        />

        <PasswordChangeDialog
          isOpen={isPasswordChangeOpen}
          onClose={() => setIsPasswordChangeOpen(false)}
          onSuccess={handlePasswordChangeSuccess}
        />

        <ReviewModal
          isOpen={isReviewModalOpen}
          onClose={() => setIsReviewModalOpen(false)}
          product={selectedProductForReview}
          orderName={selectedOrderName}
          onReviewSubmitted={handleReviewSubmitted}
        />

        <Footer />
      </div>
  );
};

export default MyPage;