import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Upload, Save, Plus, ChevronDown } from 'lucide-react';

const ProductManagement = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    businessPrice: '',
    customerPrice: '',
    discountPercent: '',
    discountPrice: '',
    stock: '',
    category: '',
    description: '',
    images: [] as File[]
  });

  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      
      const response = await fetch('http://localhost:8080/api/admin/categories', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data && Array.isArray(data) && data.length > 0) {
          const normalizedCategories = data.map((item: any, index: number) => ({
            id: item.id || item.categoryId || (index + 100).toString(),
            name: item.name || item.categoryName || item.category || 'Unknown'
          }));
          setCategories(normalizedCategories);
        }
      }
    } catch (error) {
      console.error('카테고리 가져오기 실패:', error);
    }
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return;
    
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('http://localhost:8080/api/admin/categories/add', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newCategoryName.trim() }),
      });
      
      if (response.ok) {
        const newCategory = { 
          id: Date.now().toString(),
          name: newCategoryName.trim() 
        };
        setCategories(prev => [...prev, newCategory]);
        setNewCategoryName('');
        setIsAddCategoryOpen(false);
      }
    } catch (error) {
      console.error('카테고리 추가 실패:', error);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 5) {
      toast({
        title: "이미지 업로드 제한",
        description: "최대 5개의 이미지만 업로드할 수 있습니다.",
        variant: "destructive",
      });
      return;
    }
    setFormData(prev => ({ ...prev, images: files }));
  };

  const handleSave = async () => {
    // 필수 필드 검증
    if (!formData.name || !formData.price || !formData.stock || !formData.category) {
      toast({
        title: "입력 오류",
        description: "제품명, 가격, 재고, 카테고리는 필수 입력 항목입니다.",
        variant: "destructive",
      });
      return;
    }

    try {
      const token = localStorage.getItem('accessToken');
      
      // FormData 생성 (multipart/form-data)
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('price', formData.price);
      formDataToSend.append('businessPrice', formData.businessPrice);
      formDataToSend.append('customerPrice', formData.customerPrice);
      formDataToSend.append('discountPercent', formData.discountPercent);
      formDataToSend.append('discountPrice', formData.discountPrice);
      formDataToSend.append('stock', formData.stock);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('description', formData.description);
      
      // 이미지 파일들 추가
      formData.images.forEach((image, index) => {
        formDataToSend.append(`images`, image);
      });

      const response = await fetch('http://localhost:8080/api/admin/products', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formDataToSend,
      });

      if (response.ok) {
        toast({
          title: "상품 등록 성공",
          description: "새 상품이 성공적으로 등록되었습니다.",
        });
        
        // 폼 초기화
        setFormData({
          name: '',
          price: '',
          businessPrice: '',
          customerPrice: '',
          discountPercent: '',
          discountPrice: '',
          stock: '',
          category: '',
          description: '',
          images: []
        });
      } else {
        const errorData = await response.json();
        toast({
          title: "상품 등록 실패",
          description: errorData.message || "상품 등록 중 오류가 발생했습니다.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "네트워크 오류",
        description: "서버와의 연결에 문제가 발생했습니다.",
        variant: "destructive",
      });
    }
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
                <Label htmlFor="price">기본 가격 (원)</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', e.target.value)}
                  placeholder="기본 가격"
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

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="businessPrice">법인 가격 (원)</Label>
                <Input
                  id="businessPrice"
                  type="number"
                  value={formData.businessPrice}
                  onChange={(e) => handleInputChange('businessPrice', e.target.value)}
                  placeholder="법인 대상 가격"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customerPrice">개인 가격 (원)</Label>
                <Input
                  id="customerPrice"
                  type="number"
                  value={formData.customerPrice}
                  onChange={(e) => handleInputChange('customerPrice', e.target.value)}
                  placeholder="개인 대상 가격"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="discountPercent">할인율 (%)</Label>
                <Input
                  id="discountPercent"
                  type="number"
                  value={formData.discountPercent}
                  onChange={(e) => handleInputChange('discountPercent', e.target.value)}
                  placeholder="할인 비율 (정수)"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="discountPrice">할인 금액 (원)</Label>
                <Input
                  id="discountPrice"
                  type="number"
                  value={formData.discountPrice}
                  onChange={(e) => handleInputChange('discountPrice', e.target.value)}
                  placeholder="할인 금액"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">카테고리</Label>
              <div className="flex gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="flex-1 justify-between">
                      {formData.category || "카테고리를 선택하세요"}
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
                          onClick={() => handleInputChange('category', category.name)}
                          className="cursor-pointer text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 px-3 py-2"
                        >
                          <span className="text-sm font-medium">{category.name}</span>
                        </DropdownMenuItem>
                      ))
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
                <Dialog open={isAddCategoryOpen} onOpenChange={setIsAddCategoryOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="icon">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </DialogTrigger>
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
              <Label>상품 이미지 (최대 5개)</Label>
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-2">
                  이미지를 업로드하거나 드래그하세요 (최대 5개)
                </p>
                <input
                  type="file"
                  id="images"
                  multiple
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                <Button variant="outline" size="sm" asChild>
                  <label htmlFor="images" className="cursor-pointer">
                    파일 선택
                  </label>
                </Button>
                {formData.images.length > 0 && (
                  <div className="mt-4 text-left">
                    <p className="text-sm font-medium mb-2">선택된 이미지 ({formData.images.length}/5):</p>
                    <div className="space-y-1">
                      {formData.images.map((file, index) => (
                        <div key={index} className="text-xs text-muted-foreground">
                          {file.name}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
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