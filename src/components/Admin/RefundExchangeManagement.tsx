import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { RotateCcw, RefreshCw, Eye, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { adminApi } from '@/lib/api';

// 프론트엔드에서 사용할 데이터 타입 정의
interface RefundExchangeRequest {
  id: string; // `RE-${claimId}` 형태의 문자열 ID
  claimId: number; // API 호출에 사용할 숫자 ID
  orderId: string;
  customerName: string;
  type: 'refund' | 'exchange';
  reason: string;
  detailReason: string;
  status: 'pending' | 'received' | 'approved' | 'rejected' | 'completed';
  requestDate: string;
  products: string[];
  amount: number;
  attachments?: string[];
}

const RefundExchangeManagement = () => {
  const [requests, setRequests] = useState<RefundExchangeRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<RefundExchangeRequest | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    const fetchRequests = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('accessToken');
        // API: GET /api/admin/claims - Get all refund/exchange claims
        const response = await adminApi.getClaims();

        if (!response.ok) {
          throw new Error('데이터를 불러오는 데 실패했습니다.');
        }

        const data = await response.json();

        if (Array.isArray(data)) {
          const formattedData: RefundExchangeRequest[] = data.map((item: any) => ({
            id: `RE-${item.claimId}`, // 화면 표시 및 key를 위한 문자열 ID
            claimId: item.claimId, // API 호출을 위한 숫자 ID
            orderId: item.orderInform?.orderNumber,
            customerName: item.customerName,
            type: (item.type ? String(item.type).toLowerCase() : 'refund') as RefundExchangeRequest['type'],
            reason: item.detailContent.title,
            detailReason: item.detailContent.content,
            status: (item.status ? String(item.status).toLowerCase() : 'pending') as RefundExchangeRequest['status'],
            requestDate: item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '',
            products: [item.orderInform?.productName].filter(Boolean) as string[],
            amount: item.orderInform?.productPrice ?? 0,
            attachments: item.detailContent.filesUrl,
          }));
          setRequests(formattedData);
        } else {
          throw new Error("API 응답이 배열 형식이 아닙니다.");
        }

      } catch (error) {
        console.error(error);
        toast({ title: "오류", description: "데이터를 불러오는 중 문제가 발생했습니다.", variant: "destructive" });
        setRequests([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [toast]);

  const handleStatusUpdate = async (claimId: number, newStatus: 'approved' | 'rejected') => {
    if (newStatus === 'rejected' && !rejectionReason.trim()) {
      toast({ title: "입력 필요", description: "거절 사유를 반드시 입력해주세요.", variant: "destructive" });
      return;
    }

    try {
    // API: POST /api/admin/claims/{claimId}/{status} - Approve or reject claim
    const response = newStatus === 'approved' 
      ? await adminApi.approveClaim(claimId)
      : await adminApi.rejectClaim(claimId, { reason: rejectionReason });

      if (!response.ok) {
        throw new Error('상태 업데이트에 실패했습니다.');
      }

      setRequests(prev => prev.map(req =>
          req.claimId === claimId ? { ...req, status: newStatus } : req
      ));

      toast({
        title: "처리 완료",
        description: `요청이 성공적으로 처리되었습니다.`,
      });

    } catch (error) {
      console.error(error);
      toast({ title: "오류", description: "작업 처리 중 문제가 발생했습니다.", variant: "destructive" });
    } finally {
      setIsDetailOpen(false);
      setRejectionReason(''); // 처리 완료 후 이유 필드 초기화
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    setIsDetailOpen(isOpen);
    if (!isOpen) {
      setRejectionReason('');
    }
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: { variant: 'secondary' as const, text: '대기중' },
      received: { variant: 'secondary' as const, text: '접수됨' },
      approved: { variant: 'default' as const, text: '승인' },
      rejected: { variant: 'destructive' as const, text: '거절' },
      completed: { variant: 'outline' as const, text: '완료' }
    };
    const key = (status || '').toLowerCase() as keyof typeof variants;
    return variants[key] || variants.pending;
  };

  const getTypeBadge = (type: string) => {
    const t = (type || '').toLowerCase();
    return t === 'refund'
        ? { icon: RotateCcw, text: '환불', className: 'text-red-600' }
        : { icon: RefreshCw, text: '교환', className: 'text-blue-600' };
  };

  const handleViewDetail = (request: RefundExchangeRequest) => {
    setSelectedRequest(request);
    setIsDetailOpen(true);
  };


  return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">환불/교환 관리</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>환불/교환 요청 목록</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>요청번호</TableHead>
                  <TableHead>주문번호</TableHead>
                  <TableHead>고객명</TableHead>
                  <TableHead>유형</TableHead>
                  <TableHead>제목</TableHead>
                  <TableHead>금액</TableHead>
                  <TableHead>상태</TableHead>
                  <TableHead>요청일</TableHead>
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
                ) : requests.length > 0 ? (
                    requests.map((request) => {
                      const statusBadge = getStatusBadge(request.status);
                      const typeBadge = getTypeBadge(request.type);
                      const TypeIcon = typeBadge.icon;

                      return (
                          <TableRow key={request.id}>
                            <TableCell className="font-medium">{request.id}</TableCell>
                            <TableCell>{request.orderId}</TableCell>
                            <TableCell>{request.customerName}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <TypeIcon className={`w-4 h-4 ${typeBadge.className}`} />
                                <span className={typeBadge.className}>{typeBadge.text}</span>
                              </div>
                            </TableCell>
                            <TableCell className="max-w-[200px] truncate">{request.reason}</TableCell>
                            <TableCell>{request.amount.toLocaleString()}원</TableCell>
                            <TableCell>
                              <Badge variant={statusBadge.variant}>{statusBadge.text}</Badge>
                            </TableCell>
                            <TableCell>{request.requestDate}</TableCell>
                            <TableCell>
                              <Button variant="outline" size="sm" onClick={() => handleViewDetail(request)}>
                                <Eye className="w-4 h-4 mr-1" /> 상세보기
                              </Button>
                            </TableCell>
                          </TableRow>
                      );
                    })
                ) : (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center h-24">
                        환불/교환 요청이 없습니다.
                      </TableCell>
                    </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Dialog open={isDetailOpen} onOpenChange={handleOpenChange}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>환불/교환 요청 상세정보</DialogTitle>
            </DialogHeader>

            {selectedRequest && (
                <div className="space-y-6 py-4">
                  <Card>
                    <CardHeader><CardTitle className="text-lg">요청 정보</CardTitle></CardHeader>
                    <CardContent className="space-y-3 text-sm">
                      <div className="grid grid-cols-2 gap-4">
                        <div><span className="font-semibold">요청번호:</span><span className="ml-2 text-muted-foreground">{selectedRequest.id}</span></div>
                        <div><span className="font-semibold">주문번호:</span><span className="ml-2 text-muted-foreground">{selectedRequest.orderId}</span></div>
                        <div><span className="font-semibold">고객명:</span><span className="ml-2 text-muted-foreground">{selectedRequest.customerName}</span></div>
                        <div><span className="font-semibold">요청일:</span><span className="ml-2 text-muted-foreground">{selectedRequest.requestDate}</span></div>
                      </div>
                      <div className="border-t pt-3 mt-3">
                        <span className="font-semibold">유형:</span>
                        <span className="ml-2 text-muted-foreground">{selectedRequest.type === 'refund' ? '환불' : '교환'}</span>
                      </div>
                      <div><span className="font-semibold">상품:</span><span className="ml-2 text-muted-foreground">{selectedRequest.products.join(', ')}</span></div>
                      <div><span className="font-semibold">금액:</span><span className="ml-2 font-bold text-lg">{selectedRequest.amount.toLocaleString()}원</span></div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader><CardTitle className="text-lg">신청 사유</CardTitle></CardHeader>
                    <CardContent className="space-y-3 text-sm">
                      <div>
                        <span className="font-semibold">제목:</span>
                        <span className="ml-2 text-muted-foreground">{selectedRequest.reason}</span>
                      </div>
                      <div>
                        <Label className="font-semibold">상세 사유:</Label>
                        <p className="mt-2 p-3 bg-muted rounded-md text-muted-foreground">{selectedRequest.detailReason}</p>
                      </div>
                    </CardContent>
                  </Card>

                  {selectedRequest.attachments && selectedRequest.attachments.length > 0 && (
                      <Card>
                        <CardHeader><CardTitle className="text-lg">첨부파일</CardTitle></CardHeader>
                        <CardContent className="space-y-2">
                          {selectedRequest.attachments.map((file, index) => (
                              <div key={index} className="flex items-center justify-between p-2 border rounded">
                                <a href={file} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline truncate pr-4">{file.split('/').pop()}</a>
                                <Button asChild variant="outline" size="sm"><a href={file} download>다운로드</a></Button>
                              </div>
                          ))}
                        </CardContent>
                      </Card>
                  )}

                  {(selectedRequest.status === 'pending' || selectedRequest.status === 'received') && (
                      <div className="space-y-4 pt-4 border-t">
                        <div>
                          <Label htmlFor="rejectionReason" className="font-semibold">거절 사유 (거절 시 필수 입력)</Label>
                          <Textarea
                              id="rejectionReason"
                              value={rejectionReason}
                              onChange={(e) => setRejectionReason(e.target.value)}
                              placeholder="요청 거절 사유를 명확하게 입력해주세요."
                              className="mt-2"
                          />
                        </div>
                        <div className="flex gap-3">
                          <Button variant="destructive" onClick={() => handleStatusUpdate(selectedRequest.claimId, 'rejected')} className="flex-1">
                            <XCircle className="w-4 h-4 mr-2" /> 거절
                          </Button>
                          <Button onClick={() => handleStatusUpdate(selectedRequest.claimId, 'approved')} className="flex-1">
                            <CheckCircle className="w-4 h-4 mr-2" /> 승인
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