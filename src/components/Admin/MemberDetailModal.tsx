import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { apiFetch } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface MemberDetail {
  id: number;
  loginId: string;
  name: string;
  contactNumber: string;
  email: string;
  createdAt: string;
  updatedAt: string;
  orders: {
    id: number;
    productName: string;
    paymentStatus: string;
    paymentMethod: string;
    productPrice: number;
    shipmentFee: number;
    shipmentStatus: string;
  }[];
  totalAmount: number;
  individualInform?: {
    memberShipPoints: number;
    address: string;
  };
  headQuartersInform?: {
    memberType: "HEADQUARTERS";
    name: string;
    businessType: string;
    businessRegistrationNumber: string;
    address: string;
  };
  branchInform?: {
    memberType: "BRANCH";
    name: string;
    businessType: string;
    businessRegistrationNumber: string;
    address: string;
    headQuartersName: string;
  };
}

interface MemberDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  memberId: number | null;
  memberType: 'individual' | 'corporate';
}

const MemberDetailModal = ({ isOpen, onClose, memberId, memberType }: MemberDetailModalProps) => {
  const [memberDetail, setMemberDetail] = useState<MemberDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchMemberDetail = async () => {
    if (!memberId) return;

    setLoading(true);
    try {
      const response = await apiFetch(`/api/admin/members/${memberId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setMemberDetail(data.data);
        }
      } else {
        throw new Error('Failed to fetch member detail');
      }
    } catch (error) {
      console.error('Error fetching member detail:', error);
      toast({
        title: "오류",
        description: "회원 상세 정보를 불러오는데 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && memberId) {
      fetchMemberDetail();
    }
  }, [isOpen, memberId]);

  const getBusinessTypeText = (businessType: string) => {
    const typeMap: { [key: string]: string } = {
      MANUFACTURING: '제조업',
      RETAIL: '소매업',
      WHOLESALE: '도매업',
      SERVICE: '서비스업',
      CONSTRUCTION: '건설업',
      RESTAURANT: '음식업',
      EDUCATION: '교육업',
      HEALTHCARE: '의료업',
      FINANCE: '금융업',
      TECHNOLOGY: '기술업',
      TRANSPORTATION: '운송업',
      REAL_ESTATE: '부동산업',
      AGRICULTURE: '농업',
      ENTERTAINMENT: '엔터테인먼트업',
      OTHER: '기타'
    };
    return typeMap[businessType] || businessType;
  };

  const calculateTotalOrderAmount = () => {
    if (!memberDetail?.orders) return 0;
    return memberDetail.orders.reduce((total, order) => 
      total + order.productPrice + order.shipmentFee, 0
    );
  };

  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="max-w-2xl">
          <div className="text-center py-8">로딩 중...</div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!memberDetail) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{memberDetail.name}님의 상세 정보</DialogTitle>
          <DialogDescription>
            {memberType === 'individual' ? '개인 회원' : '법인 회원'}의 상세 정보입니다.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* 기본 정보 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">기본 정보</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">로그인 ID</label>
                  <p className="text-sm">{memberDetail.loginId}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">이름</label>
                  <p className="text-sm">{memberDetail.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">연락처</label>
                  <p className="text-sm">{memberDetail.contactNumber}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">이메일</label>
                  <p className="text-sm">{memberDetail.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">가입일</label>
                  <p className="text-sm">{new Date(memberDetail.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">수정일</label>
                  <p className="text-sm">{new Date(memberDetail.updatedAt).toLocaleDateString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 개인 회원 정보 */}
          {memberType === 'individual' && memberDetail.individualInform && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">개인 회원 정보</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">주소</label>
                  <p className="text-sm">{memberDetail.individualInform.address}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">적립금</label>
                  <p className="text-sm font-medium">{memberDetail.individualInform.memberShipPoints}P</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 법인 회원 정보 */}
          {memberType === 'corporate' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">법인 정보</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {memberDetail.headQuartersInform && (
                  <>
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        본사
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">회사명</label>
                        <p className="text-sm">{memberDetail.headQuartersInform.name}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">업종</label>
                        <p className="text-sm">{getBusinessTypeText(memberDetail.headQuartersInform.businessType)}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">사업자번호</label>
                        <p className="text-sm">{memberDetail.headQuartersInform.businessRegistrationNumber}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">주소</label>
                        <p className="text-sm">{memberDetail.headQuartersInform.address}</p>
                      </div>
                    </div>
                  </>
                )}

                {memberDetail.branchInform && (
                  <>
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        지점
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">지점명</label>
                        <p className="text-sm">{memberDetail.branchInform.name}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">본사명</label>
                        <p className="text-sm">{memberDetail.branchInform.headQuartersName}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">업종</label>
                        <p className="text-sm">{getBusinessTypeText(memberDetail.branchInform.businessType)}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">사업자번호</label>
                        <p className="text-sm">{memberDetail.branchInform.businessRegistrationNumber}</p>
                      </div>
                      <div className="col-span-2">
                        <label className="text-sm font-medium text-muted-foreground">주소</label>
                        <p className="text-sm">{memberDetail.branchInform.address}</p>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}

          {/* 주문 요약 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">주문 요약</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">총 주문 수</label>
                  <p className="text-lg font-semibold">{memberDetail.orders?.length || 0}건</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">총 결제 금액</label>
                  <p className="text-lg font-semibold text-primary">
                    ₩{calculateTotalOrderAmount().toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MemberDetailModal;