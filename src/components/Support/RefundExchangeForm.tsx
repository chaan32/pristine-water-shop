import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { RotateCcw, RefreshCw, Upload, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supportApi, getUserInfo } from '@/lib/api';

interface Order {
  id: string;
  date: string;
  products: string[];
  total: number;
  status: string;
}

interface RefundExchangeFormProps {
  order: Order;
}

const RefundExchangeForm = ({ order }: RefundExchangeFormProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [requestType, setRequestType] = useState<'refund' | 'exchange'>('refund');
  const [reason, setReason] = useState('');
  const [detailReason, setDetailReason] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const reasons = [
    '단순 변심',
    '사이즈/색상 불만족',
    '배송 지연',
    '상품 불량/하자',
    '상품 설명과 다름',
    '기타'
  ];


  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setUploadedFiles(prev => [...prev, ...files].slice(0, 5)); // 최대 5개
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!reason || !detailReason) {
      toast({
        title: "입력 오류",
        description: "사유를 모두 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    const userInfo = getUserInfo();
    if (!userInfo) {
      toast({
        title: "로그인 필요",
        description: "로그인 후 신청해주세요.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // 신청사유와 상세사유를 "-"로 연결
      const combinedContent = `${reason} - ${detailReason}`;
      
      // 1:1문의 API와 동일한 형태로 데이터 구성
      const inquiryData = {
        category: `${requestType === 'refund' ? '환불' : '교환'} 신청`,
        title: `[${requestType === 'refund' ? '환불' : '교환'} 신청] ${order.id}`,
        content: combinedContent,
        orderId: parseInt(order.id) // 주문번호를 숫자로 변환
      };

      let response;
      if (uploadedFiles.length > 0) {
        const formData = new FormData();
        const inquiryDataBlob = new Blob([JSON.stringify(inquiryData)], { type: 'application/json' });
        formData.append('data', inquiryDataBlob);
        uploadedFiles.forEach((file) => {
          formData.append(`attachments`, file);
        });
        response = await supportApi.createInquiryWithFiles(formData);
      } else {
        response = await supportApi.createInquiry(inquiryData);
      }

      if (response.ok) {
        toast({
          title: "신청 완료",
          description: `${requestType === 'refund' ? '환불' : '교환'} 신청이 완료되었습니다.`,
        });
        
        setIsOpen(false);
        // Reset form
        setReason('');
        setDetailReason('');
        setUploadedFiles([]);
      } else {
        const errorData = await response.json();
        throw new Error(errorData?.message || '신청 처리 중 오류가 발생했습니다.');
      }
    } catch (error: any) {
      toast({
        title: "신청 실패",
        description: error.message || '신청 처리 중 오류가 발생했습니다.',
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          환불/교환 신청
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RotateCcw className="w-5 h-5" />
            환불/교환 신청
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* 주문 정보 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">주문 정보</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium">주문번호:</span>
                  <span>{order.id}</span>
                  <Badge variant="secondary">{order.status}</Badge>
                </div>
                <div>
                  <span className="font-medium">상품:</span>
                  <span className="ml-2">{order.products.join(', ')}</span>
                </div>
                <div>
                  <span className="font-medium">주문일:</span>
                  <span className="ml-2">{order.date}</span>
                </div>
                <div>
                  <span className="font-medium">결제금액:</span>
                  <span className="ml-2 font-bold">{order.total.toLocaleString()}원</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 신청 유형 */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">신청 유형</Label>
            <RadioGroup 
              value={requestType} 
              onValueChange={(value) => setRequestType(value as 'refund' | 'exchange')}
              className="flex gap-6"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="refund" id="refund" />
                <Label htmlFor="refund" className="flex items-center gap-2">
                  <RotateCcw className="w-4 h-4" />
                  환불
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="exchange" id="exchange" />
                <Label htmlFor="exchange" className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4" />
                  교환
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* 사유 선택 */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">신청 사유</Label>
            <RadioGroup value={reason} onValueChange={setReason}>
              <div className="grid grid-cols-2 gap-4">
                {reasons.map((reasonOption) => (
                  <div key={reasonOption} className="flex items-center space-x-2">
                    <RadioGroupItem value={reasonOption} id={reasonOption} />
                    <Label htmlFor={reasonOption}>{reasonOption}</Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </div>

          {/* 상세 사유 */}
          <div className="space-y-2">
            <Label htmlFor="detail-reason" className="text-base font-semibold">상세 사유</Label>
            <Textarea
              id="detail-reason"
              placeholder="상세한 사유를 입력해주세요 (최소 10자)"
              value={detailReason}
              onChange={(e) => setDetailReason(e.target.value)}
              rows={4}
            />
          </div>


          {/* 첨부파일 */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">첨부파일 (선택사항)</Label>
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
              <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-2">
                이미지를 업로드하세요 (최대 5개, 10MB 이하)
              </p>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
              />
              <Button 
                variant="outline" 
                onClick={() => document.getElementById('file-upload')?.click()}
                type="button"
              >
                파일 선택
              </Button>
            </div>
            
            {uploadedFiles.length > 0 && (
              <div className="space-y-2">
                {uploadedFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-2 border rounded">
                    <span className="text-sm truncate">{file.name}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 주의사항 */}
          <Card className="bg-muted/50">
            <CardContent className="p-4">
              <h4 className="font-semibold mb-2">주의사항</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• 상품 수령 후 7일 이내에 신청 가능합니다.</li>
                <li>• 포장재 훼손 시 교환/환불이 제한될 수 있습니다.</li>
                <li>• 단순 변심의 경우 배송비는 고객 부담입니다.</li>
                <li>• 상품 불량의 경우 무료로 교환/환불 처리됩니다.</li>
              </ul>
            </CardContent>
          </Card>

          {/* 버튼 */}
          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={() => setIsOpen(false)} className="flex-1">
              취소
            </Button>
            <Button onClick={handleSubmit} className="flex-1" disabled={isSubmitting}>
              {isSubmitting ? '처리중...' : '신청하기'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RefundExchangeForm;