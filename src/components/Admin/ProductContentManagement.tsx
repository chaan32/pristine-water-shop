import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Upload, Save, Eye, Plus, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Product {
  id: string;
  name: string;
}

const ProductContentManagement = () => {
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [selectedProduct, setSelectedProduct] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [contentData, setContentData] = useState({
    title: '',
    overview: '',
    sections: [] as { subtitle: string; content: string }[],
    faq: [] as { question: string; answer: string }[],
    warranty: '',
    certifications: ''
  });
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string>('');
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);

  // API에서 상품 목록 가져오기
  const fetchProducts = async () => {
    try {
      setLoadingProducts(true);
      const token = localStorage.getItem('accessToken');
      
      const response = await fetch('http://localhost:8080/api/admin/products', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('상품 목록 응답:', data);
        
        // 응답 데이터 정규화 (id, name만)
        const normalizedProducts = data.map((item: any) => ({
          id: item.id || item.productId,
          name: item.name || item.productName
        }));
        
        setProducts(normalizedProducts);
      } else {
        console.error('상품 목록 요청 실패:', response.status);
        toast({
          title: "오류",
          description: "상품 목록을 불러오는데 실패했습니다.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('상품 목록 가져오기 실패:', error);
      toast({
        title: "네트워크 오류",
        description: "서버와의 연결에 문제가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setLoadingProducts(false);
    }
  };

  const [newFaq, setNewFaq] = useState({ question: '', answer: '' });
  const [newSection, setNewSection] = useState({ subtitle: '', content: '' });

  // 컴포넌트 마운트 시 상품 목록 가져오기
  useEffect(() => {
    fetchProducts();
  }, []);

  // URL 파라미터에서 productId를 받아 자동 선택
  useEffect(() => {
    const productId = searchParams.get('productId');
    if (productId) {
      setSelectedProduct(productId);
    }
  }, [searchParams]);

  const handleInputChange = (field: string, value: string) => {
    setContentData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSectionChange = (section: string, field: string, value: string) => {
    setContentData(prev => ({
      ...prev,
      [section]: {
        ...(prev[section as keyof typeof prev] as any),
        [field]: value
      }
    }));
  };

  const addFaq = () => {
    if (newFaq.question.trim() && newFaq.answer.trim()) {
      setContentData(prev => ({
        ...prev,
        faq: [...prev.faq, { ...newFaq }]
      }));
      setNewFaq({ question: '', answer: '' });
    }
  };

  const removeFaq = (index: number) => {
    setContentData(prev => ({
      ...prev,
      faq: prev.faq.filter((_, i) => i !== index)
    }));
  };

  const addSection = () => {
    if (newSection.subtitle.trim() && newSection.content.trim()) {
      setContentData(prev => ({
        ...prev,
        sections: [...prev.sections, { ...newSection }]
      }));
      setNewSection({ subtitle: '', content: '' });
    }
  };

  const removeSection = (index: number) => {
    setContentData(prev => ({
      ...prev,
      sections: prev.sections.filter((_, i) => i !== index)
    }));
  };

  const handleImageUpload = (file: File) => {
    setThumbnailFile(file);
    const previewUrl = URL.createObjectURL(file);
    setThumbnailPreview(previewUrl);
  };

  const handleGalleryImageUpload = (file: File) => {
    if (galleryFiles.length >= 5) {
      toast({
        title: "이미지 제한",
        description: "갤러리 이미지는 최대 5장까지 업로드 가능합니다.",
        variant: "destructive",
      });
      return;
    }

    setGalleryFiles(prev => [...prev, file]);
    const previewUrl = URL.createObjectURL(file);
    setGalleryPreviews(prev => [...prev, previewUrl]);
  };

  const removeGalleryImage = (index: number) => {
    setGalleryFiles(prev => prev.filter((_, i) => i !== index));
    setGalleryPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const convertToHtml = () => {
    let html = '';
    
    if (contentData.overview) {
      html += `<div class="overview"><h2>제품 개요</h2><p>${contentData.overview.replace(/\n/g, '<br>')}</p></div>`;
    }
    
    contentData.sections.forEach(section => {
      html += `<div class="section"><h3>${section.subtitle}</h3><div class="content">${section.content.replace(/\n/g, '<br>')}</div></div>`;
    });
    
    if (contentData.faq.length > 0) {
      html += '<div class="faq"><h2>자주 묻는 질문</h2>';
      contentData.faq.forEach(faq => {
        html += `<div class="faq-item"><h4>Q: ${faq.question}</h4><p>A: ${faq.answer}</p></div>`;
      });
      html += '</div>';
    }
    
    if (contentData.warranty) {
      html += `<div class="warranty"><h3>품질보증</h3><p>${contentData.warranty.replace(/\n/g, '<br>')}</p></div>`;
    }
    
    if (contentData.certifications) {
      html += `<div class="certifications"><h3>인증정보</h3><p>${contentData.certifications.replace(/\n/g, '<br>')}</p></div>`;
    }
    
    return html;
  };

  const handleSave = async () => {
    if (!selectedProduct) {
      toast({
        title: "선택 오류",
        description: "상품을 선택해주세요.",
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData();
    
    // 기본 데이터 추가
    formData.append('productId', selectedProduct);
    formData.append('title', contentData.title);
    formData.append('htmlContent', convertToHtml());
    
    // 썸네일 이미지 파일 추가
    if (thumbnailFile) {
      formData.append('thumbnailImage', thumbnailFile);
    }
    
    // // 갤러리 이미지 파일들 추가
    // galleryFiles.forEach((file, index) => {
    //   formData.append(`galleryImage_${index}`, file);
    // });

    galleryFiles.forEach(file=>{
      formData.append('galleryImages', file);
    });

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('http://localhost:8080/api/admin/products/content', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          // Content-Type 헤더는 FormData 사용 시 자동으로 multipart/form-data로 설정됨
        },
        body: formData // FormData 객체 직접 전송 (multipart/form-data)
      });

      if (response.ok) {
        toast({
          title: "저장 완료",
          description: "상품 상세 컨텐츠가 저장되었습니다.",
        });
      } else {
        throw new Error('저장 실패');
      }
    } catch (error) {
      toast({
        title: "저장 실패",
        description: "컨텐츠 저장 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  const handlePreview = () => {
    setShowPreview(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">상품 상세 컨텐츠 관리</h1>
          <p className="text-muted-foreground mt-2">제품의 상세 정보와 썸네일을 작성하고 관리합니다.</p>
        </div>
        <div className="flex gap-3">
          <Dialog open={showPreview} onOpenChange={setShowPreview}>
            <DialogTrigger asChild>
              <Button variant="outline" onClick={handlePreview}>
                <Eye className="w-4 h-4 mr-2" />
                미리보기
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>제품 상세 정보 미리보기</DialogTitle>
                <DialogDescription>
                  작성한 내용이 실제 제품 페이지에서 어떻게 보일지 확인하세요.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6">
                {/* 썸네일 */}
                {thumbnailPreview && (
                  <Card>
                    <CardHeader>
                      <CardTitle>제품 썸네일</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <img 
                        src={thumbnailPreview} 
                        alt="제품 썸네일" 
                        className="w-48 h-48 object-cover rounded-lg border"
                      />
                    </CardContent>
                  </Card>
                )}

                {/* 제품 개요 */}
                {contentData.overview && (
                  <Card>
                    <CardHeader>
                      <CardTitle>제품 개요</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="whitespace-pre-wrap">{contentData.overview}</p>
                    </CardContent>
                  </Card>
                )}

                {/* 상세 섹션들 */}
                {contentData.sections.map((section, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <CardTitle>{section.subtitle}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="whitespace-pre-wrap">{section.content}</div>
                    </CardContent>
                  </Card>
                ))}

                {/* 갤러리 */}
                {galleryPreviews.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>제품 갤러리</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {galleryPreviews.map((image, index) => (
                          <img
                            key={index}
                            src={image}
                            alt={`갤러리 이미지 ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg border"
                          />
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* FAQ */}
                {contentData.faq.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>자주 묻는 질문</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {contentData.faq.map((item, index) => (
                          <div key={index} className="border-b pb-4 last:border-b-0">
                            <h4 className="font-medium mb-2">Q: {item.question}</h4>
                            <p className="text-muted-foreground">A: {item.answer}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </DialogContent>
          </Dialog>
          
          <Button onClick={handleSave}>
            <Save className="w-4 h-4 mr-2" />
            저장
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>제품 선택</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="product-select">상품 선택</Label>
              <Select value={selectedProduct} onValueChange={setSelectedProduct} disabled={loadingProducts}>
                <SelectTrigger>
                  <SelectValue placeholder={loadingProducts ? "상품 목록을 불러오는 중..." : "컨텐츠를 작성할 상품을 선택하세요"} />
                </SelectTrigger>
                <SelectContent>
                  {products.map(product => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {selectedProduct && (
              <Badge variant="secondary" className="w-fit">
                선택된 상품: {products.find(p => p.id === selectedProduct)?.name}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {selectedProduct && (
        <Tabs defaultValue="basic" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">기본 정보</TabsTrigger>
            <TabsTrigger value="images">이미지 관리</TabsTrigger>
            <TabsTrigger value="content">상세 컨텐츠</TabsTrigger>
          </TabsList>

          <TabsContent value="basic">
            <Card>
              <CardHeader>
                <CardTitle>기본 정보</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">제품 제목</Label>
                  <Input
                    id="title"
                    value={contentData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="제품의 메인 제목을 입력하세요"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="overview">제품 개요</Label>
                  <Textarea
                    id="overview"
                    value={contentData.overview}
                    onChange={(e) => handleInputChange('overview', e.target.value)}
                    placeholder="제품의 전반적인 개요를 작성하세요..."
                    className="min-h-[120px]"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="images">
            <Card>
              <CardHeader>
                <CardTitle>이미지 관리</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="thumbnail">제품 썸네일</Label>
                  <div className="flex items-center gap-4">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleImageUpload(file);
                        }
                      }}
                      className="flex-1"
                    />
                    {thumbnailPreview && (
                      <img 
                        src={thumbnailPreview} 
                        alt="썸네일 미리보기" 
                        className="w-16 h-16 object-cover rounded border"
                      />
                    )}
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label>갤러리 이미지</Label>
                  <div className="flex gap-2">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleGalleryImageUpload(file);
                        }
                      }}
                      className="hidden"
                      id="gallery-file"
                    />
                    <Button 
                      variant="outline" 
                      onClick={() => document.getElementById('gallery-file')?.click()}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      이미지 추가
                    </Button>
                  </div>
                  {galleryFiles.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm text-muted-foreground mb-2">갤러리 이미지 ({galleryFiles.length}/5)</p>
                      <div className="grid grid-cols-3 gap-4">
                        {galleryPreviews.map((image, index) => (
                          <div key={index} className="relative">
                            <img
                              src={image}
                              alt={`갤러리 이미지 ${index + 1}`}
                              className="w-full h-24 object-cover rounded-md border"
                            />
                            <Button
                              variant="destructive"
                              size="icon"
                              className="absolute top-1 right-1 h-6 w-6"
                              onClick={() => removeGalleryImage(index)}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="content">
            <div className="space-y-6">
              {/* 상세 섹션 관리 */}
              <Card>
                <CardHeader>
                  <CardTitle>상세 컨텐츠 섹션</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="section-subtitle">서브 타이틀</Label>
                      <Input
                        id="section-subtitle"
                        value={newSection.subtitle}
                        onChange={(e) => setNewSection(prev => ({ ...prev, subtitle: e.target.value }))}
                        placeholder="예: 핵심 기술, 주요 특징 등"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="section-content">세부 내용</Label>
                      <Textarea
                        id="section-content"
                        value={newSection.content}
                        onChange={(e) => setNewSection(prev => ({ ...prev, content: e.target.value }))}
                        placeholder="서브 타이틀에 대한 세부 설명을 입력하세요"
                        className="min-h-[100px]"
                      />
                    </div>
                  </div>
                  <Button onClick={addSection} className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    섹션 추가
                  </Button>

                  <div className="space-y-3">
                    {contentData.sections.map((section, index) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium mb-2">{section.subtitle}</h4>
                            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{section.content}</p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeSection(index)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* FAQ */}
              <Card>
                <CardHeader>
                  <CardTitle>자주 묻는 질문</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="faq-question">질문</Label>
                      <Input
                        id="faq-question"
                        value={newFaq.question}
                        onChange={(e) => setNewFaq(prev => ({ ...prev, question: e.target.value }))}
                        placeholder="질문을 입력하세요"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="faq-answer">답변</Label>
                      <Textarea
                        id="faq-answer"
                        value={newFaq.answer}
                        onChange={(e) => setNewFaq(prev => ({ ...prev, answer: e.target.value }))}
                        placeholder="답변을 입력하세요"
                        className="min-h-[80px]"
                      />
                    </div>
                  </div>
                  <Button onClick={addFaq} className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    FAQ 추가
                  </Button>

                  <div className="space-y-3">
                    {contentData.faq.map((item, index) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium mb-2">Q: {item.question}</h4>
                            <p className="text-sm text-muted-foreground">A: {item.answer}</p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeFaq(index)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* 품질보증 및 인증정보 */}
              <Card>
                <CardHeader>
                  <CardTitle>추가 정보</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="warranty">품질보증</Label>
                    <Textarea
                      id="warranty"
                      value={contentData.warranty}
                      onChange={(e) => handleInputChange('warranty', e.target.value)}
                      placeholder="품질보증 관련 정보를 입력하세요"
                      className="min-h-[80px]"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="certifications">인증정보</Label>
                    <Textarea
                      id="certifications"
                      value={contentData.certifications}
                      onChange={(e) => handleInputChange('certifications', e.target.value)}
                      placeholder="제품 인증 관련 정보를 입력하세요"
                      className="min-h-[80px]"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default ProductContentManagement;