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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Search, Plus } from 'lucide-react';
import { apiFetch, productInjectApi } from '@/lib/api';
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
  specializeProduct?: {
    id: number;
    name: string;
    imageUrl: string;
  }[];
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
    managerName?: string;
    managerPhone?: string;
  };
  individualInform?: {
    name: string;
    memberShipPoints: number;
  };
}

interface SearchProduct {
  id: number;
  name: string;
  imageUrl: string;
}

interface MemberDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  memberData: MemberDetail | null;
  memberType: 'individual' | 'corporate';
  onUpdate?: () => void;
}

const MemberDetailModal = ({ isOpen, onClose, memberData, memberType, onUpdate }: MemberDetailModalProps) => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<SearchProduct[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [localMemberData, setLocalMemberData] = useState<MemberDetail | null>(memberData);

  // memberData가 변경될 때 로컬 상태도 업데이트
  useEffect(() => {
    setLocalMemberData(memberData);
  }, [memberData]);

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

  const handleSearchProducts = async () => {
    if (!searchTerm.trim()) return;

    setIsSearching(true);
    try {
      const response: SearchProduct[] = await productInjectApi.searchProductsByName(searchTerm);
      setSearchResults(response);
    } catch (error) {
      toast({
        title: "검색 실패",
        description: "상품 검색에 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddProduct = async (productId: number) => {
    if (!localMemberData) return;

    // 추가할 상품 찾기
    const productToAdd = searchResults.find(p => p.id === productId);
    if (!productToAdd) return;

    // 낙관적 업데이트 - 즉시 UI에 반영
    const updatedMemberData = {
      ...localMemberData,
      specializeProduct: [
        ...(localMemberData.specializeProduct || []),
        productToAdd
      ]
    };
    setLocalMemberData(updatedMemberData);

    // Reset search immediately
    setSearchTerm('');
    setSearchResults([]);

    try {
      await productInjectApi.injectProductToMember({
        memberId: localMemberData.id,
        productId: productId
      });
      
      toast({
        title: "상품 추가 완료",
        description: "특별 상품이 성공적으로 추가되었습니다.",
      });

      // Call update callback to refresh parent data
      if (onUpdate) onUpdate();
    } catch (error) {
      // 실패 시 원래 상태로 되돌리기
      setLocalMemberData(localMemberData);
      
      toast({
        title: "상품 추가 실패",
        description: "특별 상품 추가에 실패했습니다.",
        variant: "destructive",
      });
    }
  };

  const handleRemoveProduct = async (specializeProductId: number) => {
    if (!localMemberData) return;

    // 삭제할 상품 찾기 및 낙관적 업데이트
    const originalProducts = localMemberData.specializeProduct || [];
    const updatedProducts = originalProducts.filter(p => p.id !== specializeProductId);
    
    const updatedMemberData = {
      ...localMemberData,
      specializeProduct: updatedProducts
    };
    setLocalMemberData(updatedMemberData);

    try {
      await productInjectApi.deleteInjectedProduct(specializeProductId);
      
      toast({
        title: "상품 삭제 완료",
        description: "특별 상품이 성공적으로 삭제되었습니다.",
      });

      // Call update callback to refresh parent data
      if (onUpdate) onUpdate();
    } catch (error) {
      // 실패 시 원래 상태로 되돌리기
      setLocalMemberData(localMemberData);
      
      toast({
        title: "상품 삭제 실패",
        description: "특별 상품 삭제에 실패했습니다.",
        variant: "destructive",
      });
    }
  };

  if (!localMemberData) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {memberType === 'individual' 
              ? localMemberData.individualInform?.name 
              : localMemberData.headQuartersInform?.name || localMemberData.branchResDto?.parentName
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
                  <p className="text-sm">{localMemberData.loginId}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">이름</label>
                  <p className="text-sm">
                    {memberType === 'individual' 
                      ? localMemberData.individualInform?.name 
                      : localMemberData.headQuartersInform?.name || localMemberData.branchResDto?.parentName
                    }
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">연락처</label>
                  <p className="text-sm">{localMemberData.phone}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">이메일</label>
                  <p className="text-sm">{localMemberData.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">가입일</label>
                  <p className="text-sm">{new Date(localMemberData.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">수정일</label>
                  <p className="text-sm">{new Date(localMemberData.updatedAt).toLocaleDateString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 개인 회원 정보 */}
          {memberType === 'individual' && localMemberData.individualInform && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">개인 회원 정보</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">주소</label>
                  <p className="text-sm">{localMemberData.address} {localMemberData.detailAddress}</p>
                  {localMemberData.postalCode && (
                    <p className="text-xs text-muted-foreground">({localMemberData.postalCode})</p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">적립금</label>
                  <p className="text-sm font-medium">{localMemberData.individualInform.memberShipPoints}P</p>
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
                {localMemberData.headQuartersInform && (
                  <>
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        본사
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">회사명</label>
                        <p className="text-sm">{localMemberData.headQuartersInform.name}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">업종</label>
                        <p className="text-sm">{getBusinessTypeText(localMemberData.headQuartersInform.bizType)}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">사업자번호</label>
                        <p className="text-sm">{localMemberData.headQuartersInform.bizRegNumber}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">주소</label>
                        <p className="text-sm">{localMemberData.address} {localMemberData.detailAddress}</p>
                        {localMemberData.postalCode && (
                          <p className="text-xs text-muted-foreground">({localMemberData.postalCode})</p>
                        )}
                      </div>
                    </div>
                  </>
                )}

                {localMemberData.branchResDto && (
                  <>
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        지점
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">지점명</label>
                        <p className="text-sm">{localMemberData.branchResDto.branchName}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">본사명</label>
                        <p className="text-sm">{localMemberData.branchResDto.parentName}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">업종</label>
                        <p className="text-sm">{getBusinessTypeText(localMemberData.branchResDto.bizType)}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">사업자번호</label>
                        <p className="text-sm">{localMemberData.branchResDto.bizRegNumber}</p>
                      </div>
                      <div className="col-span-2">
                        <label className="text-sm font-medium text-muted-foreground">주소</label>
                        <p className="text-sm">{localMemberData.address} {localMemberData.detailAddress}</p>
                        {localMemberData.postalCode && (
                          <p className="text-xs text-muted-foreground">({localMemberData.postalCode})</p>
                        )}
                      </div>
                      {localMemberData.branchResDto.managerName && (
                        <>
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">매니저명</label>
                            <p className="text-sm">{localMemberData.branchResDto.managerName}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">매니저 연락처</label>
                            <p className="text-sm">{localMemberData.branchResDto.managerPhone}</p>
                          </div>
                        </>
                      )}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}

          {/* 특별 상품 관리 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">특별 상품 관리</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 상품 검색 */}
              <div className="flex gap-2">
                <div className="flex-1">
                  <Input
                    placeholder="상품명으로 검색..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearchProducts()}
                  />
                </div>
                <Button 
                  onClick={handleSearchProducts}
                  disabled={isSearching || !searchTerm.trim()}
                  size="icon"
                >
                  <Search className="h-4 w-4" />
                </Button>
              </div>

              {/* 검색 결과 */}
              {searchResults.length > 0 && (
                <div className="border rounded-lg p-3 max-h-48 overflow-y-auto">
                  <p className="text-sm font-medium mb-2">검색 결과</p>
                  <div className="space-y-2">
                    {searchResults.map((product) => (
                      <div key={product.id} className="flex items-center justify-between p-2 border rounded hover:bg-muted/50">
                        <div className="flex items-center gap-3">
                          <img 
                            src={product.imageUrl} 
                            alt={product.name}
                            className="w-10 h-10 object-cover rounded"
                          />
                          <span className="text-sm">{product.name}</span>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleAddProduct(product.id)}
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          추가
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 현재 특별 상품 목록 */}
              <div>
                <p className="text-sm font-medium mb-2">현재 특별 상품</p>
                {localMemberData.specializeProduct && localMemberData.specializeProduct.length > 0 ? (
                  <div className="space-y-2">
                    {localMemberData.specializeProduct.map((product) => (
                      <div key={product.id} className="flex items-center justify-between p-2 border rounded">
                        <div className="flex items-center gap-3">
                          <img 
                            src={product.imageUrl} 
                            alt={product.name}
                            className="w-10 h-10 object-cover rounded"
                          />
                          <span className="text-sm">{product.name}</span>
                        </div>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleRemoveProduct(product.id)}
                        >
                          <X className="h-3 w-3 mr-1" />
                          삭제
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground py-4 text-center">
                    등록된 특별 상품이 없습니다.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 주문 요약 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">주문 요약</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">총 주문 수</label>
                  <p className="text-lg font-semibold">{localMemberData.orders?.length || 0}건</p>
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