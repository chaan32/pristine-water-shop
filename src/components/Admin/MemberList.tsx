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

// 실제 백엔드 DTO 구조에 맞는 타입 정의
interface IndividualMember {
  id: number;
  name: string;
  email: string;
  phone: string;
  joinDate: string;
  orderCount: number;
  totalAmount: number;
  status: string;
}

interface CorporateMember {
  id: number;
  companyName: string;
  branchName: string;
  email: string;
  phone: string;
  businessRegistrationNumber: string;
  businessType: string;
  isHeadquarters: boolean;
  joinDate: string;
  orderCount: number;
  totalAmount: number;
  status: string;
}

const MemberList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('individual');
  const [filterType, setFilterType] = useState<'all' | 'headquarters' | 'branch'>('all');
  const [individualMembers, setIndividualMembers] = useState<IndividualMember[]>([]);
  const [corporateMembers, setCorporateMembers] = useState<CorporateMember[]>([]);
  const [loading, setLoading] = useState(true);

  // 실제 API에서 회원 목록 가져오기
  const fetchMembers = async () => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      
      // 개인 회원 목록
      const individualResponse = await fetch('http://localhost:8080/api/admin/members/individual', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      // 법인 회원 목록
      const corporateResponse = await fetch('http://localhost:8080/api/admin/members/corporate', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (individualResponse.ok) {
        const individualData = await individualResponse.json();
        if (individualData.success) {
          setIndividualMembers(individualData.data);
        }
      }

      if (corporateResponse.ok) {
        const corporateData = await corporateResponse.json();
        console.log('Corporate data:', corporateData);
        if (corporateData.success) {
          console.log('Corporate members:', corporateData.data);
          setCorporateMembers(corporateData.data);
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

  const filteredIndividual = individualMembers.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredCorporate = corporateMembers.filter(member => {
    const matchesSearch = member.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    console.log('Filter type:', filterType);
    console.log('Member:', member.companyName, 'isHeadquarters:', member.isHeadquarters);
    
    if (filterType === 'headquarters') return matchesSearch && member.isHeadquarters;
    if (filterType === 'branch') return matchesSearch && !member.isHeadquarters;
    return matchesSearch; // 'all'
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

  const handleViewDetail = (id: number, type: 'individual' | 'corporate') => {
    console.log('회원 상세 조회:', { id, type });
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
            개인: {individualMembers.length}명
          </Badge>
          <Badge variant="secondary">
            법인: {corporateMembers.length}개사
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
                    <TableHead>가입일</TableHead>
                    <TableHead>주문 수</TableHead>
                    <TableHead>총 구매금액</TableHead>
                    <TableHead className="text-right">관리</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredIndividual.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell className="font-medium">{member.name}</TableCell>
                      <TableCell>{member.email}</TableCell>
                      <TableCell>{member.phone}</TableCell>
                      <TableCell className="text-muted-foreground">{member.joinDate}</TableCell>
                      <TableCell>{member.orderCount}회</TableCell>
                      <TableCell>₩{member.totalAmount.toLocaleString()}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetail(member.id, 'individual')}
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
                    <TableHead>회사명</TableHead>
                    <TableHead>지점명</TableHead>
                    <TableHead>이메일</TableHead>
                    <TableHead>연락처</TableHead>
                    <TableHead>사업자번호</TableHead>
                    <TableHead>업종</TableHead>
                    <TableHead>가입일</TableHead>
                    <TableHead>주문 수</TableHead>
                    <TableHead>총 구매금액</TableHead>
                    <TableHead className="text-right">관리</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCorporate.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {member.companyName}
                           {member.isHeadquarters && (
                             <div title="본사 회원">
                               <Crown className="w-4 h-4 text-yellow-500" />
                             </div>
                           )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {member.isHeadquarters ? (
                          <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700 border-yellow-200">
                            본사
                          </Badge>
                        ) : (
                          member.branchName
                        )}
                      </TableCell>
                      <TableCell>{member.email}</TableCell>
                      <TableCell>{member.phone}</TableCell>
                      <TableCell className="text-muted-foreground">{member.businessRegistrationNumber}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {getBusinessTypeText(member.businessType)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{member.joinDate}</TableCell>
                      <TableCell>{member.orderCount}회</TableCell>
                      <TableCell>₩{member.totalAmount.toLocaleString()}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetail(member.id, 'corporate')}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default MemberList;