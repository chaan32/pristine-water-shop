import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Save, Plus, ChevronDown } from 'lucide-react';

const ProductManagement = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    businessPrice: '',
    customerPrice: '',
    discountPercent: '',
    discountPrice: '',
    stock: '',
    categoryId: ''
  });

  const [selectedCategoryName, setSelectedCategoryName] = useState('');

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
        const responseText = await response.text();
        console.log('응답 길이:', responseText.length);
        
        // 순환 참조 패턴 강력 감지 - JSON.parse 전에 완전히 차단
        const hasCircularRef = 
          responseText.includes('{"id":1,"category":{"id":1,"category"') ||
          responseText.includes('}]}}]}}]}}"') ||
          responseText.length > 50000 ||
          (responseText.match(/{"id":/g) || []).length > 20;
        
        if (hasCircularRef) {
          console.warn('순환 참조 감지 - 기본 카테고리 사용');
          // 기본 카테고리로 설정
          setCategories([
            { id: '1', name: '샤워 필터' },
            { id: '2', name: '주방 필터' },
            { id: '3', name: '산업용 필터' },
            { id: '4', name: '일반 필터' }
          ]);
          return;
        }
        
        // 정상적인 응답만 JSON 파싱 시도
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
            console.error('JSON 파싱 실패 - 기본 카테고리 사용');
          }
        }
        
        // 기본 카테고리로 폴백
        setCategories([
          { id: '1', name: '샤워 필터' },
          { id: '2', name: '주방 필터' },
          { id: '3', name: '산업용 필터' },
          { id: '4', name: '일반 필터' }
        ]);
        
      } else {
        console.error('카테고리 요청 실패:', response.status);
        // 기본 카테고리로 설정
        setCategories([
          { id: '1', name: '샤워 필터' },
          { id: '2', name: '주방 필터' },
          { id: '3', name: '산업용 필터' },
          { id: '4', name: '일반 필터' }
        ]);
      }
    } catch (error) {
      console.error('카테고리 가져오기 실패:', error);
      // 에러 시 기본 카테고리로 설정
      setCategories([
        { id: '1', name: '샤워 필터' },
        { id: '2', name: '주방 필터' },
        { id: '3', name: '산업용 필터' },
        { id: '4', name: '일반 필터' }
      ]);
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

  const handleSave = async () => {
    // 필수 필드 검증
    if (!formData.name || !formData.customerPrice || !formData.businessPrice || !formData.stock || !formData.categoryId || !formData.discountPercent || !formData.discountPrice) {
      toast({
        title: "입력 오류",
        description: "모든 필드는 필수 입력 항목입니다.",
        variant: "destructive",
      });
      return;
    }

    try {
      const token = localStorage.getItem('accessToken');
      
      const productData = {
        name: formData.name,
        businessPrice: formData.businessPrice ? parseInt(formData.businessPrice) : null,
        customerPrice: parseInt(formData.customerPrice),
        discountPercent: formData.discountPercent ? parseInt(formData.discountPercent) : null,
        discountPrice: formData.discountPrice ? parseInt(formData.discountPrice) : null,
        stock: parseInt(formData.stock),
        categoryId: formData.categoryId
      };

      const response = await fetch('http://localhost:8080/api/admin/products/add', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      });

      if (response.ok) {
        const createdProduct = await response.json();
        
        toast({
          title: "상품 등록 성공",
          description: "상품이 등록되었습니다.",
        });
        
        // 자동으로 상품 상세 페이지로 이동
        navigate(`/admin?tab=product-content&productId=${createdProduct.id || createdProduct.productId}`);
        
        // 폼 초기화
        setFormData({
          name: '',
          businessPrice: '',
          customerPrice: '',
          discountPercent: '',
          discountPrice: '',
          stock: '',
          categoryId: ''
        });
        setSelectedCategoryName('');
        
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

            <div className="space-y-2">
              <Label htmlFor="category">카테고리</Label>
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

            <div className="grid grid-cols-2 gap-4">
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
            </div>

            <div className="grid grid-cols-3 gap-4">
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
              <div className="space-y-2">
                <Label htmlFor="discountPercent">할인율 (%)</Label>
                <Input
                  id="discountPercent"
                  type="number"
                  value={formData.discountPercent}
                  onChange={(e) => handleInputChange('discountPercent', e.target.value)}
                  placeholder="할인 비율"
                />
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