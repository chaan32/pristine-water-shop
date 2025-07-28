import Header from '@/components/Layout/Header';
import Footer from '@/components/Layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { LogIn, User, Lock } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';

const Login = () => {
  const navigate = useNavigate();
  const [loginData, setLoginData] = useState({
    username: '',
    password: ''
  });

  const handleLogin = () => {
    // 임시 로그인 로직 - 실제로는 백엔드 API와 연동
    if (loginData.username === 'admin' && loginData.password === 'admin') {
      // 관리자 로그인
      localStorage.setItem('userType', 'admin');
      localStorage.setItem('userName', '김관리자');
      navigate('/admin');
    } else if (loginData.username === 'headquarters' && loginData.password === 'headquarters') {
      // 본사 회원 로그인
      localStorage.setItem('userType', 'headquarters');
      localStorage.setItem('userName', 'ABC카페 본사');
      localStorage.setItem('companyName', 'ABC카페');
      localStorage.setItem('isHeadquarters', 'true');
      navigate('/mypage');
    } else if (loginData.username === 'branch' && loginData.password === 'branch') {
      // 지점 회원 로그인
      localStorage.setItem('userType', 'branch');
      localStorage.setItem('userName', 'ABC카페 강남점');
      localStorage.setItem('companyName', 'ABC카페');
      localStorage.setItem('parentCompany', 'ABC카페 본사');
      localStorage.setItem('isHeadquarters', 'false');
      navigate('/mypage');
    } else if (loginData.username && loginData.password) {
      // 일반 사용자 로그인
      localStorage.setItem('userType', 'individual');
      localStorage.setItem('userName', '홍길동');
      navigate('/mypage');
    } else {
      alert('아이디 또는 비밀번호가 올바르지 않습니다.');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto">
          <Card className="water-drop">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold">로그인</CardTitle>
              <p className="text-muted-foreground">AquaPure에 오신 것을 환영합니다</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                   <Input 
                    placeholder="아이디 (관리자: admin, 본사: headquarters, 지점: branch)" 
                    className="pl-10"
                    value={loginData.username}
                    onChange={(e) => setLoginData(prev => ({ ...prev, username: e.target.value }))}
                  />
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                   <Input 
                    type="password" 
                    placeholder="비밀번호 (관리자: admin, 본사: headquarters, 지점: branch)" 
                    className="pl-10"
                    value={loginData.password}
                    onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                    onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox id="remember" />
                  <label htmlFor="remember" className="text-sm">로그인 상태 유지</label>
                </div>
                <Button variant="link" className="text-sm">비밀번호 찾기</Button>
              </div>

              <Button onClick={handleLogin} className="w-full water-drop" size="lg">
                <LogIn className="w-4 h-4 mr-2" />
                로그인
              </Button>

              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">
                  아직 회원이 아니신가요?
                </p>
                <Link to="/register">
                  <Button variant="outline" className="w-full">
                    회원가입
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Login;