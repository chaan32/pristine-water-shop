import { useState } from 'react';
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

const ProductContentManagement = () => {
  const [selectedProduct, setSelectedProduct] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [contentData, setContentData] = useState({
    title: '',
    thumbnailImage: '',
    gallery: [] as string[],
    overview: '프리미엄 샤워 필터 SF-100은 최신 다층 필터링 기술을 적용하여 개발된 고성능 샤워용 정수 필터입니다. 일반 수돗물에 포함된 염소, 중금속, 세균 등의 유해물질을 효과적으로 제거하여 깨끗하고 건강한 샤워 환경을 제공합니다.\n\n특허받은 5단계 필터링 시스템을 통해 물의 순도를 높이면서도 필수 미네랄은 보존하여, 피부와 모발 건강에 도움을 주는 최적의 샤워 워터를 만들어냅니다.',
    coretech: {
      title: '핵심 기술',
      content: [
        {
          title: '5단계 필터링 시스템',
          description: 'PP 필터, 활성탄 필터, KDF 필터, 세라믹볼, 비타민C 필터가 순차적으로 작동하여 최대 99.9%의 염소 제거 효과를 달성합니다.'
        },
        {
          title: '중금속 차단 기술',
          description: '특수 KDF 필터를 통해 납, 수은, 카드뮴 등의 중금속을 효과적으로 제거하여 안전한 샤워 환경을 조성합니다.'
        },
        {
          title: '미네랄 보존 기술',
          description: '유해물질은 제거하면서도 칼슘, 마그네슘 등 피부에 유익한 미네랄은 그대로 보존하는 선택적 필터링을 구현했습니다.'
        },
        {
          title: '비타민C 인퓨전',
          description: '천연 비타민C가 용해되어 피부에 영양을 공급하고 염소로 인한 자극과 건조를 완화시켜줍니다.'
        }
      ]
    },
    keyfeatures: {
      title: '주요 특징 및 효과',
      content: [
        {
          title: '염소 제거율 99.9%',
          description: '염소 냄새와 자극을 완전히 제거하여 쾌적한 샤워 환경을 제공합니다.'
        },
        {
          title: '중금속 차단 기능',
          description: '납, 수은, 카드뮴 등 유해 중금속을 효과적으로 차단합니다.'
        },
        {
          title: '6개월 장기 사용',
          description: '한 번 설치로 최대 6개월까지 지속적인 필터링 효과를 유지합니다.'
        },
        {
          title: '간편한 설치 및 교체',
          description: '공구 없이 누구나 쉽게 설치하고 교체할 수 있도록 설계되었습니다.'
        },
        {
          title: 'NSF 인증 획득',
          description: '국제적으로 인정받은 NSF 인증을 획득하여 안전성이 검증되었습니다.'
        },
        {
          title: '환경친화적 소재',
          description: '재활용 가능한 친환경 소재를 사용하여 환경 보호에 기여합니다.'
        }
      ]
    },
    specs: {
      title: '제품 사양',
      content: {
        '크기': '15cm x 8cm x 8cm',
        '무게': '350g',
        '필터 수명': '6개월 (약 15,000L)',
        '적용 수압': '1~6kgf/cm²',
        '사용 온도': '5~40°C',
        '소재': 'ABS, 스테인리스 스틸'
      } as Record<string, string>
    },
    installation: {
      title: '설치 및 사용법',
      content: [
        {
          step: '1',
          title: '기존 샤워헤드 분리',
          description: '기존 샤워헤드를 시계 반대 방향으로 돌려 분리합니다.'
        },
        {
          step: '2',
          title: '필터 연결',
          description: '샤워 필터를 샤워 호스에 시계 방향으로 돌려 연결합니다.'
        },
        {
          step: '3',
          title: '샤워헤드 재연결',
          description: '샤워헤드를 필터에 연결하고 물이 새지 않는지 확인합니다.'
        }
      ]
    },
    maintenance: {
      title: '관리 및 유지보수',
      content: [
        '필터 교체 주기: 6개월 또는 약 15,000L 사용 시',
        '외관 청소: 중성세제로 월 1회 청소 권장',
        '보관 방법: 직사광선을 피하고 서늘한 곳에 보관',
        '교체 알림: 물의 맛이나 냄새 변화 시 즉시 교체'
      ]
    },
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

  const [newFaq, setNewFaq] = useState({ question: '', answer: '' });

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

  const handleSave = () => {
    console.log('저장된 상품 컨텐츠:', { product: selectedProduct, content: contentData });
    alert('상품 상세 컨텐츠가 저장되었습니다.');
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
                    <div className="grid grid-cols-3 gap-4 mt-4">
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