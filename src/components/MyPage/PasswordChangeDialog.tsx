import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { apiFetch } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface PasswordChangeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const PasswordChangeDialog = ({ isOpen, onClose, onSuccess }: PasswordChangeDialogProps) => {
  const [password, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handlePasswordChange = async () => {
    if (!password.trim() || !confirmPassword.trim()) {
      toast({
        title: "오류",
        description: "새 비밀번호를 입력해주세요.",
        variant: "destructive"
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "오류",
        description: "새 비밀번호가 일치하지 않습니다.",
        variant: "destructive"
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "오류",
        description: "비밀번호는 6자 이상이어야 합니다.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const accessToken = localStorage.getItem('accessToken');
      const response = await apiFetch('/api/auth/change/password', {
        method: 'PUT',
        body: JSON.stringify({
          newPassword: password
        }),
        headers :{
          Authorization: `Bearer ${accessToken}`
        }
      });

      if (response.ok) {
        toast({
          title: "성공",
          description: "비밀번호가 변경되었습니다. 다시 로그인해주세요.",
        });
        setNewPassword('');
        setConfirmPassword('');
        onSuccess();
        onClose();
      } else {
        throw new Error('비밀번호 변경 실패');
      }
    } catch (error) {
      toast({
        title: "오류",
        description: "비밀번호 변경 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setNewPassword('');
    setConfirmPassword('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>비밀번호 변경</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="new-password">새 비밀번호</Label>
            <Input
              id="new-password"
              type="password"
              value={password}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="새 비밀번호를 입력하세요 (6자 이상)"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-password">새 비밀번호 확인</Label>
            <Input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handlePasswordChange()}
              placeholder="새 비밀번호를 다시 입력하세요"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleClose}>
              취소
            </Button>
            <Button onClick={handlePasswordChange} disabled={loading}>
              {loading ? '변경 중...' : '비밀번호 변경'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PasswordChangeDialog;