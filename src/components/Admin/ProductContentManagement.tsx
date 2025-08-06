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
    thumbnailImage: '',
    gallery: [] as string[],
    overview: '',
    coretech: {
      title: '핵심 기술',
      content: [] as { title: string; description: string }[]
    },
    keyfeatures: {
      title: '주요 특징 및 효과',
      content: [] as { title: string; description: string }[]
    },
    specs: {
      title: '제품 사양',
      content: {} as Record<string, string>
    },
    installation: {
      title: '설치 및 사용법',
      content: [] as { step: string; title: string; description: string }[]
    },
    maintenance: {
      title: '관리 및 유지보수',
      content: [] as string[]
    },
    faq: [] as { question: string; answer: string }[],
    warranty: '',
    certifications: ''
  });

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

  const handleImageUpload = (field: string, file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      handleInputChange(field, result);
    };
    reader.readAsDataURL(file);
  };

  const handleGalleryImageUpload = (file: File) => {
    if (contentData.gallery.length >= 5) {
      toast({
        title: "이미지 제한",
        description: "갤러리 이미지는 최대 5장까지 업로드 가능합니다.",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setContentData(prev => ({
        ...prev,
        gallery: [...prev.gallery, result]
      }));
    };
    reader.readAsDataURL(file);
  };

  const removeGalleryImage = (index: number) => {
    setContentData(prev => ({
      ...prev,
      gallery: prev.gallery.filter((_, i) => i !== index)
    }));
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

    console.log('저장된 상품 컨텐츠:', { product: selectedProduct, content: contentData });
    toast({
      title: "저장 완료",
      description: "상품 상세 컨텐츠가 저장되었습니다.",
    });
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
                {contentData.thumbnailImage && (
                  <Card>
                    <CardHeader>
                      <CardTitle>제품 썸네일</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <img 
                        src={contentData.thumbnailImage} 
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

                {/* 핵심 기술 */}
                {contentData.coretech.content.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>{contentData.coretech.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {contentData.coretech.content.map((tech, index) => (
                          <div key={index} className="bg-secondary/30 rounded-lg p-6">
                            <h4 className="font-semibold text-lg mb-3 text-primary">{tech.title}</h4>
                            <p className="text-muted-foreground">{tech.description}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* 주요 특징 및 효과 */}
                {contentData.keyfeatures.content.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>{contentData.keyfeatures.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {contentData.keyfeatures.content.map((feature, index) => (
                          <div key={index} className="flex items-start gap-4 p-4 bg-secondary/20 rounded-lg">
                            <div className="w-3 h-3 bg-primary rounded-full mt-2 flex-shrink-0" />
                            <div>
                              <span className="font-medium text-lg">{feature.title}</span>
                              <p className="text-sm text-muted-foreground mt-1">{feature.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* 제품 사양 */}
                {Object.keys(contentData.specs.content).length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>{contentData.specs.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {Object.entries(contentData.specs.content).map(([key, value]) => (
                          <div key={key} className="flex justify-between items-center border-b border-secondary pb-3">
                            <span className="font-medium text-lg">{key}</span>
                            <span className="text-muted-foreground text-lg">{value}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* 설치 및 사용법 */}
                {contentData.installation.content.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>{contentData.installation.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {contentData.installation.content.map((step, index) => (
                          <div key={index} className="text-center">
                            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                              <span className="text-2xl font-bold text-primary">{step.step}</span>
                            </div>
                            <h4 className="font-semibold mb-2">{step.title}</h4>
                            <p className="text-sm text-muted-foreground">{step.description}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* 관리 및 유지보수 */}
                {contentData.maintenance.content.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>{contentData.maintenance.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-secondary/20 rounded-lg p-6">
                        <ul className="space-y-3">
                          {contentData.maintenance.content.map((item, index) => (
                            <li key={index} className="flex items-start gap-3">
                              <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* 갤러리 */}
                {contentData.gallery.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>제품 갤러리</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {contentData.gallery.map((image, index) => (
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
              <CardContent className="space-y-6">
                <div className="grid gap-2">
                  <Label htmlFor="thumbnail">썸네일 이미지</Label>
                  <div className="flex gap-2">
                    <Input
                      id="thumbnail"
                      value={contentData.thumbnailImage}
                      onChange={(e) => handleInputChange('thumbnailImage', e.target.value)}
                      placeholder="이미지 URL 또는 파일 업로드"
                    />
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleImageUpload('thumbnailImage', file);
                        }
                      }}
                      className="hidden"
                      id="thumbnail-file"
                    />
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={() => document.getElementById('thumbnail-file')?.click()}
                    >
                      <Upload className="w-4 h-4" />
                    </Button>
                  </div>
                  {contentData.thumbnailImage && (
                    <div className="mt-2">
                      <img
                        src={contentData.thumbnailImage}
                        alt="썸네일 미리보기"
                        className="w-32 h-32 object-cover rounded-md border"
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
                      size="icon"
                      onClick={() => document.getElementById('gallery-file')?.click()}
                    >
                      <Upload className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      onClick={() => {
                        const input = document.querySelector('input[placeholder="갤러리에 추가할 이미지 URL"]') as HTMLInputElement;
                        const url = input.value;
                        if (url) {
                          setContentData(prev => ({
                            ...prev,
                            gallery: [...prev.gallery, url]
                          }));
                          input.value = '';
                        }
                      }}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                   {contentData.gallery.length > 0 && (
                     <div className="mt-4">
                       <p className="text-sm text-muted-foreground mb-2">갤러리 이미지 ({contentData.gallery.length}/5)</p>
                       <div className="grid grid-cols-3 gap-4">
                         {contentData.gallery.map((image, index) => (
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
              {/* 핵심 기술 */}
              <Card>
                <CardHeader>
                  <CardTitle>
                    <Input
                      value={contentData.coretech.title}
                      onChange={(e) => handleSectionChange('coretech', 'title', e.target.value)}
                      className="text-lg font-semibold border-none p-0 h-auto"
                    />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {contentData.coretech.content.map((tech, index) => (
                      <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg">
                        <div className="space-y-2">
                          <Label>제목</Label>
                          <Input
                            value={tech.title}
                            onChange={(e) => {
                              const newContent = [...contentData.coretech.content];
                              newContent[index] = { ...newContent[index], title: e.target.value };
                              setContentData(prev => ({
                                ...prev,
                                coretech: { ...prev.coretech, content: newContent }
                              }));
                            }}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>설명</Label>
                          <Textarea
                            value={tech.description}
                            onChange={(e) => {
                              const newContent = [...contentData.coretech.content];
                              newContent[index] = { ...newContent[index], description: e.target.value };
                              setContentData(prev => ({
                                ...prev,
                                coretech: { ...prev.coretech, content: newContent }
                              }));
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* 주요 특징 및 효과 */}
              <Card>
                <CardHeader>
                  <CardTitle>
                    <Input
                      value={contentData.keyfeatures.title}
                      onChange={(e) => handleSectionChange('keyfeatures', 'title', e.target.value)}
                      className="text-lg font-semibold border-none p-0 h-auto"
                    />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {contentData.keyfeatures.content.map((feature, index) => (
                      <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg">
                        <div className="space-y-2">
                          <Label>제목</Label>
                          <Input
                            value={feature.title}
                            onChange={(e) => {
                              const newContent = [...contentData.keyfeatures.content];
                              newContent[index] = { ...newContent[index], title: e.target.value };
                              setContentData(prev => ({
                                ...prev,
                                keyfeatures: { ...prev.keyfeatures, content: newContent }
                              }));
                            }}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>설명</Label>
                          <Textarea
                            value={feature.description}
                            onChange={(e) => {
                              const newContent = [...contentData.keyfeatures.content];
                              newContent[index] = { ...newContent[index], description: e.target.value };
                              setContentData(prev => ({
                                ...prev,
                                keyfeatures: { ...prev.keyfeatures, content: newContent }
                              }));
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* 제품 사양 */}
              <Card>
                <CardHeader>
                  <CardTitle>
                    <Input
                      value={contentData.specs.title}
                      onChange={(e) => handleSectionChange('specs', 'title', e.target.value)}
                      className="text-lg font-semibold border-none p-0 h-auto"
                    />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(contentData.specs.content).map(([key, value], index) => (
                      <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg">
                        <div className="space-y-2">
                          <Label>항목</Label>
                          <Input
                            value={key}
                            onChange={(e) => {
                               const entries = Object.entries(contentData.specs.content);
                               const newContent = Object.fromEntries(
                                 entries.map(([k, v], i) => i === index ? [e.target.value, v] : [k, v])
                               ) as Record<string, string>;
                               setContentData(prev => ({
                                 ...prev,
                                 specs: { ...prev.specs, content: newContent }
                               }));
                            }}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>값</Label>
                          <Input
                            value={value}
                            onChange={(e) => {
                               const entries = Object.entries(contentData.specs.content);
                               const newContent = Object.fromEntries(
                                 entries.map(([k, v], i) => i === index ? [k, e.target.value] : [k, v])
                               ) as Record<string, string>;
                               setContentData(prev => ({
                                 ...prev,
                                 specs: { ...prev.specs, content: newContent }
                               }));
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* 설치 및 사용법 */}
              <Card>
                <CardHeader>
                  <CardTitle>
                    <Input
                      value={contentData.installation.title}
                      onChange={(e) => handleSectionChange('installation', 'title', e.target.value)}
                      className="text-lg font-semibold border-none p-0 h-auto"
                    />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {contentData.installation.content.map((step, index) => (
                      <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg">
                        <div className="space-y-2">
                          <Label>단계</Label>
                          <Input
                            value={step.step}
                            onChange={(e) => {
                              const newContent = [...contentData.installation.content];
                              newContent[index] = { ...newContent[index], step: e.target.value };
                              setContentData(prev => ({
                                ...prev,
                                installation: { ...prev.installation, content: newContent }
                              }));
                            }}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>제목</Label>
                          <Input
                            value={step.title}
                            onChange={(e) => {
                              const newContent = [...contentData.installation.content];
                              newContent[index] = { ...newContent[index], title: e.target.value };
                              setContentData(prev => ({
                                ...prev,
                                installation: { ...prev.installation, content: newContent }
                              }));
                            }}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>설명</Label>
                          <Textarea
                            value={step.description}
                            onChange={(e) => {
                              const newContent = [...contentData.installation.content];
                              newContent[index] = { ...newContent[index], description: e.target.value };
                              setContentData(prev => ({
                                ...prev,
                                installation: { ...prev.installation, content: newContent }
                              }));
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* 관리 및 유지보수 */}
              <Card>
                <CardHeader>
                  <CardTitle>
                    <Input
                      value={contentData.maintenance.title}
                      onChange={(e) => handleSectionChange('maintenance', 'title', e.target.value)}
                      className="text-lg font-semibold border-none p-0 h-auto"
                    />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {contentData.maintenance.content.map((item, index) => (
                      <div key={index} className="space-y-2">
                        <Label>항목 {index + 1}</Label>
                        <Input
                          value={item}
                          onChange={(e) => {
                            const newContent = [...contentData.maintenance.content];
                            newContent[index] = e.target.value;
                            setContentData(prev => ({
                              ...prev,
                              maintenance: { ...prev.maintenance, content: newContent }
                            }));
                          }}
                        />
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
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default ProductContentManagement;