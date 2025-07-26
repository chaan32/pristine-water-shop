import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Upload, Save, Plus } from 'lucide-react';

const ProductManagement = () => {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    stock: '',
    category: '',
    description: '',
    image: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    console.log('상품 등록:', formData);
    // 실제 저장 로직 구현
  };

  const recentProducts = [
    { id: 1, name: '샤워 정수 필터', category: '샤워 필터', price: 89000, stock: 50, status: '판매중' },
    { id: 2, name: '주방 정수 필터', category: '주방 필터', price: 120000, stock: 30, status: '판매중' },
    { id: 3, name: '산업용 대용량 필터', category: '산업용', price: 350000, stock: 5, status: '품절' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">상품 등록</h1>
        <Badge variant="secondary">총 {recentProducts.length}개 상품</Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 상품 등록 폼 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              새 상품 등록
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">제품명</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="제품명을 입력하세요"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">가격 (원)</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', e.target.value)}
                  placeholder="가격"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stock">재고 수량</Label>
                <Input
                  id="stock"
                  type="number"
                  value={formData.stock}
                  onChange={(e) => handleInputChange('stock', e.target.value)}
                  placeholder="재고"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">카테고리</Label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                placeholder="카테고리"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">상품 설명</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="상품 설명을 입력하세요"
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label>상품 이미지</Label>
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  이미지를 업로드하거나 드래그하세요
                </p>
                <Button variant="outline" size="sm" className="mt-2">
                  파일 선택
                </Button>
              </div>
            </div>

            <Button onClick={handleSave} className="w-full" size="lg">
              <Save className="w-4 h-4 mr-2" />
              상품 등록
            </Button>
          </CardContent>
        </Card>

        {/* 최근 등록 상품 목록 */}
        <Card>
          <CardHeader>
            <CardTitle>최근 등록 상품</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentProducts.map((product) => (
                <div key={product.id} className="border border-border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold">{product.name}</h3>
                    <Badge variant={product.status === '판매중' ? 'default' : 'secondary'}>
                      {product.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{product.category}</p>
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-medium">₩{product.price.toLocaleString()}</span>
                    <span className="text-muted-foreground">재고: {product.stock}개</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProductManagement;