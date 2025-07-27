import { useParams, Link } from 'react-router-dom';
import Header from '@/components/Layout/Header';
import Footer from '@/components/Layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Bell, Pin, Calendar } from 'lucide-react';

const NoticeDetail = () => {
  const { id } = useParams();
  
  // 실제 구현에서는 API로 데이터를 가져올 것입니다
  const notices = [
    {
      id: 1,
      title: '[중요] 설날 연휴 배송 및 고객센터 운영 안내',
      date: '2024.01.20',
      pinned: true,
      content: '안녕하세요. AquaPure입니다.\n\n설날 연휴(2024년 2월 9일~2월 12일) 기간 중 배송 및 고객센터 운영에 대해 안내드립니다.\n\n📦 배송 안내:\n• 2월 7일(수) 오후 2시까지 주문 → 연휴 전 배송\n• 2월 8일(목) 이후 주문 → 2월 13일(화)부터 순차 배송\n• 제주/도서산간 지역은 1-2일 추가 소요\n\n📞 고객센터 운영:\n• 연휴 기간 중 고객센터 휴무\n• 1:1 문의는 정상 접수되며, 2월 13일(화)부터 순차 답변\n• 긴급 문의는 emergency@aquapure.co.kr로 연락\n\n고객님들의 양해를 부탁드리며, 건강하고 행복한 설날 보내세요.',
      views: 1245
    },
    {
      id: 2,
      title: '🎉 신제품 출시! 프리미엄 가정용 정수 시스템 런칭',
      date: '2024.01.18',
      pinned: true,
      content: '안녕하세요! AquaPure에서 새로운 프리미엄 제품을 출시했습니다.\n\n🌟 새로 출시된 제품:\n• AquaPure Pro 가정용 직수 정수기 (APH-300)\n• 5단계 고급 여과 시스템\n• IoT 연동 스마트 관리 기능\n• 자동 필터 교체 알림\n\n🎁 출시 기념 혜택:\n• 런칭 기념 20% 할인 (1월 31일까지)\n• 필터 1년분 무료 제공\n• 무료 전문 설치 서비스\n\n자세한 정보는 제품 페이지에서 확인하세요!',
      views: 892
    },
    {
      id: 3,
      title: '고객센터 운영시간 변경 및 서비스 확대 안내',
      date: '2024.01.15',
      pinned: false,
      content: '고객님들께 더 나은 서비스를 제공하기 위해 고객센터 운영시간을 확대합니다.\n\n📞 변경된 운영시간:\n• 평일: 09:00 ~ 19:00 (기존 18:00에서 1시간 연장)\n• 토요일: 10:00 ~ 15:00 (신규 운영)\n• 일요일/공휴일: 휴무\n\n🆕 새로운 서비스:\n• 실시간 채팅 상담 (평일 09:00~17:00)\n• 화상 원격 지원 서비스\n• 예약 상담 시스템 도입\n\n더욱 편리해진 고객 지원을 이용해보세요!',
      views: 567
    },
    {
      id: 4,
      title: '필터 교체 주기 알림 서비스 시작',
      date: '2024.01.10',
      pinned: false,
      content: '제품을 더 효과적으로 사용하실 수 있도록 필터 교체 알림 서비스를 시작합니다.\n\n📱 서비스 내용:\n• SMS/이메일을 통한 교체 시기 알림\n• 개인별 사용량에 따른 맞춤 알림\n• 교체용 필터 할인 쿠폰 제공\n\n신청 방법: 마이페이지 > 알림 설정에서 등록 가능합니다.',
      views: 423
    },
    {
      id: 5,
      title: '정기 점검 서비스 출시 안내',
      date: '2024.01.08',
      pinned: false,
      content: '제품의 최적 성능 유지를 위한 정기 점검 서비스를 시작합니다.\n\n🔧 서비스 내용:\n• 분기별 무료 점검 서비스\n• 필터 상태 진단 및 교체 권장\n• 성능 최적화 및 청소 서비스\n\n대상: 2023년 이후 구매 고객 (무료)\n예약: 고객센터 또는 온라인 예약 가능',
      views: 321
    }
  ];

  const notice = notices.find(n => n.id === parseInt(id || '1'));

  if (!notice) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">공지사항을 찾을 수 없습니다</h1>
            <Link to="/support">
              <Button variant="outline">공지사항 목록으로 돌아가기</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* 뒤로 가기 버튼 */}
        <div className="mb-6">
          <Link to="/support">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              공지사항 목록으로
            </Button>
          </Link>
        </div>

        <Card className="water-drop">
          <CardHeader className="border-b">
            <div className="flex items-center gap-3 mb-2">
              {notice.pinned && (
                <Pin className="w-5 h-5 text-primary" />
              )}
              <CardTitle className="text-2xl">{notice.title}</CardTitle>
              {notice.pinned && (
                <Badge variant="destructive">중요</Badge>
              )}
            </div>
            
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>작성일: {notice.date}</span>
              </div>
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4" />
                <span>조회수: {notice.views.toLocaleString()}</span>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-8">
            <div className="prose max-w-none">
              {notice.content.split('\n').map((line, index) => (
                <p key={index} className="mb-3 leading-relaxed whitespace-pre-wrap">
                  {line}
                </p>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 이전/다음 공지사항 네비게이션 */}
        <div className="flex justify-between items-center mt-8">
          <div className="flex-1">
            {parseInt(id || '1') > 1 && (
              <Link to={`/notice/${parseInt(id || '1') - 1}`}>
                <Button variant="outline" className="gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  이전 공지사항
                </Button>
              </Link>
            )}
          </div>
          
          <div className="flex-1 text-center">
            <Link to="/support">
              <Button variant="secondary">목록</Button>
            </Link>
          </div>
          
          <div className="flex-1 text-right">
            {parseInt(id || '1') < notices.length && (
              <Link to={`/notice/${parseInt(id || '1') + 1}`}>
                <Button variant="outline" className="gap-2">
                  다음 공지사항
                  <ArrowLeft className="w-4 h-4 rotate-180" />
                </Button>
              </Link>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default NoticeDetail;