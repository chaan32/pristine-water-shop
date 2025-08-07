import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Edit, Trash2, Search, Save, Upload, Plus, ChevronDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const ProductEdit = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editForm, setEditForm] = useState({
    name: '',
    category: '',
    categoryId: '',
    customerPrice: '',
    businessPrice: '',
    discountPrice: '',
    discountPercent: '',
    stock: '',
    status: ''
  });
  
  // 카테고리 관련 상태
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [selectedCategoryName, setSelectedCategoryName] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const { toast } = useToast();

  // 상품 목록 조회
  const fetchProducts = async () => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        toast({
          title: "인증 오류",
          description: "로그인이 필요합니다.",
          variant: "destructive"
        });
        return;
      }

      const response = await fetch('http://localhost:8080/api/admin/products/edit', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('상품 목록을 가져오는데 실패했습니다.');
      }

      const data = await response.json();
      setProducts(data);
    } catch (error) {
      toast({
        title: "오류",
        description: "상품 목록을 가져오는데 실패했습니다.",
        variant: "destructive"
      });
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  // 카테고리 목록 조회
  const fetchCategories = async () => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) return;

      const response = await fetch('http://localhost:8080/api/admin/categories', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const responseText = await response.text();
        
        // 순환 참조 패턴 감지
        const hasCircularRef = 
          responseText.includes('{"id":1,"category":{"id":1,"category"') ||
          responseText.includes('}]}}]}}]}}"') ||
          responseText.length > 50000 ||
          (responseText.match(/{"id":/g) || []).length > 20;
        
        if (hasCircularRef) {
          setCategories([]);
          return;
        }
        
        if (responseText.trim() && responseText.length < 10000) {
          try {
            const data = JSON.parse(responseText);
            if (data && Array.isArray(data) && data.length > 0) {
              const normalizedCategories = data.map((item: any, index: number) => ({
                id: item.id || item.categoryId || (index + 100).toString(),
                name: item.name || item.categoryName || item.category || 'Unknown'
              }));
              setCategories(normalizedCategories);
              return;
            }
          } catch (parseError) {
            console.error('JSON 파싱 실패');
          }
        }
        
        setCategories([]);
      }
    } catch (error) {
      console.error('카테고리 가져오기 실패:', error);
      setCategories([]);
    }
  };

  // 카테고리 추가
  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return;
    
    try {
      const accessToken = localStorage.getItem('accessToken');
      const response = await fetch('http://localhost:8080/api/admin/categories/add', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newCategoryName.trim() }),
      });
      
      if (response.ok) {
        const responseData = await response.json();
        const newCategory = { 
          id: responseData.id || responseData.categoryId || Date.now().toString(),
          name: newCategoryName.trim() 
        };
        setCategories(prev => [...prev, newCategory]);
        setNewCategoryName('');
        setIsAddCategoryOpen(false);
        fetchCategories(); // 카테고리 목록 새로고침
      }
    } catch (error) {
      console.error('카테고리 추가 실패:', error);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const filteredProducts = products.filter(product =>
    (product.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.category || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (product: any) => {
    setSelectedProduct(product);
    setEditForm({
      name: product.name || '',
      category: product.categoryName || product.category || '',
      categoryId: product.categoryId || '',
      customerPrice: (product.customerPrice || 0).toString(),
      businessPrice: (product.businessPrice || 0).toString(),
      discountPrice: (product.discountPrice || 0).toString(),
      discountPercent: (product.discountPercent || 0).toString(),
      stock: (product.stock || 0).toString(),
      status: product.status || '판매 중'
    });
    setSelectedCategoryName(product.categoryName || product.category || '');
    setIsEditOpen(true);
  };

  const handleSaveEdit = async () => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        toast({
          title: "인증 오류",
          description: "로그인이 필요합니다.",
          variant: "destructive"
        });
        return;
      }

      const response = await fetch(`http://localhost:8080/api/admin/products/edit/${selectedProduct.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: editForm.name,
          category: editForm.category,
          categoryId: editForm.categoryId,
          customerPrice: parseInt(editForm.customerPrice),
          businessPrice: parseInt(editForm.businessPrice),
          discountPrice: parseInt(editForm.discountPrice),
          discountPercent: parseInt(editForm.discountPercent),
          stock: parseInt(editForm.stock),
          status: editForm.status
        })
      });

      if (!response.ok) {
        throw new Error('상품 수정에 실패했습니다.');
      }

      toast({
        title: "상품 수정 완료",
        description: `${editForm.name} 상품이 수정되었습니다.`,
      });
      
      setIsEditOpen(false);
      setSelectedProduct(null);
      fetchProducts(); // 목록 새로고침
    } catch (error) {
      toast({
        title: "오류",
        description: "상품 수정에 실패했습니다.",
        variant: "destructive"
      });
      console.error('Error updating product:', error);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        toast({
          title: "인증 오류",
          description: "로그인이 필요합니다.",
          variant: "destructive"
        });
        return;
      }

      const response = await fetch(`http://localhost:8080/api/products/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('상품 삭제에 실패했습니다.');
      }

      toast({
        title: "상품 삭제",
        description: "상품이 삭제되었습니다.",
        variant: "destructive"
      });
      
      fetchProducts(); // 목록 새로고침
    } catch (error) {
      toast({
        title: "오류",
        description: "상품 삭제에 실패했습니다.",
        variant: "destructive"
      });
      console.error('Error deleting product:', error);
    }
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
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="text-muted-foreground">상품 목록을 불러오는 중...</div>
            </div>
          ) : (
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
                {filteredProducts.map((product, index) => (
                  <TableRow key={product.id || `product-${index}`}>
                    <TableCell className="font-medium">{product.name || '-'}</TableCell>
                    <TableCell>{product.categoryName || product.category || '-'}</TableCell>
                    <TableCell>₩{(product.customerPrice || 0).toLocaleString()}</TableCell>
                    <TableCell>₩{(product.businessPrice || 0).toLocaleString()}</TableCell>
                    <TableCell>₩{(product.discountPrice || 0).toLocaleString()}</TableCell>
                    <TableCell>{product.discountPercent || 0}%</TableCell>
                    <TableCell>
                      <span className={(product.stock || 0) === 0 ? 'text-destructive' : ''}>
                        {product.stock || 0}개
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={
                        product.status === '판매 중' ? 'default' : 
                        product.status === '품절' ? 'destructive' : 
                        product.status === '판매 중단' ? 'secondary' : 'secondary'
                      }>
                        {product.status || '상태미정'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{product.createdAt || '-'}</TableCell>
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
          )}
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
                    <div className="flex gap-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" className="flex-1 justify-between">
                            {selectedCategoryName || "카테고리를 선택하세요"}
                            <ChevronDown className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-full min-w-[200px] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                          {categories.length === 0 ? (
                            <DropdownMenuItem disabled className="text-gray-500">
                              카테고리가 없습니다
                            </DropdownMenuItem>
                          ) : (
                            categories.map((category, index) => (
                              <DropdownMenuItem 
                                key={`${category.id}-${index}`}
                                onClick={() => {
                                  handleInputChange('categoryId', category.id);
                                  handleInputChange('category', category.name);
                                  setSelectedCategoryName(category.name);
                                }}
                                className="cursor-pointer text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 px-3 py-2"
                              >
                                <span className="text-sm font-medium">{category.name}</span>
                              </DropdownMenuItem>
                            ))
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                      <Dialog open={isAddCategoryOpen} onOpenChange={setIsAddCategoryOpen}>
                        <Button variant="outline" size="icon" onClick={() => setIsAddCategoryOpen(true)}>
                          <Plus className="w-4 h-4" />
                        </Button>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>새 카테고리 추가</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="newCategory">카테고리명</Label>
                              <Input
                                id="newCategory"
                                value={newCategoryName}
                                onChange={(e) => setNewCategoryName(e.target.value)}
                                placeholder="카테고리명을 입력하세요"
                              />
                            </div>
                            <div className="flex gap-2 justify-end">
                              <Button variant="outline" onClick={() => setIsAddCategoryOpen(false)}>
                                취소
                              </Button>
                              <Button onClick={handleAddCategory}>
                                추가
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
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
                      <option value="판매 중">판매 중</option>
                      <option value="품절">품절</option>
                      <option value="판매 중단">판매 중단</option>
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
                        <Badge className="ml-2" variant={
                          selectedProduct.status === '판매 중' ? 'default' : 
                          selectedProduct.status === '품절' ? 'destructive' : 
                          selectedProduct.status === '판매 중단' ? 'secondary' : 'secondary'
                        }>
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