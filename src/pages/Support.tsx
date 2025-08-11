import { Link } from 'react-router-dom';
import {useEffect, useState} from 'react';
import Header from '@/components/Layout/Header';
import Footer from '@/components/Layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bell, FileText, MessageCircle, HelpCircle, Send, Pin, Upload, X } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';
interface Notice{
    id: number;
    title: string;
    createdAt: string;
    pinned: boolean;
    content?: string;
}


const Support = () => {
  // ---  공지사항 목록과 로딩 상태를 위한 state 추가 ---
  const [notices, setNotices] = useState<Notice[]>([]);
  const [noticesLoading, setNoticesLoading] = useState(true);

  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [inquiryData, setInquiryData] = useState({
    category: '',
    title: '',
    content: ''
  });

  const [faqCategories, setFaqCategories] = useState<any[]>([]);
  const [faqs, setFaqs] = useState<any[]>([]);
  const [faqsLoading, setFaqsLoading] = useState(false);

  const fetchNotices = async () => {
    setNoticesLoading(true);
    try{
      const res = await fetch('http://localhost:8080/api/notices');
      if (!res.ok) {
        throw new Error('공지사항을 불러오는데 실패했습니다.');
      }
      const data: Notice[] = await res.json();
      const sortedData = data.sort((a, b) => Number(b.pinned) - Number(a.pinned) || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setNotices(sortedData);
    }
    catch (error) {
      console.error('Failed to fetch notices:', error);
      // API 실패 시 보여줄 목업 데이터 (선택 사항)
      setNotices([]);
    }
    finally {
      setNoticesLoading(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (attachedFiles.length + imageFiles.length > 5) {
      alert('최대 5장까지 첨부할 수 있습니다.');
      return;
    }
    
    setAttachedFiles(prev => [...prev, ...imageFiles].slice(0, 5));
  };

  const removeFile = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleInquirySubmit = async () => {
    if (!inquiryData.title || !inquiryData.content) {
      alert('필수 항목을 모두 입력해주세요.');
      return;
    }

    try {
      const token = localStorage.getItem('accessToken');
      let body;
      let headers: HeadersInit = {};

      if (attachedFiles.length > 0) {
        // 파일 첨부가 있는 경우: FormData 사용
        const formData = new FormData();

        // JSON 데이터를 Blob 객체로 변환하여 Content-Type을 명시
        const inquiryDataBlob = new Blob([JSON.stringify(inquiryData)], { type: 'application/json' });
        formData.append('data', inquiryDataBlob);

        attachedFiles.forEach((file) => {
          formData.append(`attachments`, file);
        });

        body = formData;
        // FormData 사용 시 Content-Type 자동 설정되므로 명시적으로 설정하지 않음
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
      } else {
        // 텍스트만 있는 경우: JSON 사용
        headers['Content-Type'] = 'application/json';
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
        body = JSON.stringify(inquiryData);
      }
      const response = await fetch('http://localhost:8080/api/inquiries', {
        method: 'POST',
        headers,
        body
      });

      let data: any = null;
      let rawText = '';
      const contentType = response.headers.get('content-type') || '';
      try {
        if (contentType.includes('application/json')) {
          data = await response.json();
        } else {
          rawText = await response.text();
          try {
            data = JSON.parse(rawText);
          } catch {
            data = { message: rawText };
          }
        }
      } catch (e) {
        console.warn('Failed to parse response body:', e);
      }
      console.log('Response:', data ?? rawText);
      if (response.ok) {
        // 폼 초기화
        setInquiryData({
          category: '',
          title: '',
          content: ''
        });
        setAttachedFiles([]);
        toast({
          title: "문의 접수 완료",
          description: "문의가 성공적으로 접수되었습니다. 빠른 시일 내에 답변드리겠습니다.",
        });
      } else {
        switch (response.status) {
          case 400:
            alert('입력 정보를 확인해주세요.');
            break;
          case 413:
            alert('첨부파일 용량이 너무 큽니다.');
            break;
          case 429:
            alert('일일 문의 제한을 초과했습니다. 내일 다시 시도해주세요.');
            break;
          default:
            alert((data && data.message) || rawText || '문의 접수 중 오류가 발생했습니다.');
        }
      }
    } catch (error) {
      console.error('Inquiry submit error:', error);
      alert('네트워크 오류가 발생했습니다. 다시 시도해주세요.');
    }
  };

  // fetchNotices 함수 아래에 추가
  const fetchFaqCategories = async () => {
    try {
      const res = await fetch('http://localhost:8080/api/faq/categories');
      if (!res.ok) throw new Error('Failed to fetch categories');
      const data = await res.json();
      setFaqCategories(data);
      await fetchAllFaqs(data);
    } catch (e) {
      console.error('Failed to fetch FAQ categories:', e);
      const fallback = [
        { id: '1', name: '제품' },
        { id: '2', name: '주문/배송' },
        { id: '3', name: '교환/환불' },
      ];
      setFaqCategories(fallback);
      await fetchAllFaqs(fallback);
    }
  };

  const fetchAllFaqs = async (categoriesList?: any[]) => {
    const cats = categoriesList ?? faqCategories;
    if (!cats || cats.length === 0) return;
    setFaqsLoading(true);
    try {
      const results = await Promise.all(
        cats.map(async (cat: any) => {
          try {
            const res = await fetch(`http://localhost:8080/api/faq?categoryId=${cat.id}`);
            if (!res.ok) throw new Error('Failed to fetch faqs');
            const data = await res.json();
            return { id: cat.id, name: cat.name, items: data };
          } catch (e) {
            console.error('Failed to fetch FAQs for category:', cat.id, e);
            const items =
              cat.id === '1'
                ? [{ id: 'a', question: '필터 교체 주기는?', answer: '평균 6개월마다 권장합니다.' }]
                : [];
            return { id: cat.id, name: cat.name, items };
          }
        })
      );
      setFaqs(results);
    } finally {
      setFaqsLoading(false);
    }
  };


  useEffect(() => {
    fetchNotices();
    fetchFaqCategories();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">고객센터</h1>
          <p className="text-lg text-muted-foreground">
            궁금한 점이나 문의사항이 있으시면 언제든 연락주세요
          </p>
        </div>

        <Tabs defaultValue="notice" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="notice">공지사항</TabsTrigger>
            <TabsTrigger value="inquiry">1:1 문의</TabsTrigger>
            <TabsTrigger value="faq">FAQ</TabsTrigger>
          </TabsList>

          {/* --- 5. 공지사항 탭 렌더링 부분 수정 --- */}
          <TabsContent value="notice" className="mt-8">
            <div className="space-y-4">
              {noticesLoading ? (
                  // 로딩 중일 때 스켈레톤 UI 표시
                  Array.from({ length: 5 }).map((_, index) => (
                      <Card key={index}>
                        <CardContent className="p-6">
                          <div className="flex items-center gap-4">
                            <Skeleton className="h-5 w-16 rounded-full" />
                            <div className="flex-1 space-y-2">
                              <Skeleton className="h-5 w-3/4" />
                              <Skeleton className="h-4 w-1/4" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                  ))
              ) : notices.length > 0 ? (
                  // 로딩 완료 후 데이터가 있을 때 목록 표시
                  notices.map((notice) => (
                      <Card key={notice.id} className="water-drop hover:shadow-lg transition-smooth">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                {notice.pinned && <Pin className="w-4 h-4 text-primary" />}
                                <Link to={`/notice/${notice.id}`}>
                                  <h3 className="text-lg font-semibold hover:text-primary transition-colors cursor-pointer">
                                    {notice.title}
                                  </h3>
                                </Link>
                                {notice.pinned && <Badge variant="destructive">중요</Badge>}
                              </div>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Bell className="w-4 h-4" />
                                <span>{new Date(notice.createdAt).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                  ))
              ) : (
                  // 로딩 완료 후 데이터가 없을 때 메시지 표시
                  <Card>
                    <CardContent className="p-10 text-center text-muted-foreground">
                      등록된 공지사항이 없습니다.
                    </CardContent>
                  </Card>
              )}
            </div>
          </TabsContent>


          <TabsContent value="inquiry" className="mt-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="water-drop">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageCircle className="w-5 h-5" />
                    1:1 문의하기
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">문의 유형</label>
                    <Select value={inquiryData.category} onValueChange={(value) => setInquiryData({...inquiryData, category: value})}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="문의 유형을 선택하세요" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="refund">환불</SelectItem>
                        <SelectItem value="exchange">교환</SelectItem>
                        <SelectItem value="general">일반문의</SelectItem>
                        <SelectItem value="product">제품 문의</SelectItem>
                        <SelectItem value="order">주문/배송 문의</SelectItem>
                        <SelectItem value="order">기타</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">제목</label>
                    <Input 
                      placeholder="문의 제목을 입력하세요" 
                      value={inquiryData.title}
                      onChange={(e) => setInquiryData({...inquiryData, title: e.target.value})}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">문의 내용</label>
                    <Textarea 
                      placeholder="문의 내용을 상세히 입력해주세요"
                      rows={6}
                      value={inquiryData.content}
                      onChange={(e) => setInquiryData({...inquiryData, content: e.target.value})}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">첨부파일 (최대 5장)</label>
                    <div className="space-y-3">
                      <div className="border-2 border-dashed border-input rounded-lg p-4 text-center">
                        <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground mb-2">
                          이미지를 드래그하거나 클릭하여 업로드
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
                          type="button" 
                          variant="outline" 
                          size="sm"
                          onClick={() => document.getElementById('file-upload')?.click()}
                        >
                          파일 선택
                        </Button>
                        <p className="text-xs text-muted-foreground mt-1">
                          JPG, PNG, GIF 형식 (최대 5장)
                        </p>
                      </div>
                      
                      {attachedFiles.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-sm font-medium">첨부된 파일 ({attachedFiles.length}/5)</p>
                          <div className="space-y-2">
                            {attachedFiles.map((file, index) => (
                              <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                                <span className="text-sm truncate flex-1">{file.name}</span>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeFile(index)}
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <Button className="w-full water-drop" onClick={handleInquirySubmit}>
                    <Send className="w-4 h-4 mr-2" />
                    문의 접수
                  </Button>
                </CardContent>
              </Card>

              <Card className="water-drop">
                <CardHeader>
                  <CardTitle>고객센터 연락처</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h4 className="font-semibold mb-3">전화 상담</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>대표번호:</span>
                        <span className="font-medium">1588-1234</span>
                      </div>
                      <div className="flex justify-between">
                        <span>운영시간:</span>
                        <span>평일 09:00-18:00</span>
                      </div>
                      <div className="flex justify-between">
                        <span>점심시간:</span>
                        <span>12:00-13:00</span>
                      </div>
                      <div className="flex justify-between">
                        <span>휴무:</span>
                        <span>토/일/공휴일</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3">이메일 문의</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>일반 문의:</span>
                        <span>info@aquapure.co.kr</span>
                      </div>
                      <div className="flex justify-between">
                        <span>기술 지원:</span>
                        <span>support@aquapure.co.kr</span>
                      </div>
                      <div className="flex justify-between">
                        <span>제품 문의:</span>
                        <span>product@aquapure.co.kr</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3">원격 지원</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      설치나 사용법에 대한 원격 지원을 제공합니다.
                    </p>
                    <Button variant="outline" className="w-full">
                      원격 지원 요청
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="faq" className="mt-8">
            <div className="space-y-6">
              {faqsLoading ? (
                  Array.from({ length: 3 }).map((_, categoryIndex) => (
                      <Card key={categoryIndex} className="water-drop">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Skeleton className="h-6 w-32" />
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <Skeleton className="h-12 w-full" />
                            <Skeleton className="h-12 w-full" />
                            <Skeleton className="h-12 w-full" />
                          </div>
                        </CardContent>
                      </Card>
                  ))
              ) : faqs.length > 0 ? (
                  faqs.map((category) => (
                      <Card key={category.id} className="water-drop">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <HelpCircle className="w-5 h-5" />
                            {category.name}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          {category.items && category.items.length > 0 ? (
                              <Accordion type="single" collapsible className="w-full">
                                {category.items.map((faq: any, faqIndex: number) => (
                                    <AccordionItem key={faq.id} value={`item-${faq.id}`}>
                                      <AccordionTrigger className="text-left">
                                        {faq.question}
                                      </AccordionTrigger>
                                      <AccordionContent className="text-muted-foreground">
                                        {faq.answer}
                                      </AccordionContent>
                                    </AccordionItem>
                                ))}
                              </Accordion>
                          ) : (
                              <p className="p-4 text-center text-muted-foreground">
                                등록된 FAQ가 없습니다.
                              </p>
                          )}
                        </CardContent>
                      </Card>
                  ))
              ) : (
                  <Card>
                    <CardContent className="p-10 text-center text-muted-foreground">
                      등록된 FAQ 카테고리가 없습니다.
                    </CardContent>
                  </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
};

export default Support;