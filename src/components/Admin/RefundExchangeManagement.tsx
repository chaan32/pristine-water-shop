import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RotateCcw, RefreshCw, Eye, CheckCircle, XCircle, MessageSquareReply } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { adminApi, getAccessToken } from '@/lib/api';

// 환불/교환 문의 데이터 타입 정의
interface RefundExchangeInquiry {
  id: number;
  inquiryId: string; // 문의번호
  orderId?: number;
  orderNumber?: string;
  customerName: string;
  type: 'refund' | 'exchange';
  category: string;
  title: string;
  content: string;
  isAnswered: boolean;
  answer?: string;
  createdAt: string;
  answeredAt?: string;
  attachments?: string[];
}

const RefundExchangeManagement = () => {
  const [inquiries, setInquiries] = useState<RefundExchangeInquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInquiry, setSelectedInquiry] = useState<RefundExchangeInquiry | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [activeTab, setActiveTab] = useState<'unanswered' | 'answered'>('unanswered');
  const { toast } = useToast();

  // 답변 상태에 따라 필터링
  const unansweredInquiries = inquiries.filter(inquiry => !inquiry.isAnswered);
  const answeredInquiries = inquiries.filter(inquiry => inquiry.isAnswered);

  useEffect(() => {
    const fetchInquiries = async () => {
      setLoading(true);
      try {
        const token = getAccessToken();
        // API: GET /api/admin/inquiries - Get all inquiries
        const response = await adminApi.getGeneralInquiries();

        if (!response.ok) {
          throw new Error('데이터를 불러오는 데 실패했습니다.');
        }

        const data = await response.json();

        if (Array.isArray(data)) {
          // 환불/교환 관련 문의만 필터링
          const refundExchangeInquiries: RefundExchangeInquiry[] = data
            .filter((item: any) => 
              item.category?.includes('환불') || 
              item.category?.includes('교환') ||
              item.title?.includes('[환불 신청]') ||
              item.title?.includes('[교환 신청]')
            )
            .map((item: any) => {
              // 제목에서 환불/교환 타입 추출
              const isRefund = item.title?.includes('[환불 신청]') || item.category?.includes('환불');
              
              return {
                id: item.inquiryId,
                inquiryId: `INQ-${item.inquiryId}`,
                orderId: item.orderId,
                orderNumber: item.orderNumber,
                customerName: item.memberName || '알 수 없음',
                type: isRefund ? 'refund' : 'exchange',
                category: item.category,
                title: item.title,
                content: item.content,
                isAnswered: item.isAnswered || false,
                answer: item.answer,
                createdAt: item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '',
                answeredAt: item.answeredAt ? new Date(item.answeredAt).toLocaleDateString() : undefined,
                attachments: item.filesUrl || [],
              };
            });
          
          setInquiries(refundExchangeInquiries);
        } else {
          throw new Error("API 응답이 배열 형식이 아닙니다.");
        }

      } catch (error) {
        console.error(error);
        toast({ title: "오류", description: "데이터를 불러오는 중 문제가 발생했습니다.", variant: "destructive" });
        setInquiries([]);
      } finally {
        setLoading(false);
      }
    };

    fetchInquiries();
  }, [toast]);

  const handleReplySubmit = async (inquiryId: number) => {
    if (!replyContent.trim()) {
      toast({ title: "입력 필요", description: "답변 내용을 입력해주세요.", variant: "destructive" });
      return;
    }

    try {
      // API: POST /api/admin/inquiries/answer - Reply to inquiry
      const response = await adminApi.answerGeneralInquiry({ 
        inquiryId: inquiryId, 
        answer: replyContent 
      });

      if (!response.ok) {
        throw new Error('답변 등록에 실패했습니다.');
      }

      setInquiries(prev => prev.map(inquiry =>
        inquiry.id === inquiryId 
          ? { ...inquiry, isAnswered: true, answer: replyContent, answeredAt: new Date().toLocaleDateString() } 
          : inquiry
      ));

      toast({
        title: "답변 완료",
        description: "답변이 성공적으로 등록되었습니다.",
      });

      setIsDetailOpen(false);
      setReplyContent('');

    } catch (error) {
      console.error(error);
      toast({ title: "오류", description: "답변 등록 중 문제가 발생했습니다.", variant: "destructive" });
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    setIsDetailOpen(isOpen);
    if (!isOpen) {
      setSelectedInquiry(null);
      setReplyContent('');
    }
  };

  const getTypeBadge = (type: string) => {
    const t = (type || '').toLowerCase();
    return t === 'refund'
        ? { icon: RotateCcw, text: '환불', className: 'text-red-600' }
        : { icon: RefreshCw, text: '교환', className: 'text-blue-600' };
  };

  const handleViewDetail = (inquiry: RefundExchangeInquiry) => {
    setSelectedInquiry(inquiry);
    setReplyContent('');
    setIsDetailOpen(true);
  };

  const renderInquiryTable = (inquiriesList: RefundExchangeInquiry[]) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>문의번호</TableHead>
          <TableHead>주문번호</TableHead>
          <TableHead>고객명</TableHead>
          <TableHead>유형</TableHead>
          <TableHead>제목</TableHead>
          <TableHead>답변상태</TableHead>
          <TableHead>요청일</TableHead>
          <TableHead>답변일</TableHead>
          <TableHead>작업</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {loading ? (
          Array.from({ length: 5 }).map((_, index) => (
            <TableRow key={index}>
              <TableCell colSpan={9} className="p-2"><Skeleton className="h-10 w-full" /></TableCell>
            </TableRow>
          ))
        ) : inquiriesList.length > 0 ? (
          inquiriesList.map((inquiry) => {
            const typeBadge = getTypeBadge(inquiry.type);
            const TypeIcon = typeBadge.icon;

            return (
              <TableRow key={inquiry.id}>
                <TableCell className="font-medium">{inquiry.inquiryId}</TableCell>
                <TableCell>{inquiry.orderNumber || '-'}</TableCell>
                <TableCell>{inquiry.customerName}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <TypeIcon className={`w-4 h-4 ${typeBadge.className}`} />
                    <span className={typeBadge.className}>{typeBadge.text}</span>
                  </div>
                </TableCell>
                <TableCell className="max-w-[200px] truncate">{inquiry.title}</TableCell>
                <TableCell>
                  <Badge variant={inquiry.isAnswered ? 'default' : 'secondary'}>
                    {inquiry.isAnswered ? '답변완료' : '답변대기'}
                  </Badge>
                </TableCell>
                <TableCell>{inquiry.createdAt}</TableCell>
                <TableCell>{inquiry.answeredAt || '-'}</TableCell>
                <TableCell>
                  <Button variant="outline" size="sm" onClick={() => handleViewDetail(inquiry)}>
                    <Eye className="w-4 h-4 mr-1" /> 상세보기
                  </Button>
                </TableCell>
              </TableRow>
            );
          })
        ) : (
          <TableRow>
            <TableCell colSpan={9} className="text-center h-24">
              {activeTab === 'unanswered' ? '답변 대기 중인 ' : '답변 완료된 '}
              환불/교환 문의가 없습니다.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">환불/교환 관리</h1>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>답변 대기: {unansweredInquiries.length}건</span>
          <span>답변 완료: {answeredInquiries.length}건</span>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>환불/교환 문의 관리</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'unanswered' | 'answered')}>
            <TabsList className="grid grid-cols-2 w-96 mb-4">
              <TabsTrigger value="unanswered" className="flex items-center gap-2">
                <MessageSquareReply className="w-4 h-4" />
                답변 대기 ({unansweredInquiries.length})
              </TabsTrigger>
              <TabsTrigger value="answered" className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                답변 완료 ({answeredInquiries.length})
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="unanswered">
              {renderInquiryTable(unansweredInquiries)}
            </TabsContent>
            
            <TabsContent value="answered">
              {renderInquiryTable(answeredInquiries)}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Dialog open={isDetailOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>환불/교환 문의 상세정보</DialogTitle>
          </DialogHeader>

          {selectedInquiry && (
            <div className="space-y-6 py-4">
              <Card>
                <CardHeader><CardTitle className="text-lg">문의 정보</CardTitle></CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="grid grid-cols-2 gap-4">
                    <div><span className="font-semibold">문의번호:</span><span className="ml-2 text-muted-foreground">{selectedInquiry.inquiryId}</span></div>
                    <div><span className="font-semibold">주문번호:</span><span className="ml-2 text-muted-foreground">{selectedInquiry.orderNumber || '-'}</span></div>
                    <div><span className="font-semibold">고객명:</span><span className="ml-2 text-muted-foreground">{selectedInquiry.customerName}</span></div>
                    <div><span className="font-semibold">문의일:</span><span className="ml-2 text-muted-foreground">{selectedInquiry.createdAt}</span></div>
                  </div>
                  <div className="border-t pt-3 mt-3">
                    <span className="font-semibold">유형:</span>
                    <span className="ml-2 text-muted-foreground">{selectedInquiry.type === 'refund' ? '환불' : '교환'}</span>
                  </div>
                  <div>
                    <span className="font-semibold">답변상태:</span>
                    <Badge className="ml-2" variant={selectedInquiry.isAnswered ? 'default' : 'secondary'}>
                      {selectedInquiry.isAnswered ? '답변완료' : '답변대기'}
                    </Badge>
                  </div>
                  {selectedInquiry.answeredAt && (
                    <div><span className="font-semibold">답변일:</span><span className="ml-2 text-muted-foreground">{selectedInquiry.answeredAt}</span></div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="text-lg">문의 내용</CardTitle></CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div>
                    <span className="font-semibold">제목:</span>
                    <span className="ml-2 text-muted-foreground">{selectedInquiry.title}</span>
                  </div>
                  <div>
                    <Label className="font-semibold">내용:</Label>
                    <p className="mt-2 p-3 bg-muted rounded-md text-muted-foreground whitespace-pre-wrap">{selectedInquiry.content}</p>
                  </div>
                </CardContent>
              </Card>

              {selectedInquiry.attachments && selectedInquiry.attachments.length > 0 && (
                <Card>
                  <CardHeader><CardTitle className="text-lg">첨부파일</CardTitle></CardHeader>
                  <CardContent className="space-y-2">
                    {selectedInquiry.attachments.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 border rounded">
                        <a href={file} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline truncate pr-4">{file.split('/').pop()}</a>
                        <Button asChild variant="outline" size="sm"><a href={file} download>다운로드</a></Button>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {selectedInquiry.isAnswered && selectedInquiry.answer && (
                <Card>
                  <CardHeader><CardTitle className="text-lg">답변 내용</CardTitle></CardHeader>
                  <CardContent>
                    <p className="p-3 bg-muted rounded-md text-muted-foreground whitespace-pre-wrap">{selectedInquiry.answer}</p>
                  </CardContent>
                </Card>
              )}

              {!selectedInquiry.isAnswered && (
                <div className="space-y-4 pt-4 border-t">
                  <div>
                    <Label htmlFor="replyContent" className="font-semibold">답변 내용</Label>
                    <Textarea
                      id="replyContent"
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      placeholder="고객에게 보낼 답변을 입력해주세요."
                      className="mt-2"
                      rows={6}
                    />
                  </div>
                  <div className="flex gap-3">
                    <Button 
                      onClick={() => handleReplySubmit(selectedInquiry.id)} 
                      className="flex-1"
                      disabled={!replyContent.trim()}
                    >
                      <MessageSquareReply className="w-4 h-4 mr-2" /> 답변 등록
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RefundExchangeManagement;