import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, ShoppingCart, Calendar, Package } from 'lucide-react';

interface ClaimDetailDialogProps {
  isOpen: boolean;
  onClose: () => void;
  claim: any;
}

const ClaimDetailDialog = ({ isOpen, onClose, claim }: ClaimDetailDialogProps) => {

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING': return '답변대기';
      case 'ANSWERED': return '답변완료';
      case 'CLOSED': return '처리완료';
      default: return status;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'PENDING': return 'destructive' as const;
      case 'ANSWERED': return 'default' as const;
      case 'CLOSED': return 'secondary' as const;
      default: return 'outline' as const;
    }
  };


  if (!claim) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            클레임 상세내용
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* 클레임 정보 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">클레임 정보</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant="outline">클레임</Badge>
                <Badge variant={getStatusVariant(claim.status)}>
                  {getStatusText(claim.status)}
                </Badge>
                {claim.orderNumber && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <ShoppingCart className="h-3 w-3" />
                    {claim.orderNumber}
                  </Badge>
                )}
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2">{claim.title}</h3>
                {claim.createdAt && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    {new Date(claim.createdAt).toLocaleDateString('ko-KR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                )}
              </div>

              <div>
                <h4 className="font-semibold mb-2">내용</h4>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="whitespace-pre-wrap">{claim.content}</p>
                </div>
              </div>

              {claim.answer && (
                <div>
                  <h4 className="font-semibold mb-2 text-primary">답변내용</h4>
                  <div className="bg-primary/5 border border-primary/20 p-4 rounded-lg">
                    <p className="whitespace-pre-wrap">{claim.answer}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 주문 정보 */}
          {claim.orderNumber && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  주문 정보
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-sm">
                    <span className="font-semibold">주문번호:</span>
                    <span className="ml-2 text-muted-foreground">{claim.orderNumber}</span>
                  </div>

                  {/* 주문 상품 목록 */}
                  {claim.items && claim.items.length > 0 ? (
                    <div>
                      <h4 className="font-semibold mb-3">주문 상품</h4>
                      <div className="space-y-3">
                        {claim.items.map((item: any, index: number) => (
                          <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                            {item.productImageUrl && (
                              <img 
                                src={item.productImageUrl} 
                                alt={item.productName}
                                className="w-16 h-16 object-cover rounded"
                              />
                            )}
                            <div className="flex-1">
                              <h5 className="font-medium">{item.productName}</h5>
                              {item.quantity && item.productPerPrice && (
                                <p className="text-sm text-muted-foreground">
                                  수량: {item.quantity}개 × {item.productPerPrice.toLocaleString()}원
                                </p>
                              )}
                            </div>
                            {item.productTotalPrice && (
                              <div className="text-right">
                                <p className="font-semibold">{item.productTotalPrice.toLocaleString()}원</p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">주문 상품 정보가 없습니다.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ClaimDetailDialog;