import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Shield, Droplets, Award } from 'lucide-react';
import heroImage from '@/assets/hero-water-filter.jpg';

const HeroSection = () => {
  console.log('HeroSection is rendering');
  console.log('Hero image path:', heroImage);
  
  return (
    <section className="relative min-h-[600px] flex items-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="깨끗한 물과 정수 필터"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/80 via-primary/40 to-transparent" />
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-2xl">
          {/* Badge */}
          <Badge variant="secondary" className="mb-4 bg-accent/20 text-accent-foreground">
            <Droplets className="w-3 h-3 mr-1" />
            정수 필터 전문 브랜드
          </Badge>

          {/* Main Heading */}
          <h1 className="text-4xl md:text-6xl font-bold text-primary-foreground mb-6 leading-tight">
            <span className="block">깨끗한 물,</span>
            <span className="block">건강한 생활</span>
          </h1>

          {/* Description */}
          <p className="text-lg md:text-xl text-primary-foreground/90 mb-8 leading-relaxed">
            DRAGON WATER와 함께 시작하는 정수 필터의 새로운 경험.
            <br />
            믿을 수 있는 품질로 당신의 건강을 지켜드립니다.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mb-12">
            <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground water-drop">
              제품 둘러보기
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap gap-6 text-primary-foreground/80">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              <span className="text-sm font-medium">국제 인증</span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5" />
              <span className="text-sm font-medium">다년간 노하우</span>
            </div>
            <div className="flex items-center gap-2">
              <Droplets className="w-5 h-5" />
              <span className="text-sm font-medium">99.9% 정수율</span>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Elements */}
      <div className="absolute top-20 right-20 w-2 h-2 bg-accent rounded-full animate-pulse hidden md:block" />
      <div className="absolute top-40 right-40 w-1 h-1 bg-primary-foreground rounded-full animate-pulse hidden md:block" />
      <div className="absolute bottom-32 right-16 w-3 h-3 bg-accent/60 rounded-full animate-pulse hidden md:block" />
    </section>
  );
};

export default HeroSection;