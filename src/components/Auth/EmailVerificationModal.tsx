import React, { useState } from 'react';
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
      const response = await fetch('/api/auth/send/authentication/mail', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setIsCodeSent(true);
        toast({
          title: "인증번호 발송",
          description: "입력하신 이메일로 인증번호를 발송했습니다.",
          variant: "default"
        });
      } else {
        throw new Error('인증번호 발송에 실패했습니다.');
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
      const response = await fetch('/api/auth/try/mail', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email,
          authCode 
        }),
      });

      if (response.ok) {
        toast({
          title: "인증 성공",
          description: "이메일 인증이 완료되었습니다.",
          variant: "default"
        });
        onVerificationSuccess(email);
        handleClose();
      } else {
        throw new Error('인증번호가 올바르지 않습니다.');
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
                  placeholder="인증번호 6자리"
                  value={authCode}
                  onChange={(e) => setAuthCode(e.target.value)}
                  maxLength={6}
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
              <p className="text-sm text-muted-foreground">
                이메일로 발송된 6자리 인증번호를 입력해주세요.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EmailVerificationModal;