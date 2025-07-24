import Header from '@/components/Layout/Header';
import Footer from '@/components/Layout/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Minus, Plus, X, ShoppingCart } from 'lucide-react';
import { useState } from 'react';

const Cart = () => {
  const [cartItems, setCartItems] = useState([
    {
      id: 1,
      name: '프리미엄 샤워 필터 SF-100',
      price: 89000,
      quantity: 2,
      image: '/placeholder.svg'
    },
    {
      id: 2,
      name: '주방용 직수 정수기 KF-200',
      price: 195000,
      quantity: 1,
      image: '/placeholder.svg'
    }
  ]);

  const shippingFee = 3000;
  const totalPrice = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const finalPrice = totalPrice + shippingFee;

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
              <Card key={item.id} className="water-drop">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded" />
                    <div className="flex-1">
                      <h3 className="font-semibold">{item.name}</h3>
                      <p className="text-primary font-bold">{item.price.toLocaleString()}원</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Minus className="w-4 h-4" />
                      </Button>
                      <Input value={item.quantity} className="w-16 text-center" />
                      <Button variant="outline" size="sm">
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    <Button variant="ghost" size="sm">
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
                <Button className="w-full water-drop">
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  주문하기
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