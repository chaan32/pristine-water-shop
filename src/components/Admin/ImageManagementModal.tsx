import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, Trash2, Image as ImageIcon, Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ImageManagementModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  productId: number;
  productName: string;
}

interface ProductImage {
  url: string;
  fileName: string;
  isThumbnail: boolean;
  id?: number;
  order?: number;
}

interface ImageApiResponse {
  thumbnailImageS3URL: string;
  galleryImagesS3URL: Record<string, number>;
}

const ImageManagementModal = ({ isOpen, onOpenChange, productId, productName }: ImageManagementModalProps) => {
  const [images, setImages] = useState<ProductImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  // API 응답을 ProductImage[]로 변환
  const transformApiResponse = (data: ImageApiResponse): ProductImage[] => {
    const result: ProductImage[] = [];
    
    // 썸네일 이미지 추가
    if (data.thumbnailImageS3URL) {
      const fileName = data.thumbnailImageS3URL.split('/').pop()?.split('-')[0] || 'thumbnail';
      result.push({
        url: data.thumbnailImageS3URL,
        fileName: fileName,
        isThumbnail: true
      });
    }
    
    // 갤러리 이미지들 추가 (숫자 값이 이미지 ID)
    Object.entries(data.galleryImagesS3URL).forEach(([url, id]) => {
      const fileName = url.split('/').pop()?.split('-')[0] || 'gallery';
      result.push({
        url: url,
        fileName: fileName,
        isThumbnail: false,
        id: id,
        order: id
      });
    });
    
    // 갤러리 이미지를 order 순으로 정렬
    result.sort((a, b) => {
      if (a.isThumbnail) return -1;
      if (b.isThumbnail) return 1;
      return (a.order || 0) - (b.order || 0);
    });
    
    return result;
  };

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
        const data: ImageApiResponse = await response.json();
        const transformedImages = transformApiResponse(data);
        setImages(transformedImages);
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
      event.target.value = '';
    }
  };

  // 이미지 삭제
  const handleImageDelete = async (image: ProductImage) => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      const response = await fetch('http://localhost:8080/api/admin/products/images', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          imageId: image.id
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

  // 썸네일 이미지 설정
  const handleSetThumbnail = async (image: ProductImage) => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      const response = await fetch('http://localhost:8080/api/admin/products/images/thumbnail', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          currentThumbnailUrl: thumbnailImage?.url,
          newThumbnailId: image.id,
          newThumbnailUrl: image.url
        })
      });

      if (response.ok) {
        toast({
          title: "썸네일 이미지 설정 완료",
          description: "썸네일 이미지가 변경되었습니다.",
        });
        fetchImages();
      } else {
        throw new Error('썸네일 이미지 설정 실패');
      }
    } catch (error) {
      console.error('썸네일 이미지 설정 실패:', error);
      toast({
        title: "오류",
        description: "썸네일 이미지 설정에 실패했습니다.",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    if (isOpen && productId) {
      fetchImages();
    }
  }, [isOpen, productId]);

  // 썸네일과 갤러리 이미지 분리
  const thumbnailImage = images.find(img => img.isThumbnail);
  const galleryImages = images.filter(img => !img.isThumbnail);

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

          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="text-muted-foreground">이미지를 불러오는 중...</div>
            </div>
          ) : (
            <>
              {/* 썸네일 이미지 섹션 */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500" />
                  <h3 className="text-lg font-semibold">썸네일 이미지</h3>
                </div>
                
                {thumbnailImage ? (
                  <Card className="overflow-hidden">
                    <CardContent className="p-0">
                      <div className="aspect-square relative bg-muted max-w-xs">
                        <img
                          src={thumbnailImage.url}
                          alt={thumbnailImage.fileName}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = '/placeholder.svg';
                          }}
                        />
                        <div className="absolute top-2 left-2">
                          <span className="bg-yellow-500 text-yellow-900 text-xs px-2 py-1 rounded">
                            썸네일
                          </span>
                        </div>
                      </div>
                      <div className="p-3 space-y-2">
                        <p className="text-sm font-medium truncate">{thumbnailImage.fileName}</p>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleImageDelete(thumbnailImage)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          삭제
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                        <Star className="w-12 h-12 mb-4" />
                        <p>썸네일 이미지가 없습니다.</p>
                        <p className="text-sm">갤러리 이미지 중 하나를 썸네일로 설정해보세요.</p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* 갤러리 이미지 섹션 */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">갤러리 이미지</h3>
                  <span className="text-sm text-muted-foreground">
                    총 {galleryImages.length}개
                  </span>
                </div>

                {galleryImages.length === 0 ? (
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                        <ImageIcon className="w-12 h-12 mb-4" />
                        <p>갤러리 이미지가 없습니다.</p>
                        <p className="text-sm">위에서 새 이미지를 업로드해보세요.</p>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {galleryImages.map((image, index) => (
                      <Card key={image.url} className="overflow-hidden">
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
                            {image.order && (
                              <div className="absolute top-2 left-2">
                                <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
                                  {image.order}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="p-3 space-y-2">
                            <p className="text-sm font-medium truncate">{image.fileName}</p>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleSetThumbnail(image)}
                                className="flex-1"
                              >
                                <Star className="w-4 h-4 mr-1" />
                                썸네일로 설정
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleImageDelete(image)}
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
            </>
          )}

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