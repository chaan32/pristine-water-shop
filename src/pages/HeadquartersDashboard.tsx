import Header from '@/components/Layout/Header';
import Footer from '@/components/Layout/Footer';
import HeadquartersDashboard from '@/components/Corporate/HeadquartersDashboard';

const HeadquartersDashboardPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <HeadquartersDashboard />
      </main>

      <Footer />
    </div>
  );
};

export default HeadquartersDashboardPage;