import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { MessageCircle, Package, Calendar, Eye } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface Inquiry {
  id: number;
  title: string;
  content: string;
  type: 'GENERAL' | 'PRODUCT';
  productName?: string;
  status: 'PENDING' | 'ANSWERED' | 'CLOSED';
  createdAt: string;
  answer?: string;
  answeredAt?: string;
}

const InquiriesTab = () => {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchInquiries();
  }, []);

  const fetchInquiries = async () => {
    try {
      setLoading(true);
      const response = await apiFetch('/api/users/inquiries');

      if (response.ok) {
        const data = await response.json();
        setInquiries(data.data || []);
      } else {
        throw new Error('문의내역을 불러오는데 실패했습니다.');
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "오류",
        description: "문의내역을 불러오는데 실패했습니다.",
      });
      console.error('Error fetching inquiries:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING': return '답변대기';
      case 'ANSWERED': return '답변완료';
      case 'CLOSED': return '처리완료';
      default: return status;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'PENDING': return 'destructive' as const;
      case 'ANSWERED': return 'default' as const;
      case 'CLOSED': return 'secondary' as const;
      default: return 'outline' as const;
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'GENERAL': return '일반문의';
      case 'PRODUCT': return '제품문의';
      default: return type;
    }
  };

  if (loading) {
    return (
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">문의내역을 불러오는 중...</p>
            </div>
          </CardContent>
        </Card>
    );
  }

  return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              나의 문의내역
            </CardTitle>
          </CardHeader>
          <CardContent>
            {inquiries.length === 0 ? (
                <div className="text-center py-8">
                  <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">문의내역이 없습니다.</p>
                </div>
            ) : (
                <div className="space-y-4">
                  {inquiries.map((inquiry) => (
                      <div
                          key={inquiry.id}
                          className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="outline">
                                {getTypeText(inquiry.type)}
                              </Badge>
                              <Badge variant={getStatusVariant(inquiry.status)}>
                                {getStatusText(inquiry.status)}
                              </Badge>
                              {inquiry.productName && (
                                  <Badge variant="secondary" className="flex items-center gap-1">
                                    <Package className="h-3 w-3" />
                                    {inquiry.productName}
                                  </Badge>
                              )}
                            </div>
                            <h3 className="font-semibold text-lg mb-2">{inquiry.title}</h3>
                            <p className="text-muted-foreground text-sm line-clamp-2 mb-2">
                              {inquiry.content}
                            </p>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Calendar className="h-4 w-4" />
                              {new Date(inquiry.createdAt).toLocaleDateString('ko-KR', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </div>
                          </div>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setSelectedInquiry(inquiry)}
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                상세보기
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                  <MessageCircle className="h-5 w-5" />
                                  문의 상세내용
                                </DialogTitle>
                              </DialogHeader>
                              {selectedInquiry && (
                                  <div className="space-y-4">
                                    <div className="flex items-center gap-2">
                                      <Badge variant="outline">
                                        {getTypeText(selectedInquiry.type)}
                                      </Badge>
                                      <Badge variant={getStatusVariant(selectedInquiry.status)}>
                                        {getStatusText(selectedInquiry.status)}
                                      </Badge>
                                      {selectedInquiry.productName && (
                                          <Badge variant="secondary" className="flex items-center gap-1">
                                            <Package className="h-3 w-3" />
                                            {selectedInquiry.productName}
                                          </Badge>
                                      )}
                                    </div>

                                    <div>
                                      <h3 className="font-semibold text-lg mb-2">{selectedInquiry.title}</h3>
                                      <div className="text-sm text-muted-foreground mb-4">
                                        {new Date(selectedInquiry.createdAt).toLocaleDateString('ko-KR', {
                                          year: 'numeric',
                                          month: 'long',
                                          day: 'numeric',
                                          hour: '2-digit',
                                          minute: '2-digit'
                                        })}
                                      </div>
                                    </div>

                                    <div>
                                      <h4 className="font-semibold mb-2">문의내용</h4>
                                      <div className="bg-muted/50 p-4 rounded-lg">
                                        <p className="whitespace-pre-wrap">{selectedInquiry.content}</p>
                                      </div>
                                    </div>

                                    {selectedInquiry.answer && (
                                        <div>
                                          <h4 className="font-semibold mb-2 text-primary">답변내용</h4>
                                          <div className="bg-primary/5 border border-primary/20 p-4 rounded-lg">
                                            <p className="whitespace-pre-wrap mb-2">{selectedInquiry.answer}</p>
                                            {selectedInquiry.answeredAt && (
                                                <div className="text-sm text-muted-foreground">
                                                  답변일시: {new Date(selectedInquiry.answeredAt).toLocaleDateString('ko-KR', {
                                                  year: 'numeric',
                                                  month: 'long',
                                                  day: 'numeric',
                                                  hour: '2-digit',
                                                  minute: '2-digit'
                                                })}
                                                </div>
                                            )}
                                          </div>
                                        </div>
                                    )}
                                  </div>
                              )}
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                  ))}
                </div>
            )}
          </CardContent>
        </Card>
      </div>
  );
};

export default InquiriesTab;