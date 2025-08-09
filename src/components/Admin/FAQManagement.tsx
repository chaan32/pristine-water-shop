import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Plus, Save, Trash2 } from 'lucide-react';

interface Category { id: string; name: string }
interface FAQItem { id: string; categoryId: string; question: string; answer: string }

const FAQManagement = () => {
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [faqItems, setFaqItems] = useState<FAQItem[]>([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newQuestion, setNewQuestion] = useState('');
  const [newAnswer, setNewAnswer] = useState('');

  const fetchCategories = async () => {
    try {
      const res = await fetch('http://localhost:8080/api/admin/faq/categories', {
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
      });
      if (!res.ok) throw new Error('failed');
      const data = await res.json();
      setCategories(data);
      if (data.length > 0) setSelectedCategoryId(data[0].id);
    } catch (e) {
      // Fallback demo
      const demo = [
        { id: '1', name: '제품' },
        { id: '2', name: '배송' },
      ];
      setCategories(demo);
      setSelectedCategoryId('1');
    }
  };

  const fetchFaqs = async (categoryId: string) => {
    if (!categoryId) return;
    try {
      const res = await fetch(`http://localhost:8080/api/admin/faq?categoryId=${categoryId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
      });
      if (!res.ok) throw new Error('failed');
      const data = await res.json();
      setFaqItems(data);
    } catch (e) {
      // Fallback demo
      setFaqItems([
        { id: 'a', categoryId, question: '필터 교체 주기는?', answer: '평균 6개월마다 권장합니다.' },
      ]);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (selectedCategoryId) fetchFaqs(selectedCategoryId);
  }, [selectedCategoryId]);

  const addCategory = async () => {
    const name = newCategoryName.trim();
    if (!name) return;
    try {
      const res = await fetch('http://localhost:8080/api/admin/faq/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) throw new Error('failed');
      toast({ title: '카테고리 추가', description: '새 카테고리가 추가되었습니다.' });
      setNewCategoryName('');
      fetchCategories();
    } catch (e) {
      // Local add
      const id = Math.random().toString(36).slice(2);
      setCategories((prev) => [...prev, { id, name }]);
      setNewCategoryName('');
      toast({ title: '임시 추가', description: '데모 데이터에 카테고리를 추가했습니다.' });
    }
  };

  const addFaq = async () => {
    if (!selectedCategoryId) {
      toast({ title: '선택 필요', description: '카테고리를 먼저 선택하세요.', variant: 'destructive' });
      return;
    }
    if (!newQuestion.trim() || !newAnswer.trim()) {
      toast({ title: '입력 오류', description: '질문과 답변을 모두 입력하세요.', variant: 'destructive' });
      return;
    }

    try {
      const res = await fetch('http://localhost:8080/api/admin/faq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
        body: JSON.stringify({ categoryId: selectedCategoryId, question: newQuestion, answer: newAnswer }),
      });
      if (!res.ok) throw new Error('failed');
      toast({ title: 'FAQ 등록', description: 'FAQ가 등록되었습니다.' });
      setNewQuestion('');
      setNewAnswer('');
      fetchFaqs(selectedCategoryId);
    } catch (e) {
      const id = Math.random().toString(36).slice(2);
      setFaqItems((prev) => [...prev, { id, categoryId: selectedCategoryId, question: newQuestion, answer: newAnswer }]);
      setNewQuestion('');
      setNewAnswer('');
      toast({ title: '임시 등록', description: '데모 데이터에 FAQ를 추가했습니다.' });
    }
  };

  const removeFaq = async (id: string) => {
    try {
      const res = await fetch(`http://localhost:8080/api/admin/faq/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
      });
      if (!res.ok) throw new Error('failed');
      fetchFaqs(selectedCategoryId);
    } catch (e) {
      setFaqItems((prev) => prev.filter((x) => x.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">FAQ 관리</h1>

      <Tabs defaultValue="manage">
        <TabsList>
          <TabsTrigger value="manage">FAQ 작성/관리</TabsTrigger>
          <TabsTrigger value="categories">카테고리 관리</TabsTrigger>
        </TabsList>

        <TabsContent value="manage" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Categories */}
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle>카테고리</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  {categories.map((c) => (
                    <button
                      key={c.id}
                      className={`w-full text-left px-3 py-2 rounded-md transition-smooth ${
                        selectedCategoryId === c.id ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary'
                      }`}
                      onClick={() => setSelectedCategoryId(c.id)}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* QA area */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>
                  {selectedCategoryId ? (
                    <span>
                      선택된 카테고리: <Badge variant="secondary">{categories.find((c) => c.id === selectedCategoryId)?.name}</Badge>
                    </span>
                  ) : (
                    '카테고리를 선택하세요'
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-2">
                  <Label htmlFor="q">질문</Label>
                  <Input id="q" value={newQuestion} onChange={(e) => setNewQuestion(e.target.value)} placeholder="질문을 입력" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="a">답변</Label>
                  <Textarea id="a" value={newAnswer} onChange={(e) => setNewAnswer(e.target.value)} placeholder="답변을 입력" rows={5} />
                </div>
                <div className="flex justify-end">
                  <Button onClick={addFaq}>
                    <Save className="w-4 h-4 mr-1" /> 등록
                  </Button>
                </div>

                <div className="space-y-3">
                  <h3 className="font-semibold">현재 FAQ</h3>
                  <div className="divide-y">
                    {faqItems.map((item) => (
                      <div key={item.id} className="py-3 flex items-start justify-between gap-4">
                        <div>
                          <p className="font-medium">Q. {item.question}</p>
                          <p className="text-sm text-muted-foreground mt-1">A. {item.answer}</p>
                        </div>
                        <Button variant="destructive" size="sm" onClick={() => removeFaq(item.id)}>
                          <Trash2 className="w-4 h-4 mr-1" /> 삭제
                        </Button>
                      </div>
                    ))}
                    {faqItems.length === 0 && <p className="text-muted-foreground">등록된 FAQ가 없습니다.</p>}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="categories" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>카테고리 추가</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2 max-w-md">
                <Label htmlFor="cat">카테고리명</Label>
                <div className="flex gap-2">
                  <Input id="cat" value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} placeholder="예) 제품, 배송, 결제" />
                  <Button onClick={addCategory}>
                    <Plus className="w-4 h-4 mr-1" /> 추가
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold">현재 카테고리</h3>
                <div className="flex flex-wrap gap-2">
                  {categories.map((c) => (
                    <Badge key={c.id} variant="secondary">{c.name}</Badge>
                  ))}
                  {categories.length === 0 && <p className="text-muted-foreground">카테고리가 없습니다.</p>}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FAQManagement;
