import Header from '@/components/Layout/Header';
import Footer from '@/components/Layout/Footer';
import HeroSection from '@/components/Home/HeroSection';
import FeaturedProducts from '@/components/Home/FeaturedProducts';
import BrandPhilosophy from '@/components/Home/BrandPhilosophy';

const Index = () => {
  console.log('Index page is rendering');
  
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <FeaturedProducts />
        <BrandPhilosophy />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
