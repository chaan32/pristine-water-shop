import { useParams, Link } from 'react-router-dom';
import Header from '@/components/Layout/Header';
import Footer from '@/components/Layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {ArrowLeft, Bell, Pin, Calendar, Eye} from 'lucide-react';
import {useEffect, useState} from 'react';
import {Skeleton} from "@/components/ui/skeleton.tsx";
import { apiFetch } from '@/lib/api';
interface NoticeDetail{
    id: number;
    title: string;
    content: string;
    createdAt: string;
    views: number;
    pinned: boolean;
}
const NoticeDetail = () => {
  const { id } = useParams();

  const [notice, setNotice] = useState<NoticeDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError('유효하지 않은 공지사항 ID입니다.');
      setLoading(false);
      return;
    }

    const fetchNotice = async () => {
      try {
        setLoading(true);
        // API: POST /api/notices/:id/view
        apiFetch(`/api/notices/${id}/view`, { method: 'POST' });

        // API: GET /api/notices/:id
        const response = await apiFetch(`/api/notices/${id}`);
        if (!response.ok) {
          throw new Error('공지사항을 불러오는 데 실패했습니다.');
        }
        const data: NoticeDetail = await response.json();
        setNotice(data);
      } catch (e: any) {
        setError(e.message || '알 수 없는 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchNotice();
  }, [id]);

  // 4. 로딩 상태 UI
  if (loading) {
    return (
        <div className="min-h-screen bg-background">
          <Header />
          <main className="container mx-auto px-4 py-8">
            <div className="mb-6">
              <Skeleton className="h-10 w-48" />
            </div>
            <Card>
              <CardHeader className="border-b">
                <Skeleton className="h-8 w-3/4 mb-4" />
                <div className="flex items-center gap-6">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-5 w-24" />
                </div>
              </CardHeader>
              <CardContent className="p-8 space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
              </CardContent>
            </Card>
          </main>
          <Footer />
        </div>
    );
  }


  // 5. 에러 또는 데이터 없음 UI
  if (error || !notice) {
    return (
        <div className="min-h-screen bg-background">
          <Header />
          <main className="container mx-auto px-4 py-8 text-center">
            <h1 className="text-2xl font-bold text-destructive mb-4">
              {error || '공지사항을 찾을 수 없습니다.'}
            </h1>
            <Link to="/support">
              <Button variant="outline">공지사항 목록으로 돌아가기</Button>
            </Link>
          </main>
          <Footer />
        </div>
    );
  }

  // 6. 데이터 로딩 완료 후 실제 UI
  return (
      <div className="min-h-screen bg-background">
        <Header />

        <main className="container mx-auto px-4 py-8">
          <div className="mb-6">
            <Link to="/support">
              <Button variant="ghost" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                공지사항 목록으로
              </Button>
            </Link>
          </div>

          <Card className="water-drop">
            <CardHeader className="border-b">
              <div className="flex items-center gap-3 mb-2">
                {notice.pinned && <Badge variant="destructive">중요</Badge>}
                <CardTitle className="text-2xl">{notice.title}</CardTitle>
              </div>

              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>작성일: {new Date(notice.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  <span>조회수: {notice.views.toLocaleString()}</span>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-8">
              {/* Tiptap 에디터의 HTML 내용을 렌더링 */}
              <div
                  className="prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: notice.content }}
              />
            </CardContent>
          </Card>

          <div className="flex justify-center items-center mt-8">
            <Link to="/support">
              <Button variant="secondary">목록</Button>
            </Link>
          </div>
        </main>

        <Footer />
      </div>
  );
};

export default NoticeDetail;