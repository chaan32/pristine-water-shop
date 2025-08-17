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
  address: string;
  detailAddress: string;
  postalCode: string;
  phone: string;
  email: string;
  createdAt: string;
  updatedAt: string;
  orders: {
    orderNumber: string;
    orderId: number;
    productName: string;
    productPrice: number;
    shipmentFee: number;
  }[];
  totalAmount: number;
  headQuartersInform?: {
    memberType: "HEADQUARTERS";
    name: string;
    bizRegImageUrl: string;
    bizRegNumber: string;
    bizType: string;
    branches: string[];
  };
  branchResDto?: {
    memberType: "BRANCH";
    branchName: string;
    parentName: string;
    bizRegImageUrl: string;
    bizRegNumber: string;
    bizType: string;
  };
  individualInform?: {
    name: string;
    memberShipPoints: number;
  };
}

interface MemberDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  memberData: MemberDetail | null;
  memberType: 'individual' | 'corporate';
}

const MemberDetailModal = ({ isOpen, onClose, memberData, memberType }: MemberDetailModalProps) => {

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
    if (!memberData?.orders) return 0;
    return memberData.orders.reduce((total, order) => 
      total + order.productPrice + order.shipmentFee, 0
    );
  };

  if (!memberData) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {memberType === 'individual' 
              ? memberData.individualInform?.name 
              : memberData.headQuartersInform?.name || memberData.branchResDto?.parentName
            }님의 상세 정보
          </DialogTitle>
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
                  <p className="text-sm">{memberData.loginId}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">이름</label>
                  <p className="text-sm">
                    {memberType === 'individual' 
                      ? memberData.individualInform?.name 
                      : memberData.headQuartersInform?.name || memberData.branchResDto?.parentName
                    }
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">연락처</label>
                  <p className="text-sm">{memberData.phone}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">이메일</label>
                  <p className="text-sm">{memberData.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">가입일</label>
                  <p className="text-sm">{new Date(memberData.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">수정일</label>
                  <p className="text-sm">{new Date(memberData.updatedAt).toLocaleDateString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 개인 회원 정보 */}
          {memberType === 'individual' && memberData.individualInform && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">개인 회원 정보</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">주소</label>
                  <p className="text-sm">{memberData.address} {memberData.detailAddress}</p>
                  {memberData.postalCode && (
                    <p className="text-xs text-muted-foreground">({memberData.postalCode})</p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">적립금</label>
                  <p className="text-sm font-medium">{memberData.individualInform.memberShipPoints}P</p>
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
                {memberData.headQuartersInform && (
                  <>
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        본사
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">회사명</label>
                        <p className="text-sm">{memberData.headQuartersInform.name}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">업종</label>
                        <p className="text-sm">{getBusinessTypeText(memberData.headQuartersInform.bizType)}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">사업자번호</label>
                        <p className="text-sm">{memberData.headQuartersInform.bizRegNumber}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">주소</label>
                        <p className="text-sm">{memberData.address} {memberData.detailAddress}</p>
                        {memberData.postalCode && (
                          <p className="text-xs text-muted-foreground">({memberData.postalCode})</p>
                        )}
                      </div>
                    </div>
                  </>
                )}

                {memberData.branchResDto && (
                  <>
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        지점
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">지점명</label>
                        <p className="text-sm">{memberData.branchResDto.branchName}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">본사명</label>
                        <p className="text-sm">{memberData.branchResDto.parentName}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">업종</label>
                        <p className="text-sm">{getBusinessTypeText(memberData.branchResDto.bizType)}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">사업자번호</label>
                        <p className="text-sm">{memberData.branchResDto.bizRegNumber}</p>
                      </div>
                      <div className="col-span-2">
                        <label className="text-sm font-medium text-muted-foreground">주소</label>
                        <p className="text-sm">{memberData.address} {memberData.detailAddress}</p>
                        {memberData.postalCode && (
                          <p className="text-xs text-muted-foreground">({memberData.postalCode})</p>
                        )}
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
                  <p className="text-lg font-semibold">{memberData.orders?.length || 0}건</p>
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