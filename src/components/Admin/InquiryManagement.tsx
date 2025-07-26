import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, MessageSquare, Clock, CheckCircle } from 'lucide-react';

const InquiryManagement = () => {
  const [selectedInquiry, setSelectedInquiry] = useState<number | null>(1);
  const [replyText, setReplyText] = useState('');

  const inquiries = [
    {
      id: 1,
      customerName: '홍길동',
      email: 'hong@email.com',
      subject: '샤워 필터 설치 관련 문의',
      content: '안녕하세요. 샤워 필터를 구매했는데 설치가 어려워서 문의드립니다. 설치 방법에 대한 자세한 안내를 받을 수 있을까요?',
      date: '2024-07-25 14:30',
      status: 'pending',
      category: '설치문의'
    },
    {
      id: 2,
      customerName: '김영희',
      email: 'kim@email.com',
      subject: '제품 교환 요청',
      content: '주문한 제품이 설명과 다릅니다. 교환이 가능한지 문의드립니다.',
      date: '2024-07-24 16:45',
      status: 'replied',
      category: '교환/환불',
      reply: '안녕하세요. 제품 교환 관련해서 확인해드리겠습니다. 주문번호를 알려주시면 빠르게 처리해드리겠습니다.',
      replyDate: '2024-07-24 17:20'
    },
    {
      id: 3,
      customerName: 'ABC호텔',
      email: 'hotel@abc.com',
      subject: '대량 구매 할인 문의',
      content: '호텔 전체 객실에 정수 필터를 설치하려고 합니다. 대량 구매 시 할인 혜택이 있는지 문의드립니다.',
      date: '2024-07-23 10:15',
      status: 'pending',
      category: '대량구매'
    }
  ];

  const selectedInquiryData = inquiries.find(inquiry => inquiry.id === selectedInquiry);

  const handleSendReply = () => {
    if (!replyText.trim()) return;
    
    console.log('답변 전송:', {
      inquiryId: selectedInquiry,
      reply: replyText
    });
    
    setReplyText('');
    // 실제로는 상태 업데이트 로직 구현
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          대기중
        </Badge>;
      case 'replied':
        return <Badge variant="default" className="flex items-center gap-1 bg-green-500">
          <CheckCircle className="w-3 h-3" />
          답변완료
        </Badge>;
      default:
        return null;
    }
  };

  const pendingCount = inquiries.filter(inquiry => inquiry.status === 'pending').length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">1:1 문의 답변</h1>
        <Badge variant="secondary">
          미답변: {pendingCount}건
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[700px]">
        {/* 문의 리스트 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              문의 목록
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[600px]">
              <div className="space-y-2 p-4">
                {inquiries.map((inquiry) => (
                  <div
                    key={inquiry.id}
                    onClick={() => setSelectedInquiry(inquiry.id)}
                    className={`p-4 border border-border rounded-lg cursor-pointer transition-smooth hover:bg-secondary ${
                      selectedInquiry === inquiry.id ? 'bg-primary/10 border-primary' : ''
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-sm">{inquiry.subject}</h3>
                        <p className="text-sm text-muted-foreground">{inquiry.customerName}</p>
                      </div>
                      {getStatusBadge(inquiry.status)}
                    </div>
                    <div className="flex justify-between items-center">
                      <Badge variant="outline" className="text-xs">
                        {inquiry.category}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{inquiry.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* 문의 상세 및 답변 */}
        <Card>
          <CardHeader>
            <CardTitle>
              {selectedInquiryData ? '문의 상세 & 답변' : '문의를 선택해주세요'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedInquiryData ? (
              <div className="space-y-6">
                {/* 문의 내용 */}
                <div className="space-y-4">
                  <div className="bg-secondary/50 p-4 rounded-lg">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold">{selectedInquiryData.subject}</h3>
                        <div className="text-sm text-muted-foreground">
                          {selectedInquiryData.customerName} ({selectedInquiryData.email})
                        </div>
                      </div>
                      <div className="text-right">
                        {getStatusBadge(selectedInquiryData.status)}
                        <div className="text-xs text-muted-foreground mt-1">
                          {selectedInquiryData.date}
                        </div>
                      </div>
                    </div>
                    <p className="text-sm leading-relaxed">{selectedInquiryData.content}</p>
                  </div>

                  {/* 기존 답변 (있는 경우) */}
                  {selectedInquiryData.reply && (
                    <div className="bg-primary/5 p-4 rounded-lg border-l-4 border-primary">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-primary">관리자 답변</span>
                        <span className="text-xs text-muted-foreground">
                          {selectedInquiryData.replyDate}
                        </span>
                      </div>
                      <p className="text-sm leading-relaxed">{selectedInquiryData.reply}</p>
                    </div>
                  )}
                </div>

                {/* 답변 작성 */}
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      {selectedInquiryData.status === 'replied' ? '추가 답변' : '답변 작성'}
                    </label>
                    <Textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="답변을 입력하세요..."
                      rows={6}
                      className="resize-none"
                    />
                  </div>
                  <Button 
                    onClick={handleSendReply}
                    className="w-full"
                    disabled={!replyText.trim()}
                  >
                    <Send className="w-4 h-4 mr-2" />
                    답변 전송
                  </Button>
                </div>
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
};

export default InquiryManagement;