
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, MessageSquare, Clock, CheckCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {useToast} from "@/hooks/use-toast.ts";

import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";

// 문의 목록 백엔드 DTO
interface AdminSIQnAResDto{
  inquiriesId: number;
  productId: number;
  productName: string;
  userName: string;
  userEmail: string;
  createdAt: string;
  isAnswered: boolean;
  question: string;
  answer: string | null;
}

// 제품 목록 필터용 타입
interface ProductInfo{
  id: number;
  name: string;
}



const InquiryManagement = () => {
  // 2. 상태 변수 재설정
  const { toast } = useToast();
  const [inquiries, setInquiries] = useState<AdminSIQnAResDto[]>([]);
  const [products, setProducts] = useState<ProductInfo[]>([]); // 제품 필터 목록용
  const [selectedInquiry, setSelectedInquiry] = useState<AdminSIQnAResDto | null>(null);
  const [replyText, setReplyText] = useState('');

  const [loadingProducts, setLoadingProducts] = useState(true);
  // 로딩 및 에러 상태
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 필터 상태 관리
  const [filterType, setFilterType] = useState('status'); // 'status' 또는 'product'
  const [statusFilter, setStatusFilter] = useState('false'); // 'true' 또는 'false'
  const [productFilter, setProductFilter] = useState<string | null>(null)


  useEffect(() => {
    const fetchInquiries = async () => {
      setLoading(true);
      setError(null);
      setSelectedInquiry(null); // 필터 변경 시에 선택 초기화

      let url = '';
      if (filterType === 'status') {
        url = `http://localhost:8080/api/admin/product-inquiries?answered=${statusFilter}`;
      } else if (filterType === 'product' && productFilter) {
        url = `http://localhost:8080/api/admin/product-inquiries/${productFilter}`;
      } else {
        url = `http://localhost:8080/api/admin/product-inquiries?answered=false`;
      }
      try {
        const accessToken = localStorage.getItem('accessToken');
        const res = await fetch(url,{
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${accessToken}`
            }
        });
        if (!res.ok) {
          throw new Error('문의 목록을 불러오는 데 실패했습니다.');
        }
        // ⚠️ 중요: 서버 응답 타입은 any로 받아서 안전하게 처리
        const rawData: any[] = await res.json();

        // ✨ [해결] 여기서 프론트엔드 타입에 맞게 데이터를 변환합니다.
        const formattedInquiries: AdminSIQnAResDto[] = rawData.map(item => ({
          inquiriesId: item.inquiresId, // 서버가 보내는 실제 키 이름이 inquiresId가 맞는지 확인!
          productId: item.productId,
          productName: item.productName,
          userName: item.userName,
          userEmail: item.userEmail,
          createdAt: item.createdAt,
          isAnswered: item.isAnswered,
          question: item.question,
          answer: item.answer,
        }));

        setInquiries(formattedInquiries);
      } catch (e: any) {
        setError(e.message || '알 수 없는 오류가 발생했습니다.');
        setInquiries([]);
      } finally {
        setLoading(false);
      }

    };
    fetchInquiries();
  }, [filterType, statusFilter, productFilter]); // 필터가 바뀔 때마다 실행
  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSendReply = async () => {
    if (!replyText.trim() || !selectedInquiry) return;

    setIsSubmitting(true);
    try {
      console.log('답변 전송 직전의 selectedInquiry 객체:', selectedInquiry);
      const accessToken = localStorage.getItem('accessToken');
      const requestBody = {
        inquiryId: selectedInquiry.inquiriesId,
        answer: replyText,
      }
      console.log('답변 전송 요청 본문:', requestBody);

      const res = await fetch('http://localhost:8080/api/admin/product-inquiries/answer', {
        method: 'POST',
        headers: {'Content-Type': 'application/json',  'Authorization': `Bearer ${accessToken}`},
        body: JSON.stringify({
          inquiryId: selectedInquiry.inquiriesId,
          answer: replyText,
        }),
      });

      if (!res.ok) {
        throw new Error('답변 전송에 실패했습니다.');
      }

      toast({
        title: "답변 등록 완료",
        description: "고객에게 답변이 전송되었습니다."
      });
      setReplyText('');
      const currentFilterType = filterType;
      setFilterType('');
      setTimeout(() => setFilterType(currentFilterType), 0);
    } catch (e: any) {
      toast({
        title: "전송 실패",
        description: e.message || "답변 전송에 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  const fetchProducts = async () => {
    try {
      setLoadingProducts(true);
      const token = localStorage.getItem('accessToken');

      const response = await fetch('http://localhost:8080/api/admin/products', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('상품 목록 응답:', data);

        // 응답 데이터 정규화 (id, name만)
        const normalizedProducts = data.map((item: any) => ({
          id: item.id || item.productId,
          name: item.name || item.productName
        }));

        setProducts(normalizedProducts);
      } else {
        console.error('상품 목록 요청 실패:', response.status);
        toast({
          title: "오류",
          description: "상품 목록을 불러오는데 실패했습니다.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('상품 목록 가져오기 실패:', error);
      toast({
        title: "네트워크 오류",
        description: "서버와의 연결에 문제가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setLoadingProducts(false);
    }
  };

  return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <MessageSquare className="w-6 h-6" />
            1:1 문의 답변
          </h1>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              대기 {inquiries.filter(inq => !inq.isAnswered).length}
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              <CheckCircle className="w-4 h-4" />
              완료 {inquiries.filter(inq => inq.isAnswered).length}
            </Badge>
            <Badge variant="default" className="flex items-center gap-1">
              전체 {inquiries.length}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[700px]">
          {/* === 좌측: 문의 목록 및 필터 === */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5"/>
                문의 목록
              </CardTitle>
              {/* 요구사항 1: 필터 기능 */}
              <Tabs value={filterType} onValueChange={setFilterType} className="w-full pt-4">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="status">상태별 보기</TabsTrigger>
                  <TabsTrigger value="product">제품별 보기</TabsTrigger>
                </TabsList>
                <TabsContent value="status" className="pt-2">
                  <div className="flex gap-2">
                    <Button variant={statusFilter === 'false' ? 'pending' : 'pendingOutline'} size="sm"
                            onClick={() => setStatusFilter('false')}>답변 대기</Button>
                    <Button variant={statusFilter === 'true' ? 'answered' : 'answeredOutline'} size="sm"
                            onClick={() => setStatusFilter('true')}>답변 완료</Button>
                  </div>
                </TabsContent>
                <TabsContent value="product" className="pt-2">
                  <Select
                      value={productFilter || ''}
                      onValueChange={setProductFilter}
                      disabled={loadingProducts}>
                    <SelectTrigger>
                      <SelectValue placeholder={loadingProducts? '불러오는 중...' : '제품을 선택하세요'} />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map(p => (
                          <SelectItem key={p.id} value = {String(p.id)}>
                            {p.name}
                          </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TabsContent>
              </Tabs>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[520px]">
                {loading ? (
                  <div className="space-y-2 p-4">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className="p-4 border border-border rounded-lg">
                        <div className="flex items-start gap-3">
                          <Skeleton className="h-8 w-8 rounded-full" />
                          <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-4 w-1/2" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : error ? (
                  <div className="text-center p-10 text-destructive">{error}</div>
                ) : inquiries.length === 0 ? (
                  <div className="text-center p-10 text-muted-foreground">
                    <img src="/placeholder.svg" alt="문의 없음 일러스트" className="mx-auto mb-4 h-24 opacity-60" />
                    표시할 문의가 없습니다.
                  </div>
                ) : (
                  <div className="space-y-2 p-4">
                    {inquiries.map((inquiry) => (
                      <div
                        key={inquiry.inquiriesId}
                        onClick={() => setSelectedInquiry(inquiry)}
                        className={`p-4 border border-border rounded-lg cursor-pointer transition-colors hover:bg-secondary hover-scale ${
                          selectedInquiry?.inquiriesId === inquiry.inquiriesId ? 'bg-primary/10 border-primary ring-1 ring-primary' : ''
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="min-w-0">
                            <p className="font-semibold text-sm truncate pr-4">{inquiry.question}</p>
                            <p className="text-xs text-muted-foreground truncate">{inquiry.productName}</p>
                          </div>
                          {inquiry.isAnswered ? (
                            <Badge variant="answered" className="shrink-0">답변완료</Badge>
                          ) : (
                            <Badge variant="pending" className="shrink-0">대기중</Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          {/* === 우측: 문의 상세 및 답변 === */}
          <Card>
            <CardHeader>
              <CardTitle>
                {selectedInquiry ? '문의 상세 및 답변' : '문의를 선택해주세요'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* 요구사항 3: 상세 정보 표시 */}
              {selectedInquiry ? (
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <div className="bg-secondary/50 p-4 rounded-lg">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-semibold">{selectedInquiry.productName}</h3>
                            <div className="text-sm text-muted-foreground">
                              {selectedInquiry.userName} ({selectedInquiry.userEmail})
                            </div>
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {formatDistanceToNow(new Date(selectedInquiry.createdAt), { addSuffix: true, locale: ko })}
                          </div>
                        </div>
                        <p className="text-sm leading-relaxed">{selectedInquiry.question}</p>
                      </div>

                      {selectedInquiry.isAnswered && selectedInquiry.answer && (
                          <div className="bg-primary/5 p-4 rounded-lg border-l-4 border-primary">
                            <p className="text-sm font-medium text-primary mb-2">관리자 답변</p>
                            <p className="text-sm leading-relaxed whitespace-pre-wrap">{selectedInquiry.answer}</p>
                          </div>
                      )}
                    </div>

                    {!selectedInquiry.isAnswered && (
                        <div className="space-y-3">
                          <label className="text-sm font-medium mb-2 block">답변 작성</label>
                          <Textarea
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              placeholder="답변을 입력하세요..."
                              rows={8}
                          />
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>고객에게 바로 전송됩니다. 신중히 작성해주세요.</span>
                            <span>{replyText.length}자</span>
                          </div>
                          <Button onClick={handleSendReply} className="w-full"
                                  disabled={!replyText.trim() || isSubmitting}>
                            <Send className="w-4 h-4 mr-2"/>
                            {isSubmitting ? '전송 중...' : '답변 전송'}
                          </Button>
                        </div>
                    )}
                  </div>
              ) : (
                  <div className="text-center text-muted-foreground py-20">
                    좌측에서 답변할 문의를 선택해주세요.
                  </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
  );
}

export default InquiryManagement;