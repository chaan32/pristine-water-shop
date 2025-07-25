import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
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

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userType, setUserType] = useState<'individual' | 'corporate'>('individual');
  const [userName] = useState('홍길동');
  const [cartCount] = useState(3);
  const location = useLocation();

  const mainMenuItems = [
    { 
      title: '회사소개', 
      path: '/about',
      submenu: ['브랜드 철학', '회사 연혁', '유통 정보', '오시는 길']
    },
    { 
      title: '제품소개', 
      path: '/products',
      submenu: ['샤워 필터', '주방 정수 필터', '산업용 필터', 'Best 제품', 'New 제품']
    },
    { 
      title: '쇼핑몰', 
      path: '/shop',
      submenu: []
    },
    { 
      title: '고객센터', 
      path: '/support',
      submenu: ['공지사항', '보도자료', '1:1 문의', 'FAQ']
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
                <span>1588-1234</span>
              </div>
              <div className="flex items-center gap-1">
                <Mail className="w-3 h-3" />
                <span>info@waterfilter.co.kr</span>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-4">
              {isLoggedIn ? (
                <>
                  <span className="text-primary font-medium">
                    {userName}님 ({userType === 'individual' ? '개인' : 'OO기업'})
                  </span>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setIsLoggedIn(false)}
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
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center water-drop">
              <Droplets className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-primary">AquaPure</h1>
              <p className="text-xs text-muted-foreground">정수 필터 전문</p>
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
                        <a
                          key={index}
                          href="#"
                          className="block px-4 py-2 text-sm text-muted-foreground hover:text-primary hover:bg-secondary transition-smooth"
                        >
                          {subItem}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            {/* My Page */}
            {isLoggedIn && (
              <Button variant="ghost" size="sm" className="hidden md:flex">
                <User className="w-4 h-4 mr-1" />
                마이페이지
              </Button>
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
                        <a
                          key={index}
                          href="#"
                          className="block text-sm text-muted-foreground hover:text-primary transition-smooth"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          {subItem}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {/* Mobile Auth */}
              <div className="pt-4 border-t border-border">
                {isLoggedIn ? (
                  <div className="space-y-2">
                    <p className="text-primary font-medium">
                      {userName}님 ({userType === 'individual' ? '개인' : 'OO기업'})
                    </p>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="w-full justify-start"
                    >
                      마이페이지
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="w-full justify-start"
                      onClick={() => setIsLoggedIn(false)}
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