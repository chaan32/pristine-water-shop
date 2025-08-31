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

interface UserInfo {
  name: string;
  phone: string;
  email: string;
  address: string;
  detailAddress: string;
  zipCode: string;
}
interface PreOrderResponse {
  orderId: string;
  amount: number;
  method: string;
  goodsName: string;
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
  const [isUserLoading, setIsUserLoading] = useState(true);
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
    const fetchInitialData = async () => {
      try {
        // 🕵️‍♂️ 1. getUserInfo()가 어떤 값을 반환하는지 확인합니다.
        const userInfo = getUserInfo();
        console.log('🕵️‍♂️ 디버깅 1: getUserInfo() 결과:', userInfo);

        if (!userInfo?.id) {
          console.error("로그인 정보가 없습니다.");
          // ... (기존 토스트 메시지)
          return;
        }

        // 🕵️‍♂️ 2. state에 설정하려는 role 값이 무엇인지 확인합니다.
        console.log('🕵️‍♂️ 디버깅 2: 설정할 사용자 역할(userInfo.role):', userInfo.role);

        setCurrentUser(userInfo);
        setUserType(userInfo.role);

        if (userInfo.role === 'INDIVIDUAL' || userInfo.role === 'HEADQUARTERS') {
          setPaymentMethod('card');
        } else if (userInfo.role === 'BRANCH') {
          setPaymentMethod('corporate_payment');
        }

        await fetchUserShippingInfo(userInfo.id);

      } catch (error) {
        console.error("초기 데이터 로딩 중 에러 발생:", error);
        // ... (기존 토스트 메시지)
      } finally {
        // 🕵️‍♂️ 3. 로직의 마지막까지 도달했는지 확인합니다.
        console.log('🕵️‍♂️ 디버깅 3: useEffect 로직 완료');
        setIsUserLoading(false);
      }
    };

    fetchInitialData();
  }, []);
  useEffect(()=>{
    // script 태그 만들기
    const script = document.createElement('script');

    // 링크 넣어주기
    script.src = "https://pay.nicepay.co.kr/v1/js/";

    // 다 하면 로그 찍기
    script.onload = () => {
      console.log("✅ script loaded");
      setIsScriptLoaded(true); // 스크립트 로딩 완료 시 상태 업데이트
    };

    // 에러 처리
    script.onerror = () => {
      console.error("❌ script load error");
      toast({
        title: '오류',
        description: '결제 모듈 로딩에 실패했습니다. 새로고침 후 다시 시도해주세요.',
        variant: 'destructive',
      });
    };
    // 붙이기
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
      console.log("🧼 script removed");
    }
  },[]);

  const handlePaymentRequest = async (preOrderData : PreOrderResponse) =>{
    if (!isScriptLoaded || !window.AUTHNICE) {
        toast({
            title: "오류",
            description: "결제 모듈이 준비되지 않았습니다. 잠시 후 다시 시도해주세요.",
            variant: "destructive"
        });
        return;
    }
    window.AUTHNICE.requestPay({
      clientId: "R2_d5c2604ed6054467bc5a2a6344e34310",
      method: preOrderData.method === '신용카드' ? 'card' : 'bank',
      orderId: preOrderData.orderId,
      amount: preOrderData.amount,
      goodsName: preOrderData.goodsName,
      returnUrl: `http://localhost:8080/api/payments/return`,
      fnError: function (result: any) {
        toast({
          title: '결제 오류',
          description: `오류가 발생했습니다: ${result.errorMsg}`,
          variant: 'destructive',
        });
      },
    });
  }

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
      console.log(paymentMethod)
      console.log("userType:", userType)
      if (result) {
        const normalized = {
          name: result.name ?? result.recipientName ?? result.username ?? result.memberName ?? '',
          phone: result.phone ?? result.recipientPhone ?? result.phoneNumber ?? result.memberPhone ?? '',
          email: result.email ?? result.memberEmail ?? '',
          address: result.address ?? result.recipientAddress ?? '',
          detailAddress: result.detailAddress ?? result.recipientDetailAddress ?? '',
          zipCode: result.zipCode ?? result.postNumber ?? result.postCode ?? result.zip ?? '',
        };
        setLoggedInUser(normalized);
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
    setUserType(currentUser.role);
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

      const preOrderData: PreOrderResponse = await response.json();

      console.log("🚀 /api/order API 응답:", preOrderData);
      if (response.ok && preOrderData.orderId) {

        // 지점 회원의 법인결제는 바로 승인 처리
        if (paymentMethod === 'corporate_payment') {
          toast({
            title: "주문이 완료되었습니다!",
            description: `법인 결제 신청이 접수되었습니다. 주문번호: ${preOrderData.orderId}`,
          });
          // 직접구매가 아닌 경우 장바구니 비우기
          if (!isDirectPurchase) {
            await apiFetch('/api/cart', { method: 'DELETE' });
          }
          // 마이페이지로 이동
          navigate('/mypage');
        }
        else {
          // 개인회원과 본사회원은 결제창 호출
          await handlePaymentRequest(preOrderData);
          // 결제창 호출 후 장바구니 비우기 (직접구매가 아닌 경우)
          if (!isDirectPurchase) {
            try {
              await apiFetch('/api/cart', { method: 'DELETE' });
              // 로컬 장바구니도 비우기
              localStorage.removeItem('cart');
              // 장바구니 업데이트 이벤트 발생
              window.dispatchEvent(new Event('cart:updated'));
            } catch (error) {
              console.error('장바구니 비우기 실패:', error);
            }
          }
        }
      } else {
        toast({
          title: "주문 실패",
          description: preOrderData?.message || '주문 처리에 실패했습니다. 다시 시도해주세요.',
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Order error:', error);
      toast({
        title: "네트워크 오류",
        description: "주문 처리에 실패했습니다.",
        variant: "destructive"
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
                      {/* 로딩 상태에 따라 UI를 다르게 보여줍니다. */}
                      {isUserLoading ? (
                          <p className="text-sm text-muted-foreground pt-2">사용자 정보를 확인 중입니다...</p>
                      ) : (
                          <>
                            {/* 개인 회원, 본사: 신용카드, 계좌이체 */}
                            {(userType === 'INDIVIDUAL' || userType === 'HEADQUARTERS') && (
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
                            {userType === 'BRANCH' && (
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
                          </>
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
