import Header from '@/components/Layout/Header';
import Footer from '@/components/Layout/Footer';
import HeadquartersDashboard from '@/components/Corporate/HeadquartersDashboard';
import MyPage from './MyPage';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const HeadquartersDashboardPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="dashboard">대시보드</TabsTrigger>
            <TabsTrigger value="mypage">회원정보</TabsTrigger>
          </TabsList>
          <TabsContent value="dashboard" className="mt-6">
            <HeadquartersDashboard />
          </TabsContent>
          <TabsContent value="mypage" className="mt-6">
            <MyPage />
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
};

export default HeadquartersDashboardPage;