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
import { apiFetch, getAccessToken } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface ReAuthDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  userLoginId: string;
}

const ReAuthDialog = ({ isOpen, onClose, onSuccess, userLoginId }: ReAuthDialogProps) => {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleReAuth = async () => {
    if (!password.trim()) {
      toast({
        title: "오류",
        description: "비밀번호를 입력해주세요.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const accessToken = getAccessToken();
      // API: POST /api/auth/login/recheck - Verify current password
      const response = await apiFetch('/api/auth/login/recheck', {
        method: 'POST',
        body: JSON.stringify({
          password
        }),
        headers :{
            Authorization: `Bearer ${accessToken}`
        }
      });

      if (response.ok) {
        setPassword('');
        onSuccess();
        onClose();
      } else {
        toast({
          title: "인증 실패",
          description: "비밀번호가 올바르지 않습니다.",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "오류",
        description: "인증 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setPassword('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>본인 확인</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            비밀번호 변경을 위해 현재 비밀번호를 입력해주세요.
          </p>
          <div className="space-y-2">
            <Label htmlFor="current-password">현재 비밀번호</Label>
            <Input
              id="current-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleReAuth()}
              placeholder="현재 비밀번호를 입력하세요"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleClose}>
              취소
            </Button>
            <Button onClick={handleReAuth} disabled={loading}>
              {loading ? '확인 중...' : '확인'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReAuthDialog;