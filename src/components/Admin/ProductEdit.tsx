import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Edit, Trash2, Search, Save, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const ProductEdit = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    category: '',
    customerPrice: '',
    businessPrice: '',
    discountPrice: '',
    discountPercent: '',
    stock: '',
    status: ''
  });
  const { toast } = useToast();
  
  const products = [
    { 
      id: 1, 
      name: '샤워 정수 필터', 
      category: '샤워 필터', 
      customerPrice: 89000,
      businessPrice: 79000,
      discountPrice: 75000,
      discountPercent: 15,
      stock: 50, 
      status: '판매중',
      createdAt: '2024-01-15'
    },
    { 
      id: 2, 
      name: '주방 정수 필터', 
      category: '주방 필터', 
      customerPrice: 120000,
      businessPrice: 108000,
      discountPrice: 100000,
      discountPercent: 17,
      stock: 30, 
      status: '판매중',
      createdAt: '2024-01-10'
    },
    { 
      id: 3, 
      name: '산업용 대용량 필터', 
      category: '산업용', 
      customerPrice: 350000,
      businessPrice: 315000,
      discountPrice: 280000,
      discountPercent: 20,
      stock: 0, 
      status: '품절',
      createdAt: '2024-01-05'
    },
    { 
      id: 4, 
      name: '휴대용 소형 필터', 
      category: '휴대용', 
      customerPrice: 45000,
      businessPrice: 40500,
      discountPrice: 38000,
      discountPercent: 16,
      stock: 100, 
      status: '판매중',
      createdAt: '2024-01-01'
    }
  ];

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (product: any) => {
    setSelectedProduct(product);
    setEditForm({
      name: product.name,
      category: product.category,
      customerPrice: product.customerPrice.toString(),
      businessPrice: product.businessPrice.toString(),
      discountPrice: product.discountPrice.toString(),
      discountPercent: product.discountPercent.toString(),
      stock: product.stock.toString(),
      status: product.status
    });
    setIsEditOpen(true);
  };

  const handleSaveEdit = () => {
    toast({
      title: "상품 수정 완료",
      description: `${editForm.name} 상품이 수정되었습니다.`,
    });
    setIsEditOpen(false);
    setSelectedProduct(null);
  };

  const handleDelete = (id: number) => {
    toast({
      title: "상품 삭제",
      description: "상품이 삭제되었습니다.",
      variant: "destructive"
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">상품 수정</h1>
        <Badge variant="secondary">총 {products.length}개 상품</Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>등록된 상품 목록</CardTitle>
          <div className="flex items-center gap-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="상품명 또는 카테고리로 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>상품명</TableHead>
                <TableHead>카테고리</TableHead>
                <TableHead>일반가격</TableHead>
                <TableHead>사업자가격</TableHead>
                <TableHead>할인가격</TableHead>
                <TableHead>할인율</TableHead>
                <TableHead>재고</TableHead>
                <TableHead>상태</TableHead>
                <TableHead>등록일</TableHead>
                <TableHead className="text-right">관리</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell>₩{product.customerPrice.toLocaleString()}</TableCell>
                  <TableCell>₩{product.businessPrice.toLocaleString()}</TableCell>
                  <TableCell>₩{product.discountPrice.toLocaleString()}</TableCell>
                  <TableCell>{product.discountPercent}%</TableCell>
                  <TableCell>
                    <span className={product.stock === 0 ? 'text-destructive' : ''}>
                      {product.stock}개
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={product.status === '판매중' ? 'default' : 'secondary'}>
                      {product.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{product.createdAt}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(product)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(product.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* 상품 수정 다이얼로그 */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>상품 수정</DialogTitle>
          </DialogHeader>

          {selectedProduct && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 상품 정보 수정 폼 */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-name">제품명</Label>
                    <Input
                      id="edit-name"
                      value={editForm.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="제품명을 입력하세요"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-category">카테고리</Label>
                    <Input
                      id="edit-category"
                      value={editForm.category}
                      onChange={(e) => handleInputChange('category', e.target.value)}
                      placeholder="카테고리"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-customer-price">일반 가격 (원)</Label>
                      <Input
                        id="edit-customer-price"
                        type="number"
                        value={editForm.customerPrice}
                        onChange={(e) => handleInputChange('customerPrice', e.target.value)}
                        placeholder="일반 가격"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-business-price">사업자 가격 (원)</Label>
                      <Input
                        id="edit-business-price"
                        type="number"
                        value={editForm.businessPrice}
                        onChange={(e) => handleInputChange('businessPrice', e.target.value)}
                        placeholder="사업자 가격"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-discount-price">할인 가격 (원)</Label>
                      <Input
                        id="edit-discount-price"
                        type="number"
                        value={editForm.discountPrice}
                        onChange={(e) => handleInputChange('discountPrice', e.target.value)}
                        placeholder="할인 가격"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-discount-percent">할인율 (%)</Label>
                      <Input
                        id="edit-discount-percent"
                        type="number"
                        value={editForm.discountPercent}
                        onChange={(e) => handleInputChange('discountPercent', e.target.value)}
                        placeholder="할인율"
                        max="100"
                        min="0"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-stock">재고 수량</Label>
                    <Input
                      id="edit-stock"
                      type="number"
                      value={editForm.stock}
                      onChange={(e) => handleInputChange('stock', e.target.value)}
                      placeholder="재고"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-status">판매 상태</Label>
                    <select 
                      id="edit-status"
                      value={editForm.status}
                      onChange={(e) => handleInputChange('status', e.target.value)}
                      className="w-full p-2 border border-border rounded-md bg-background"
                    >
                      <option value="판매중">판매중</option>
                      <option value="품절">품절</option>
                      <option value="판매중단">판매중단</option>
                    </select>
                  </div>

                </div>

                {/* 이미지 업로드 */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>상품 이미지</Label>
                    <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                      <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground mb-2">
                        새 이미지를 업로드하거나 드래그하세요
                      </p>
                      <Button variant="outline" size="sm">
                        파일 선택
                      </Button>
                    </div>
                  </div>

                  {/* 현재 상품 정보 미리보기 */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">현재 상품 정보</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div>
                        <span className="font-medium">상품 ID:</span>
                        <span className="ml-2">{selectedProduct.id}</span>
                      </div>
                      <div>
                        <span className="font-medium">등록일:</span>
                        <span className="ml-2">{selectedProduct.createdAt}</span>
                      </div>
                      <div>
                        <span className="font-medium">현재 상태:</span>
                        <Badge className="ml-2" variant={selectedProduct.status === '판매중' ? 'default' : 'secondary'}>
                          {selectedProduct.status}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* 저장 버튼 */}
              <div className="flex gap-3 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setIsEditOpen(false)}
                  className="flex-1"
                >
                  취소
                </Button>
                <Button 
                  onClick={handleSaveEdit}
                  className="flex-1"
                >
                  <Save className="w-4 h-4 mr-2" />
                  저장
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductEdit;