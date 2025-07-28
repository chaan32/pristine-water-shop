import Header from '@/components/Layout/Header';
import Footer from '@/components/Layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Star, Minus, Plus, ShoppingCart, Share2, Truck, Shield, RotateCcw } from 'lucide-react';
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
              
              <div className="flex items-center gap-4 mb-6">
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

              <p className="text-lg text-muted-foreground leading-relaxed">{product.description}</p>
            </div>
          </div>
        </div>

        {/* Detailed Product Information */}
        <div className="space-y-12 mb-16">
          <Card className="water-drop">
            <CardHeader>
              <CardTitle className="text-2xl">제품 상세정보</CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              <div>
                <h3 className="text-xl font-semibold mb-6">제품 개요</h3>
                <div className="prose max-w-none text-muted-foreground">
                  <p className="text-lg leading-relaxed mb-4">
                    프리미엄 샤워 필터 SF-100은 최신 다층 필터링 기술을 적용하여 개발된 고성능 샤워용 정수 필터입니다. 
                    일반 수돗물에 포함된 염소, 중금속, 세균 등의 유해물질을 효과적으로 제거하여 깨끗하고 건강한 샤워 환경을 제공합니다.
                  </p>
                  <p className="text-lg leading-relaxed mb-4">
                    특허받은 5단계 필터링 시스템을 통해 물의 순도를 높이면서도 필수 미네랄은 보존하여, 
                    피부와 모발 건강에 도움을 주는 최적의 샤워 워터를 만들어냅니다.
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-6">핵심 기술</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-secondary/30 rounded-lg p-6">
                    <h4 className="font-semibold text-lg mb-3 text-primary">5단계 필터링 시스템</h4>
                    <p className="text-muted-foreground">
                      PP 필터, 활성탄 필터, KDF 필터, 세라믹볼, 비타민C 필터가 순차적으로 작동하여 
                      최대 99.9%의 염소 제거 효과를 달성합니다.
                    </p>
                  </div>
                  <div className="bg-secondary/30 rounded-lg p-6">
                    <h4 className="font-semibold text-lg mb-3 text-primary">중금속 차단 기술</h4>
                    <p className="text-muted-foreground">
                      특수 KDF 필터를 통해 납, 수은, 카드뮴 등의 중금속을 효과적으로 제거하여 
                      안전한 샤워 환경을 조성합니다.
                    </p>
                  </div>
                  <div className="bg-secondary/30 rounded-lg p-6">
                    <h4 className="font-semibold text-lg mb-3 text-primary">미네랄 보존 기술</h4>
                    <p className="text-muted-foreground">
                      유해물질은 제거하면서도 칼슘, 마그네슘 등 피부에 유익한 미네랄은 
                      그대로 보존하는 선택적 필터링을 구현했습니다.
                    </p>
                  </div>
                  <div className="bg-secondary/30 rounded-lg p-6">
                    <h4 className="font-semibold text-lg mb-3 text-primary">비타민C 인퓨전</h4>
                    <p className="text-muted-foreground">
                      천연 비타민C가 용해되어 피부에 영양을 공급하고 염소로 인한 
                      자극과 건조를 완화시켜줍니다.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-6">주요 특징 및 효과</h3>
                <div className="space-y-4">
                  {product.features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-4 p-4 bg-secondary/20 rounded-lg">
                      <div className="w-3 h-3 bg-primary rounded-full mt-2 flex-shrink-0" />
                      <div>
                        <span className="font-medium text-lg">{feature}</span>
                        <p className="text-sm text-muted-foreground mt-1">
                          {index === 0 && "염소 냄새와 자극을 완전히 제거하여 쾌적한 샤워 환경을 제공합니다."}
                          {index === 1 && "납, 수은, 카드뮴 등 유해 중금속을 효과적으로 차단합니다."}
                          {index === 2 && "한 번 설치로 최대 6개월까지 지속적인 필터링 효과를 유지합니다."}
                          {index === 3 && "공구 없이 누구나 쉽게 설치하고 교체할 수 있도록 설계되었습니다."}
                          {index === 4 && "국제적으로 인정받은 NSF 인증을 획득하여 안전성이 검증되었습니다."}
                          {index === 5 && "재활용 가능한 친환경 소재를 사용하여 환경 보호에 기여합니다."}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold mb-6">제품 사양</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {Object.entries(product.specifications).map(([key, value]) => (
                    <div key={key} className="flex justify-between items-center border-b border-secondary pb-3">
                      <span className="font-medium text-lg">{key}</span>
                      <span className="text-muted-foreground text-lg">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-6">설치 및 사용법</h3>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-2xl font-bold text-primary">1</span>
                      </div>
                      <h4 className="font-semibold mb-2">기존 샤워헤드 분리</h4>
                      <p className="text-sm text-muted-foreground">기존 샤워헤드를 시계 반대 방향으로 돌려 분리합니다.</p>
                    </div>
                    <div className="text-center">
                      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-2xl font-bold text-primary">2</span>
                      </div>
                      <h4 className="font-semibold mb-2">필터 연결</h4>
                      <p className="text-sm text-muted-foreground">샤워 필터를 샤워 호스에 시계 방향으로 돌려 연결합니다.</p>
                    </div>
                    <div className="text-center">
                      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-2xl font-bold text-primary">3</span>
                      </div>
                      <h4 className="font-semibold mb-2">샤워헤드 재연결</h4>
                      <p className="text-sm text-muted-foreground">샤워헤드를 필터에 연결하고 물이 새지 않는지 확인합니다.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-6">관리 및 유지보수</h3>
                <div className="bg-secondary/20 rounded-lg p-6">
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                      <span>필터 교체 주기: 6개월 또는 약 15,000L 사용 시</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                      <span>외관 청소: 중성세제로 월 1회 청소 권장</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                      <span>보관 방법: 직사광선을 피하고 서늘한 곳에 보관</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                      <span>교체 알림: 물의 맛이나 냄새 변화 시 즉시 교체</span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Reviews and Q&A */}
        <Tabs defaultValue="reviews" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="reviews">구매후기 ({reviews.length})</TabsTrigger>
            <TabsTrigger value="qna">Q&A ({qnas.length})</TabsTrigger>
          </TabsList>

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