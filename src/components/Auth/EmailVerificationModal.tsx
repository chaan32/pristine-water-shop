import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from '@/hooks/use-toast';
import { authApi } from '@/lib/api';
import { Mail, CheckCircle } from 'lucide-react';

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
  const [authCode, setAuthCode] = useState('');
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0); // 남은 시간 (초)
  const [isResending, setIsResending] = useState(false);

  // 타이머 관리
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (timeLeft > 0) {
      timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [timeLeft]);

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
        setTimeLeft(600); // 10분 설정
        toast({
          title: "인증번호 발송",
          description: "입력하신 이메일로 인증번호를 발송했습니다.",
          variant: "default"
        });
      } else {
        const errorMessage = await response.text();
        toast({
          title: "인증번호 발송 실패",
          description: errorMessage,
          variant: "destructive"
        });
        setIsCodeSent(false);
      }
    } catch (error) {
      console.error('Auth code send error:', error);
      toast({
        title: "오류",
        description: "인증번호 발송 중 오류가 발생했습니다. 다시 시도해주세요.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resendAuthCode = async () => {
    setIsResending(true);
    try {
      const response = await authApi.sendAuthMail(email);

      if (response.ok) {
        setTimeLeft(600); // 10분으로 다시 설정
        toast({
          title: "인증번호 재발송",
          description: "새로운 인증번호를 발송했습니다.",
          variant: "default"
        });
      } else {
        const errorMessage = await response.text();
        toast({
          title: "재발송 실패",
          description: errorMessage,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Resend error:', error);
      toast({
        title: "오류",
        description: "재발송 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    } finally {
      setIsResending(false);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const verifyAuthCode = async () => {
    if (!authCode.trim()) {
      toast({
        title: "오류",
        description: "인증번호를 입력해주세요.",
        variant: "destructive"
      });
      return;
    }

    setIsVerifying(true);
    try {
      const response = await authApi.verifyAuthMail(email, authCode);

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

  const handleClose = () => {
    setEmail('');
    setAuthCode('');
    setIsCodeSent(false);
    setIsLoading(false);
    setIsVerifying(false);
    setTimeLeft(0); // 타이머 리셋
    setIsResending(false);
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
                variant="outline"
                onClick={sendAuthCode}
                disabled={isLoading || isCodeSent}
                className="whitespace-nowrap"
              >
                {isLoading ? "발송 중..." : isCodeSent ? "발송 완료" : "인증하기"}
              </Button>
            </div>
          </div>

          {isCodeSent && (
            <div className="space-y-2">
              <Label htmlFor="authCode">인증번호</Label>
              <div className="flex gap-2">
                <Input
                  id="authCode"
                  type="text"
                  placeholder="인증번호 20자리"
                  value={authCode}
                  onChange={(e) => setAuthCode(e.target.value)}
                  maxLength={20}
                  className="flex-1"
                />
                <Button
                  type="button"
                  onClick={verifyAuthCode}
                  disabled={isVerifying || !authCode.trim()}
                  className="whitespace-nowrap"
                >
                  {isVerifying ? "인증 중..." : "인증"}
                </Button>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">남은 시간:</span>
                  <span className={`font-mono ${timeLeft <= 60 ? 'text-destructive' : 'text-primary'}`}>
                    {formatTime(timeLeft)}
                  </span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={resendAuthCode}
                  disabled={isResending || timeLeft > 0}
                  className="h-auto p-1 text-sm"
                >
                  {isResending ? "재발송 중..." : "재발송"}
                </Button>
              </div>
              
              <p className="text-sm text-muted-foreground">
                이메일로 발송된 인증번호를 입력해주세요.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EmailVerificationModal;