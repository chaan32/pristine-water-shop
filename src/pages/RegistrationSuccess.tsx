import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Clock, ShoppingBag, Droplets } from 'lucide-react';

const RegistrationSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const userType = searchParams.get('type') || 'individual'; // individual, corporate, headquarters, franchise

  const isCorporate = userType !== 'individual';

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl space-y-8">
        {/* 성공 메시지 */}
        <Card className="text-center">
          <CardHeader className="pb-4">
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <CardTitle className="text-2xl md:text-3xl font-bold text-foreground">
              회원가입이 완료되었습니다!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {isCorporate && (
              <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-6">
                <div className="flex items-center justify-center gap-3 mb-3">
                  <Clock className="h-6 w-6 text-amber-600" />
                  <h3 className="text-lg font-semibold text-amber-800 dark:text-amber-200">
                    관리자 승인 대기 중
                  </h3>
                </div>
                <p className="text-amber-700 dark:text-amber-300 leading-relaxed">
                  법인 회원의 경우 관리자의 승인이 필요합니다.<br />
                  <strong>1~2일 정도의 대기 기간</strong>이 소요될 예정이며,<br />
                  승인 완료 후 이메일로 안내해 드리겠습니다.
                </p>
              </div>
            )}
            
            <p className="text-muted-foreground text-lg">
              {isCorporate 
                ? '승인 대기 중에도 제품을 둘러보시고 쇼핑을 즐기실 수 있습니다.'
                : '이제 모든 서비스를 이용하실 수 있습니다. 쇼핑을 시작해보세요!'
              }
            </p>
          </CardContent>
        </Card>

        {/* 제품 소개 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <Droplets className="h-6 w-6 text-primary" />
              우리의 프리미엄 정수 필터
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center space-y-3">
                <div className="h-32 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 rounded-lg flex items-center justify-center">
                  <Droplets className="h-12 w-12 text-blue-600" />
                </div>
                <h3 className="font-semibold">고급 여과 시스템</h3>
                <p className="text-sm text-muted-foreground">
                  99.9% 유해물질 제거로 깨끗하고 안전한 물을 제공합니다.
                </p>
              </div>
              
              <div className="text-center space-y-3">
                <div className="h-32 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30 rounded-lg flex items-center justify-center">
                  <CheckCircle className="h-12 w-12 text-green-600" />
                </div>
                <h3 className="font-semibold">인증된 품질</h3>
                <p className="text-sm text-muted-foreground">
                  국제 인증을 받은 고품질 필터로 믿을 수 있는 성능을 보장합니다.
                </p>
              </div>
              
              <div className="text-center space-y-3">
                <div className="h-32 bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/30 dark:to-purple-800/30 rounded-lg flex items-center justify-center">
                  <ShoppingBag className="h-12 w-12 text-purple-600" />
                </div>
                <h3 className="font-semibold">다양한 제품</h3>
                <p className="text-sm text-muted-foreground">
                  가정용부터 산업용까지, 다양한 용도에 맞는 필터를 제공합니다.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 행동 버튼 */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={() => navigate('/shop')}
            size="lg"
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 py-3"
          >
            <ShoppingBag className="mr-2 h-5 w-5" />
            쇼핑몰 둘러보기
          </Button>
          
          <Button
            onClick={() => navigate('/')}
            variant="outline"
            size="lg"
            className="px-8 py-3"
          >
            홈으로 이동
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RegistrationSuccess;