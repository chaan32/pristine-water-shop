import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { CheckCircle, XCircle, Eye, Clock, Crown } from 'lucide-react';

const CorporateRequests = () => {
  const [requests, setRequests] = useState([
    {
      id: 1,
      companyName: 'DEF 펜션',
      contactName: '정사장',
      email: 'def@pension.com',
      phone: '033-123-4567',
      businessNumber: '456-78-91234',
      businessType: 'hotel',
      requestDate: '2024-07-20',
      status: 'pending',
      documents: ['사업자등록증', '통장사본'],
      isHeadquarters: false
    },
    {
      id: 2,
      companyName: 'GHI 카페',
      contactName: '김대표',
      email: 'ghi@cafe.com',
      phone: '02-987-6543',
      businessNumber: '789-12-34567',
      businessType: 'cafe',
      requestDate: '2024-07-18',
      status: 'pending',
      documents: ['사업자등록증'],
      isHeadquarters: false
    },
    {
      id: 3,
      companyName: 'JKL 리조트',
      contactName: '이팀장',
      email: 'jkl@resort.com',
      phone: '064-555-7777',
      businessNumber: '321-65-98765',
      businessType: 'hotel',
      requestDate: '2024-07-15',
      status: 'approved',
      documents: ['사업자등록증', '통장사본', '신분증'],
      isHeadquarters: true
    }
  ]);

  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [isHeadquartersChecked, setIsHeadquartersChecked] = useState(false);

  const handleApprovalClick = (request: any) => {
    setSelectedRequest(request);
    setIsHeadquartersChecked(request.isHeadquarters || false);
    setShowApprovalDialog(true);
  };

  const handleApprove = () => {
    if (selectedRequest) {
      setRequests(requests.map(req => 
        req.id === selectedRequest.id 
          ? { ...req, status: 'approved', isHeadquarters: isHeadquartersChecked } 
          : req
      ));
      setShowApprovalDialog(false);
      setSelectedRequest(null);
      console.log('승인:', selectedRequest.id, '본사 지위:', isHeadquartersChecked);
    }
  };

  const handleReject = (id: number) => {
    setRequests(requests.map(req => 
      req.id === id ? { ...req, status: 'rejected' } : req
    ));
    console.log('거절:', id);
  };

  const handleViewDetail = (id: number) => {
    console.log('상세 조회:', id);
  };

  const getBusinessTypeText = (type: string) => {
    const types: { [key: string]: string } = {
      bakery: '베이커리',
      cafe: '카페',
      franchise: '프랜차이즈',
      restaurant: '레스토랑',
      hotel: '호텔/펜션',
      other: '기타'
    };
    return types[type] || type;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          검토중
        </Badge>;
      case 'approved':
        return <Badge variant="default" className="flex items-center gap-1 bg-green-500">
          <CheckCircle className="w-3 h-3" />
          승인
        </Badge>;
      case 'rejected':
        return <Badge variant="destructive" className="flex items-center gap-1">
          <XCircle className="w-3 h-3" />
          거절
        </Badge>;
      default:
        return null;
    }
  };

  const pendingCount = requests.filter(req => req.status === 'pending').length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">법인 회원 등록 요청</h1>
        <Badge variant="secondary">
          대기중: {pendingCount}건
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>등록 요청 목록</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>회사명</TableHead>
                <TableHead>담당자</TableHead>
                <TableHead>연락처</TableHead>
                <TableHead>사업자번호</TableHead>
                <TableHead>업종</TableHead>
                <TableHead>요청일</TableHead>
                <TableHead>제출 서류</TableHead>
                <TableHead>상태</TableHead>
                <TableHead className="text-right">관리</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {request.companyName}
                      {request.isHeadquarters && request.status === 'approved' && (
                        <div title="본사 회원">
                          <Crown className="w-4 h-4 text-yellow-500" />
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div>{request.contactName}</div>
                      <div className="text-sm text-muted-foreground">{request.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>{request.phone}</TableCell>
                  <TableCell className="font-mono text-sm">{request.businessNumber}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {getBusinessTypeText(request.businessType)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{request.requestDate}</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {request.documents.map((doc, index) => (
                        <Badge key={index} variant="outline" className="mr-1 text-xs">
                          {doc}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(request.status)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDetail(request.id)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      {request.status === 'pending' && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleApprovalClick(request)}
                            className="text-green-600 hover:text-green-700"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleReject(request.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <XCircle className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* 승인/거절 통계 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 요청</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{requests.length}</div>
            <p className="text-xs text-muted-foreground">전체 등록 요청</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">승인</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {requests.filter(req => req.status === 'approved').length}
            </div>
            <p className="text-xs text-muted-foreground">승인된 요청</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">대기중</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{pendingCount}</div>
            <p className="text-xs text-muted-foreground">검토 대기</p>
          </CardContent>
        </Card>
      </div>

      {/* 승인 확인 다이얼로그 */}
      <Dialog open={showApprovalDialog} onOpenChange={setShowApprovalDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>법인 회원 승인</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedRequest && (
              <div className="space-y-2">
                <p><strong>회사명:</strong> {selectedRequest.companyName}</p>
                <p><strong>담당자:</strong> {selectedRequest.contactName}</p>
                <p><strong>업종:</strong> {getBusinessTypeText(selectedRequest.businessType)}</p>
              </div>
            )}
            
            <div className="flex items-center space-x-2 p-4 border rounded-lg">
              <Checkbox 
                id="headquarters" 
                checked={isHeadquartersChecked}
                onCheckedChange={(checked) => setIsHeadquartersChecked(!!checked)}
              />
              <div className="space-y-1">
                <Label 
                  htmlFor="headquarters" 
                  className="text-sm font-medium cursor-pointer flex items-center gap-2"
                >
                  <Crown className="w-4 h-4 text-yellow-500" />
                  본사 지위 부여
                </Label>
                <p className="text-xs text-muted-foreground">
                  본사 회원은 지점 회원들의 구매 내역을 조회할 수 있습니다.
                </p>
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowApprovalDialog(false)}>
                취소
              </Button>
              <Button onClick={handleApprove} className="bg-green-600 hover:bg-green-700">
                승인
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CorporateRequests;