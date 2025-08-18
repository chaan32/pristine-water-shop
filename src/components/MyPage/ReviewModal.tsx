import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiFetch } from '@/lib/api';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: any;
  orderName: string;
  onReviewSubmitted: () => void;
}

const ReviewModal = ({ isOpen, onClose, product, orderName, onReviewSubmitted }: ReviewModalProps) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

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
      const accessToken = localStorage.getItem('accessToken');
      const response = await apiFetch('/api/shop/products/review', {
        method: 'POST',
        body: JSON.stringify({
          productId: product.productId,
          orderName: orderName,
          rating,
          comment: comment.trim()
        }),
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`
        }
      });

      if (response.ok) {
        toast({
          title: "성공",
          description: "후기가 등록되었습니다.",
        });
        setComment('');
        setRating(5);
        onReviewSubmitted();
        onClose();
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>후기 작성</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium block mb-2">주문번호</label>
            <p className="text-sm text-muted-foreground">{orderName}</p>
          </div>
          
          <div>
            <label className="text-sm font-medium block mb-2">제품명</label>
            <p className="text-sm text-muted-foreground">{product?.productName}</p>
          </div>

          <div>
            <label className="text-sm font-medium block mb-2">평점</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="p-1"
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
            <label className="text-sm font-medium block mb-2">후기 내용</label>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="제품에 대한 후기를 작성해주세요..."
              rows={4}
              className="resize-none"
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={handleClose}>
              취소
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? '등록 중...' : '후기 등록'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReviewModal;