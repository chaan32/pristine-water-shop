import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageCircle, Package, Calendar, Eye, AlertTriangle, ShoppingCart } from 'lucide-react';
import { apiFetch, getUserInfo } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import ClaimDetailDialog from './ClaimDetailDialog';

interface GeneralInquiry {
  inquiryId: number;
  orderNumber?: string;
  isAnswered: boolean;
  answer?: string;
  question: string;
  title: string;
  createdAt: string;
}

interface ProductInquiry {
  inquiryId: number;
  isAnswered: boolean;
  answer?: string;
  question: string;
  createdAt: string;
}

interface Claim {
  claimId: number;
  title: string;
  content: string;
  status: string;
  answer?: string;
  orderNumber?: string;
  createdAt?: string;
}

interface InquiriesData {
  generalInquiries: GeneralInquiry[];
  productInquiries: ProductInquiry[];
  claims: Claim[];
}

const InquiriesTab = () => {
  const [inquiriesData, setInquiriesData] = useState<InquiriesData>({
    generalInquiries: [],
    productInquiries: [],
    claims: []
  });
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [selectedType, setSelectedType] = useState<'general' | 'product' | 'claim'>('general');
  const [isClaimDetailOpen, setIsClaimDetailOpen] = useState(false);
  const [selectedClaim, setSelectedClaim] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchInquiries();
  }, []);

  const fetchInquiries = async () => {
    try {
      setLoading(true);
      const userInfo = getUserInfo();
      const id = userInfo?.id;
      // API: GET /api/users/inquiries/{userId} - Get user's inquiries
      const response = await apiFetch(`/api/users/inquiries/${id}`);

      if (response.ok) {
        const result = await response.json();
        setInquiriesData(result.data || {
          generalInquiries: [],
          productInquiries: [],
          claims: []
        });
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
      case 'approved': return '승인';
      case 'rejected': return '거절';
      default: return status;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'PENDING': return 'destructive' as const;
      case 'ANSWERED': return 'default' as const;
      case 'CLOSED': return 'secondary' as const;
      case 'approved': return 'approved' as const;
      case 'rejected': return 'destructive' as const;
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

  const renderGeneralInquiry = (inquiry: GeneralInquiry) => (
    <div key={inquiry.inquiryId} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline">일반문의</Badge>
            <Badge variant={inquiry.isAnswered ? 'default' : 'destructive'}>
              {inquiry.isAnswered ? '답변완료' : '답변대기'}
            </Badge>
            {inquiry.orderNumber && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <ShoppingCart className="h-3 w-3" />
                {inquiry.orderNumber}
              </Badge>
            )}
          </div>
          <h3 className="font-semibold text-lg mb-2">{inquiry.title}</h3>
          <p className="text-muted-foreground text-sm line-clamp-2 mb-2">
            {inquiry.question}
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
              onClick={() => {
                setSelectedItem(inquiry);
                setSelectedType('general');
              }}
            >
              <Eye className="h-4 w-4 mr-1" />
              상세보기
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                일반문의 상세내용
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant="outline">일반문의</Badge>
                <Badge variant={inquiry.isAnswered ? 'default' : 'destructive'}>
                  {inquiry.isAnswered ? '답변완료' : '답변대기'}
                </Badge>
                {inquiry.orderNumber && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <ShoppingCart className="h-3 w-3" />
                    {inquiry.orderNumber}
                  </Badge>
                )}
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2">{inquiry.title}</h3>
                <div className="text-sm text-muted-foreground mb-4">
                  {new Date(inquiry.createdAt).toLocaleDateString('ko-KR', {
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
                  <p className="whitespace-pre-wrap">{inquiry.question}</p>
                </div>
              </div>

              {inquiry.answer && (
                <div>
                  <h4 className="font-semibold mb-2 text-primary">답변내용</h4>
                  <div className="bg-primary/5 border border-primary/20 p-4 rounded-lg">
                    <p className="whitespace-pre-wrap mb-2">{inquiry.answer}</p>
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );

  const renderProductInquiry = (inquiry: ProductInquiry) => (
    <div key={inquiry.inquiryId} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline">제품문의</Badge>
            <Badge variant={inquiry.isAnswered ? 'default' : 'destructive'}>
              {inquiry.isAnswered ? '답변완료' : '답변대기'}
            </Badge>
          </div>
          <p className="text-muted-foreground text-sm line-clamp-2 mb-2">
            {inquiry.question}
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
              onClick={() => {
                setSelectedItem(inquiry);
                setSelectedType('product');
              }}
            >
              <Eye className="h-4 w-4 mr-1" />
              상세보기
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                제품문의 상세내용
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant="outline">제품문의</Badge>
                <Badge variant={inquiry.isAnswered ? 'default' : 'destructive'}>
                  {inquiry.isAnswered ? '답변완료' : '답변대기'}
                </Badge>
              </div>

              <div>
                <div className="text-sm text-muted-foreground mb-4">
                  {new Date(inquiry.createdAt).toLocaleDateString('ko-KR', {
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
                  <p className="whitespace-pre-wrap">{inquiry.question}</p>
                </div>
              </div>

              {inquiry.answer && (
                <div>
                  <h4 className="font-semibold mb-2 text-primary">답변내용</h4>
                  <div className="bg-primary/5 border border-primary/20 p-4 rounded-lg">
                    <p className="whitespace-pre-wrap mb-2">{inquiry.answer}</p>
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );

  const renderClaim = (claim: Claim) => (
    <div key={claim.claimId} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline">클레임</Badge>
            <Badge variant={getStatusVariant(claim.status)}>
              {getStatusText(claim.status)}
            </Badge>
            {claim.orderNumber && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <ShoppingCart className="h-3 w-3" />
                {claim.orderNumber}
              </Badge>
            )}
          </div>
          <h3 className="font-semibold text-lg mb-2">{claim.title}</h3>
          <p className="text-muted-foreground text-sm line-clamp-2 mb-2">
            {claim.content}
          </p>
          {claim.createdAt && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              {new Date(claim.createdAt).toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setSelectedClaim(claim);
            setIsClaimDetailOpen(true);
          }}
        >
          <Eye className="h-4 w-4 mr-1" />
          상세보기
        </Button>
      </div>
    </div>
  );

  const totalCount = inquiriesData.generalInquiries.length + inquiriesData.productInquiries.length + inquiriesData.claims.length;

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
          {totalCount === 0 ? (
            <div className="text-center py-8">
              <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">문의내역이 없습니다.</p>
            </div>
          ) : (
            <Tabs defaultValue="general" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="general" className="flex items-center gap-2">
                  <MessageCircle className="h-4 w-4" />
                  일반문의 ({inquiriesData.generalInquiries.length})
                </TabsTrigger>
                <TabsTrigger value="product" className="flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  제품문의 ({inquiriesData.productInquiries.length})
                </TabsTrigger>
                <TabsTrigger value="claim" className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  클레임 ({inquiriesData.claims.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="general" className="mt-4">
                <div className="space-y-4">
                  {inquiriesData.generalInquiries.length === 0 ? (
                    <div className="text-center py-8">
                      <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">일반문의가 없습니다.</p>
                    </div>
                  ) : (
                    inquiriesData.generalInquiries.map(renderGeneralInquiry)
                  )}
                </div>
              </TabsContent>

              <TabsContent value="product" className="mt-4">
                <div className="space-y-4">
                  {inquiriesData.productInquiries.length === 0 ? (
                    <div className="text-center py-8">
                      <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">제품문의가 없습니다.</p>
                    </div>
                  ) : (
                    inquiriesData.productInquiries.map(renderProductInquiry)
                  )}
                </div>
              </TabsContent>

              <TabsContent value="claim" className="mt-4">
                <div className="space-y-4">
                  {inquiriesData.claims.length === 0 ? (
                    <div className="text-center py-8">
                      <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">클레임이 없습니다.</p>
                    </div>
                  ) : (
                    inquiriesData.claims.map(renderClaim)
                  )}
                </div>
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>

      
      <ClaimDetailDialog
        isOpen={isClaimDetailOpen}
        onClose={() => setIsClaimDetailOpen(false)}
        claim={selectedClaim}
      />
    </div>
  );
};

export default InquiriesTab;