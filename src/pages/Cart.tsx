import Header from '@/components/Layout/Header';
import Footer from '@/components/Layout/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Minus, Plus, X, ShoppingCart } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import showerFilter from '@/assets/shower-filter.jpg';
import kitchenFilter from '@/assets/kitchen-filter.jpg';
import { apiFetch, API_BASE_URL } from '@/lib/api';

const Cart = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  /*
  ==================== API 요청 명세 (장바구니 조회) ====================
  Method: GET
  URL: http://localhost:8080/api/cart
  Headers: {
    'Authorization': 'Bearer {accessToken}',
    'Content-Type': 'application/json'
  }
  
  ==================== 예상 응답 명세 ====================
  성공 시 (200 OK):
  {
    "success": true,
    "data": {
      "items": [
        {
          "id": number,
          "productId": number,
          "name": string,
          "price": number,
          "quantity": number,
          "image": string,
          "options": object,      // 제품 옵션
          "addedAt": string      // 추가 시간
        }
      ],
      "totalItems": number,
      "lastUpdated": string
    }
  }
  */
  
  useEffect(() => {
    fetchCartItems();
  }, []);

  const fetchCartItems = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        // 비로그인 상태에서는 localStorage에서 장바구니 정보 조회
        const localCart = JSON.parse(localStorage.getItem('cart') || '[]');
        setCartItems(localCart);
        setLoading(false);
        return;
      }

      // 서버 장바구니 조회 (CartItemDto[])
      const res = await apiFetch('/api/cart');
      if (!res.ok) {
        throw new Error('장바구니 조회 실패');
      }
      const dtos: Array<{ productId: number; quantity: number }> = await res.json();

      // 각 상품 상세를 병렬로 조회하여 표시용 데이터 구성
      const userType = localStorage.getItem('userType');
      const items = await Promise.all(
        dtos.map(async (dto) => {
          const pdRes = await fetch(`${API_BASE_URL}/api/shop/${dto.productId}`);
          if (!pdRes.ok) throw new Error('상품 정보를 불러오지 못했습니다.');
          const pd = await pdRes.json();
          const price =
            userType === 'headquarters' || userType === 'branch'
              ? pd.businessPrice
              : pd.customerPrice;
          return {
            productId: dto.productId,
            name: pd.productName,
            price,
            quantity: dto.quantity,
            image: pd.thumbnailImageUrl || '/placeholder.svg',
          };
        })
      );
      setCartItems(items);
    } catch (error) {
      console.error('Cart fetch error:', error);
      // 에러 시 로컬 장바구니 사용
      const localCart = JSON.parse(localStorage.getItem('cart') || '[]');
      setCartItems(localCart);
    } finally {
      setLoading(false);
    }
  };

  /*
  ==================== API 요청 명세 (장바구니 수량 변경) ====================
  Method: PUT
  URL: http://localhost:8080/api/cart/items/{itemId}
  Headers: {
    'Authorization': 'Bearer {accessToken}',
    'Content-Type': 'application/json'
  }
  
  Request Body:
  {
    "quantity": number
  }
  */
  const updateQuantity = async (productId: number, change: number) => {
    const currentItem = cartItems.find((item: any) => item.productId === productId);
    if (!currentItem) return;

    const newQuantity = Math.max(1, currentItem.quantity + change);
    
    try {
      const token = localStorage.getItem('accessToken');
      if (token) {
        const res = await apiFetch('/api/cart', {
          method: 'POST',
          body: JSON.stringify({ productId, quantity: newQuantity })
        });
        if (!res.ok) {
          throw new Error('수량 변경 실패');
        }
      }

      // 로컬 상태 업데이트
      setCartItems((items: any) => 
        items.map((item: any) => 
          item.productId === productId 
            ? { ...item, quantity: newQuantity }
            : item
        )
      );

      // 로컬 스토리지 업데이트 (비로그인 사용자용)
      if (!token) {
        const updatedItems = cartItems.map((item: any) => 
          item.productId === productId ? { ...item, quantity: newQuantity } : item
        );
        localStorage.setItem('cart', JSON.stringify(updatedItems));
      }
    } catch (error) {
      console.error('Update quantity error:', error);
      alert('수량 변경 중 오류가 발생했습니다.');
    }
  };

  /*
  ==================== API 요청 명세 (장바구니 상품 삭제) ====================
  Method: DELETE
  URL: http://localhost:8080/api/cart/items/{itemId}
  Headers: {
    'Authorization': 'Bearer {accessToken}'
  }
  */
  const removeItem = async (productId: number) => {
    try {
      const token = localStorage.getItem('accessToken');
      if (token) {
        const res = await apiFetch(`/api/cart/${productId}`, {
          method: 'DELETE',
        });
        if (!res.ok) {
          throw new Error('상품 삭제 실패');
        }
      }

      // 로컬 상태 업데이트
      setCartItems((items: any) => items.filter((item: any) => item.productId !== productId));

      // 로컬 스토리지 업데이트 (비로그인 사용자용)
      if (!token) {
        const updatedItems = cartItems.filter((item: any) => item.productId !== productId);
        localStorage.setItem('cart', JSON.stringify(updatedItems));
      }
    } catch (error) {
      console.error('Remove item error:', error);
      alert('상품 삭제 중 오류가 발생했습니다.');
    }
  };

  const shippingFee = 3000;
  const totalPrice = cartItems.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
  const finalPrice = totalPrice + (cartItems.length > 0 ? shippingFee : 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">로딩 중...</div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">장바구니</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <Card key={item.productId} className="water-drop">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded" />
                    <div className="flex-1">
                      <h3 className="font-semibold">{item.name}</h3>
                      <p className="text-primary font-bold">{item.price.toLocaleString()}원</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => updateQuantity(item.productId, -1)}
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <Input value={item.quantity} className="w-16 text-center" readOnly />
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => updateQuantity(item.productId, 1)}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => removeItem(item.productId)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div>
            <Card className="water-drop">
              <CardContent className="p-6 space-y-4">
                <h3 className="text-lg font-semibold">주문 요약</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>상품 금액</span>
                    <span>{totalPrice.toLocaleString()}원</span>
                  </div>
                  <div className="flex justify-between">
                    <span>배송비</span>
                    <span>{shippingFee.toLocaleString()}원</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between font-bold">
                    <span>총 결제금액</span>
                    <span className="text-primary">{finalPrice.toLocaleString()}원</span>
                  </div>
                </div>
                <Button 
                  className="w-full water-drop"
                  onClick={() => {
                    navigate('/order', { state: { items: cartItems, isDirectPurchase: false } });
                  }}
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  주문하기 ({finalPrice.toLocaleString()}원)
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Cart;