import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Search, Eye, User, Building } from 'lucide-react';

const MemberList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('individual');

  const individualMembers = [
    {
      id: 1,
      name: '홍길동',
      email: 'hong@email.com',
      phone: '010-1234-5678',
      joinDate: '2024-01-15',
      orderCount: 12,
      totalAmount: 890000,
      status: '정상'
    },
    {
      id: 2,
      name: '김영희',
      email: 'kim@email.com',
      phone: '010-9876-5432',
      joinDate: '2024-02-10',
      orderCount: 8,
      totalAmount: 650000,
      status: '정상'
    },
    {
      id: 3,
      name: '박철수',
      email: 'park@email.com',
      phone: '010-5555-1234',
      joinDate: '2024-03-05',
      orderCount: 3,
      totalAmount: 230000,
      status: '휴면'
    }
  ];

  const corporateMembers = [
    {
      id: 1,
      companyName: 'ABC 호텔',
      contactName: '이담당자',
      email: 'contact@abchotel.com',
      phone: '02-1234-5678',
      businessNumber: '123-45-67890',
      joinDate: '2024-01-20',
      orderCount: 25,
      totalAmount: 5600000,
      status: '정상'
    },
    {
      id: 2,
      companyName: 'XYZ 레스토랑',
      contactName: '최매니저',
      email: 'manager@xyz.com',
      phone: '02-9876-5432',
      businessNumber: '987-65-43210',
      joinDate: '2024-02-15',
      orderCount: 18,
      totalAmount: 3200000,
      status: '정상'
    }
  ];

  const filteredIndividual = individualMembers.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredCorporate = corporateMembers.filter(member =>
    member.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewDetail = (id: number, type: 'individual' | 'corporate') => {
    console.log('회원 상세 조회:', { id, type });
  };

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
                    <TableHead>상태</TableHead>
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
                      <TableCell>
                        <Badge variant={member.status === '정상' ? 'default' : 'secondary'}>
                          {member.status}
                        </Badge>
                      </TableCell>
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
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>회사명</TableHead>
                    <TableHead>담당자</TableHead>
                    <TableHead>이메일</TableHead>
                    <TableHead>연락처</TableHead>
                    <TableHead>사업자번호</TableHead>
                    <TableHead>가입일</TableHead>
                    <TableHead>주문 수</TableHead>
                    <TableHead>총 구매금액</TableHead>
                    <TableHead>상태</TableHead>
                    <TableHead className="text-right">관리</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCorporate.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell className="font-medium">{member.companyName}</TableCell>
                      <TableCell>{member.contactName}</TableCell>
                      <TableCell>{member.email}</TableCell>
                      <TableCell>{member.phone}</TableCell>
                      <TableCell className="text-muted-foreground">{member.businessNumber}</TableCell>
                      <TableCell className="text-muted-foreground">{member.joinDate}</TableCell>
                      <TableCell>{member.orderCount}회</TableCell>
                      <TableCell>₩{member.totalAmount.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant={member.status === '정상' ? 'default' : 'secondary'}>
                          {member.status}
                        </Badge>
                      </TableCell>
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