import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { authApi } from '@/lib/api';
import { Mail, RefreshCw, Clock } from 'lucide-react';

interface EmailVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerificationSuccess: (email: string) => void;
}

const EmailVerificationModal: React.FC<EmailVerificationModalProps> = ({
  isOpen,
  onClose,
  onVerificationSuccess,
}) => {
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [verifyCode, setVerifyCode] = useState('');
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

  const sendAuthCode = async () => {
    if (!email.trim()) {
      toast({
        title: "오류",
        description: "이메일을 입력해주세요.",
        variant: "destructive"
      });
      return;
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({
        title: "오류",
        description: "올바른 이메일 형식을 입력해주세요.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await authApi.sendAuthMail(email);
      
      if (response.ok) {
        setIsCodeSent(true);
        setCountdown(300);
        toast({
          title: "인증 메일 발송",
          description: "이메일로 인증번호가 발송되었습니다.",
        });
      } else {
        const errorData = await response.json();
        toast({
          title: "발송 실패",
          description: errorData.message || "이메일 발송에 실패했습니다.",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      console.error('Auth code send error:', error);
      toast({
        title: "발송 실패",
        description: error.message || "이메일 발송 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resendAuthCode = async () => {
    setCountdown(0);
    setIsCodeSent(false);
    await sendAuthCode();
  };

  const verifyAuthCode = async () => {
    if (!verifyCode.trim()) {
      toast({
        title: "오류",
        description: "인증번호를 입력해주세요.",
        variant: "destructive"
      });
      return;
    }

    setIsVerifying(true);
    try {
      const response = await authApi.verifyAuthMail(email, verifyCode);

      if (response.ok) {
        toast({
          title: "인증 성공",
          description: "이메일 인증이 완료되었습니다.",
          variant: "default"
        });
        onVerificationSuccess(email);
        handleClose();
      } else {
        const errorMessage = await response.text();
        toast({
          title: "인증 실패",
          description: errorMessage,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Auth verification error:', error);
      toast({
        title: "인증 실패",
        description: "인증번호가 올바르지 않습니다. 다시 확인해주세요.",
        variant: "destructive"
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

  const handleClose = () => {
    setEmail('');
    setVerifyCode('');
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
            <Mail className="w-5 h-5" />
            이메일 인증
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">이메일 주소</Label>
            <div className="flex gap-2">
              <Input
                id="email"
                type="email"
                placeholder="example@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isCodeSent}
                className="flex-1"
              />
              <Button
                type="button"
                onClick={sendAuthCode}
                disabled={isLoading || isCodeSent}
                className="whitespace-nowrap"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                    발송중
                  </>
                ) : (
                  '인증번호 전송'
                )}
              </Button>
            </div>
          </div>

          {isCodeSent && (
            <>
              <div className="space-y-2">
                <Label htmlFor="verifyCode" className="flex items-center gap-2">
                  인증번호
                  <span className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {formatTime(countdown)}
                  </span>
                </Label>
                <Input
                  id="verifyCode"
                  type="text"
                  placeholder="인증번호 20자리 입력"
                  value={verifyCode}
                  onChange={(e) => setVerifyCode(e.target.value)}
                  maxLength={20}
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
                  disabled={isVerifying || !verifyCode.trim()}
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

export default EmailVerificationModal;