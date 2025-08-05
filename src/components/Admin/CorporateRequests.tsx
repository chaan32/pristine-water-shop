import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { CheckCircle, XCircle, Eye, Clock, Crown } from 'lucide-react';

// 실제 백엔드 ApproveResponseDto 구조에 맞는 타입 정의
interface ApproveRequest {
  id: number;
  companyName: string;
  branchName: string;
  phone: string;
  email: string;
  businessRegistrationNumber: string;
  businessRegistrationURL: string;
  businessType: string;
  isHeadquarters: boolean;
  approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  requestDate: string; // Date를 string으로 받아서 처리
}

const CorporateRequests = () => {
  const [requests, setRequests] = useState<ApproveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<'all' | 'headquarters' | 'branch'>('all');

  // 실제 API에서 법인 승인 요청 목록 가져오기
  const fetchCorporateRequests = async () => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      const response = await fetch('http://localhost:8080/api/admin/corporate-requests', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Corporate requests data:', data);
        
        // API 응답이 직접 배열인 경우와 { success, data } 형태 모두 처리
        if (Array.isArray(data)) {
          setRequests(data);
        } else if (data.success && data.data) {
          setRequests(data.data);
        }
      }
    } catch (error) {
      console.error('Error fetching corporate requests:', error);
    } finally {
      setLoading(false);
    }
  };

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    fetchCorporateRequests();
  }, []);

  const [selectedRequest, setSelectedRequest] = useState<ApproveRequest | null>(null);
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [isHeadquartersChecked, setIsHeadquartersChecked] = useState(false);

  const handleApprovalClick = (request: ApproveRequest) => {
    setSelectedRequest(request);
    setIsHeadquartersChecked(request.isHeadquarters || false);
    setShowApprovalDialog(true);
  };

  const handleApprove = async () => {
    if (selectedRequest) {
      try {
        const accessToken = localStorage.getItem('accessToken');
        const response = await fetch(`http://localhost:8080/api/admin/corporate-requests/${selectedRequest.id}/approve`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            isHeadquarters: isHeadquartersChecked
          })
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            // 서버에서 최신 데이터를 다시 가져옴
            await fetchCorporateRequests();
            setShowApprovalDialog(false);
            setSelectedRequest(null);
            alert('승인이 완료되었습니다.');
          }
        }
      } catch (error) {
        console.error('Error approving request:', error);
        alert('승인 처리 중 오류가 발생했습니다.');
      }
    }
  };

  const handleReject = async (id: number) => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      const response = await fetch(`http://localhost:8080/api/admin/corporate-requests/${id}/reject`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // 서버에서 최신 데이터를 다시 가져옴
          await fetchCorporateRequests();
          alert('거절이 완료되었습니다.');
        }
      }
    } catch (error) {
      console.error('Error rejecting request:', error);
      alert('거절 처리 중 오류가 발생했습니다.');
    }
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
      case 'PENDING':
        return <Badge variant="secondary" className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          검토중
        </Badge>;
      case 'APPROVED':
        return <Badge variant="default" className="flex items-center gap-1 bg-green-500">
          <CheckCircle className="w-3 h-3" />
          승인
        </Badge>;
      case 'REJECTED':
        return <Badge variant="destructive" className="flex items-center gap-1">
          <XCircle className="w-3 h-3" />
          거절
        </Badge>;
      default:
        return null;
    }
  };

  // 필터링된 요청 목록
  const filteredRequests = requests.filter(request => {
    if (filterType === 'headquarters') return request.isHeadquarters;
    if (filterType === 'branch') return !request.isHeadquarters;
    return true; // 'all'
  });

  const pendingCount = requests.filter(req => req.approvalStatus === 'PENDING').length;

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
          <CardTitle className="flex items-center justify-between">
            <span>등록 요청 목록</span>
            <div className="flex items-center gap-4">
              <RadioGroup
                value={filterType}
                onValueChange={(value) => setFilterType(value as 'all' | 'headquarters' | 'branch')}
                className="flex flex-row gap-6"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="all" id="all" />
                  <Label htmlFor="all" className="text-sm">모두 보기</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="headquarters" id="headquarters" />
                  <Label htmlFor="headquarters" className="text-sm flex items-center gap-1">
                    <Crown className="w-3 h-3 text-yellow-500" />
                    본사만 보기
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="branch" id="branch" />
                  <Label htmlFor="branch" className="text-sm">지점만 보기</Label>
                </div>
              </RadioGroup>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>회사명/지점명</TableHead>
                <TableHead>이메일</TableHead>
                <TableHead>연락처</TableHead>
                <TableHead>사업자번호</TableHead>
                <TableHead>업종</TableHead>
                <TableHead>요청일</TableHead>
                <TableHead>사업자등록증</TableHead>
                <TableHead>상태</TableHead>
                <TableHead className="text-right">관리</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRequests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <div>
                        <div>{request.companyName}</div>
                        <div className="text-sm text-muted-foreground">{request.branchName}</div>
                      </div>
                      {request.isHeadquarters && (
                        <div title="본사 회원">
                          <Crown className="w-4 h-4 text-yellow-500" />
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {request.email}
                  </TableCell>
                  <TableCell>{request.phone}</TableCell>
                  <TableCell className="font-mono text-sm">{request.businessRegistrationNumber}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {getBusinessTypeText(request.businessType)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{request.requestDate}</TableCell>
                  <TableCell>
                    <Button
                      variant="link"
                      size="sm"
                      onClick={() => window.open(request.businessRegistrationURL, '_blank')}
                      className="p-0 h-auto text-blue-600 hover:text-blue-800"
                    >
                      보기
                    </Button>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(request.approvalStatus)}
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
                      {request.approvalStatus === 'PENDING' && (
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
              {requests.filter(req => req.approvalStatus === 'APPROVED').length}
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
                <p><strong>지점명:</strong> {selectedRequest.branchName}</p>
                <p><strong>이메일:</strong> {selectedRequest.email}</p>
                <p><strong>연락처:</strong> {selectedRequest.phone}</p>
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