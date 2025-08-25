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
import { useLocation, useNavigate } from 'react-router-dom'; // useNavigate 추가

declare global {
  interface Window {
    nicepay: any;
  }
}

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
  const navigate = useNavigate();
  const initialItems = location.state?.items || JSON.parse(sessionStorage.getItem('orderItems') || '[]');
  const isDirectPurchase = location.state?.isDirectPurchase || false;
  const [items, setItems] = useState(initialItems);
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

  const [isLoading, setIsLoading] = useState(false); // 로딩 상태 추가


  useEffect(() => {
    console.log("📦 주문 페이지로 전달된 상품 목록:", items);
    if (!items || items.length === 0) {
      console.error("🚨 주문할 상품이 없습니다! 장바구니 페이지에서 다시 시도해주세요.");
    }
  }, [items]);

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
        const result = await response.json();
        if (result.success) {
          setLoggedInUser(result.data); // result.data로 실제 사용자 정보에 접근
        }
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
      toast({
        title: "정보 입력 오류", description: `필수 정보를 모두 입력해주세요.`, variant: 'warning'
      });
      return;
    }

    setIsLoading(true); // 로딩 시작
    const userInfo = getUserInfo();
    const orderData = {
      userId: userInfo?.id || null,
      items: items.map((item: any) => ({
        productId: item.productId || item.id,
        quantity: item.quantity,
        price: item.price * item.quantity,
        perPrice: item.price,
      })),
      shipmentInform: {
        recipientName: orderInfo.name,
        recipientPhone: orderInfo.phone,
        postNumber: orderInfo.zipCode,
        address: orderInfo.address,
        detailAddress: orderInfo.detailAddress,
        memo: orderInfo.memo,
      },
      totalPrice: finalTotal,
      productPrice: subtotal,
      couponDiscountPrice: couponDiscount,
      pointDiscountPrice: pointUsage,
      shipmentFee: shippingFee,
      paymentMethod: paymentMethod,
    };
    console.log("🚀 /api/order API 요청으로 전송할 데이터:", JSON.stringify(orderData, null, 2));

    try {
      const response = await apiFetch('/api/order', {
        method: 'POST',
        body: JSON.stringify(orderData)
      });

      const data = await response.json(); // data -> result로 이름 변경하여 혼동 방지

      if (response.ok && data.success) {
        // 백엔드 응답 구조에 맞게 실제 데이터 객체에 접근합니다.
        const responseData = data.data;

        if (paymentMethod === 'corporate_payment') {
          // 법인 결제는 여기서 완료 처리하는 것이 맞습니다.
          toast({
            title: "주문이 완료되었습니다!",
            description: `법인 결제 신청이 접수되었습니다. 주문번호: ${responseData.orderNumber}`,
          });
          if (!isDirectPurchase) {
            await apiFetch('/api/cart', { method: 'DELETE' });
          }
          // navigate('/mypage'); // 주문 완료 후 페이지 이동 (useNavigate 필요)
        } else {
          // PG 결제는 주문 ID로 결제창만 띄워주고 끝냅니다.
          // 결제 성공 후 처리는 이 파일이 아닌 /payment/result 페이지에서 담당해야 합니다.
          const createdOrderId = responseData.orderId;
          await handlePaymentRequest(createdOrderId);
        }
      } else {
        alert(data.message || '주문 처리 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('Order error:', error);
      alert('네트워크 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false); // 모든 경우에 로딩 상태를 해제
    }
  };

  //  나이스페이먼츠 결제 요청 함수 (신규 추가)
  const handlePaymentRequest = async (createdOrderId: number) => {
    setIsLoading(true);
    try {
      // 1. 백엔드에 결제 준비를 요청하여 서명(Signature) 등 필수 정보를 받습니다.
      const response = await apiFetch(`/api/payments/prepare?orderId=${createdOrderId}`, {
        method: 'POST',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '결제 준비에 실패했습니다.');
      }

      const result = await response.json();
      const prepData = result.data;

      // 2. 받은 정보로 나이스페이먼츠 결제창을 호출합니다.
      window.nicepay.requestPay({
        PayMethod: paymentMethod === 'bank_transfer' ? 'BANK' : 'CARD',
        GoodsName: items.length > 1 ? `${items[0].name} 외 ${items.length - 1}건` : items[0].name,
        Amt: prepData.amount,
        MID: prepData.mid,
        Moid: prepData.orderId, // 백엔드에서 받은 주문번호
        BuyerEmail: orderInfo.email,
        BuyerName: orderInfo.name,
        BuyerTel: orderInfo.phone,
        EdiDate: prepData.editDate,
        SignData: prepData.signature,
        ReturnURL: `http://localhost:8081/payment/result`, // 성공/실패 시 모두 이 URL로 이동
        FailURL: `http://localhost:8081/payment/result`,
      });

    } catch (error) {
      console.error('결제 처리 중 오류 발생:', error);
      toast({
        title: "결제 오류",
        description: "결제 처리 중 오류가 발생했습니다. 다시 시도해주세요.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
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
                        disabled={finalTotal <= 0 || isLoading} // isLoading 추가
                    >
                      {isLoading ? '처리 중...' : `${finalTotal.toLocaleString()}원 결제하기`}
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
                      <AlertDialogAction onClick={handleOrder} disabled={isLoading}>
                        {isLoading ? '주문 처리 중...' : '주문하기'}
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