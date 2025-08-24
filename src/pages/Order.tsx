import {useEffect, useState} from 'react';
import { useLocation } from 'react-router-dom';
import Header from '@/components/Layout/Header';
import Footer from '@/components/Layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { MapPin, CreditCard, Gift, Coins } from 'lucide-react';
import {apiFetch, getUserInfo} from "@/lib/api.ts";
import { useToast } from '@/hooks/use-toast';


interface UserInfo {
  name: string;
  phone: string;
  email: string;
  address: string;
  detailAddress: string;
  zipCode: string;
}

const Order = () => {
  const location = useLocation();
  const { items, isDirectPurchase } = location.state || { items: [], isDirectPurchase: false };
  const [pointUsage, setPointUsage] = useState(0);
  const [selectedCoupon, setSelectedCoupon] = useState('');
  const [loggedInUser, setLoggedInUser] = useState<UserInfo | null>(null);
  const [paymentMethod, setPaymentMethod] = useState('card'); // 'card', 'bank', 'mobile'
  const [userType, setUserType] = useState<string | null>(null);
  const { toast } = useToast();

  const [orderInfo, setOrderInfo] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    detailAddress: '',
    zipCode: '',
    memo: ''
  });



  useEffect(() => {
    // 사용자 타입을 JWT에서 가져오기
    const userInfo = getUserInfo();
    setUserType(userInfo?.role);
    
    // 사용자 타입에 따라 기본 결제 방법 설정
    if (userInfo?.role === 'individual' || userInfo?.role === 'headquarters') {
      setPaymentMethod('card');
    } else if (userInfo?.role === 'branch') {
      setPaymentMethod('corporate_payment');
    }

    // 페이지가 처음 로드될 때 로그인된 사용자의 정보를 가져옵니다.
    const fetchUserInfo = async () => {
      const userInfo = getUserInfo();
      if (!userInfo?.id) {
        // 로그인 상태가 아니면 아무 작업도 하지 않습니다.
        // 실제로는 로그인 페이지로 보내는 로직을 추가할 수 있습니다.
        console.log("로그인된 사용자가 없습니다.");
        return;
      }
      try {
        // 이전에 만드셨던 컨트롤러의 getRecipientInform 메서드 호출
        // API: GET /api/order/recipient/same/{userId} - Get user shipping info
        const response = await apiFetch(`/api/order/recipient/same/${userInfo.id}`);
        const data = await response.json(); // .json()을 호출해서 실제 데이터를 꺼냅니다.
        setLoggedInUser(data);
      } catch (error) {
        console.error('사용자 정보 조회 실패:', error);
        alert('회원 정보를 불러오는 데 실패했습니다.');
      }
    };

    fetchUserInfo();
  }, []);

  // 사용자 정보 (실제로는 로그인된 사용자 정보에서 가져올 것)
  const userPoints = 15000;
  const userCoupons = [
    { id: 'welcome10', name: '신규가입 10% 할인', discount: 0.1, minOrder: 50000 },
    { id: 'winter20', name: '겨울맞이 20% 할인', discount: 0.2, minOrder: 100000 },
    { id: 'free-shipping', name: '무료배송 쿠폰', discount: 3000, minOrder: 0 }
  ];

  const baseShippingFee = 3000;
  const subtotal = items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
  const shippingFee = subtotal > 0 ? baseShippingFee : 0;
  
  // 쿠폰 할인 계산
  const selectedCouponInfo = userCoupons.find(c => c.id === selectedCoupon);
  let couponDiscount = 0;
  if (selectedCouponInfo) {
    if (selectedCouponInfo.discount < 1) {
      // 퍼센트 할인
      couponDiscount = Math.floor(subtotal * selectedCouponInfo.discount);
    } else {
      // 고정 금액 할인
      couponDiscount = selectedCouponInfo.discount;
    }
  }

  const totalBeforeDiscounts = subtotal + shippingFee;
  const totalAfterCoupon = totalBeforeDiscounts - couponDiscount;
  const finalTotal = Math.max(0, totalAfterCoupon - pointUsage);

  const fillOrdererInfo = () => {
    if (loggedInUser) {
      console.log('주문자와 동일 버튼 클릭됨');
      console.log('API에서 가져온 사용자 정보:', loggedInUser);
      setOrderInfo({
        ...orderInfo, // 기존에 입력된 값 (예: 배송 메모) 유지
        name: loggedInUser.name,
        phone: loggedInUser.phone,
        email: loggedInUser.email,
        address: loggedInUser.address,
        detailAddress: loggedInUser.detailAddress,
        zipCode: loggedInUser.zipCode,
      });
    } else {
      alert("로그인 정보가 없습니다.");
    }
  };

  const openPostcode = () => {
    console.log('우편번호 찾기 버튼 클릭됨');
    if (!(window as any).daum) {
      console.error('Daum Postcode API가 로드되지 않았습니다.');
      alert('우편번호 검색 서비스를 불러오는 중입니다. 잠시 후 다시 시도해주세요.');
      return;
    }
    
    try {
      new (window as any).daum.Postcode({
        oncomplete: function(data: any) {
          console.log('우편번호 검색 완료:', data);
          setOrderInfo({
            ...orderInfo,
            zipCode: data.zonecode,
            address: data.address
          });
        }
      }).open();
    } catch (error) {
      console.error('우편번호 검색 오류:', error);
      alert('우편번호 검색 중 오류가 발생했습니다.');
    }
  };

  const handleOrder = async () => {
    if (!orderInfo.name || !orderInfo.phone || !orderInfo.address) {
      alert('필수 정보를 모두 입력해주세요.');
      return;
    }
    const userInfo = getUserInfo();
    const orderData = {
      userId: userInfo?.id || null, // 로그인된 사용자 ID, 없으면 null
      // 1. OrderReqDto.items -> List<OrderItemDto>
      items: items.map((item: any) => ({
        productId: item.productId || item.id,
        quantity: item.quantity,
        price: item.price * item.quantity,
        perPrice: item.price,
      })),

      // 2. OrderReqDto.shipmentInform -> ShipmentReqDto
      shipmentInform: {
        recipientName: orderInfo.name,
        recipientPhone: orderInfo.phone,
        postNumber: orderInfo.zipCode,
        address: orderInfo.address,
        detailAddress: orderInfo.detailAddress,
        memo: orderInfo.memo,
      },

      // 3. OrderReqDto의 가격 정보 필드들
      totalPrice: finalTotal,          // 최종 결제 금액
      productPrice: subtotal,          // 상품 총액
      couponDiscountPrice: couponDiscount, // 쿠폰 할인액
      pointDiscountPrice: pointUsage,      // 포인트 사용액
      shipmentFee: shippingFee,        // 배송비

      // 4. OrderReqDto의 결제 정보 필드들
      paymentMethod: paymentMethod,

    };

    try {
      const response = await apiFetch('/api/order', {
        method: 'POST',
        body: JSON.stringify(orderData)
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "주문이 완료되었습니다!",
          description: `주문번호: ${data.orderNumber}`,
        });
        
        // 장바구니에서 주문한 경우 장바구니 비우기
        if (!isDirectPurchase) {
          // 장바구니 비우기 API 호출
          try {
            // API: DELETE /api/cart - Clear cart after order
            await apiFetch('/api/cart', { method: 'DELETE' });
          } catch (error) {
            console.error('Cart clear error:', error);
          }
        }
        
        // 주문 완료 페이지로 이동 또는 마이페이지로 리다이렉트
        // navigate('/mypage');
      } else {
        switch (response.status) {
          case 400:
            alert('주문 정보를 확인해주세요.');
            break;
          case 402:
            alert('결제 정보에 오류가 있습니다.');
            break;
          case 409:
            alert('선택하신 상품의 재고가 부족합니다.');
            break;
          default:
            alert(data.message || '주문 처리 중 오류가 발생했습니다.');
        }
      }
    } catch (error) {
      console.error('Order error:', error);
      alert('네트워크 오류가 발생했습니다. 다시 시도해주세요.');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">주문하기</h1>
          <p className="text-lg text-muted-foreground">
            {isDirectPurchase ? '바로구매' : '장바구니'} 상품을 주문합니다
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 주문 정보 입력 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 배송지 정보 */}
            <Card className="water-drop">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    배송지 정보
                  </CardTitle>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={fillOrdererInfo}
                  >
                    주문자와 동일
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="receiver-name" className="text-sm font-medium mb-2 block">받는 분 이름 *</label>
                    <Input 
                      id="receiver-name"
                      name="receiver-name"
                      placeholder="이름을 입력하세요"
                      value={orderInfo.name}
                      onChange={(e) => setOrderInfo({...orderInfo, name: e.target.value})}
                      tabIndex={1}
                      autoComplete="name"
                    />
                  </div>
                  <div>
                    <label htmlFor="receiver-phone" className="text-sm font-medium mb-2 block">연락처 *</label>
                    <Input 
                      id="receiver-phone"
                      placeholder="010-0000-0000"
                      value={orderInfo.phone}
                      onChange={(e) => setOrderInfo({...orderInfo, phone: e.target.value})}
                      tabIndex={2}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="zipcode" className="text-sm font-medium mb-2 block">우편번호</label>
                    <div className="flex gap-2">
                      <Input 
                        id="zipcode"
                        placeholder="00000"
                        value={orderInfo.zipCode}
                        onChange={(e) => setOrderInfo({...orderInfo, zipCode: e.target.value})}
                        tabIndex={4}
                      />
                      <Button 
                        variant="outline" 
                        onClick={openPostcode} 
                        tabIndex={5}
                        type="button"
                        className="shrink-0"
                        onMouseDown={(e) => e.preventDefault()}
                      >
                        찾기
                      </Button>
                    </div>
                  </div>
                </div>

                <div>
                  <label htmlFor="address" className="text-sm font-medium mb-2 block">주소 *</label>
                  <Input 
                    id="address"
                    placeholder="주소를 입력하세요"
                    value={orderInfo.address}
                    onChange={(e) => setOrderInfo({...orderInfo, address: e.target.value})}
                    tabIndex={6}
                  />
                </div>

                <div>
                  <label htmlFor="detail-address" className="text-sm font-medium mb-2 block">상세주소</label>
                  <Input 
                    id="detail-address"
                    placeholder="상세주소를 입력하세요"
                    value={orderInfo.detailAddress}
                    onChange={(e) => setOrderInfo({...orderInfo, detailAddress: e.target.value})}
                    tabIndex={7}
                  />
                </div>

                <div>
                  <label htmlFor="delivery-memo" className="text-sm font-medium mb-2 block">배송 메모</label>
                  <Textarea 
                    id="delivery-memo"
                    placeholder="배송 시 요청사항을 입력하세요"
                    value={orderInfo.memo}
                    onChange={(e) => setOrderInfo({...orderInfo, memo: e.target.value})}
                    tabIndex={8}
                  />
                </div>
              </CardContent>
            </Card>

            {/* 할인 혜택 */}
            <Card className="water-drop">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gift className="w-5 h-5" />
                  할인 혜택
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* 포인트 사용 */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <Coins className="w-4 h-4" />
                      포인트 사용
                    </label>
                    <span className="text-sm text-muted-foreground">
                      보유: {userPoints.toLocaleString()}P
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Input 
                      type="number"
                      placeholder="사용할 포인트"
                      value={pointUsage}
                      onChange={(e) => {
                        const value = Math.min(parseInt(e.target.value) || 0, userPoints, totalAfterCoupon);
                        setPointUsage(value);
                      }}
                      max={Math.min(userPoints, totalAfterCoupon)}
                    />
                    <Button 
                      variant="outline"
                      onClick={() => setPointUsage(Math.min(userPoints, totalAfterCoupon))}
                    >
                      전액사용
                    </Button>
                  </div>
                </div>

                {/* 쿠폰 선택 */}
                <div>
                  <label className="text-sm font-medium mb-3 block">쿠폰 선택</label>
                  <Select value={selectedCoupon || "none"} onValueChange={(value) => setSelectedCoupon(value === "none" ? "" : value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="쿠폰을 선택하세요" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">쿠폰 사용 안함</SelectItem>
                      {userCoupons.map((coupon) => (
                        <SelectItem 
                          key={coupon.id}
                          value={coupon.id}
                          disabled={subtotal < coupon.minOrder}
                        >
                          <div className="flex items-center gap-2">
                            {coupon.name}
                            {subtotal < coupon.minOrder && (
                              <Badge variant="secondary" className="text-xs">
                                {coupon.minOrder.toLocaleString()}원 이상
                              </Badge>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 주문 요약 */}
          <div>
            <Card className="water-drop sticky top-4">
              <CardHeader>
                <CardTitle>주문 요약</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* 주문 상품 */}
                <div>
                  <h4 className="font-semibold mb-3">주문 상품</h4>
                  <div className="space-y-2">
                    {items.map((item: any, index: number) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span>{item.name} x{item.quantity}</span>
                        <span>{(item.price * item.quantity).toLocaleString()}원</span>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* 가격 계산 */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>상품 금액</span>
                    <span>{subtotal.toLocaleString()}원</span>
                  </div>
                  <div className="flex justify-between">
                    <span>배송비</span>
                    <span>{shippingFee.toLocaleString()}원</span>
                  </div>
                  {couponDiscount > 0 && (
                    <div className="flex justify-between text-red-600">
                      <span>쿠폰 할인</span>
                      <span>-{couponDiscount.toLocaleString()}원</span>
                    </div>
                  )}
                  {pointUsage > 0 && (
                    <div className="flex justify-between text-blue-600">
                      <span>포인트 사용</span>
                      <span>-{pointUsage.toLocaleString()}P</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between font-bold text-lg">
                    <span>총 결제금액</span>
                    <span className="text-primary">{finalTotal.toLocaleString()}원</span>
                  </div>
                </div>

                 결제 수단
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <CreditCard className="w-4 h-4" />
                    결제 수단
                  </h4>
                  <div className="space-y-2">
                    {/* 개인 회원, 본사: 신용카드, 계좌이체 */}
                    {(userType === 'individual' || userType === 'headquarters') && (
                      <>
                        <div
                          className="flex items-center space-x-2 cursor-pointer"
                          onClick={() => setPaymentMethod('card')}
                        >
                          <Checkbox 
                            id="card" 
                            checked={paymentMethod === 'card'}
                            onCheckedChange={(checked) => checked && setPaymentMethod('card')}
                          />
                          <label htmlFor="card" className="text-sm cursor-pointer">신용카드</label>
                        </div>
                        <div
                          className="flex items-center space-x-2 cursor-pointer"
                          onClick={() => setPaymentMethod('bank_transfer')}
                        >
                          <Checkbox 
                            id="bank-transfer" 
                            checked={paymentMethod === 'bank_transfer'}
                            onCheckedChange={(checked) => checked && setPaymentMethod('bank_transfer')}
                          />
                          <label htmlFor="bank-transfer" className="text-sm cursor-pointer">계좌이체</label>
                        </div>
                      </>
                    )}

                    {/* 법인 지점: 법인결제만 */}
                    {userType === 'branch' && (
                      <div
                        className="flex items-center space-x-2 cursor-pointer"
                        onClick={() => setPaymentMethod('corporate_payment')}
                      >
                        <Checkbox 
                          id="corporate" 
                          checked={paymentMethod === 'corporate_payment'}
                          onCheckedChange={(checked) => checked && setPaymentMethod('corporate_payment')}
                        />
                        <label htmlFor="corporate" className="text-sm cursor-pointer">법인결제</label>
                      </div>
                    )}
                  </div>
                </div>


                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      className="w-full water-drop"
                      disabled={finalTotal <= 0}
                    >
                      {finalTotal.toLocaleString()}원 결제하기
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>주문 확인</AlertDialogTitle>
                      <AlertDialogDescription>
                        정말 주문하시겠습니까?
                        <div className="mt-4 p-4 bg-secondary rounded-lg space-y-2">
                          <div className="flex justify-between">
                            <span>최종 결제금액:</span>
                            <span className="font-bold text-primary">{finalTotal.toLocaleString()}원</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>배송지:</span>
                            <span>{orderInfo.address + orderInfo.detailAddress || '배송지를 입력해주세요'}</span>
                          </div>
                        </div>
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>취소</AlertDialogCancel>
                      <AlertDialogAction onClick={handleOrder}>
                        주문하기
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Order;