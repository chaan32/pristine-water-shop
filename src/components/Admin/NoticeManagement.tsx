import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import Image from '@tiptap/extension-image';
import Color from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import { Eye, Save, Trash2 } from 'lucide-react';

interface Notice {
  id: number;
  title: string;
  content: string;
  pinned: boolean;
  createdAt: string;
}

const NoticeManagement = () => {
  const { toast } = useToast();
  const [tab, setTab] = useState<'list' | 'create'>('list');
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [pinned, setPinned] = useState(false);
  const [htmlContent, setHtmlContent] = useState('');

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        bulletList: { keepMarks: true },
        orderedList: { keepMarks: true },
      }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Image.configure({ HTMLAttributes: { class: 'rounded-lg max-w-full h-auto' } }),
      TextStyle,
      Color.configure({ types: [TextStyle.name, 'heading'] }),
    ],
    content: htmlContent,
    onUpdate: ({ editor }) => setHtmlContent(editor.getHTML()),
    editorProps: {
      attributes: {
        class:
          'prose prose-sm max-w-none focus:outline-none min-h-[320px] p-4 [&_h1]:text-3xl [&_h1]:font-bold [&_h2]:text-2xl [&_h2]:font-bold [&_ul]:list-disc [&_ul]:ml-6 [&_ol]:list-decimal [&_ol]:ml-6',
      },
    },
  });

  const fetchNotices = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:8080/api/admin/notices', {
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
      });
      if (!res.ok) throw new Error('failed');
      const data = await res.json();
      // Expecting array of notices
      setNotices(data);
    } catch (e) {
      // Fallback demo data
      setNotices([
        { id: 1, title: '[중요] 설날 연휴 배송 안내', content: '<p>연휴 기간 배송 안내</p>', pinned: true, createdAt: '2024-01-20' },
        { id: 2, title: '서비스 점검 안내', content: '<p>정기 점검 공지</p>', pinned: false, createdAt: '2024-01-10' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  const resetForm = () => {
    setTitle('');
    setPinned(false);
    setHtmlContent('');
    editor?.commands.setContent('');
  };

  const handleCreate = async () => {
    if (!title.trim()) {
      toast({ title: '입력 오류', description: '제목을 입력하세요.', variant: 'destructive' });
      return;
    }
    if (!htmlContent.trim()) {
      toast({ title: '입력 오류', description: '내용을 입력하세요.', variant: 'destructive' });
      return;
    }

    try {
      const res = await fetch('http://localhost:8080/api/admin/notices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({ title, content: htmlContent, pinned }),
      });
      if (!res.ok) throw new Error('create failed');
      toast({ title: '등록 완료', description: '공지사항이 등록되었습니다.' });
      resetForm();
      setTab('list');
      fetchNotices();
    } catch (e) {
      toast({ title: '오류', description: '등록 중 문제가 발생했습니다.', variant: 'destructive' });
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const res = await fetch(`http://localhost:8080/api/admin/notices/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
      });
      if (!res.ok) throw new Error('delete failed');
      toast({ title: '삭제됨', description: '공지사항이 삭제되었습니다.' });
      fetchNotices();
    } catch (e) {
      // Optimistic fallback removal
      setNotices((prev) => prev.filter((n) => n.id !== id));
      toast({ title: '삭제 처리', description: '임시로 목록에서 제거했습니다.' });
    }
  };

  const sorted = useMemo(
    () =>
      [...notices].sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.createdAt.localeCompare(a.createdAt)),
    [notices]
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">공지사항 관리</h1>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as 'list' | 'create')}>
        <TabsList>
          <TabsTrigger value="list">목록</TabsTrigger>
          <TabsTrigger value="create">새 공지 작성</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>공지사항 목록</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-muted-foreground">불러오는 중...</p>
              ) : (
                <div className="divide-y">
                  {sorted.map((n) => (
                    <div key={n.id} className="flex items-start gap-4 py-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          {n.pinned && <Badge variant="secondary">상단고정</Badge>}
                          <p className="font-semibold leading-tight">{n.title}</p>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{new Date(n.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => window.open(`/notice/${n.id}`, '_blank')}>
                          <Eye className="w-4 h-4 mr-1" /> 보기
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDelete(n.id)}>
                          <Trash2 className="w-4 h-4 mr-1" /> 삭제
                        </Button>
                      </div>
                    </div>
                  ))}
                  {sorted.length === 0 && <p className="text-muted-foreground">등록된 공지사항이 없습니다.</p>}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="create" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>새 공지 작성</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="title">제목</Label>
                <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="공지 제목을 입력하세요" />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Switch id="pinned" checked={pinned} onCheckedChange={setPinned} />
                  <Label htmlFor="pinned">상단 고정</Label>
                </div>
              </div>

              <div className="grid gap-2">
                <Label>내용</Label>
                <div className="rounded-md border">
                  <EditorContent editor={editor} />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="secondary" onClick={resetForm}>초기화</Button>
                <Button onClick={handleCreate}>
                  <Save className="w-4 h-4 mr-1" /> 저장
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NoticeManagement;
