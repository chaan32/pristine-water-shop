import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, Save, Eye, Plus, Trash2, Image } from 'lucide-react';

const ProductContentManagement = () => {
  const [selectedProduct, setSelectedProduct] = useState('');
  const [contentData, setContentData] = useState({
    title: '',
    subtitle: '',
    thumbnailImage: '',
    heroImage: '',
    gallery: [] as string[],
    overview: '',
    features: [] as string[],
    specifications: '',
    installation: '',
    maintenance: '',
    faq: [] as { question: string; answer: string }[],
    warranty: '',
    certifications: ''
  });

  const products = [
    { id: 'sf-100', name: '프리미엄 샤워 필터 SF-100' },
    { id: 'sf-50', name: '기본형 샤워 필터 SF-50' },
    { id: 'kf-200', name: '주방용 직수 정수기 KF-200' },
    { id: 'if-1000', name: '산업용 대용량 필터 IF-1000' }
  ];

  const [newFeature, setNewFeature] = useState('');
  const [newFaq, setNewFaq] = useState({ question: '', answer: '' });

  const handleInputChange = (field: string, value: string) => {
    setContentData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addFeature = () => {
    if (newFeature.trim()) {
      setContentData(prev => ({
        ...prev,
        features: [...prev.features, newFeature.trim()]
      }));
      setNewFeature('');
    }
  };

  const removeFeature = (index: number) => {
    setContentData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
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

  const handleSave = () => {
    console.log('저장된 상품 컨텐츠:', { product: selectedProduct, content: contentData });
    alert('상품 상세 컨텐츠가 저장되었습니다.');
  };

  const handlePreview = () => {
    console.log('미리보기:', { product: selectedProduct, content: contentData });
    alert('미리보기 기능은 개발 중입니다.');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">상품 상세 컨텐츠 관리</h1>
          <p className="text-muted-foreground mt-2">제품의 상세 정보와 썸네일을 작성하고 관리합니다.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handlePreview}>
            <Eye className="w-4 h-4 mr-2" />
            미리보기
          </Button>
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
              <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                <SelectTrigger>
                  <SelectValue placeholder="컨텐츠를 작성할 상품을 선택하세요" />
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
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">기본 정보</TabsTrigger>
            <TabsTrigger value="images">이미지 관리</TabsTrigger>
            <TabsTrigger value="content">상세 컨텐츠</TabsTrigger>
            <TabsTrigger value="extras">추가 정보</TabsTrigger>
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
                  <Label htmlFor="subtitle">부제목</Label>
                  <Input
                    id="subtitle"
                    value={contentData.subtitle}
                    onChange={(e) => handleInputChange('subtitle', e.target.value)}
                    placeholder="제품의 부제목을 입력하세요"
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
              <CardContent className="space-y-6">
                <div className="grid gap-2">
                  <Label htmlFor="thumbnail">썸네일 이미지 URL</Label>
                  <div className="flex gap-2">
                    <Input
                      id="thumbnail"
                      value={contentData.thumbnailImage}
                      onChange={(e) => handleInputChange('thumbnailImage', e.target.value)}
                      placeholder="제품 목록에 표시될 썸네일 이미지 URL"
                    />
                    <Button variant="outline" size="icon">
                      <Upload className="w-4 h-4" />
                    </Button>
                  </div>
                  {contentData.thumbnailImage && (
                    <div className="mt-2">
                      <img
                        src={contentData.thumbnailImage || '/placeholder.svg'}
                        alt="썸네일 미리보기"
                        className="w-32 h-32 object-cover rounded-md border"
                      />
                    </div>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="hero">히어로 이미지 URL</Label>
                  <div className="flex gap-2">
                    <Input
                      id="hero"
                      value={contentData.heroImage}
                      onChange={(e) => handleInputChange('heroImage', e.target.value)}
                      placeholder="상세 페이지 상단에 표시될 히어로 이미지 URL"
                    />
                    <Button variant="outline" size="icon">
                      <Upload className="w-4 h-4" />
                    </Button>
                  </div>
                  {contentData.heroImage && (
                    <div className="mt-2">
                      <img
                        src={contentData.heroImage || '/placeholder.svg'}
                        alt="히어로 이미지 미리보기"
                        className="w-full max-w-md h-48 object-cover rounded-md border"
                      />
                    </div>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label>갤러리 이미지</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="갤러리에 추가할 이미지 URL"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          const url = (e.target as HTMLInputElement).value;
                          if (url) {
                            setContentData(prev => ({
                              ...prev,
                              gallery: [...prev.gallery, url]
                            }));
                            (e.target as HTMLInputElement).value = '';
                          }
                        }
                      }}
                    />
                    <Button variant="outline" size="icon">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  {contentData.gallery.length > 0 && (
                    <div className="grid grid-cols-3 gap-4 mt-4">
                      {contentData.gallery.map((image, index) => (
                        <div key={index} className="relative">
                          <img
                            src={image || '/placeholder.svg'}
                            alt={`갤러리 이미지 ${index + 1}`}
                            className="w-full h-24 object-cover rounded-md border"
                          />
                          <Button
                            variant="destructive"
                            size="icon"
                            className="absolute top-1 right-1 h-6 w-6"
                            onClick={() => {
                              setContentData(prev => ({
                                ...prev,
                                gallery: prev.gallery.filter((_, i) => i !== index)
                              }));
                            }}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="content">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>주요 기능</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      value={newFeature}
                      onChange={(e) => setNewFeature(e.target.value)}
                      placeholder="새로운 기능을 입력하세요"
                      onKeyPress={(e) => e.key === 'Enter' && addFeature()}
                    />
                    <Button onClick={addFeature}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {contentData.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 border rounded">
                        <span className="flex-1">{feature}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeFeature(index)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>기술 사양</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={contentData.specifications}
                    onChange={(e) => handleInputChange('specifications', e.target.value)}
                    placeholder="제품의 상세한 기술 사양을 작성하세요..."
                    className="min-h-[200px]"
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>설치 방법</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={contentData.installation}
                    onChange={(e) => handleInputChange('installation', e.target.value)}
                    placeholder="제품 설치 방법을 단계별로 작성하세요..."
                    className="min-h-[200px]"
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>유지보수</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={contentData.maintenance}
                    onChange={(e) => handleInputChange('maintenance', e.target.value)}
                    placeholder="제품 유지보수 방법을 작성하세요..."
                    className="min-h-[200px]"
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="extras">
            <div className="space-y-6">
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
                      <Input
                        id="faq-answer"
                        value={newFaq.answer}
                        onChange={(e) => setNewFaq(prev => ({ ...prev, answer: e.target.value }))}
                        placeholder="답변을 입력하세요"
                        onKeyPress={(e) => e.key === 'Enter' && addFaq()}
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

              <Card>
                <CardHeader>
                  <CardTitle>보증 정보</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={contentData.warranty}
                    onChange={(e) => handleInputChange('warranty', e.target.value)}
                    placeholder="제품 보증 정보를 작성하세요..."
                    className="min-h-[120px]"
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>인증 정보</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={contentData.certifications}
                    onChange={(e) => handleInputChange('certifications', e.target.value)}
                    placeholder="제품 인증 정보를 작성하세요..."
                    className="min-h-[120px]"
                  />
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