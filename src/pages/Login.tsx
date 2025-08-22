import Header from '@/components/Layout/Header';
import Footer from '@/components/Layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { LogIn, User, Lock } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { authApi } from '@/lib/api';
import {toast} from "@/hooks/use-toast.ts";

const Login = () => {
  const navigate = useNavigate();
  const [loginData, setLoginData] = useState({
    username: '',
    password: ''
  });

  // 로그인 상태 체크
  useEffect(() => {
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      navigate('/', { replace: true });
    }
  }, [navigate]);

  const handleLogin = async () => {
    
    if (!loginData.username || !loginData.password) {
      alert('아이디와 비밀번호를 입력해주세요.');
      return;
    }

    try {
      const response = await authApi.login({
        username: loginData.username,
        password: loginData.password,
        deviceInfo: {
          userAgent: navigator.userAgent,
          ip: 'auto' // 서버에서 자동 감지
        }
      });
      console.log(response);


      if (response.ok) {
        const data = await response.json();
        // 실제 API 응답 구조에 따른 토큰 저장
        localStorage.setItem('accessToken', data.data.accessToken);
        localStorage.setItem('secretToken', data.data.secretToken);
        // 실제 API 응답 구조에 따른 사용자 정보 저장
        const user = data.data.user;
        localStorage.setItem('userType', user.userType || '');
        localStorage.setItem('userName', user.name || '');
        localStorage.setItem('userEmail', user.email || '');
        localStorage.setItem('userId', user.id ? user.id.toString() : '');
        localStorage.setItem('username', user.username || '');
        
        if (user.companyName) {
          localStorage.setItem('companyName', user.companyName);
        }
        if (user.isHeadQuarters !== undefined && user.isHeadQuarters !== null) {
          localStorage.setItem('isHeadquarters', user.isHeadQuarters.toString());
        }
        if (user.parentCompany) {
          localStorage.setItem('parentCompany', user.parentCompany);
        }
        if (user.permissions && Array.isArray(user.permissions)) {
          localStorage.setItem('permissions', JSON.stringify(user.permissions));
        }

        // 사용자 타입에 따른 리다이렉트
        switch (user.userType) {
          case 'admin':
            navigate('/admin');
            break;
          case 'headquarters':
            navigate('/headquarters-dashboard');
            break;
          case 'branch':
          case 'corporate':
          case 'individual':
            navigate('/mypage');
            break;
          default:
            navigate('/');
        }
      } else {
        try {
          const errorData = await response.json();
          const errorMessage = errorData.message || '로그인에 실패했습니다.';
          toast({ title: '로그인 오류', description: errorMessage, variant: 'destructive'});
        } catch (parseError) {
          const errorMessage = await response.text();
          toast({ title: '로그인 오류', description: errorMessage || '로그인에 실패했습니다.', variant: 'destructive'});
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({ title: '알 수 없는 오류', description: '네트워크 오류가 발생했습니다. 인터넷 연결을 확인해주세요.', variant: 'destructive' });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto">
          <Card className="water-drop">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold">DRAGON COMPANY</CardTitle>
              <p className="text-muted-foreground"></p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                   <Input 
                    placeholder="아이디 "
                    className="pl-10"
                    value={loginData.username}
                    onChange={(e) => setLoginData(prev => ({ ...prev, username: e.target.value }))}
                  />
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                   <Input 
                    type="password" 
                    placeholder="비밀번호"
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