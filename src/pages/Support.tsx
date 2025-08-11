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
    name: '',
    phone: '',
    email: '',
    category: '',
    title: '',
    content: ''
  });

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
    if (!inquiryData.name || !inquiryData.email || !inquiryData.title || !inquiryData.content) {
      alert('필수 항목을 모두 입력해주세요.');
      return;
    }

    try {
      const token = localStorage.getItem('accessToken');
      let body;
      let headers: HeadersInit = {};

      if (attachedFiles.length > 0) {
        // 파일 첨부가 있는 경우 FormData 사용
        const formData = new FormData();
        formData.append('data', JSON.stringify(inquiryData));
        
        attachedFiles.forEach((file, index) => {
          formData.append(`attachments`, file);
        });
        
        body = formData;
        // FormData 사용 시 Content-Type 자동 설정
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
      } else {
        // 텍스트만 있는 경우 JSON 사용
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

      const data = await response.json();

      if (response.ok) {
        alert(`문의가 접수되었습니다!\n\n문의번호: ${data.data.inquiryNumber}\n예상 답변 시간: ${data.data.estimatedResponseTime}\n\n답변은 등록하신 이메일로 발송됩니다.`);
        
        // 폼 초기화
        setInquiryData({
          name: '',
          phone: '',
          email: '',
          category: '',
          title: '',
          content: ''
        });
        setAttachedFiles([]);
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
            alert(data.message || '문의 접수 중 오류가 발생했습니다.');
        }
      }
    } catch (error) {
      console.error('Inquiry submit error:', error);
      alert('네트워크 오류가 발생했습니다. 다시 시도해주세요.');
    }
  };

  const faqs = [
    {
      category: '제품',
      items: [
        {
          question: '필터 교체 주기는 언제인가요?',
          answer: '일반적으로 6개월 또는 사용량에 따라 15,000L 사용 시 교체를 권장합니다. 물의 상태나 사용 빈도에 따라 차이가 있을 수 있습니다.'
        },
        {
          question: '설치는 어떻게 하나요?',
          answer: '대부분의 제품은 간단한 나사 결합 방식으로 별도 공구 없이 설치 가능합니다. 상세한 설치 가이드는 제품과 함께 제공됩니다.'
        }
      ]
    },
    {
      category: '주문/배송',
      items: [
        {
          question: '배송은 얼마나 걸리나요?',
          answer: '일반적으로 주문 후 2-3일 내 배송됩니다. 제주도 및 도서산간 지역은 추가 1-2일이 소요될 수 있습니다.'
        },
        {
          question: '배송비는 얼마인가요?',
          answer: '3만원 이상 주문 시 무료배송이며, 미만 시 3,000원의 배송비가 발생합니다.'
        }
      ]
    },
    {
      category: '교환/환불',
      items: [
        {
          question: '교환/환불은 언제까지 가능한가요?',
          answer: '제품 수령 후 7일 이내에 교환/환불이 가능합니다. 단, 사용하신 제품은 교환/환불이 제한될 수 있습니다.'
        }
      ]
    }
  ];

  useEffect(() => {
    fetchNotices();
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
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">이름</label>
                      <Input 
                        placeholder="이름을 입력하세요" 
                        value={inquiryData.name}
                        onChange={(e) => setInquiryData({...inquiryData, name: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">연락처</label>
                      <Input 
                        placeholder="연락처를 입력하세요" 
                        value={inquiryData.phone}
                        onChange={(e) => setInquiryData({...inquiryData, phone: e.target.value})}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-2 block">이메일</label>
                    <Input 
                      type="email" 
                      placeholder="이메일을 입력하세요" 
                      value={inquiryData.email}
                      onChange={(e) => setInquiryData({...inquiryData, email: e.target.value})}
                    />
                  </div>

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
              {faqs.map((category, categoryIndex) => (
                <Card key={categoryIndex} className="water-drop">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <HelpCircle className="w-5 h-5" />
                      {category.category}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                      {category.items.map((faq, faqIndex) => (
                        <AccordionItem key={faqIndex} value={`item-${categoryIndex}-${faqIndex}`}>
                          <AccordionTrigger className="text-left">
                            {faq.question}
                          </AccordionTrigger>
                          <AccordionContent className="text-muted-foreground">
                            {faq.answer}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
};

export default Support;