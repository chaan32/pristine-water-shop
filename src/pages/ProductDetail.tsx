import Header from '@/components/Layout/Header';
import Footer from '@/components/Layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Star, Minus, Plus, ShoppingCart, Heart, Share2, Truck, Shield, RotateCcw } from 'lucide-react';
import { useState } from 'react';
import { useParams } from 'react-router-dom';

const ProductDetail = () => {
  const { id } = useParams();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  // Mock product data
  const product = {
    id: 1,
    name: '프리미엄 샤워 필터 SF-100',
    price: 89000,
    originalPrice: 120000,
    images: ['/placeholder.svg', '/placeholder.svg', '/placeholder.svg'],
    rating: 4.8,
    reviews: 234,
    badge: 'BEST',
    status: 'available',
    shippingFee: 3000,
    description: '프리미엄 샤워 필터 SF-100은 첨단 필터링 기술을 통해 염소와 중금속을 효과적으로 제거하여 건강하고 깨끗한 샤워를 제공합니다.',
    features: [
      '염소 제거율 99.9%',
      '중금속 차단 기능',
      '6개월 장기 사용',
      '간편한 설치 및 교체',
      'NSF 인증 획득',
      '환경친화적 소재'
    ],
    specifications: {
      '크기': '15cm x 8cm x 8cm',
      '무게': '350g',
      '필터 수명': '6개월 (약 15,000L)',
      '적용 수압': '1~6kgf/cm²',
      '사용 온도': '5~40°C',
      '소재': 'ABS, 스테인리스 스틸'
    }
  };

  const reviews = [
    {
      id: 1,
      user: '김**',
      rating: 5,
      date: '2024.01.15',
      content: '설치가 정말 간단하고 물이 부드러워진 게 바로 느껴져요. 피부가 많이 좋아졌습니다.'
    },
    {
      id: 2,
      user: '이**',
      rating: 4,
      date: '2024.01.10',
      content: '가격 대비 만족스럽습니다. 염소 냄새가 확실히 줄어들었어요.'
    },
    {
      id: 3,
      user: '박**',
      rating: 5,
      date: '2024.01.08',
      content: '6개월째 사용 중인데 아직도 효과가 좋습니다. 추천해요!'
    }
  ];

  const qnas = [
    {
      id: 1,
      user: '홍**',
      question: '설치 시 별도 공구가 필요한가요?',
      answer: '간단한 설치로 별도 공구 없이 손으로만 설치 가능합니다.',
      date: '2024.01.12'
    },
    {
      id: 2,
      user: '김**',
      question: '필터 교체 주기는 언제인가요?',
      answer: '일반적으로 6개월 또는 15,000L 사용 시 교체를 권장합니다.',
      date: '2024.01.05'
    }
  ];

  const handleQuantityChange = (value: number) => {
    if (value >= 1 && value <= 10) {
      setQuantity(value);
    }
  };

  const totalPrice = (product.price * quantity) + product.shippingFee;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-square bg-secondary rounded-lg overflow-hidden">
              <img
                src={product.images[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex gap-2">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`aspect-square w-20 bg-secondary rounded-lg overflow-hidden border-2 transition-colors ${
                    selectedImage === index ? 'border-primary' : 'border-transparent'
                  }`}
                >
                  <img
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              {product.badge && (
                <Badge className={`mb-2 ${
                  product.badge === 'BEST' 
                    ? 'bg-destructive text-destructive-foreground' 
                    : 'bg-accent text-accent-foreground'
                }`}>
                  {product.badge}
                </Badge>
              )}
              <h1 className="text-3xl font-bold text-foreground mb-4">{product.name}</h1>
              
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${
                          i < Math.floor(product.rating)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="font-medium">{product.rating}</span>
                  <span className="text-muted-foreground">({product.reviews}개 리뷰)</span>
                </div>
              </div>

              <p className="text-muted-foreground mb-6">{product.description}</p>
            </div>

            {/* Price */}
            <div className="border-t border-b py-6">
              <div className="flex items-center gap-4 mb-2">
                {product.originalPrice && (
                  <span className="text-lg text-muted-foreground line-through">
                    {product.originalPrice.toLocaleString()}원
                  </span>
                )}
                <span className="text-3xl font-bold text-primary">
                  {product.price.toLocaleString()}원
                </span>
              </div>
              <div className="text-sm text-muted-foreground">
                배송비: {product.shippingFee.toLocaleString()}원
              </div>
            </div>

            {/* Quantity and Actions */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <span className="font-medium">수량:</span>
                <div className="flex items-center border rounded-md">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleQuantityChange(quantity - 1)}
                    disabled={quantity <= 1}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <Input
                    value={quantity}
                    onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                    className="w-16 text-center border-0"
                    min="1"
                    max="10"
                    type="number"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleQuantityChange(quantity + 1)}
                    disabled={quantity >= 10}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="text-lg font-semibold">
                총 결제금액: <span className="text-primary">{totalPrice.toLocaleString()}원</span>
              </div>

              <div className="flex gap-3">
                <Button className="flex-1 water-drop" size="lg">
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  장바구니
                </Button>
                <Button variant="outline" size="lg" className="water-drop">
                  <Heart className="w-5 h-5" />
                </Button>
                <Button variant="outline" size="lg" className="water-drop">
                  <Share2 className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Shipping Info */}
            <div className="bg-secondary/50 rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-3">
                <Truck className="w-5 h-5 text-primary" />
                <div>
                  <div className="font-medium">무료배송</div>
                  <div className="text-sm text-muted-foreground">3만원 이상 구매시 (제주/도서산간 제외)</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-primary" />
                <div>
                  <div className="font-medium">품질보증</div>
                  <div className="text-sm text-muted-foreground">정품 인증 및 1년 품질보증</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <RotateCcw className="w-5 h-5 text-primary" />
                <div>
                  <div className="font-medium">교환/반품</div>
                  <div className="text-sm text-muted-foreground">7일 이내 무료 교환/반품</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details">상세정보</TabsTrigger>
            <TabsTrigger value="reviews">구매후기 ({reviews.length})</TabsTrigger>
            <TabsTrigger value="qna">Q&A ({qnas.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="mt-8">
            <Card className="water-drop">
              <CardHeader>
                <CardTitle>제품 상세정보</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">주요 특징</h3>
                  <ul className="space-y-2">
                    {product.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-primary rounded-full" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-4">제품 사양</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(product.specifications).map(([key, value]) => (
                      <div key={key} className="flex justify-between border-b pb-2">
                        <span className="font-medium">{key}</span>
                        <span className="text-muted-foreground">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviews" className="mt-8">
            <div className="space-y-6">
              {reviews.map((review) => (
                <Card key={review.id} className="water-drop">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <span className="font-medium">{review.user}</span>
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < review.rating
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <span className="text-sm text-muted-foreground">{review.date}</span>
                    </div>
                    <p className="text-muted-foreground">{review.content}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="qna" className="mt-8">
            <div className="space-y-6">
              {qnas.map((qna) => (
                <Card key={qna.id} className="water-drop">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline">Q</Badge>
                          <span className="font-medium">{qna.user}</span>
                          <span className="text-sm text-muted-foreground">{qna.date}</span>
                        </div>
                        <p className="ml-8">{qna.question}</p>
                      </div>
                      
                      <div className="ml-4 pl-4 border-l-2 border-secondary">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge>A</Badge>
                          <span className="font-medium text-primary">AquaPure</span>
                        </div>
                        <p className="ml-8 text-muted-foreground">{qna.answer}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              <Card className="water-drop">
                <CardHeader>
                  <CardTitle>문의하기</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea placeholder="궁금한 점을 남겨주세요..." />
                  <Button className="w-full water-drop">문의 등록</Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
};

export default ProductDetail;