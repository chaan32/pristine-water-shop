import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { authApi } from '@/lib/api';
import { Smartphone, Clock, RefreshCw } from 'lucide-react';

interface PhoneVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerificationSuccess: (phoneNumber: string) => void;
}

const PhoneVerificationModal: React.FC<PhoneVerificationModalProps> = ({
  isOpen,
  onClose,
  onVerificationSuccess,
}) => {
  const { toast } = useToast();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [countdown, setCountdown] = useState(300); // 5분 = 300초

  // 카운트다운 타이머
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isCodeSent && countdown > 0) {
      timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
    } else if (countdown === 0) {
      setIsCodeSent(false);
      toast({
        title: "인증 시간 만료",
        description: "인증번호가 만료되었습니다. 다시 전송해주세요.",
        variant: "destructive",
      });
    }
    return () => clearTimeout(timer);
  }, [isCodeSent, countdown, toast]);

  // 인증번호 전송
  const sendAuthCode = async () => {
    if (!phoneNumber) {
      toast({
        title: "전화번호를 입력해주세요",
        variant: "destructive",
      });
      return;
    }

    // 전화번호 형식 검증 (하이픈 제거)
    const cleanPhone = phoneNumber.replace(/-/g, '');
    if (!/^01[0-9]{8,9}$/.test(cleanPhone)) {
      toast({
        title: "올바른 전화번호 형식이 아닙니다",
        description: "010으로 시작하는 11자리 번호를 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await authApi.sendAuthPhone(cleanPhone);

      if (response.ok) {
        setIsCodeSent(true);
        setCountdown(300);
        toast({
          title: "인증번호 전송 완료",
          description: "휴대폰으로 인증번호가 전송되었습니다.",
        });
      } else {
        const errorData = await response.json();
        toast({
          title: "인증번호 전송 실패",
          description: errorData.message || "다시 시도해주세요.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "네트워크 오류",
        description: "인증번호 전송 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 인증번호 재전송
  const resendAuthCode = async () => {
    setCountdown(0);
    setIsCodeSent(false);
    await sendAuthCode();
  };

  // 인증번호 확인
  const verifyAuthCode = async () => {
    if (!verificationCode) {
      toast({
        title: "인증번호를 입력해주세요",
        variant: "destructive",
      });
      return;
    }

    setIsVerifying(true);
    try {
      const cleanPhone = phoneNumber.replace(/-/g, '');
      const response = await authApi.verifyAuthPhone(cleanPhone, verificationCode);

      if (response.ok) {
        toast({
          title: "인증 완료",
          description: "휴대폰 인증이 완료되었습니다.",
        });
        onVerificationSuccess(cleanPhone);
        handleClose();
      } else {
        const errorData = await response.json();
        toast({
          title: "인증 실패",
          description: errorData.message || "올바른 인증번호를 입력해주세요.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "네트워크 오류",
        description: "인증 확인 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  // 시간 포맷팅 (MM:SS)
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // 모달 닫기 및 초기화
  const handleClose = () => {
    setPhoneNumber('');
    setVerificationCode('');
    setIsCodeSent(false);
    setCountdown(300);
    setIsLoading(false);
    setIsVerifying(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            휴대폰 인증
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* 휴대폰 번호 입력 */}
          <div className="space-y-2">
            <Label htmlFor="phone">휴대폰 번호</Label>
            <div className="flex gap-2">
              <Input
                id="phone"
                type="tel"
                placeholder="010-1234-5678"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                disabled={isCodeSent}
                className="flex-1"
              />
              <Button 
                onClick={sendAuthCode}
                disabled={isLoading || isCodeSent}
                className="whitespace-nowrap"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                    전송중
                  </>
                ) : (
                  '인증번호 전송'
                )}
              </Button>
            </div>
          </div>

          {/* 인증번호 입력 (인증번호 전송 후 표시) */}
          {isCodeSent && (
            <>
              <div className="space-y-2">
                <Label htmlFor="verification-code" className="flex items-center gap-2">
                  인증번호
                  <span className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {formatTime(countdown)}
                  </span>
                </Label>
                <Input
                  id="verification-code"
                  type="text"
                  placeholder="인증번호 6자리 입력"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  maxLength={6}
                />
              </div>

              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={resendAuthCode}
                  className="flex-1"
                >
                  재전송
                </Button>
                <Button 
                  onClick={verifyAuthCode}
                  disabled={isVerifying}
                  className="flex-1"
                >
                  {isVerifying ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                      확인중
                    </>
                  ) : (
                    '인증 확인'
                  )}
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PhoneVerificationModal;