import { Link } from 'react-router-dom';
import {useEffect, useState} from 'react';
import Header from '@/components/Layout/Header';
import Footer from '@/components/Layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bell, FileText, MessageCircle, HelpCircle, Send, Pin, Upload, X, ChevronDown } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';
import { supportApi, userApi, getAccessToken } from '@/lib/api';

interface Notice{
  id: number;
  title: string;
  createdAt: string;
  pinned: boolean;
  content?: string;
}

// 주문 상품 정보 타입
interface OrderItem {
  productName: string;
  quantity: number;
}

// 주문 정보 타입
interface Order {
  orderId: number;
  orderNumber: string;
  createdAt: string;
  orderItems: OrderItem[];
}


const Support = () => {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [noticesLoading, setNoticesLoading] = useState(true);

  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [inquiryData, setInquiryData] = useState({
    category: '',
    title: '',
    content: ''
  });

  const [faqCategories, setFaqCategories] = useState<any[]>([]);
  const [faqs, setFaqs] = useState<any[]>([]);
  const [faqsLoading, setFaqsLoading] = useState(false);

  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isOrderSelectorOpen, setIsOrderSelectorOpen] = useState(false);


  const fetchNotices = async () => {
    setNoticesLoading(true);
    try{
      // API: GET /api/notices - Get all notices
      const res = await supportApi.getNotices();
      if (!res.ok) {
        throw new Error('공지사항을 불러오는데 실패했습니다.');
      }
      const data: Notice[] = await res.json();
      const sortedData = data.sort((a, b) => Number(b.pinned) - Number(a.pinned) || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setNotices(sortedData);
    }
    catch (error) {
      console.error('Failed to fetch notices:', error);
      setNotices([]);
    }
    finally {
      setNoticesLoading(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));

    if (attachedFiles.length + imageFiles.length > 5) {
      alert('최대 5장까지 첨부할 수 있습니다.');
      return;
    }

    setAttachedFiles(prev => [...prev, ...imageFiles].slice(0, 5));
  };

  const removeFile = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // handleInquirySubmit 함수 수정
  const handleInquirySubmit = async () => {
    if (!inquiryData.title || !inquiryData.content) {
      alert('필수 항목을 모두 입력해주세요.');
      return;
    }

    // 전송할 데이터 객체 생성
    const submissionData: any = {
      ...inquiryData,
    };

    // 선택된 주문이 있으면 orderId 추가
    if (selectedOrder) {
      submissionData.orderId = selectedOrder.orderId;
    }


    try {
      let body;

      if (attachedFiles.length > 0) {
        const formData = new FormData();
        const inquiryDataBlob = new Blob([JSON.stringify(submissionData)], { type: 'application/json' });
        formData.append('data', inquiryDataBlob);
        attachedFiles.forEach((file) => {
          formData.append(`attachments`, file);
        });
        body = formData;
      } else {
        body = submissionData;
      }
      
      // API: POST /api/inquiries - Submit inquiry
      const response = attachedFiles.length > 0 
        ? await supportApi.createInquiryWithFiles(body as FormData)
        : await supportApi.createInquiry(submissionData);

      let data: any = null;
      const rawText = await response.text();
      try {
        data = JSON.parse(rawText);
      } catch {
        data = { message: rawText };
      }

      if (response.ok) {
        setInquiryData({ category: '', title: '', content: '' });
        setAttachedFiles([]);
        setSelectedOrder(null); // 성공 시 선택된 주문 초기화
        toast({
          title: "문의 접수 완료",
          description: "문의가 성공적으로 접수되었습니다. 빠른 시일 내에 답변드리겠습니다.",
        });
      } else {
        console.log(response.status);
        switch (response.status) {
          case 400: toast({ title: '입력 정보를 확인해주세요.', description: "환불/교환의 경우 주문 선택은 필수입니다.", variant: 'warning'}); break;
          case 413: toast({ title: '입력 정보를 확인해주세요.', description: "첨부파일 용량이 너무 큽니다.", variant: 'warning'}); break;
          case 429: alert('일일 문의 제한을 초과했습니다. 내일 다시 시도해주세요.'); break;
          case 409: toast({ title: '환불/교환이 이미 등록된 주문입니다.', description: "환불/교환 문의는 주문 당 1회 가능합니다. ", variant: 'warning'}); break;
          default: alert(data.message || '문의 접수 중 오류가 발생했습니다.');
        }
      }
    } catch (error) {
      console.error('Inquiry submit error:', error);
      alert('네트워크 오류가 발생했습니다. 다시 시도해주세요.');
    }
  };

  const fetchFaqCategories = async () => {
    try {
      // API: GET /api/faq/categories - Get FAQ categories
      const res = await supportApi.getFaqCategories();
      if (!res.ok) throw new Error('Failed to fetch categories');
      const data = await res.json();
      setFaqCategories(data);
      await fetchAllFaqs(data);
    } catch (e) {
      console.error('Failed to fetch FAQ categories:', e);
      const fallback = [
        { id: '1', name: '제품' },
        { id: '2', name: '주문/배송' },
        { id: '3', name: '교환/환불' },
      ];
      setFaqCategories(fallback);
      await fetchAllFaqs(fallback);
    }
  };

  const fetchAllFaqs = async (categoriesList?: any[]) => {
    const cats = categoriesList ?? faqCategories;
    if (!cats || cats.length === 0) return;
    setFaqsLoading(true);
    try {
      const results = await Promise.all(
          cats.map(async (cat: any) => {
            try {
              // API: GET /api/faq?categoryId={id} - Get FAQs by category
              const res = await supportApi.getFaqs(cat.id);
              if (!res.ok) throw new Error('Failed to fetch faqs');
              return { id: cat.id, name: cat.name, items: await res.json() };
            } catch (e) {
              console.error('Failed to fetch FAQs for category:', cat.id, e);
              return {};
            }
          })
      );
      setFaqs(results);
    } finally {
      setFaqsLoading(false);
    }
  };


  useEffect(() => {
    fetchNotices();
    fetchFaqCategories();

    const fetchOrders = async () => {
      setOrdersLoading(true);
      const token = getAccessToken();
      if (!token) {
        setOrdersLoading(false);
        return;
      }

      try {
        // API: GET /api/users/orders - Get user's orders for inquiry selection
        const response = await userApi.getOrders(0, 10);

        if (!response.ok) {
          throw new Error('주문 내역을 불러오는데 실패했습니다.');
        }

        const result = await response.json();

        const formattedOrders: Order[] = result.data.map((order: any) => ({
          orderId: order.orderId,
          orderNumber: order.orderName,
          createdAt: order.createdAt,
          orderItems: (order.items || []).map((item: any) => ({
            productName: item.productName,
            quantity: item.quantity,
          })),
        }));

        setOrders(formattedOrders);
      } catch (error) {
        console.error("Failed to fetch orders:", error);
        setOrders([]);
      } finally {
        setOrdersLoading(false);
      }
    };

    fetchOrders();
  }, []);

  return (
      <div className="min-h-screen bg-background">
        <Header />

        <main className="container mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-4">고객센터</h1>
            <p className="text-lg text-muted-foreground">
              궁금한 점이나 문의사항이 있으시면 언제든 연락주세요
            </p>
          </div>

          <Tabs defaultValue="notice" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="notice">공지사항</TabsTrigger>
              <TabsTrigger value="inquiry">1:1 문의</TabsTrigger>
              <TabsTrigger value="faq">FAQ</TabsTrigger>
            </TabsList>

            <TabsContent value="notice" className="mt-8">
              <div className="space-y-4">
                {noticesLoading ? (
                    Array.from({ length: 5 }).map((_, index) => (
                        <Card key={index}>
                          <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                              <Skeleton className="h-5 w-16 rounded-full" />
                              <div className="flex-1 space-y-2">
                                <Skeleton className="h-5 w-3/4" />
                                <Skeleton className="h-4 w-1/4" />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                    ))
                ) : notices.length > 0 ? (
                    notices.map((notice) => (
                        <Card key={notice.id} className="water-drop hover:shadow-lg transition-smooth">
                          <CardContent className="p-6">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  {notice.pinned && <Pin className="w-4 h-4 text-primary" />}
                                  <Link to={`/notice/${notice.id}`}>
                                    <h3 className="text-lg font-semibold hover:text-primary transition-colors cursor-pointer">
                                      {notice.title}
                                    </h3>
                                  </Link>
                                  {notice.pinned && <Badge variant="destructive">중요</Badge>}
                                </div>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <Bell className="w-4 h-4" />
                                  <span>{new Date(notice.createdAt).toLocaleDateString()}</span>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                    ))
                ) : (
                    <Card>
                      <CardContent className="p-10 text-center text-muted-foreground">
                        등록된 공지사항이 없습니다.
                      </CardContent>
                    </Card>
                )}
              </div>
            </TabsContent>


            <TabsContent value="inquiry" className="mt-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="water-drop">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageCircle className="w-5 h-5" />
                      1:1 문의하기
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">문의 유형</label>
                      <Select value={inquiryData.category} onValueChange={(value) => setInquiryData({...inquiryData, category: value})}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="문의 유형을 선택하세요" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="refund">환불</SelectItem>
                          <SelectItem value="exchange">교환</SelectItem>
                          <SelectItem value="general">일반문의</SelectItem>
                          <SelectItem value="product">제품 문의</SelectItem>
                          <SelectItem value="order">주문/배송 문의</SelectItem>
                          <SelectItem value="other">기타</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Button
                          variant="outline"
                          className="w-full justify-between"
                          onClick={() => setIsOrderSelectorOpen(!isOrderSelectorOpen)}
                      >
                        {selectedOrder ? `선택된 주문: ${selectedOrder.orderNumber}` : "주문 내역 선택 (선택 사항)"}
                        <ChevronDown className={`w-4 h-4 transition-transform ${isOrderSelectorOpen ? "rotate-180" : ""}`} />
                      </Button>
                      {isOrderSelectorOpen && (
                          <Card className="p-2 space-y-2">
                            {ordersLoading ? (
                                Array.from({ length: 2 }).map((_, index) => (
                                    <div key={index} className="p-3 rounded-lg">
                                      <div className="flex justify-between items-center">
                                        <Skeleton className="h-5 w-32" />
                                        <Skeleton className="h-4 w-20" />
                                      </div>
                                      <div className="mt-2 pl-2 space-y-2">
                                        <Skeleton className="h-4 w-4/5" />
                                        <Skeleton className="h-4 w-3/5" />
                                      </div>
                                    </div>
                                ))
                            ) : orders.length > 0 ? (
                                orders.map((order) => (
                                    <div
                                        key={order.orderId}
                                        className="p-3 rounded-lg hover:bg-secondary cursor-pointer"
                                        onClick={() => {
                                          setSelectedOrder(order);
                                          setIsOrderSelectorOpen(false);
                                        }}
                                    >
                                      <div className="flex justify-between items-center">
                                        <p className="font-semibold">{order.orderNumber}</p>
                                        <p className="text-sm text-muted-foreground">
                                          {new Date(order.createdAt).toLocaleDateString()}
                                        </p>
                                      </div>
                                      <div className="mt-2 pl-2 border-l-2 border-border">
                                        {order.orderItems.map((item, index) => (
                                            <p key={index} className="text-sm text-muted-foreground">
                                              {item.productName} (수량: {item.quantity})
                                            </p>
                                        ))}
                                        {order.orderItems.length === 0 && (
                                            <p className="text-sm text-muted-foreground">주문 상품 정보가 없습니다.</p>
                                        )}
                                      </div>
                                    </div>
                                ))
                            ) : (
                                <p className="p-4 text-center text-sm text-muted-foreground">주문 내역이 없습니다.</p>
                            )}
                          </Card>
                      )}
                    </div>


                    <div>
                      <label className="text-sm font-medium mb-2 block">제목</label>
                      <Input
                          placeholder="문의 제목을 입력하세요"
                          value={inquiryData.title}
                          onChange={(e) => setInquiryData({...inquiryData, title: e.target.value})}
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">문의 내용</label>
                      <Textarea
                          placeholder="문의 내용을 상세히 입력해주세요"
                          rows={6}
                          value={inquiryData.content}
                          onChange={(e) => setInquiryData({...inquiryData, content: e.target.value})}
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">첨부파일 (최대 5장)</label>
                      <div className="space-y-3">
                        <div className="border-2 border-dashed border-input rounded-lg p-4 text-center">
                          <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground mb-2">
                            이미지를 드래그하거나 클릭하여 업로드
                          </p>
                          <input
                              type="file"
                              multiple
                              accept="image/*"
                              onChange={handleFileUpload}
                              className="hidden"
                              id="file-upload"
                          />
                          <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => document.getElementById('file-upload')?.click()}
                          >
                            파일 선택
                          </Button>
                          <p className="text-xs text-muted-foreground mt-1">
                            JPG, PNG, GIF 형식 (최대 5장)
                          </p>
                        </div>

                        {attachedFiles.length > 0 && (
                            <div className="space-y-2">
                              <p className="text-sm font-medium">첨부된 파일 ({attachedFiles.length}/5)</p>
                              <div className="space-y-2">
                                {attachedFiles.map((file, index) => (
                                    <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                                      <span className="text-sm truncate flex-1">{file.name}</span>
                                      <Button
                                          type="button"
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => removeFile(index)}
                                      >
                                        <X className="w-4 h-4" />
                                      </Button>
                                    </div>
                                ))}
                              </div>
                            </div>
                        )}
                      </div>
                    </div>

                    <Button className="w-full water-drop" onClick={handleInquirySubmit}>
                      <Send className="w-4 h-4 mr-2" />
                      문의 접수
                    </Button>
                  </CardContent>
                </Card>

                <Card className="water-drop">
                  <CardHeader>
                    <CardTitle>고객센터 연락처</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h4 className="font-semibold mb-3">전화 상담</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>대표번호:</span>
                          <span className="font-medium">010-4658-7418</span>
                        </div>
                        <div className="flex justify-between">
                          <span>운영시간:</span>
                          <span>평일 09:00-18:00</span>
                        </div>
                        <div className="flex justify-between">
                          <span>점심시간:</span>
                          <span>12:00-13:00</span>
                        </div>
                        <div className="flex justify-between">
                          <span>휴무:</span>
                          <span>토/일/공휴일</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-3">이메일 문의</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>일반 문의:</span>
                          <span>ttgy61@naver.com</span>
                        </div>
                        <div className="flex justify-between">
                          <span>기술 지원:</span>
                          <span>ttgy61@naver.com</span>
                        </div>
                        <div className="flex justify-between">
                          <span>제품 문의:</span>
                          <span>ttgy61@naver.com</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-3">원격 지원</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        설치나 사용법에 대한 원격 지원을 제공합니다.
                      </p>
                      <Button variant="outline" className="w-full">
                        원격 지원 요청
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="faq" className="mt-8">
              <div className="space-y-6">
                {faqsLoading ? (
                    Array.from({ length: 3 }).map((_, categoryIndex) => (
                        <Card key={categoryIndex} className="water-drop">
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <Skeleton className="h-6 w-32" />
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2">
                              <Skeleton className="h-12 w-full" />
                              <Skeleton className="h-12 w-full" />
                              <Skeleton className="h-12 w-full" />
                            </div>
                          </CardContent>
                        </Card>
                    ))
                ) : faqs.length > 0 ? (
                    faqs.map((category) => (
                        <Card key={category.id} className="water-drop">
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <HelpCircle className="w-5 h-5" />
                              {category.name}
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            {category.items && category.items.length > 0 ? (
                                <Accordion type="single" collapsible className="w-full">
                                  {category.items.map((faq: any) => (
                                      <AccordionItem key={faq.id} value={`item-${faq.id}`}>
                                        <AccordionTrigger className="text-left">
                                          {faq.question}
                                        </AccordionTrigger>
                                        <AccordionContent className="text-muted-foreground">
                                          {faq.answer}
                                        </AccordionContent>
                                      </AccordionItem>
                                  ))}
                                </Accordion>
                            ) : (
                                <p className="p-4 text-center text-muted-foreground">
                                  등록된 FAQ가 없습니다.
                                </p>
                            )}
                          </CardContent>
                        </Card>
                    ))
                ) : (
                    <Card>
                      <CardContent className="p-10 text-center text-muted-foreground">
                        등록된 FAQ 카테고리가 없습니다.
                      </CardContent>
                    </Card>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </main>

        <Footer />
      </div>
  );
};

export default Support;