
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

// 일반 문의 DTO
interface GeneralInquiryDto {
  inquiryId: number;
  category: string;
  title: string;
  userName: string;
  userEmail: string;
  createdAt: string;
  isAnswered: boolean;
  content: string;
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

// 문의 유형 선택: 제품/일반
const [inquiryType, setInquiryType] = useState<'product' | 'general'>('product');

// 일반 문의 상태
const [generalInquiries, setGeneralInquiries] = useState<GeneralInquiryDto[]>([]);
const [selectedGeneralInquiry, setSelectedGeneralInquiry] = useState<GeneralInquiryDto | null>(null);
const [statusFilterGeneral, setStatusFilterGeneral] = useState('false');


  useEffect(() => {
    if (inquiryType !== 'product') return;
    const fetchInquiries = async () => {
      setLoading(true);
      setError(null);
      setSelectedInquiry(null);

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
        const rawData: any[] = await res.json();
        const formattedInquiries: AdminSIQnAResDto[] = rawData.map(item => ({
          inquiriesId: item.inquiresId,
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
  }, [inquiryType, filterType, statusFilter, productFilter]);

  useEffect(() => {
    if (inquiryType !== 'general') return;
    const fetchGeneral = async () => {
      setLoading(true);
      setError(null);
      setSelectedGeneralInquiry(null);
      try {
        const accessToken = localStorage.getItem('accessToken');
        const url = `http://localhost:8080/api/admin/inquiries?answered=${statusFilterGeneral}`;
        const res = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          }
        });
        if (!res.ok) throw new Error('일반 문의 목록을 불러오는 데 실패했습니다.');
        const rawData: any[] = await res.json();
        const formatted: GeneralInquiryDto[] = rawData.map((item: any) => ({
          inquiryId: item.inquiryId ?? item.id,
          category: item.category ?? item.type ?? '',
          title: item.title ?? item.subject ?? '',
          userName: item.userName ?? item.name,
          userEmail: item.userEmail ?? item.email,
          createdAt: item.createdAt,
          isAnswered: item.isAnswered,
          content: item.content ?? item.question,
          answer: item.answer ?? null,
        }));
        setGeneralInquiries(formatted);
      } catch (e: any) {
        setError(e.message || '알 수 없는 오류가 발생했습니다.');
        setGeneralInquiries([]);
      } finally {
        setLoading(false);
      }
    };
    fetchGeneral();
  }, [inquiryType, statusFilterGeneral]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSendReply = async () => {
    const isProduct = inquiryType === 'product';
    const target = isProduct ? selectedInquiry : selectedGeneralInquiry;
    if (!replyText.trim() || !target) return;

    setIsSubmitting(true);
    try {
      const accessToken = localStorage.getItem('accessToken');
      const endpoint = isProduct
        ? 'http://localhost:8080/api/admin/product-inquiries/answer'
        : 'http://localhost:8080/api/admin/inquiries/answer';
      const inquiryId = isProduct
        ? (selectedInquiry as AdminSIQnAResDto).inquiriesId
        : (selectedGeneralInquiry as GeneralInquiryDto).inquiryId;
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${accessToken}` },
        body: JSON.stringify({ inquiryId, answer: replyText }),
      });

      if (!res.ok) {
        throw new Error('답변 전송에 실패했습니다.');
      }

      toast({
        title: '답변 등록 완료',
        description: '고객에게 답변이 전송되었습니다.',
      });
      // 낙관적 업데이트 및 목록 새로고침 트리거
      if (isProduct) {
        setSelectedInquiry((prev) => (prev ? { ...prev, isAnswered: true, answer: replyText } : prev));
        const currentFilterType = filterType;
        setFilterType('');
        setTimeout(() => setFilterType(currentFilterType), 0);
      } else {
        setSelectedGeneralInquiry((prev) => (prev ? { ...prev, isAnswered: true, answer: replyText } : prev));
        const current = statusFilterGeneral;
        setStatusFilterGeneral(current === 'false' ? 'true' : 'false');
        setTimeout(() => setStatusFilterGeneral(current), 0);
      }
      setReplyText('');
    } catch (e: any) {
      toast({
        title: '전송 실패',
        description: e.message || '답변 전송에 실패했습니다.',
        variant: 'destructive',
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
              대기 {(inquiryType === 'product' ? inquiries : generalInquiries).filter(inq => !inq.isAnswered).length}
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              <CheckCircle className="w-4 h-4" />
              완료 {(inquiryType === 'product' ? inquiries : generalInquiries).filter(inq => inq.isAnswered).length}
            </Badge>
            <Badge variant="default" className="flex items-center gap-1">
              전체 {(inquiryType === 'product' ? inquiries : generalInquiries).length}
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
              <div className="pt-2">
                <Tabs value={inquiryType} onValueChange={(v) => setInquiryType(v as 'product' | 'general')}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="product">제품 문의</TabsTrigger>
                    <TabsTrigger value="general">일반 문의</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
              {inquiryType === 'product' ? (
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
              ) : (
                <div className="pt-4">
                  <div className="flex gap-2">
                    <Button
                      variant={statusFilterGeneral === 'false' ? 'pending' : 'pendingOutline'}
                      size="sm"
                      onClick={() => setStatusFilterGeneral('false')}
                    >
                      답변 대기
                    </Button>
                    <Button
                      variant={statusFilterGeneral === 'true' ? 'answered' : 'answeredOutline'}
                      size="sm"
                      onClick={() => setStatusFilterGeneral('true')}
                    >
                      답변 완료
                    </Button>
                  </div>
                </div>
              )}
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
                ) : (inquiryType === 'product' ? inquiries : generalInquiries).length === 0 ? (
                    <div className="text-center p-10 text-muted-foreground">
                      <img src="/placeholder.svg" alt="문의 없음 일러스트" className="mx-auto mb-4 h-24 opacity-60" />
                      표시할 문의가 없습니다.
                    </div>
                ) : (
                    <div className="space-y-2 p-4">
                      {inquiryType === 'product' ? (
                          // 제품 문의 렌더링
                          inquiries.map((inquiry) => (
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
                          ))
                      ) : (
                          // 일반 문의 렌더링
                          generalInquiries.map((inquiry) => (
                              <div
                                  key={inquiry.inquiryId}
                                  onClick={() => setSelectedGeneralInquiry(inquiry)}
                                  className={`p-4 border border-border rounded-lg cursor-pointer transition-colors hover:bg-secondary hover-scale ${
                                      selectedGeneralInquiry?.inquiryId === inquiry.inquiryId ? 'bg-primary/10 border-primary ring-1 ring-primary' : ''
                                  }`}
                              >
                                <div className="flex justify-between items-start mb-2">
                                  <div className="min-w-0">
                                    <p className="font-semibold text-sm truncate pr-4">{inquiry.title}</p>
                                    <p className="text-xs text-muted-foreground truncate">
                                      {inquiry.category} · {inquiry.userName}
                                    </p>
                                  </div>
                                  {inquiry.isAnswered ? (
                                      <Badge variant="answered" className="shrink-0">답변완료</Badge>
                                  ) : (
                                      <Badge variant="pending" className="shrink-0">대기중</Badge>
                                  )}
                                </div>
                                <div className="text-xs text-muted-foreground mt-2">
                                  {formatDistanceToNow(new Date(inquiry.createdAt), { addSuffix: true, locale: ko })}
                                </div>
                              </div>
                          ))
                      )}
                    </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>
                {(inquiryType === 'product' ? selectedInquiry : selectedGeneralInquiry) ? '문의 상세 및 답변' : '문의를 선택해주세요'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {inquiryType === 'product' ? (
                selectedInquiry ? (
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
                        <Button onClick={handleSendReply} className="w-full" disabled={!replyText.trim() || isSubmitting}>
                          <Send className="w-4 h-4 mr-2" />
                          {isSubmitting ? '전송 중...' : '답변 전송'}
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-20">좌측에서 답변할 문의를 선택해주세요.</div>
                )
              ) : (
                selectedGeneralInquiry ? (
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <div className="bg-secondary/50 p-4 rounded-lg">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-semibold">{selectedGeneralInquiry.title}</h3>
                            <div className="text-sm text-muted-foreground">
                              {selectedGeneralInquiry.category} · {selectedGeneralInquiry.userName} ({selectedGeneralInquiry.userEmail})
                            </div>
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {formatDistanceToNow(new Date(selectedGeneralInquiry.createdAt), { addSuffix: true, locale: ko })}
                          </div>
                        </div>
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{selectedGeneralInquiry.content}</p>
                      </div>
                      {selectedGeneralInquiry.isAnswered && selectedGeneralInquiry.answer && (
                        <div className="bg-primary/5 p-4 rounded-lg border-l-4 border-primary">
                          <p className="text-sm font-medium text-primary mb-2">관리자 답변</p>
                          <p className="text-sm leading-relaxed whitespace-pre-wrap">{selectedGeneralInquiry.answer}</p>
                        </div>
                      )}
                    </div>
                    {!selectedGeneralInquiry.isAnswered && (
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
                        <Button onClick={handleSendReply} className="w-full" disabled={!replyText.trim() || isSubmitting}>
                          <Send className="w-4 h-4 mr-2" />
                          {isSubmitting ? '전송 중...' : '답변 전송'}
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-20">좌측에서 답변할 문의를 선택해주세요.</div>
                )
              )}
            </CardContent>
          </Card>
        </div>
      </div>
  );
}

export default InquiryManagement;