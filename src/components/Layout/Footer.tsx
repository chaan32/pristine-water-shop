import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  Droplets, 
  Phone, 
  Mail, 
  MapPin, 
  Clock,
  Facebook,
  Instagram,
  Youtube
} from 'lucide-react';
import { createStorageUrl } from '@/lib/config';

const Footer = () => {
  return (
    <footer className="bg-secondary border-t border-border mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Company Info - Left */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-6">
              <img
                src={createStorageUrl('파란용배경어픈.png')}
                alt="드래곤 로고"
                className="h-8 w-8 object-contain"
              />
              <h3 className="text-xl font-bold text-primary">DRAGON COMPANY</h3>
            </div>
            
            <div className="space-y-2 text-sm text-muted-foreground">
              <p><span className="font-medium text-foreground">대표자:</span> 문용현</p>
              <p className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>경기 안양시 동안구 귀인로 190번길 90-13</span>
              </p>
              <p><span className="font-medium text-foreground">사업자등록번호:</span> 289-02-03583</p>
              <p><span className="font-medium text-foreground">개인정보책임자:</span> 문용현 (ttgy61@naver.com)</p>
              <p>
                <span className="font-medium text-foreground">제휴문의:</span> 
                <a href="mailto:partner@aquapure.co.kr" className="text-primary hover:underline ml-1">
                  ttgy61@naver.com
                </a>
              </p>
            </div>
          </div>

          {/* Customer Service - Right */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-foreground mb-6">고객센터</h4>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <Phone className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-primary">010-4658-7418</p>
                  <p className="text-sm text-muted-foreground">평일 9:00 ~ 18:00</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center">
                  <Mail className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="font-medium text-foreground">ttgy61@naver.com</p>
                  <p className="text-sm text-muted-foreground">24시간 이메일 접수</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                  <Clock className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium text-foreground">운영시간</p>
                  <p className="text-sm text-muted-foreground">점심시간: 12:00 ~ 13:00</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Separator className="my-8" />

        {/* Bottom Copyright */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <p>© 2025 DRAGON COMPANY. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span>웹사이트 운영: haechan8864@naver.com</span>
            {/*<span>웹사이트 운영: AquaPure Co., Ltd.</span>*/}
            <span>|</span>
            <span>Made with 💧 for Clean Water</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;