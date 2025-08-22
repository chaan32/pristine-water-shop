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
import { Eye, Save, Trash2, Edit } from 'lucide-react';
import { adminApi } from '@/lib/api';

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

  // 수정 중인 공지사항 상태 추가
  const [editingNotice, setEditingNotice] = useState<Notice | null>(null);

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
      // API: GET /api/admin/notices
      const res = await adminApi.getNotices();
      if (!res.ok) throw new Error('failed');
      const data = await res.json();
      setNotices(data);
    } catch (e) {
      toast({ title: '불러오기 오류', description: '공지사항을 불러오는 데 실패했어요.', variant: 'destructive' });
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
    setEditingNotice(null); // 수정 상태 초기화
  };

  // '수정' 버튼 클릭 시 호출될 함수
  const handleEdit = (notice: Notice) => {
    setEditingNotice(notice);
    setTitle(notice.title);
    setPinned(notice.pinned);
    setHtmlContent(notice.content);
    editor?.commands.setContent(notice.content);
    setTab('create');
  };

  // 등록 및 수정을 처리하는 통합 함수
  const handleSave = async () => {
    if (!title.trim()) {
      toast({ title: '입력 오류', description: '제목을 입력하세요.', variant: 'destructive' });
      return;
    }
    if (!htmlContent.trim()) {
      toast({ title: '입력 오류', description: '내용을 입력하세요.', variant: 'destructive' });
      return;
    }

    const isEditing = !!editingNotice;
    try {
      // API: POST /api/admin/notices or PUT /api/admin/notices/:id
      const res = isEditing
        ? await adminApi.updateNotice(String(editingNotice!.id), { title, content: htmlContent, pinned })
        : await adminApi.addNotice({ title, content: htmlContent, pinned });
      if (!res.ok) throw new Error('save failed');

      toast({ title: '성공', description: `공지사항이 성공적으로 ${isEditing ? '수정' : '등록'}되었습니다.` });

      resetForm();
      setTab('list');
      fetchNotices();
    } catch (e) {
      toast({ title: '오류', description: `${isEditing ? '수정' : '등록'} 중 문제가 발생했습니다.`, variant: 'destructive' });
    }
  };

  const handleDelete = async (id: number) => {
    try {
      // API: DELETE /api/admin/notices/:id
      const res = await adminApi.deleteNotice(String(id));
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

        <Tabs value={tab} onValueChange={(v) => {
          setTab(v as 'list' | 'create');
          if (v === 'create') {
            // '새 공지 작성' 탭으로 이동할 때 기존 수정 상태를 초기화
            resetForm();
          }
        }}>
          <TabsList>
            <TabsTrigger value="list">목록</TabsTrigger>
            <TabsTrigger value="create">{editingNotice ? '공지 수정' : '새 공지 작성'}</TabsTrigger>
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
                              {/* 수정 버튼 추가 */}
                              <Button variant="outline" size="sm" onClick={() => handleEdit(n)}>
                                <Edit className="w-4 h-4 mr-1" /> 수정
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
                <CardTitle>{editingNotice ? '공지 수정' : '새 공지 작성'}</CardTitle>
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
                    {editor && (
                        <div className="border-b p-2 bg-muted rounded-t-md">
                          <div className="flex flex-wrap items-center gap-1">
                            <Button
                                type="button" variant="ghost" size="sm"
                                onClick={() => editor.chain().focus().toggleBold().run()}
                                className={editor.isActive('bold') ? 'bg-accent' : ''}
                            >
                              Bold
                            </Button>
                            <Button
                                type="button" variant="ghost" size="sm"
                                onClick={() => editor.chain().focus().toggleItalic().run()}
                                className={editor.isActive('italic') ? 'bg-accent' : ''}
                            >
                              Italic
                            </Button>
                            <Button
                                type="button" variant="ghost" size="sm"
                                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                                className={editor.isActive('heading', { level: 1 }) ? 'bg-accent' : ''}
                            >
                              H1
                            </Button>
                            <Button
                                type="button" variant="ghost" size="sm"
                                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                                className={editor.isActive('heading', { level: 2 }) ? 'bg-accent' : ''}
                            >
                              H2
                            </Button>
                            <Button
                                type="button" variant="ghost" size="sm"
                                onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                                className={editor.isActive('heading', { level: 3 }) ? 'bg-accent' : ''}
                            >
                              H3
                            </Button>
                            <Button
                                type="button" variant="ghost" size="sm"
                                onClick={() => editor.chain().focus().toggleBulletList().run()}
                                className={editor.isActive('bulletList') ? 'bg-accent' : ''}
                            >
                              List
                            </Button>
                            <input
                                type="color"
                                onInput={(e) => editor.chain().focus().setColor((e.target as HTMLInputElement).value).run()}
                                value={editor.getAttributes('textStyle').color || '#000000'}
                                className="w-8 h-8 rounded cursor-pointer bg-transparent border-none"
                                title="텍스트 색상"
                            />
                          </div>
                        </div>
                    )}
                    <EditorContent editor={editor} />
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  {editingNotice && (
                      <Button variant="secondary" onClick={() => {
                        resetForm();
                        setTab('list');
                      }}>취소</Button>
                  )}
                  <Button onClick={handleSave}>
                    <Save className="w-4 h-4 mr-1" /> {editingNotice ? '수정 저장' : '등록'}
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