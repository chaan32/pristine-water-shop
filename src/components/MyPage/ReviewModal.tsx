import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiFetch } from '@/lib/api';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: any;
  onReviewSubmitted: () => void;
}

const ReviewModal = ({ isOpen, onClose, order, onReviewSubmitted }: ReviewModalProps) => {
  const { toast } = useToast();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!comment.trim()) {
      toast({
        title: "오류",
        description: "후기 내용을 입력해주세요.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await apiFetch('/api/reviews', {
        method: 'POST',
        body: JSON.stringify({
          orderNumber: order.orderName,
          rating,
          comment: comment.trim()
        })
      });

      if (response.ok) {
        toast({
          title: "성공",
          description: "후기가 등록되었습니다."
        });
        onReviewSubmitted();
        onClose();
        setComment('');
        setRating(5);
      } else {
        throw new Error('후기 등록 실패');
      }
    } catch (error) {
      console.error('Review submission error:', error);
      toast({
        title: "오류",
        description: "후기 등록 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setComment('');
    setRating(5);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>상품 후기 작성</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium">주문번호</Label>
            <p className="text-sm text-muted-foreground">{order?.orderName}</p>
          </div>

          <div>
            <Label className="text-sm font-medium mb-2 block">평점</Label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="transition-colors"
                >
                  <Star
                    className={`w-6 h-6 ${
                      star <= rating 
                        ? 'fill-yellow-400 text-yellow-400' 
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="comment" className="text-sm font-medium mb-2 block">
              후기 내용
            </Label>
            <Textarea
              id="comment"
              placeholder="상품에 대한 후기를 작성해주세요..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="min-h-[120px] resize-none"
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {comment.length}/500자
            </p>
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              onClick={handleClose}
              className="flex-1"
              disabled={isSubmitting}
            >
              취소
            </Button>
            <Button
              onClick={handleSubmit}
              className="flex-1"
              disabled={isSubmitting}
            >
              {isSubmitting ? '등록 중...' : '후기 등록'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReviewModal;