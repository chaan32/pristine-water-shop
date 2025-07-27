import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { RotateCcw, RefreshCw, Eye, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface RefundExchangeRequest {
  id: string;
  orderId: string;
  customerName: string;
  type: 'refund' | 'exchange';
  reason: string;
  detailReason: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  requestDate: string;
  products: string[];
  amount: number;
  attachments?: string[];
}

const RefundExchangeManagement = () => {
  const [selectedRequest, setSelectedRequest] = useState<RefundExchangeRequest | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const { toast } = useToast();

  // 임시 데이터
  const requests: RefundExchangeRequest[] = [
    {
      id: 'RE001',
      orderId: 'ORD-2024-001',
      customerName: '김수민',
      type: 'refund',
      reason: '단순 변심',
      detailReason: '생각했던 것과 달라서 환불을 요청합니다.',
      status: 'pending',
      requestDate: '2024-01-15',
      products: ['프리미엄 정수기 필터'],
      amount: 89000,
      attachments: ['상품사진1.jpg']
    },
    {
      id: 'RE002',
      orderId: 'ORD-2024-002',
      customerName: '이민호',
      type: 'exchange',
      reason: '상품 불량/하자',
      detailReason: '필터에 크랙이 발견되어 교환을 요청합니다.',
      status: 'approved',
      requestDate: '2024-01-14',
      products: ['샤워 필터'],
      amount: 65000,
      attachments: ['불량사진1.jpg', '불량사진2.jpg']
    },
    {
      id: 'RE003',
      orderId: 'ORD-2024-003',
      customerName: '박지영',
      type: 'refund',
      reason: '배송 지연',
      detailReason: '배송이 1주일 이상 지연되어 환불을 요청합니다.',
      status: 'completed',
      requestDate: '2024-01-13',
      products: ['주방용 정수기'],
      amount: 129000
    }
  ];

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: { variant: 'secondary' as const, text: '대기중' },
      approved: { variant: 'default' as const, text: '승인' },
      rejected: { variant: 'destructive' as const, text: '거절' },
      completed: { variant: 'outline' as const, text: '완료' }
    };
    return variants[status as keyof typeof variants];
  };

  const getTypeBadge = (type: string) => {
    return type === 'refund' 
      ? { icon: RotateCcw, text: '환불', className: 'text-red-600' }
      : { icon: RefreshCw, text: '교환', className: 'text-blue-600' };
  };

  const handleViewDetail = (request: RefundExchangeRequest) => {
    setSelectedRequest(request);
    setIsDetailOpen(true);
  };

  const handleStatusUpdate = (requestId: string, newStatus: 'approved' | 'rejected') => {
    toast({
      title: "상태 업데이트",
      description: `요청이 ${newStatus === 'approved' ? '승인' : '거절'}되었습니다.`,
    });
    setIsDetailOpen(false);
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
                <TableHead>사유</TableHead>
                <TableHead>금액</TableHead>
                <TableHead>상태</TableHead>
                <TableHead>요청일</TableHead>
                <TableHead>작업</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((request) => {
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
                    <TableCell>{request.reason}</TableCell>
                    <TableCell>{request.amount.toLocaleString()}원</TableCell>
                    <TableCell>
                      <Badge variant={statusBadge.variant}>
                        {statusBadge.text}
                      </Badge>
                    </TableCell>
                    <TableCell>{request.requestDate}</TableCell>
                    <TableCell>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleViewDetail(request)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        상세보기
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* 상세보기 다이얼로그 */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>환불/교환 요청 상세정보</DialogTitle>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-6">
              {/* 기본 정보 */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">요청 정보</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="font-medium">요청번호:</span>
                      <span className="ml-2">{selectedRequest.id}</span>
                    </div>
                    <div>
                      <span className="font-medium">주문번호:</span>
                      <span className="ml-2">{selectedRequest.orderId}</span>
                    </div>
                    <div>
                      <span className="font-medium">고객명:</span>
                      <span className="ml-2">{selectedRequest.customerName}</span>
                    </div>
                    <div>
                      <span className="font-medium">요청일:</span>
                      <span className="ml-2">{selectedRequest.requestDate}</span>
                    </div>
                  </div>
                  <div>
                    <span className="font-medium">유형:</span>
                    <span className="ml-2">
                      {selectedRequest.type === 'refund' ? '환불' : '교환'}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">상품:</span>
                    <span className="ml-2">{selectedRequest.products.join(', ')}</span>
                  </div>
                  <div>
                    <span className="font-medium">금액:</span>
                    <span className="ml-2 font-bold">{selectedRequest.amount.toLocaleString()}원</span>
                  </div>
                </CardContent>
              </Card>

              {/* 사유 */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">신청 사유</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div>
                      <span className="font-medium">사유:</span>
                      <span className="ml-2">{selectedRequest.reason}</span>
                    </div>
                    <div>
                      <span className="font-medium">상세 사유:</span>
                      <p className="mt-1 p-3 bg-muted rounded-md">
                        {selectedRequest.detailReason}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 첨부파일 */}
              {selectedRequest.attachments && selectedRequest.attachments.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">첨부파일</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {selectedRequest.attachments.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-2 border rounded">
                          <span className="text-sm">{file}</span>
                          <Button variant="outline" size="sm">
                            다운로드
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* 상태 관리 버튼 */}
              {selectedRequest.status === 'pending' && (
                <div className="flex gap-3 pt-4">
                  <Button 
                    variant="destructive" 
                    onClick={() => handleStatusUpdate(selectedRequest.id, 'rejected')}
                    className="flex-1"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    거절
                  </Button>
                  <Button 
                    onClick={() => handleStatusUpdate(selectedRequest.id, 'approved')}
                    className="flex-1"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    승인
                  </Button>
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