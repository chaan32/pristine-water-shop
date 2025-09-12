import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Upload, Save, Eye, Trash2, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import Image from '@tiptap/extension-image';
import Color from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import { adminApi } from '@/lib/api';

// TipTap 에디터 컴포넌트

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
    htmlContent: '',
  });

  // TipTap 에디터 설정
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
        bulletList: {
          keepMarks: true,
        },
        orderedList: {
          keepMarks: true,
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'rounded-lg max-w-full h-auto',
        },
      }),
      TextStyle,
      Color.configure({ types: [TextStyle.name, 'heading'] }),
    ],
    content: contentData.htmlContent,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      handleHtmlContentChange(html);
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[400px] p-4 [&_h1]:text-3xl [&_h1]:font-bold [&_h1]:mb-4 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:mb-3 [&_h3]:text-xl [&_h3]:font-bold [&_h3]:mb-2 [&_ul]:list-disc [&_ul]:ml-6 [&_ol]:list-decimal [&_ol]:ml-6 [&_li]:mb-1',
      },
    },
  });
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string>('');
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);

  // 에디터 이미지 업로드를 위한 상태
  const [editorImageFiles, setEditorImageFiles] = useState<File[]>([]);

  // FAQ 관리를 위한 상태
  const [faqList, setFaqList] = useState<{question: string, answer: string}[]>([]);
  const [newFaq, setNewFaq] = useState({question: '', answer: ''});

  // 기존 콘텐츠 여부 추적
  const [hasExistingContent, setHasExistingContent] = useState(false);


  // API에서 상품 목록 가져오기
  const fetchProducts = async () => {
    try {
      setLoadingProducts(true);
      // API: GET /api/admin/products
      const response = await adminApi.getProducts();
      
      if (response.ok) {
        const data = await response.json();
        
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

  // 컴포넌트 마운트 시 상품 목록 가져오기
  useEffect(() => {
    fetchProducts();
  }, []);

  // 제품의 기존 콘텐츠 불러오기
  const fetchProductContent = async (productId: string) => {
    try {
      // API: GET /api/admin/products/:productId/content
      const response = await adminApi.getProductContent(productId);
      
      if (response.ok) {
        const text = await response.text();
        
        if (!text) {
          setContentData({ title: '', htmlContent: '' });
          if (editor) editor.commands.setContent('');
          setThumbnailPreview('');
          setGalleryPreviews([]);
          setHasExistingContent(false);
          return;
        }
        
        const data = JSON.parse(text);
        
        // 기존 데이터로 상태 업데이트 (안전하게 처리)
        setContentData({
          title: data?.title || '',
          htmlContent: data?.htmlContent || '',
        });
        
        // 에디터에도 기존 내용 설정
        if (editor) {
          const content = data?.htmlContent || '';
          editor.commands.setContent(content);
        }
        
        // 기존 이미지들 처리
        setThumbnailPreview(data?.thumbnailImageUrl || '');
        setGalleryPreviews(data?.galleryImageUrls || []);
        setHasExistingContent(true); // 서버에서 기존 콘텐츠를 불러온 경우
        
        toast({
          title: "콘텐츠 불러오기 완료",
          description: "기존 콘텐츠를 불러왔습니다.",
        });
      } else if (response.status === 404) {
        // 콘텐츠가 없는 경우 - 새로 작성
        setContentData({ title: '', htmlContent: '' });
        if (editor) {
          editor.commands.setContent('');
        }
        setThumbnailPreview('');
        setGalleryPreviews([]);
        setHasExistingContent(false);
      } else {
        throw new Error('콘텐츠 불러오기 실패');
      }
    } catch (error) {
      console.error('콘텐츠 불러오기 오류:', error);
      toast({
        title: "불러오기 실패",
        description: "기존 콘텐츠를 불러오는데 실패했습니다.",
        variant: "destructive",
      });
    }
  };

  // URL 파라미터에서 productId를 받아 자동 선택
  useEffect(() => {
    const productId = searchParams.get('productId');
    if (productId) {
      setSelectedProduct(productId);
    }
  }, [searchParams]);

  // 선택된 제품이 변경될 때 기존 콘텐츠 불러오기
  useEffect(() => {
    if (selectedProduct && editor) {
      fetchProductContent(selectedProduct);
    }
  }, [selectedProduct, editor]);

  const handleInputChange = (field: string, value: string) => {
    setContentData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleHtmlContentChange = (content: string) => {
    setContentData(prev => ({
      ...prev,
      htmlContent: content
    }));
  };

  const handleImageUpload = (file: File) => {
    // 서버에서 불러온 기존 콘텐츠가 있는 경우에만 제한
    if (hasExistingContent) {
      toast({
        title: "이미지 수정 제한",
        description: "이미지 수정은 상품 수정 패널에서 진행해주세요",
        variant: "destructive",
      });
      return;
    }
    
    setThumbnailFile(file);
    const previewUrl = URL.createObjectURL(file);
    setThumbnailPreview(previewUrl);
  };

  const handleGalleryImageUpload = (file: File) => {
    // 서버에서 불러온 기존 콘텐츠가 있는 경우에만 제한
    if (hasExistingContent) {
      toast({
        title: "이미지 수정 제한",
        description: "이미지 수정은 상품 수정 패널에서 진행해주세요",
        variant: "destructive",
      });
      return;
    }

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

  const removeThumbnail = () => {
    setThumbnailFile(null);
    setThumbnailPreview('');
  };

  // 에디터용 이미지 업로드 처리 (백엔드 API 연동)
  const handleEditorImageUpload = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('productId', selectedProduct || '');
      
      // API: POST /api/admin/products/upload/image
      const response = await adminApi.uploadImage(formData);
      
      if (response.ok) {
        const data = await response.json();
        const imageUrl = data.imageUrl; // 백엔드에서 반환하는 S3 URL
        
        // 에디터에 S3 URL로 이미지 삽입
        editor?.chain().focus().setImage({ src: imageUrl }).run();
        
        toast({
          title: "이미지 업로드 완료",
          description: "이미지가 성공적으로 업로드되었습니다.",
        });
        
        return imageUrl;
      } else {
        throw new Error('이미지 업로드 실패');
      }
    } catch (error) {
      console.error('이미지 업로드 오류:', error);
      toast({
        title: "업로드 실패",
        description: "이미지 업로드 중 오류가 발생했습니다.",
        variant: "destructive",
      });
      
      // 실패 시 아무것도 삽입하지 않음
      return null;
    }
  };

  // FAQ 관련 함수들
  const addFaq = () => {
    if (!newFaq.question.trim() || !newFaq.answer.trim()) {
      toast({
        title: "입력 오류",
        description: "질문과 답변을 모두 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    setFaqList(prev => [...prev, { ...newFaq }]);
    setNewFaq({ question: '', answer: '' });
    
    toast({
      title: "FAQ 추가됨",
      description: "새로운 FAQ가 추가되었습니다.",
    });
  };

  const removeFaq = (index: number) => {
    setFaqList(prev => prev.filter((_, i) => i !== index));
  };

  const insertFaqToEditor = () => {
    if (faqList.length === 0) {
      toast({
        title: "FAQ 없음",
        description: "먼저 FAQ를 추가해주세요.",
        variant: "destructive",
      });
      return;
    }

    // FAQ를 HTML로 변환
    const faqHtml = `
      <h2>자주 묻는 질문 (FAQ)</h2>
      <div class="faq-section">
        ${faqList.map((faq, index) => `
          <div class="faq-item" style="margin-bottom: 1.5rem; border-bottom: 1px solid #e5e7eb; padding-bottom: 1rem;">
            <h3 style="color: #1f2937; font-weight: 600; margin-bottom: 0.5rem;">Q${index + 1}. ${faq.question}</h3>
            <p style="color: #6b7280; line-height: 1.6;">${faq.answer}</p>
          </div>
        `).join('')}
      </div>
    `;

    // 에디터 맨 끝에 안전하게 삽입 (이미지/노드 선택 대체 방지)
    editor?.chain()
      .focus('end')
      .insertContent('<p></p>' + faqHtml)
      .run();
    
    toast({
      title: "FAQ 삽입 완료",
      description: "FAQ가 에디터에 삽입되었습니다.",
    });
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

    if (!contentData.title.trim()) {
      toast({
        title: "입력 오류",
        description: "제품 제목을 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    if (!contentData.htmlContent.trim()) {
      toast({
        title: "입력 오류",
        description: "제품 상세 설명을 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData();
    
    // 수정 모드인지 신규 등록 모드인지 구분
    const isEditMode = contentData.title || contentData.htmlContent || thumbnailPreview || galleryPreviews.length > 0;
    
    // 기본 데이터 추가
    formData.append('productId', selectedProduct);
    formData.append('title', contentData.title);
    formData.append('htmlContent', contentData.htmlContent);
    formData.append('mode', isEditMode ? 'edit' : 'create');
    
    // 썸네일 이미지 처리
    if (thumbnailFile) {
      // 새로운 파일이 선택된 경우 (신규 등록 또는 수정 시 새 이미지)
      formData.append('thumbnailImage', thumbnailFile);
    } else if (isEditMode && thumbnailPreview) {
      // 수정 모드에서 기존 썸네일 유지
      formData.append('thumbnailImageUrl', thumbnailPreview);
    }
    
    // 갤러리 이미지 파일들 추가
    galleryFiles.forEach(file => {
      formData.append('galleryImages', file);
    });

    // 에디터 이미지 파일들 추가
    editorImageFiles.forEach(file => {
      formData.append('editorImages', file);
    });
    try {
      // API: POST /api/admin/products/content (multipart/form-data)
      const response = await adminApi.saveProductContentFormData(formData);


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
          <h1 className="text-3xl font-bold">상품 상세 콘텐츠 관리</h1>
          <p className="text-muted-foreground mt-2">리치 텍스트 에디터로 제품의 상세 정보를 작성하고 관리합니다.</p>
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
                {/* 제품 제목 */}
                {contentData.title && (
                  <Card>
                    <CardHeader>
                      <CardTitle>제품 제목</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <h2 className="text-2xl font-bold">{contentData.title}</h2>
                    </CardContent>
                  </Card>
                )}

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

                {/* HTML 콘텐츠 미리보기 */}
                {contentData.htmlContent && (
                  <Card>
                    <CardHeader>
                      <CardTitle>상세 설명</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div 
                        className="prose prose-sm max-w-none [&_h1]:text-3xl [&_h1]:font-bold [&_h1]:mb-4 [&_h1]:text-gray-900 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:mb-3 [&_h2]:text-gray-800 [&_h3]:text-xl [&_h3]:font-bold [&_h3]:mb-2 [&_h3]:text-gray-700 [&_ul]:list-disc [&_ul]:ml-6 [&_ol]:list-decimal [&_ol]:ml-6 [&_li]:mb-1 [&_p]:mb-3 [&_p]:leading-relaxed [&_.faq-section]:mt-6 [&_.faq-item]:mb-4 [&_.faq-item]:pb-4 [&_.faq-item]:border-b [&_.faq-item]:border-gray-200"
                        dangerouslySetInnerHTML={{ __html: contentData.htmlContent }}
                      />
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
        <Tabs defaultValue="content" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="content">상세 콘텐츠</TabsTrigger>
            <TabsTrigger value="images">이미지 관리</TabsTrigger>
          </TabsList>

          <TabsContent value="content">
            <Card>
              <CardHeader>
                <CardTitle>상세 콘텐츠 작성</CardTitle>
                <p className="text-sm text-muted-foreground">
                  리치 텍스트 에디터를 사용하여 제품의 상세 설명을 작성하세요.
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* 제품 제목 */}
                  <div className="grid gap-2">
                    <Label htmlFor="title">제품 요약</Label>
                    <Input
                      id="title"
                      value={contentData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      placeholder="제품의 요약 내용을 입력하세요"
                    />
                  </div>
                  
                  {/* 리치 텍스트 에디터 */}
                  <div className="grid gap-2">
                    <Label>상세 설명</Label>
                    
                    {/* 에디터 툴바 */}
                    <div className="border rounded-t-md p-2 bg-muted">
                      <div className="flex flex-wrap gap-1">
                        {/* 헤딩 */}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
                          className={editor?.isActive('heading', { level: 1 }) ? 'bg-muted' : ''}
                        >
                          H1
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
                          className={editor?.isActive('heading', { level: 2 }) ? 'bg-muted' : ''}
                        >
                          H2
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
                          className={editor?.isActive('heading', { level: 3 }) ? 'bg-muted' : ''}
                        >
                          H3
                        </Button>

                        {/* 텍스트 서식 */}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => editor?.chain().focus().toggleBold().run()}
                          className={editor?.isActive('bold') ? 'bg-muted' : ''}
                        >
                          B
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => editor?.chain().focus().toggleItalic().run()}
                          className={editor?.isActive('italic') ? 'bg-muted' : ''}
                        >
                          I
                        </Button>

                        {/* 텍스트 정렬 */}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => editor?.chain().focus().setTextAlign('left').run()}
                          className={editor?.isActive({ textAlign: 'left' }) ? 'bg-muted' : ''}
                        >
                          왼쪽
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => editor?.chain().focus().setTextAlign('center').run()}
                          className={editor?.isActive({ textAlign: 'center' }) ? 'bg-muted' : ''}
                        >
                          가운데
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => editor?.chain().focus().setTextAlign('right').run()}
                          className={editor?.isActive({ textAlign: 'right' }) ? 'bg-muted' : ''}
                        >
                          오른쪽
                        </Button>

                        {/* 리스트 */}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => editor?.chain().focus().toggleBulletList().run()}
                          className={editor?.isActive('bulletList') ? 'bg-muted' : ''}
                        >
                          • List
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => editor?.chain().focus().toggleOrderedList().run()}
                          className={editor?.isActive('orderedList') ? 'bg-muted' : ''}
                        >
                          1. List
                        </Button>

                        {/* 기타 */}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => editor?.chain().focus().toggleBlockquote().run()}
                          className={editor?.isActive('blockquote') ? 'bg-muted' : ''}
                        >
                          Quote
                        </Button>

                        {/* 색상 */}
                        <div className="flex gap-1">
                          <input
                            type="color"
                            onInput={(e) => editor?.chain().focus().setColor((e.target as HTMLInputElement).value).run()}
                            value={editor?.getAttributes('textStyle').color || '#000000'}
                            className="w-8 h-8 rounded cursor-pointer"
                            title="텍스트 색상"
                          />
                        </div>

                        {/* 이미지 삽입 */}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              handleEditorImageUpload(file);
                            }
                          }}
                          className="hidden"
                          id="editor-image-upload"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => document.getElementById('editor-image-upload')?.click()}
                        >
                          📷 이미지
                        </Button>
                        
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const url = window.prompt('외부 이미지 URL을 입력하세요:');
                            if (url) {
                              editor?.chain().focus().setImage({ src: url }).run();
                            }
                          }}
                        >
                          🔗 URL 이미지
                        </Button>
                      </div>
                      
                      {/* 에디터 사용법 */}
                      <div className="mt-2 p-2 bg-background rounded text-xs text-muted-foreground">
                        <p><strong>사용법:</strong></p>
                        <p>• 텍스트 서식: 볼드, 이탤릭, H1-H3 헤딩 사용 가능</p>
                        <p>• 텍스트 정렬: 왼쪽, 가운데, 오른쪽 정렬 지원</p>
                        <p>• 색상: 컬러 피커로 텍스트 색상 변경 가능</p>
                        <p>• 이미지: 로컬 파일 업로드 또는 URL 입력으로 이미지 삽입</p>
                        <p>• 리스트와 인용문으로 구조화된 문서 작성</p>
                      </div>
                    </div>
                    
                    {/* 에디터 영역 */}
                    <div className="border rounded-b-md min-h-[400px]">
                      <EditorContent editor={editor} />
                    </div>
                  </div>
                  
                  {/* FAQ 관리 섹션 */}
                  <div className="grid gap-4 border-t pt-6">
                    <div className="flex items-center justify-between">
                      <Label className="text-base font-semibold">FAQ 관리</Label>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={insertFaqToEditor}
                        disabled={faqList.length === 0}
                      >
                        FAQ 에디터에 추가
                      </Button>
                    </div>
                    
                    {/* FAQ 추가 폼 */}
                    <div className="grid gap-4 p-4 border rounded-lg bg-muted/30">
                      <div className="grid gap-2">
                        <Label htmlFor="faq-question">질문</Label>
                        <Input
                          id="faq-question"
                          value={newFaq.question}
                          onChange={(e) => setNewFaq(prev => ({ ...prev, question: e.target.value }))}
                          placeholder="자주 묻는 질문을 입력하세요"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="faq-answer">답변</Label>
                        <Input
                          id="faq-answer"
                          value={newFaq.answer}
                          onChange={(e) => setNewFaq(prev => ({ ...prev, answer: e.target.value }))}
                          placeholder="질문에 대한 답변을 입력하세요"
                        />
                      </div>
                      <Button
                        type="button"
                        onClick={addFaq}
                        className="w-fit"
                      >
                        FAQ 추가
                      </Button>
                    </div>
                    
                    {/* FAQ 목록 */}
                    {faqList.length > 0 && (
                      <div className="space-y-3">
                        <Label className="text-sm font-medium">추가된 FAQ 목록 ({faqList.length}개)</Label>
                        {faqList.map((faq, index) => (
                          <div key={index} className="p-3 border rounded-lg bg-background">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 space-y-1">
                                <p className="font-medium text-sm">Q{index + 1}. {faq.question}</p>
                                <p className="text-sm text-muted-foreground">{faq.answer}</p>
                              </div>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => removeFaq(index)}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <div className="text-xs text-muted-foreground p-2 bg-blue-50 rounded border-l-4 border-blue-200">
                      <p><strong>💡 FAQ 사용 팁:</strong></p>
                      <p>• 질문과 답변을 추가한 후 "FAQ 에디터에 추가" 버튼을 클릭하여 상세 설명에 삽입</p>
                      <p>• 미리 만들어둔 FAQ는 언제든지 에디터에 추가할 수 있습니다</p>
                      <p>• FAQ는 깔끔한 레이아웃으로 자동 formatting됩니다</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="images">
            <Card>
              <CardHeader>
                <CardTitle>이미지 관리</CardTitle>
                <p className="text-sm text-muted-foreground">
                  썸네일과 갤러리 이미지를 업로드하세요. 본문 내 이미지는 리치 에디터에서 직접 삽입할 수 있습니다.
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* 썸네일 업로드 */}
                <div className="grid gap-2">
                  <Label>제품 썸네일 (대표 이미지)</Label>
                  <div className="flex gap-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleImageUpload(file);
                        }
                      }}
                      className="hidden"
                      id="thumbnail-file"
                    />
                    <Button 
                      variant="outline" 
                      onClick={() => document.getElementById('thumbnail-file')?.click()}
                      disabled={!!thumbnailFile}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      썸네일 업로드
                    </Button>
                    {thumbnailPreview && (
                      <div className="flex items-center gap-2">
                        <img 
                          src={thumbnailPreview} 
                          alt="썸네일 미리보기" 
                          className="w-16 h-16 object-cover rounded border"
                        />
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={removeThumbnail}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                {/* 갤러리 이미지 업로드 */}
                <div className="grid gap-2">
                  <Label>갤러리 이미지 (최대 5장)</Label>
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
                      disabled={galleryFiles.length >= 5}
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

        </Tabs>
      )}
    </div>
  );
};

export default ProductContentManagement;