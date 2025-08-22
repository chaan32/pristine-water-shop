import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
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
import { Search, Eye, User, Building, Crown } from 'lucide-react';
import OrderHistoryModal from './OrderHistoryModal';
import MemberDetailModal from './MemberDetailModal';
import { adminApi } from '@/lib/api';

// 백엔드 API 응답 구조에 맞는 타입 정의
interface OrderSummary {
  orderNumber: string;
  orderId: number;
  productName: string;
  productPrice: number;
  shipmentFee: number;
}

interface Member {
  id: number;
  loginId: string;
  address: string;
  detailAddress: string;
  postalCode: string;
  phone: string;
  email: string;
  createdAt: string;
  updatedAt: string;
  orders: OrderSummary[];
  totalAmount: number;
  headQuartersInform: {
    memberType: "HEADQUARTERS";
    name: string;
    bizRegImageUrl: string;
    bizRegNumber: string;
    bizType: string;
    branches: string[];
  } | null;
  branchResDto: {
    memberType: "BRANCH";
    branchName: string;
    parentName: string;
    bizRegImageUrl: string;
    bizRegNumber: string;
    bizType: string;
  } | null;
  individualInform: {
    name: string;
    memberShipPoints: number;
  } | null;
}

const MemberList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('individual');
  const [filterType, setFilterType] = useState<'all' | 'headquarters' | 'branch'>('all');
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [orderHistoryModal, setOrderHistoryModal] = useState({
    isOpen: false,
    memberId: null as number | null,
    memberName: '',
    memberType: 'individual' as 'individual' | 'corporate'
  });
  const [memberDetailModal, setMemberDetailModal] = useState({
    isOpen: false,
    memberData: null as Member | null,
    memberType: 'individual' as 'individual' | 'corporate'
  });

  // 통합된 API에서 회원 목록 가져오기
  const fetchMembers = async () => {
    try {
      // API: GET /api/admin/members
      const response = await adminApi.getMembers();

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setMembers(data.data);
        }
      }
    } catch (error) {
      console.error('Error fetching members:', error);
    } finally {
      setLoading(false);
    }
  };

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    fetchMembers();
  }, []);

  // 개인 회원 필터링
  const filteredIndividual = members.filter(member => {
    if (!member.individualInform) return false;
    
    const matchesSearch = member.individualInform.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  // 법인 회원 필터링
  const filteredCorporate = members.filter(member => {
    if (!member.headQuartersInform && !member.branchResDto) return false;
    
    const companyName = member.headQuartersInform?.name || member.branchResDto?.parentName || '';
    const matchesSearch = companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterType === 'headquarters') return matchesSearch && member.headQuartersInform;
    if (filterType === 'branch') return matchesSearch && member.branchResDto;
    return matchesSearch;
  });

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

  const getBusinessTypeStyle = (type: string) => {
    const styles: { [key: string]: string } = {
      bakery: 'bg-orange-50 text-orange-700 border-orange-200',
      cafe: 'bg-amber-50 text-amber-700 border-amber-200',
      franchise: 'bg-purple-50 text-purple-700 border-purple-200',
      restaurant: 'bg-red-50 text-red-700 border-red-200',
      hotel: 'bg-blue-50 text-blue-700 border-blue-200',
      other: 'bg-gray-50 text-gray-700 border-gray-200'
    };
    return styles[type] || 'bg-gray-50 text-gray-700 border-gray-200';
  };

  const handleViewDetail = (member: Member, type: 'individual' | 'corporate') => {
    setMemberDetailModal({
      isOpen: true,
      memberData: member,
      memberType: type
    });
  };

  const closeMemberDetailModal = () => {
    setMemberDetailModal({
      isOpen: false,
      memberData: null,
      memberType: 'individual'
    });
  };

  const handleOrderHistoryClick = (member: Member, type: 'individual' | 'corporate') => {
    const memberName = type === 'individual' 
      ? member.individualInform?.name || ''
      : member.headQuartersInform?.name || member.branchResDto?.parentName || '';
    setOrderHistoryModal({
      isOpen: true,
      memberId: member.id,
      memberName,
      memberType: type
    });
  };

  const closeOrderHistoryModal = () => {
    setOrderHistoryModal({
      isOpen: false,
      memberId: null,
      memberName: '',
      memberType: 'individual'
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">회원 리스트</h1>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">로딩 중...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">회원 리스트</h1>
        <div className="flex gap-2">
          <Badge variant="secondary">
            개인: {filteredIndividual.length}명
          </Badge>
          <Badge variant="secondary">
            법인: {filteredCorporate.length}개사
          </Badge>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>회원 관리</CardTitle>
            <div className="relative max-w-sm">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="이름, 이메일로 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="individual" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                개인 회원
              </TabsTrigger>
              <TabsTrigger value="corporate" className="flex items-center gap-2">
                <Building className="w-4 h-4" />
                법인 회원
              </TabsTrigger>
            </TabsList>

            <TabsContent value="individual" className="mt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>이름</TableHead>
                    <TableHead>이메일</TableHead>
                    <TableHead>연락처</TableHead>
                    <TableHead>주소</TableHead>
                    <TableHead>가입일</TableHead>
                    <TableHead>적립금</TableHead>
                    <TableHead>주문 수</TableHead>
                    <TableHead>총 주문 금액</TableHead>
                    <TableHead className="text-right">관리</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredIndividual.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell className="font-medium">{member.individualInform?.name}</TableCell>
                      <TableCell>{member.email}</TableCell>
                      <TableCell>{member.phone}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {member.address} {member.detailAddress}
                        <br />
                        <span className="text-xs text-muted-foreground">({member.postalCode})</span>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(member.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {member.individualInform?.memberShipPoints || 0}P
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant="link" 
                          className="p-0 h-auto text-primary hover:underline"
                          onClick={() => handleOrderHistoryClick(member, 'individual')}
                        >
                          {member.orders?.length || 0}건
                        </Button>
                      </TableCell>
                      <TableCell className="font-medium">
                        {(member.totalAmount || 0).toLocaleString()}원
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetail(member, 'individual')}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="corporate" className="mt-6">
              <div className="mb-4">
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
                      <Crown className="w-4 h-4 text-yellow-500" />
                      본사만 보기
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="branch" id="branch" />
                    <Label htmlFor="branch" className="text-sm">지점만 보기</Label>
                  </div>
                </RadioGroup>
              </div>
              
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>회사명/지점명</TableHead>
                    <TableHead>유형</TableHead>
                    <TableHead>이메일</TableHead>
                    <TableHead>연락처</TableHead>
                    <TableHead>주소</TableHead>
                    <TableHead>사업자번호</TableHead>
                    <TableHead>업종</TableHead>
                    <TableHead>가입일</TableHead>
                    <TableHead>주문 수</TableHead>
                    <TableHead>총 주문 금액</TableHead>
                    <TableHead className="text-right">관리</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCorporate.map((member) => {
                    const isHeadquarters = !!member.headQuartersInform;
                    const companyName = member.headQuartersInform?.name || member.branchResDto?.parentName || '';
                    const bizRegNumber = member.headQuartersInform?.bizRegNumber || member.branchResDto?.bizRegNumber || '';
                    const bizType = member.headQuartersInform?.bizType || member.branchResDto?.bizType || '';
                    
                    return (
                      <TableRow key={member.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {isHeadquarters ? companyName : `${companyName} (${member.branchResDto?.branchName})`}
                            {isHeadquarters && (
                              <div title="본사 회원">
                                <Crown className="w-4 h-4 text-yellow-500" />
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {isHeadquarters ? (
                            <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700 border-yellow-200">
                              본사
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                              지점
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>{member.email}</TableCell>
                        <TableCell>{member.phone}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {member.address} {member.detailAddress}
                          <br />
                          <span className="text-xs text-muted-foreground">({member.postalCode})</span>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{bizRegNumber}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`text-xs ${getBusinessTypeStyle(bizType)}`}>
                            {getBusinessTypeText(bizType)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(member.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Button 
                            variant="link" 
                            className="p-0 h-auto text-primary hover:underline"
                            onClick={() => handleOrderHistoryClick(member, 'corporate')}
                          >
                            {member.orders?.length || 0}건
                          </Button>
                        </TableCell>
                        <TableCell className="font-medium">
                          {(member.totalAmount || 0).toLocaleString()}원
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewDetail(member, 'corporate')}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <OrderHistoryModal
        isOpen={orderHistoryModal.isOpen}
        onClose={closeOrderHistoryModal}
        memberId={orderHistoryModal.memberId}
        memberName={orderHistoryModal.memberName}
        memberType={orderHistoryModal.memberType}
      />

      <MemberDetailModal
        isOpen={memberDetailModal.isOpen}
        onClose={closeMemberDetailModal}
        memberData={memberDetailModal.memberData}
        memberType={memberDetailModal.memberType}
      />
    </div>
  );
};

export default MemberList;