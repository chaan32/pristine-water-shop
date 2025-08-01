import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Package, 
  Edit3, 
  BarChart3, 
  Users, 
  Building2, 
  MessageSquare,
  Menu,
  X,
  LogOut,
  Droplets,
  RotateCcw
} from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [adminName] = useState(localStorage.getItem('userName') || '관리자');
  const location = useLocation();

  const menuItems = [
    { title: '상품 등록', path: '/admin/products', icon: Package },
    { title: '상품 수정', path: '/admin/products/edit', icon: Edit3 },
    { title: '상품 컨텐츠 관리', path: '/admin/products/content', icon: Edit3 },
    { title: '매출 그래프', path: '/admin/sales', icon: BarChart3 },
    { title: '회원 리스트', path: '/admin/members', icon: Users },
    { title: '법인 등록 요청', path: '/admin/corporate-requests', icon: Building2 },
    { title: '1:1 문의 답변', path: '/admin/inquiries', icon: MessageSquare },
    { title: '환불/교환 관리', path: '/admin/refund-exchange', icon: RotateCcw }
  ];

  const isActivePath = (path: string) => {
    if (path === '/admin/products/edit') {
      return location.pathname.includes('/admin/products/edit');
    }
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top Header */}
      <header className="bg-card border-b border-border water-shadow sticky top-0 z-50">
        <div className="px-4 py-4">
          <div className="flex justify-between items-center">
            {/* Logo & Menu Toggle */}
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              >
                {isSidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </Button>
              
              <Link to="/" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center water-drop">
                  <Droplets className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-primary">AquaPure</h1>
                  <p className="text-xs text-muted-foreground">관리자 패널</p>
                </div>
              </Link>
            </div>

            {/* Admin Info & Logout */}
            <div className="flex items-center gap-4">
              <span className="text-primary font-medium">
                관리자 {adminName}님
              </span>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => {
                  localStorage.clear();
                  window.location.href = '/login';
                }}
              >
                <LogOut className="w-4 h-4 mr-1" />
                로그아웃
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        {isSidebarOpen && (
          <aside className="w-64 min-h-screen bg-card border-r border-border">
            <nav className="p-4">
              <div className="space-y-2">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = isActivePath(item.path);
                  
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-smooth ${
                        isActive 
                          ? 'bg-primary text-primary-foreground' 
                          : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="font-medium">{item.title}</span>
                    </Link>
                  );
                })}
              </div>
            </nav>
          </aside>
        )}

        {/* Main Content */}
        <main className={`flex-1 p-6 ${isSidebarOpen ? '' : 'ml-0'}`}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;