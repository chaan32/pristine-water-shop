import { useState, useEffect, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  ShoppingCart, 
  Menu, 
  X, 
  Droplets,
  Phone,
  Mail
} from 'lucide-react';
import { apiFetch, getUserInfo, clearTokens } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

const Header = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [cartCount, setCartCount] = useState<number>(0);
  const location = useLocation();

  // 사용자 정보 업데이트
  const updateUserInfo = () => {
    const info = getUserInfo();
    setUserInfo(info);
  };

  useEffect(() => {
    updateUserInfo();

    // 스토리지 이벤트 리스너 (다른 탭에서 로그인/로그아웃 시)
    const handleStorageChange = () => {
      updateUserInfo();
      computeCartCount();
    };

    window.addEventListener('storage', handleStorageChange);

    // 커스텀 이벤트 리스너 (같은 탭에서 상태 변화 시)
    const onCartUpdated: EventListener = () => computeCartCount();
    window.addEventListener('cart:updated', onCartUpdated);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('cart:updated', onCartUpdated);
    };
  }, []);

  const computeCartCount = useCallback(async () => {
    try {
      if (userInfo) {
        // 로그인된 사용자: API에서 가져오기
        const res = await apiFetch('/api/cart');
        if (!res.ok) throw new Error('failed');
        const dtos = await res.json();
        setCartCount(Array.isArray(dtos) ? dtos.length : 0);
      } else {
        // 비로그인 사용자: 로컬스토리지에서 가져오기
        const localCart = JSON.parse(localStorage.getItem('cart') || '[]');
        setCartCount(Array.isArray(localCart) ? localCart.length : 0);
      }
    } catch {
      setCartCount(0);
    }
  }, [userInfo]);

  useEffect(() => {
    computeCartCount();
  }, [computeCartCount, location.pathname]);

  const handleLogout = () => {
    clearTokens();
    setUserInfo(null);
    toast({
      title: "로그아웃",
      description: "성공적으로 로그아웃되었습니다.",
    });
    navigate('/');
  };

  // 사용자 표시 정보 생성
  const getUserDisplayInfo = () => {
    if (!userInfo) return null;
    
    const { role, name } = userInfo as { role: string; name: string };
    
    switch (role) {
      case 'ADMIN':
        return { name: '관리자', subInfo: name };
      case 'HEADQUARTERS':
        return { name: '본사', subInfo: name };
      case 'BRANCH':
        return { name: '지사', subInfo: name };
      default:
        return { name, subInfo: name };
    }
  };

  const displayInfo = getUserDisplayInfo();

  const mainMenuItems = [
    { 
      title: '제품소개', 
      path: '/products',
      submenu: ['샤워 필터', '주방 정수 필터', '산업용 필터']
    },
    { 
      title: '쇼핑몰', 
      path: '/shop',
      submenu: []
    },
    { 
      title: '고객센터', 
      path: '/support',
      submenu: ['공지사항', '1:1 문의', 'FAQ']
    }
  ];

  return (
    <header className="bg-background border-b border-border water-shadow sticky top-0 z-50">
      {/* Top Bar */}
      <div className="bg-secondary py-2">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center text-sm text-muted-foreground">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Phone className="w-3 h-3" />
                <span>010-4658-7418</span>
              </div>
              <div className="flex items-center gap-1">
                <Mail className="w-3 h-3" />
                <span>ttgy61@naver.com</span>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-4">
              {userInfo ? (
                <>
                   <span className="text-primary font-medium">
                      {displayInfo?.name}
                      {displayInfo?.subInfo && (
                        <span className="text-xs text-muted-foreground ml-1">
                          ({displayInfo.subInfo})
                        </span>
                      )}
                   </span>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={handleLogout}
                  >
                    로그아웃
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/login">
                    <Button 
                      variant="ghost" 
                      size="sm"
                    >
                      로그인
                    </Button>
                  </Link>
                  <Link to="/register">
                    <Button variant="ghost" size="sm">회원가입</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2 group">
            <img
                src="https://dragonwater-image-storage-by-haechan.s3.ap-northeast-2.amazonaws.com/%EB%A1%9C%EA%B3%A0/%E1%84%8E%E1%85%A9%E1%84%85%E1%85%A9%E1%86%A8%E1%84%89%E1%85%A2%E1%86%A8%E1%84%85%E1%85%A9%E1%84%80%E1%85%A9.jpeg"
                alt="드래곤 로고"
                className="h-16"
            />
            <div>
              <h1 className="text-2xl font-bold text-primary">DRAGON COMPANY</h1>
              <p className="text-xs text-muted-foreground">수질의 혁신, 깨끗함의 기준</p> {/* 필요에 따라 문구 수정 */}
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            {mainMenuItems.map((item) => (
              <div key={item.title} className="relative group">
                <Link
                  to={item.path}
                  className={`text-foreground hover:text-primary transition-smooth font-medium ${
                    location.pathname.startsWith(item.path) ? 'text-primary' : ''
                  }`}
                >
                  {item.title}
                </Link>
                {item.submenu.length > 0 && (
                  <div className="absolute top-full left-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-smooth">
                    <div className="py-2">
                       {item.submenu.map((subItem, index) => (
                        <Link
                          key={index}
                          to={`${item.path}#${subItem.toLowerCase().replace(/\s+/g, '-').replace(/:/g, '')}`}
                          className="block px-4 py-2 text-sm text-muted-foreground hover:text-primary hover:bg-secondary transition-smooth"
                        >
                          {subItem}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            {/* My Page / Admin Panel */}
            {userInfo && (
              <Link to={userInfo.role === 'ADMIN' ? '/admin' : 
                       userInfo.role === 'HEADQUARTERS' ? '/headquarters-dashboard' : '/mypage'}>
                <Button variant="ghost" size="sm" className="hidden md:flex">
                  <User className="w-4 h-4 mr-1" />
                  {userInfo.role === 'ADMIN' ? '관리자 패널' : 
                   userInfo.role === 'HEADQUARTERS' ? '본사 대시보드' : '마이페이지'}
                </Button>
              </Link>
            )}

            {/* Cart */}
            <Link to="/cart">
              <Button variant="ghost" size="sm" className="relative">
                <ShoppingCart className="w-4 h-4" />
                {cartCount > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                  >
                    {cartCount}
                  </Badge>
                )}
              </Button>
            </Link>

            {/* Mobile Menu Toggle */}
            <Button 
              variant="ghost" 
              size="sm" 
              className="lg:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden bg-card border-t border-border">
          <div className="container mx-auto px-4 py-4">
            <nav className="space-y-4">
              {mainMenuItems.map((item) => (
                <div key={item.title}>
                  <Link
                    to={item.path}
                    className={`block text-foreground hover:text-primary transition-smooth font-medium ${
                      location.pathname.startsWith(item.path) ? 'text-primary' : ''
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.title}
                  </Link>
                  {item.submenu.length > 0 && (
                    <div className="ml-4 mt-2 space-y-2">
                      {item.submenu.map((subItem, index) => (
                        <Link
                          key={index}
                          to={`${item.path}#${subItem.toLowerCase().replace(/\s+/g, '-').replace(/:/g, '')}`}
                          className="block text-sm text-muted-foreground hover:text-primary transition-smooth"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          {subItem}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {/* Mobile Auth */}
              <div className="pt-4 border-t border-border">
                {userInfo ? (
                  <div className="space-y-2">
                     <p className="text-primary font-medium">
                       {displayInfo?.name}
                       {displayInfo?.subInfo && (
                         <span className="text-xs text-muted-foreground block">
                           {displayInfo.subInfo}
                         </span>
                       )}
                     </p>
                    <Link to={userInfo.role === 'ADMIN' ? '/admin' : 
                             userInfo.role === 'HEADQUARTERS' ? '/headquarters-dashboard' : '/mypage'} 
                          onClick={() => setIsMenuOpen(false)}>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="w-full justify-start"
                      >
                        {userInfo.role === 'ADMIN' ? '관리자 패널' : 
                         userInfo.role === 'HEADQUARTERS' ? '본사 대시보드' : '마이페이지'}
                      </Button>
                    </Link>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="w-full justify-start"
                      onClick={() => {
                        handleLogout();
                        setIsMenuOpen(false);
                      }}
                    >
                      로그아웃
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="w-full justify-start"
                      >
                        로그인
                      </Button>
                    </Link>
                    <Link to="/register" onClick={() => setIsMenuOpen(false)}>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="w-full justify-start"
                      >
                        회원가입
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;