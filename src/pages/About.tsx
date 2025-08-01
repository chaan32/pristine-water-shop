import Header from '@/components/Layout/Header';
import Footer from '@/components/Layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { MapPin, Phone, Mail, Clock, Award, Users, Droplets, Shield } from 'lucide-react';

const About = () => {
  const milestones = [
    { year: '2010', title: '회사 설립', description: '정수 필터 전문 기업으로 시작' },
    { year: '2015', title: 'ISO 인증 획득', description: '품질 관리 시스템 구축' },
    { year: '2018', title: '기업 고객 확대', description: '산업용 필터 사업 진출' },
    { year: '2020', title: '온라인 쇼핑몰 런칭', description: '디지털 전환 및 D2C 서비스' },
    { year: '2023', title: '누적 판매 100만대 돌파', description: '고객 신뢰 바탕 성장' }
  ];

  const philosophy = [
    {
      icon: Droplets,
      title: '깨끗한 물의 가치',
      description: '모든 사람이 깨끗하고 안전한 물을 마실 권리가 있다고 믿습니다.'
    },
    {
      icon: Shield,
      title: '신뢰와 안전',
      description: '엄격한 품질 검증과 인증을 통해 고객의 건강을 보호합니다.'
    },
    {
      icon: Users,
      title: '고객 중심',
      description: '개인부터 기업까지, 모든 고객의 니즈에 맞는 솔루션을 제공합니다.'
    },
    {
      icon: Award,
      title: '지속적 혁신',
      description: '최신 기술과 연구개발을 통해 더 나은 제품을 만들어갑니다.'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">회사소개</h1>
          <p className="text-lg text-muted-foreground">
            깨끗한 물을 통해 건강한 삶을 만들어가는 AquaPure
          </p>
        </div>

        <Tabs defaultValue="philosophy" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="philosophy">브랜드 철학</TabsTrigger>
            <TabsTrigger value="history">회사 연혁</TabsTrigger>
            <TabsTrigger value="distribution">유통 정보</TabsTrigger>
            <TabsTrigger value="location">오시는 길</TabsTrigger>
          </TabsList>

          <TabsContent value="philosophy" className="mt-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              {philosophy.map((item, index) => (
                <Card key={index} className="water-drop">
                  <CardHeader>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                        <item.icon className="w-6 h-6 text-primary-foreground" />
                      </div>
                      <CardTitle className="text-xl">{item.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{item.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="history" className="mt-8">
            <div className="space-y-6">
              {milestones.map((milestone, index) => (
                <Card key={index} className="water-drop">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-6">
                      <Badge variant="outline" className="text-lg px-4 py-2">
                        {milestone.year}
                      </Badge>
                      <div>
                        <h3 className="text-xl font-semibold mb-2">{milestone.title}</h3>
                        <p className="text-muted-foreground">{milestone.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="distribution" className="mt-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="water-drop">
                <CardHeader>
                  <CardTitle>온라인 판매</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Badge>공식 쇼핑몰</Badge>
                    <span>자체 온라인 스토어</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">제휴사</Badge>
                    <span>주요 이커머스 플랫폼</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    개인 및 기업 고객 모두 온라인으로 주문 가능하며, 전국 배송 서비스를 제공합니다.
                  </p>
                </CardContent>
              </Card>

              <Card className="water-drop">
                <CardHeader>
                  <CardTitle>오프라인 유통</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Badge>전문 대리점</Badge>
                    <span>전국 50여개 매장</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">B2B 영업</Badge>
                    <span>기업 직접 공급</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    전문 상담과 설치 서비스가 필요한 고객을 위해 오프라인 네트워크를 운영합니다.
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="location" className="mt-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="water-drop">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    본사 위치
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">주소</h4>
                    <p className="text-muted-foreground">
                      서울특별시 강남구 테헤란로 123, AquaPure 빌딩 5층
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-primary" />
                      <span>1588-1234</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-primary" />
                      <span>info@aquapure.co.kr</span>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      운영시간
                    </h4>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>평일: 09:00 - 18:00</p>
                      <p>점심시간: 12:00 - 13:00</p>
                      <p>토/일/공휴일: 휴무</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="water-drop">
                <CardHeader>
                  <CardTitle>찾아오시는 길</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">지하철</h4>
                      <p className="text-sm text-muted-foreground">
                        2호선 강남역 3번 출구에서 도보 5분<br />
                        신분당선 강남역 4번 출구에서 도보 3분
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">버스</h4>
                      <p className="text-sm text-muted-foreground">
                        간선버스: 146, 360, 740<br />
                        지선버스: 3412, 6411<br />
                        강남역 정류장 하차
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">주차</h4>
                      <p className="text-sm text-muted-foreground">
                        건물 내 지하주차장 이용 가능<br />
                        방문 고객 2시간 무료 주차
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
};

export default About;