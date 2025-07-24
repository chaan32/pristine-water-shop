import Header from '@/components/Layout/Header';
import Footer from '@/components/Layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { UserPlus, Building, User } from 'lucide-react';

const Register = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-4">회원가입</h1>
            <p className="text-lg text-muted-foreground">개인/법인 회원가입을 선택해주세요</p>
          </div>

          <Tabs defaultValue="individual" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="individual" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                개인회원
              </TabsTrigger>
              <TabsTrigger value="corporate" className="flex items-center gap-2">
                <Building className="w-4 h-4" />
                법인회원
              </TabsTrigger>
            </TabsList>

            <TabsContent value="individual" className="mt-8">
              <Card className="water-drop">
                <CardHeader>
                  <CardTitle>개인회원 가입</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input placeholder="이름" />
                    <Input placeholder="아이디" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input type="password" placeholder="비밀번호" />
                    <Input type="password" placeholder="비밀번호 확인" />
                  </div>
                  <Input type="email" placeholder="이메일" />
                  <div className="flex gap-2">
                    <Input placeholder="휴대폰 번호" className="flex-1" />
                    <Button variant="outline">인증</Button>
                  </div>
                  <Input placeholder="주소" />
                  
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="terms1" />
                      <label htmlFor="terms1" className="text-sm">이용약관에 동의합니다 (필수)</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="privacy1" />
                      <label htmlFor="privacy1" className="text-sm">개인정보 처리방침에 동의합니다 (필수)</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="marketing1" />
                      <label htmlFor="marketing1" className="text-sm">마케팅 정보 수신에 동의합니다 (선택)</label>
                    </div>
                  </div>

                  <Button className="w-full water-drop" size="lg">
                    <UserPlus className="w-4 h-4 mr-2" />
                    개인회원 가입
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="corporate" className="mt-8">
              <Card className="water-drop">
                <CardHeader>
                  <CardTitle>법인회원 가입</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input placeholder="회사명" />
                    <Input placeholder="사업자등록번호" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input placeholder="대표자명" />
                    <Input placeholder="담당자명" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input placeholder="아이디" />
                    <Input type="password" placeholder="비밀번호" />
                  </div>
                  <Input type="password" placeholder="비밀번호 확인" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input type="email" placeholder="이메일" />
                    <Input placeholder="회사 전화번호" />
                  </div>
                  <Input placeholder="회사 주소" />
                  
                  <div className="bg-secondary/50 p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-2">
                      * 법인회원은 별도 인증 절차가 필요합니다.
                    </p>
                    <p className="text-sm text-muted-foreground">
                      * 가입 승인까지 1-2일 소요될 수 있습니다.
                    </p>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="terms2" />
                      <label htmlFor="terms2" className="text-sm">이용약관에 동의합니다 (필수)</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="privacy2" />
                      <label htmlFor="privacy2" className="text-sm">개인정보 처리방침에 동의합니다 (필수)</label>
                    </div>
                  </div>

                  <Button className="w-full water-drop" size="lg">
                    <Building className="w-4 h-4 mr-2" />
                    법인회원 가입 신청
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Register;