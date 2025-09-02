import Header from '@/components/Layout/Header';
import Footer from '@/components/Layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { LogIn, User, Lock } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { authApi, setTokens, getUserInfo } from '@/lib/api';
import { toast } from "@/hooks/use-toast.ts";

const Login = () => {
  const navigate = useNavigate();
  const [loginData, setLoginData] = useState({
    username: '',
    password: ''
  });

  // 이미 로그인되어 있다면 리다이렉트
  useEffect(() => {
    const userInfo = getUserInfo();
    if (userInfo) {
      switch (userInfo.role) {
        case 'ADMIN':
          navigate('/admin');
          break;
        case 'HEADQUARTERS':
          navigate('/headquarters-dashboard');
          break;
        default:
          navigate('/mypage');
      }
    }
  }, [navigate]);

  const handleLogin = async () => {
    
    if (!loginData.username || !loginData.password) {
      toast({ 
        title: '입력 오류', 
        description: '아이디와 비밀번호를 입력해주세요.', 
        variant: 'destructive' 
      });
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

      if (response.ok) {
        const data = await response.json();
        
        // 토큰 저장
        setTokens(data.data.accessToken, data.data.refreshToken);
        
        // JWT에서 사용자 정보 추출
        const userInfo = getUserInfo();
        
        if (userInfo) {
          toast({ 
            title: '로그인 성공', 
            description: `${userInfo.name}님, 환영합니다!` 
          });

          // 사용자 역할에 따라 리다이렉트
          switch (userInfo.role) {
            case 'ADMIN':
              navigate('/admin');
              break;
            case 'HEADQUARTERS':
              navigate('/headquarters-dashboard');
              break;
            default:
              navigate('/mypage');
          }
        } else {
          throw new Error('사용자 정보를 가져올 수 없습니다.');
        }
      } else {
        try {
          const errorData = await response.json();
          const errorMessage = errorData.message || '로그인에 실패했습니다.';
          if (errorMessage === "법인 승인 검토 중입니다."){
            toast({ title: '로그인 오류', description: errorMessage, variant: 'warning'});
          } else {
            toast({ title: '로그인 오류', description: errorMessage, variant: 'destructive'});
          }
        } catch (parseError) {
          const errorMessage = await response.text();
          toast({ title: '로그인 오류', description: errorMessage || '로그인에 실패했습니다.', variant: 'destructive'});
        }
      }
    } catch (error) {
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