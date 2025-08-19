import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, Trash2, Image as ImageIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ImageManagementModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  productId: number;
  productName: string;
}

interface ProductImage {
  id: number;
  url: string;
  fileName: string;
  isMain: boolean;
}

const ImageManagementModal = ({ isOpen, onOpenChange, productId, productName }: ImageManagementModalProps) => {
  const [images, setImages] = useState<ProductImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  // 이미지 목록 조회
  const fetchImages = async () => {
    try {
      setLoading(true);
      const accessToken = localStorage.getItem('accessToken');
      const response = await fetch(`http://localhost:8080/api/admin/products/${productId}/images`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setImages(data);
      }
    } catch (error) {
      console.error('이미지 목록 조회 실패:', error);
      toast({
        title: "오류",
        description: "이미지 목록을 불러오는데 실패했습니다.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // 이미지 업로드
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const formData = new FormData();
    
    Array.from(files).forEach((file) => {
      formData.append('images', file);
    });
    formData.append('productId', productId.toString());

    try {
      const accessToken = localStorage.getItem('accessToken');
      const response = await fetch('http://localhost:8080/api/admin/products/images/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
        body: formData
      });

      if (response.ok) {
        toast({
          title: "이미지 업로드 성공",
          description: `${files.length}개의 이미지가 업로드되었습니다.`,
        });
        fetchImages();
      } else {
        throw new Error('이미지 업로드 실패');
      }
    } catch (error) {
      console.error('이미지 업로드 실패:', error);
      toast({
        title: "오류",
        description: "이미지 업로드에 실패했습니다.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
      // 파일 입력 초기화
      event.target.value = '';
    }
  };

  // 이미지 삭제
  const handleImageDelete = async (imageId: number) => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      const response = await fetch('http://localhost:8080/api/admin/products/images', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          productId: productId,
          imageId: imageId
        })
      });

      if (response.ok) {
        toast({
          title: "이미지 삭제 완료",
          description: "이미지가 삭제되었습니다.",
        });
        fetchImages();
      } else {
        throw new Error('이미지 삭제 실패');
      }
    } catch (error) {
      console.error('이미지 삭제 실패:', error);
      toast({
        title: "오류",
        description: "이미지 삭제에 실패했습니다.",
        variant: "destructive"
      });
    }
  };

  // 메인 이미지 설정
  const handleSetMainImage = async (imageId: number) => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      const response = await fetch('http://localhost:8080/api/admin/products/images/main', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          productId: productId,
          imageId: imageId
        })
      });

      if (response.ok) {
        toast({
          title: "메인 이미지 설정 완료",
          description: "메인 이미지가 변경되었습니다.",
        });
        fetchImages();
      } else {
        throw new Error('메인 이미지 설정 실패');
      }
    } catch (error) {
      console.error('메인 이미지 설정 실패:', error);
      toast({
        title: "오류",
        description: "메인 이미지 설정에 실패했습니다.",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    if (isOpen && productId) {
      fetchImages();
    }
  }, [isOpen, productId]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>이미지 관리 - {productName}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* 이미지 업로드 섹션 */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <Label htmlFor="image-upload">새 이미지 업로드</Label>
                <div className="flex items-center gap-4">
                  <Input
                    id="image-upload"
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploading}
                  />
                  <Button disabled={uploading} variant="outline">
                    <Upload className="w-4 h-4 mr-2" />
                    {uploading ? '업로드 중...' : '이미지 선택'}
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  여러 이미지를 동시에 선택할 수 있습니다. (JPG, PNG, WEBP 등)
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 이미지 목록 */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">등록된 이미지</h3>
              <span className="text-sm text-muted-foreground">
                총 {images.length}개
              </span>
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-8">
                <div className="text-muted-foreground">이미지를 불러오는 중...</div>
              </div>
            ) : images.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                    <ImageIcon className="w-12 h-12 mb-4" />
                    <p>등록된 이미지가 없습니다.</p>
                    <p className="text-sm">위에서 새 이미지를 업로드해보세요.</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {images.map((image) => (
                  <Card key={image.id} className="overflow-hidden">
                    <CardContent className="p-0">
                      <div className="aspect-square relative bg-muted">
                        <img
                          src={image.url}
                          alt={image.fileName}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = '/placeholder.svg';
                          }}
                        />
                        {image.isMain && (
                          <div className="absolute top-2 left-2">
                            <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
                              메인
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="p-3 space-y-2">
                        <p className="text-sm font-medium truncate">{image.fileName}</p>
                        <div className="flex gap-2">
                          {!image.isMain && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleSetMainImage(image.id)}
                              className="flex-1"
                            >
                              메인으로 설정
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleImageDelete(image.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* 닫기 버튼 */}
          <div className="flex justify-end pt-4">
            <Button onClick={() => onOpenChange(false)}>
              닫기
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImageManagementModal;