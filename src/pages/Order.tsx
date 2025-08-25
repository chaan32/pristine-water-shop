import { useEffect, useState} from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
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

declare global {
  interface Window {
    AUTHNICE?: any;
    NICEPAY?: any;
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
  const [currentUser, setCurrentUser] = useState<any>(null); // 현재 로그인한 사용자 정보
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

  const [isLoading, setIsLoading] = useState(false);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false); // 스크립트 로딩 상태 추가
  useEffect(() => {
    const script = document.createElement('script');
    script.src = "https://pay.nicepay.co.kr/v1/js/";
    script.async = true;

    // 스크립트 로딩이 성공했을 때 실행될 함수
    script.onload = () => {
      console.log("✅ 스크립트 로딩 완료");
      console.log("window.AUTHNICE:", window.AUTHNICE);
      setIsScriptLoaded(true);
    };

    // 스크립트 로딩이 실패했을 때 실행될 함수
    script.onerror = () => {
      console.error("❌ 나이스페이먼츠 스크립트 로딩 실패.");
      toast({
        title: "오류",
        description: "결제 모듈 로딩에 실패했습니다. 새로고침 후 다시 시도해주세요.",
        variant: "destructive"
      });
    };

    document.body.appendChild(script);

    // 컴포넌트가 사라질 때 스크립트를 정리합니다. (메모리 누수 방지)
    return () => {
      document.body.removeChild(script);
    };
  }, []); // 빈 배열을 전달하여 컴포넌트가 처음 마운트될 때 한 번만 실행되도록 합니다.
  useEffect(() => {
    console.log("📦 주문 페이지로 전달된 상품 목록:", items);
    if (!items || items.length === 0) {
      console.error("🚨 주문할 상품이 없습니다! 장바구니 페이지에서 다시 시도해주세요.");
    }
  }, [items]);

  useEffect(() => {
    // 현재 로그인한 사용자 정보 가져오기
    const userInfo = getUserInfo();
    console.log("현재 로그인한 사용자 정보:", userInfo);

    if (!userInfo?.id) {
      console.error("로그인 정보가 없습니다. 로그인이 필요합니다.");
      toast({
        title: "로그인 필요",
        description: "로그인 후 이용해주세요.",
        variant: "destructive"
      });
      // navigate('/login'); // 로그인 페이지로 리디렉션
      return;
    }

    setCurrentUser(userInfo);
    setUserType(userInfo.role);

    // 사용자 타입에 따라 기본 결제 방법 설정
    if (userInfo.role === 'individual' || userInfo.role === 'headquarters') {
      setPaymentMethod('card');
    } else if (userInfo.role === 'branch') {
      setPaymentMethod('corporate_payment');
    }

    // 배송지 정보 자동 로드
    fetchUserShippingInfo(userInfo.id);
  }, []);

  // 사용자 배송지 정보 가져오는 함수 분리
  const fetchUserShippingInfo = async (userId: number) => {
    try {
      console.log(`사용자 배송지 정보 조회 요청: userId=${userId}`);
      const response = await apiFetch(`/api/order/recipient/same/${userId}`);

      if (!response.ok) {
        console.error(`API 요청 실패: ${response.status} ${response.statusText}`);
        throw new Error(`API 요청 실패: ${response.status}`);
      }

      const result = await response.json();
      console.log("API 응답 결과:", result);

      if (result) {
        const normalized = {
          name: result.name ?? result.recipientName ?? result.username ?? result.memberName ?? '',
          phone: result.phone ?? result.recipientPhone ?? result.phoneNumber ?? result.memberPhone ?? '',
          email: result.email ?? result.memberEmail ?? '',
          address: result.address ?? result.recipientAddress ?? '',
          detailAddress: result.detailAddress ?? result.recipientDetailAddress ?? '',
          zipCode: result.zipCode ?? result.postNumber ?? result.postCode ?? result.zip ?? '',
        };
        console.log("정규화된 배송지 정보:", normalized);
        setLoggedInUser(normalized);
        console.log("사용자 배송지 정보 설정 완료 (정규화 적용):", normalized);
      } else {
        console.warn("사용자 배송지 정보가 없거나 조회에 실패했습니다:", result);
        setLoggedInUser(null); // 명시적으로 null 설정
        toast({
          title: "알림",
          description: "등록된 배송지 정보가 없습니다. 직접 입력해주세요.",
          variant: "default"
        });
      }
    } catch (error) {
      console.error('사용자 배송지 정보 조회 실패:', error);
      setLoggedInUser(null); // 에러 발생 시 null 설정
      toast({
        title: "오류",
        description: "배송지 정보를 불러오는데 실패했습니다.",
        variant: "destructive"
      });
    }
  };

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
    console.log('주문자와 동일 버튼 클릭됨');
    console.log('현재 로그인한 사용자:', currentUser);
    console.log('API에서 가져온 배송지 정보:', loggedInUser);

    if (!currentUser) {
      toast({
        title: "오류",
        description: "로그인 정보가 없습니다. 다시 로그인해주세요.",
        variant: "destructive"
      });
      return;
    }

    if (loggedInUser) {
      // API에서 가져온 배송지 정보가 있는 경우
      const newOrderInfo = {
        name: loggedInUser.name || '',
        phone: loggedInUser.phone || '',
        email: loggedInUser.email || '',
        address: loggedInUser.address || '',
        detailAddress: loggedInUser.detailAddress || '',
        zipCode: loggedInUser.zipCode || '',
        memo: orderInfo.memo // 기존 메모는 유지
      };
      
      console.log('새로 설정할 주문 정보:', newOrderInfo);
      setOrderInfo(newOrderInfo);

      toast({
        title: "완료",
        description: "배송지 정보가 입력되었습니다.",
        variant: "default"
      });
    } else {
      // API에서 배송지 정보를 가져오지 못한 경우, 현재 사용자 정보로 대체
      const newOrderInfo = {
        name: currentUser.name || '',
        phone: currentUser.phone || '',
        email: currentUser.email || '',
        address: '',
        detailAddress: '',
        zipCode: '',
        memo: orderInfo.memo // 기존 메모는 유지
      };
      
      console.log('기본 정보로 설정할 주문 정보:', newOrderInfo);
      setOrderInfo(newOrderInfo);

      toast({
        title: "알림",
        description: "기본 정보만 입력되었습니다. 주소를 직접 입력해주세요.",
        variant: "default"
      });
    }
  };

  const openPostcode = () => {
    console.log('우편번호 찾기 버튼 클릭됨');
    if (!(window as any).daum) {
      console.error('Daum Postcode API가 로드되지 않았습니다.');
      toast({
        title: "오류",
        description: "우편번호 검색 서비스를 불러오는 중입니다. 잠시 후 다시 시도해주세요.",
        variant: "destructive"
      });
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
      toast({
        title: "오류",
        description: "우편번호 검색 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    }
  };

  const handleOrder = async () => {
    if (!orderInfo.name || !orderInfo.phone || !orderInfo.address) {
      toast({
        title: "정보 입력 오류",
        description: "필수 정보를 모두 입력해주세요.",
        variant: 'destructive'
      });
      return;
    }

    if (!currentUser?.id) {
      toast({
        title: "오류",
        description: "로그인 정보가 없습니다. 다시 로그인해주세요.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    const orderData = {
      userId: currentUser.id,
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

      const data = await response.json();

      console.log("🚀 /api/order API 응답:", data);
      if (response.ok && data.success) {
        const responseData = data;

        if (paymentMethod === 'corporate_payment') {
          toast({
            title: "주문이 완료되었습니다!",
            description: `법인 결제 신청이 접수되었습니다. 주문번호: ${responseData.orderNumber}`,
          });
          if (!isDirectPurchase) {
            await apiFetch('/api/cart', { method: 'DELETE' });
          }
          // navigate('/mypage');
        } else {
          const createdOrderId = responseData.orderId;
          await handlePaymentRequest(createdOrderId);
        }
      } else {
        toast({
          title: "주문 실패",
          description: data.message || '주문 처리 중 오류가 발생했습니다.',
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Order error:', error);
      toast({
        title: "네트워크 오류",
        description: '네트워크 오류가 발생했습니다. 다시 시도해주세요.',
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 나이스페이먼츠 결제 요청 함수
  const handlePaymentRequest = async (createdOrderId: number) => {
    setIsLoading(true);
    try {
      const response = await apiFetch(`/api/payments/prepare?orderId=${createdOrderId}`, {
        method: 'POST',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '결제 준비에 실패했습니다.');
      }

      const result = await response.json();
      const prepData = result.data;

      if (!isScriptLoaded || !!window.AUTHNICE) {
        toast({
          title: "오류",
          description: "결제 모듈이 준비되지 않았습니다. 새로고침 후 다시 시도해주세요.",
          variant: "destructive",
        });
        return;
      }


      window.AUTHNICE.requestPay({
        clientId: "58e3b578555e45738d6b569e53d5ae54",
        method: paymentMethod === "bank_transfer" ? "bank" : "card",
        orderId: prepData.orderId,
        amount: prepData.amount,
        goodsName: items.length > 1 ? `${items[0].name} 외 ${items.length - 1}건` : items[0].name,
        returnUrl: `${window.location.origin}/payment/result`,
        fnError: (result: any) => {
          console.error("결제 오류:", result);
          toast({
            title: "결제 실패",
            description: result.msg || "결제 중 오류가 발생했습니다.",
            variant: "destructive",
          });
        },
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
                        disabled={!currentUser}
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

                  <div>
                    <label htmlFor="receiver-email" className="text-sm font-medium mb-2 block">이메일</label>
                    <Input
                        id="receiver-email"
                        type="email"
                        placeholder="example@email.com"
                        value={orderInfo.email}
                        onChange={(e) => setOrderInfo({...orderInfo, email: e.target.value})}
                        tabIndex={3}
                    />
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

                  {/* 결제 수단 */}
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
                          disabled={finalTotal <= 0 || isLoading || !currentUser || !isScriptLoaded} // 👈 !isScriptLoaded 추가
                      >
                        {isLoading
                            ? '처리 중...'
                            : !isScriptLoaded
                                ? '결제 모듈 로딩 중...'
                                : `${finalTotal.toLocaleString()}원 결제하기`}
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