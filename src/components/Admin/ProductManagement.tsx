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
import { Save, Plus, ChevronDown, Edit2, Trash2 } from 'lucide-react';
import { adminApi, getAccessToken } from '@/lib/api';
import { formatPriceWithComma, extractNumbers, createPriceChangeHandler } from '@/lib/price-format';

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
    categoryId: '',
    mainCategoryId: ''
  });

  const [selectedCategoryName, setSelectedCategoryName] = useState('');

  // 메인 카테고리와 서브 카테고리 관리
  const [mainCategories, setMainCategories] = useState<{ id: number; category: string; subCategories: Record<string, string> }[]>([]);
  const [subCategories, setSubCategories] = useState<{ id: string; name: string }[]>([]);
  const [selectedMainCategoryId, setSelectedMainCategoryId] = useState<number | null>(null);
  const [selectedMainCategoryName, setSelectedMainCategoryName] = useState('');

  // 새 카테고리 추가 관련
  const [newMainCategoryName, setNewMainCategoryName] = useState('');
  const [newSubCategoryName, setNewSubCategoryName] = useState('');
  const [isAddMainCategoryOpen, setIsAddMainCategoryOpen] = useState(false);
  const [isAddSubCategoryOpen, setIsAddSubCategoryOpen] = useState(false);

  // 카테고리 수정 관련
  const [editingCategory, setEditingCategory] = useState<{ type: 'main' | 'sub', id: string, name: string } | null>(null);
  const [editCategoryName, setEditCategoryName] = useState('');
  const [isEditCategoryOpen, setIsEditCategoryOpen] = useState(false);

  // 카테고리 삭제 관련
  const [deletingCategory, setDeletingCategory] = useState<{ type: 'main' | 'sub', id: string, name: string } | null>(null);
  const [isDeleteCategoryOpen, setIsDeleteCategoryOpen] = useState(false);

  // 상품 표현 관련 (IME 안전)
  const [expressions, setExpressions] = useState<string[]>([]);
  const [currentExpression, setCurrentExpression] = useState('');
  const [isComposing, setIsComposing] = useState(false);

  // 메인 카테고리 조회
  const fetchMainCategories = async () => {
    try {
      const response = await adminApi.getMainCategories();
      
      if (response.ok) {
        const data = await response.json();
        console.log('메인 카테고리 응답:', data);
        setMainCategories(data);
      }
    } catch (error) {
      console.error('메인 카테고리 가져오기 실패:', error);
    }
  };

  // 서브 카테고리 조회 (특정 메인 카테고리에 대해)
  const fetchSubCategories = async (mainCategoryId: number) => {
    try {
      const response = await adminApi.getSubCategories(mainCategoryId);
      
      if (response.ok) {
        const data = await response.json();
        console.log('서브 카테고리 응답:', data);
        
        // 서버 응답을 { id: string, name: string } 형태로 변환
        const subCategoryArray = Array.isArray(data) ? data.map((item: any) => ({
          id: item.id.toString(),
          name: item.category || item.name
        })) : [];
        setSubCategories(subCategoryArray);
      }
    } catch (error) {
      console.error('서브 카테고리 가져오기 실패:', error);
      setSubCategories([]);
    }
  };

  // 메인 카테고리 추가
  const handleAddMainCategory = async () => {
    if (!newMainCategoryName.trim()) return;
    
    try {
      const response = await adminApi.addMainCategory({ name: newMainCategoryName.trim() });
      
      if (response.ok) {
        const responseData = await response.json();
        console.log('메인 카테고리 추가 응답:', responseData);
        
        toast({
          title: "메인 카테고리 추가 성공",
          description: "새로운 메인 카테고리가 추가되었습니다.",
        });
        
        setNewMainCategoryName('');
        setIsAddMainCategoryOpen(false);
        fetchMainCategories(); // 메인 카테고리 목록 새로고침
      }
    } catch (error) {
      console.error('메인 카테고리 추가 실패:', error);
      toast({
        title: "메인 카테고리 추가 실패",
        description: "메인 카테고리 추가 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  // 서브 카테고리 추가
  const handleAddSubCategory = async () => {
    if (!newSubCategoryName.trim() || !selectedMainCategoryId) return;
    
    try {
      const response = await adminApi.addSubCategory({ 
        name: newSubCategoryName.trim(),
        id: selectedMainCategoryId 
      });
      
      if (response.ok) {
        const responseData = await response.json();
        console.log('서브 카테고리 추가 응답:', responseData);
        
        toast({
          title: "서브 카테고리 추가 성공",
          description: "새로운 서브 카테고리가 추가되었습니다.",
        });
        
        setNewSubCategoryName('');
        setIsAddSubCategoryOpen(false);
        fetchSubCategories(selectedMainCategoryId); // 서브 카테고리 목록 새로고침
        fetchMainCategories(); // 메인 카테고리도 새로고침 (subCategories 업데이트)
      }
    } catch (error) {
      console.error('서브 카테고리 추가 실패:', error);
      toast({
        title: "서브 카테고리 추가 실패",
        description: "서브 카테고리 추가 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  // 메인 카테고리 선택 시
  const handleMainCategorySelect = (mainCategory: { id: number; category: string; subCategories: Record<string, string> }) => {
    setSelectedMainCategoryId(mainCategory.id);
    setSelectedMainCategoryName(mainCategory.category);
    setSelectedCategoryName(''); // 서브 카테고리 선택 초기화
    setFormData(prev => ({ ...prev, categoryId: '', mainCategoryId: mainCategory.id.toString() })); // 메인 카테고리 ID도 설정
    
    // 서브 카테고리가 있으면 조회, 없으면 빈 배열로 설정
    if (Object.keys(mainCategory.subCategories).length > 0) {
      fetchSubCategories(mainCategory.id);
    } else {
      setSubCategories([]);
    }
  };

  // 서브 카테고리 선택 시
  const handleSubCategorySelect = (subCategory: { id: string; name: string }) => {
    setSelectedCategoryName(`${selectedMainCategoryName} > ${subCategory.name}`);
    handleInputChange('categoryId', subCategory.id);
  };

  // 카테고리 수정
  const handleEditCategory = async () => {
    if (!editCategoryName.trim() || !editingCategory) return;
    
    try {
      const token = getAccessToken();
      const endpoint = editingCategory.type === 'main' 
        ? `http://localhost:8080/api/admin/main/categories/${editingCategory.id}/${editCategoryName.trim()}`
        : `http://localhost:8080/api/admin/sub/categories/${editingCategory.id}/${editCategoryName.trim()}`;
      
      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        // body: JSON.stringify({ name: editCategoryName.trim() }),
      });
      
      if (response.ok) {
        toast({
          title: "카테고리 수정 성공",
          description: `${editingCategory.type === 'main' ? '메인' : '서브'} 카테고리가 수정되었습니다.`,
        });
        
        setEditCategoryName('');
        setEditingCategory(null);
        setIsEditCategoryOpen(false);
        
        // 카테고리 목록 새로고침
        fetchMainCategories();
        if (editingCategory.type === 'sub' && selectedMainCategoryId) {
          fetchSubCategories(selectedMainCategoryId);
        }
      }
    } catch (error) {
      console.error('카테고리 수정 실패:', error);
      toast({
        title: "카테고리 수정 실패",
        description: "카테고리 수정 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (type: 'main' | 'sub', id: string, name: string) => {
    setEditingCategory({ type, id, name });
    setEditCategoryName(name);
    setIsEditCategoryOpen(true);
  };

  // 카테고리 삭제 다이얼로그 열기
  const openDeleteDialog = (type: 'main' | 'sub', id: string, name: string) => {
    setDeletingCategory({ type, id, name });
    setIsDeleteCategoryOpen(true);
  };

  // 카테고리 삭제 실행
  const handleDeleteCategory = async () => {
    if (!deletingCategory) return;
    
    try {
      const token = getAccessToken();
      const endpoint = deletingCategory.type === 'main' 
        ? `http://localhost:8080/api/admin/main/categories/${deletingCategory.id}`
        : `http://localhost:8080/api/admin/sub/categories/${deletingCategory.id}`;
      
      const response = await fetch(endpoint, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        toast({
          title: "카테고리 삭제 성공",
          description: `${deletingCategory.type === 'main' ? '메인' : '서브'} 카테고리가 삭제되었습니다.`,
        });
        
        setDeletingCategory(null);
        setIsDeleteCategoryOpen(false);
        
        // 카테고리 목록 새로고침
        fetchMainCategories();
        if (deletingCategory.type === 'sub' && selectedMainCategoryId) {
          fetchSubCategories(selectedMainCategoryId);
        }
      }
    } catch (error) {
      console.error('카테고리 삭제 실패:', error);
      toast({
        title: "카테고리 삭제 실패",
        description: "카테고리 삭제 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchMainCategories();
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
      const token = getAccessToken();
      
      const productData = {
        name: formData.name,
        businessPrice: formData.businessPrice ? parseInt(extractNumbers(formData.businessPrice)) : null,
        customerPrice: parseInt(extractNumbers(formData.customerPrice)),
        discountPercent: formData.discountPercent ? parseInt(formData.discountPercent) : null,
        discountPrice: formData.discountPrice ? parseInt(extractNumbers(formData.discountPrice)) : null,
        stock: parseInt(formData.stock),
        categoryId: parseInt(formData.categoryId),
        mainCategoryId: parseInt(formData.mainCategoryId),
        expressions: expressions
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
        console.log('생성된 상품 데이터:', createdProduct);
        
        const productId = createdProduct.id || createdProduct.productId;
        console.log('추출된 productId:', productId);
        
        toast({
          title: "상품 등록 성공",
          description: "상품이 등록되었습니다.",
          action: (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate(`/admin/products/content?productId=${productId}`)}
            >
              상품 설정하기
            </Button>
          ),
        });
        
        // 폼 초기화
        setFormData({
          name: '',
          businessPrice: '',
          customerPrice: '',
          discountPercent: '',
          discountPrice: '',
          stock: '',
          categoryId: '',
          mainCategoryId: ''
        });
        setSelectedCategoryName('');
        setSelectedMainCategoryId(null);
        setSelectedMainCategoryName('');
        setSubCategories([]);
        setExpressions([]);
        setCurrentExpression('');
        
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">상품 등록</h1>
        <Badge variant="secondary">카테고리 관리</Badge>
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
              
              {/* 메인 카테고리 선택 */}
              <div className="space-y-2">
                <div className="flex gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="flex-1 justify-between">
                        {selectedMainCategoryName || "메인 카테고리를 선택하세요"}
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-full min-w-[200px] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                      {mainCategories.length === 0 ? (
                        <DropdownMenuItem disabled className="text-gray-500">
                          메인 카테고리가 없습니다
                        </DropdownMenuItem>
                      ) : (
                        mainCategories.map((mainCategory) => (
                          <DropdownMenuItem 
                            key={mainCategory.id}
                            onClick={() => handleMainCategorySelect(mainCategory)}
                            className="cursor-pointer text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 px-3 py-2"
                          >
                            <span className="text-sm font-medium">{mainCategory.category}</span>
                          </DropdownMenuItem>
                        ))
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                  
                  <Dialog open={isAddMainCategoryOpen} onOpenChange={setIsAddMainCategoryOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="icon">
                        <Plus className="w-4 h-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>새 메인 카테고리 추가</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="newMainCategory">메인 카테고리명</Label>
                          <Input
                            id="newMainCategory"
                            value={newMainCategoryName}
                            onChange={(e) => setNewMainCategoryName(e.target.value)}
                            placeholder="메인 카테고리명을 입력하세요"
                          />
                        </div>
                        <div className="flex gap-2 justify-end">
                          <Button variant="outline" onClick={() => setIsAddMainCategoryOpen(false)}>
                            취소
                          </Button>
                          <Button onClick={handleAddMainCategory}>
                            추가
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                {/* 서브 카테고리 선택 */}
                {selectedMainCategoryId && (
                  <div className="flex gap-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="flex-1 justify-between">
                          {selectedCategoryName.includes(' > ') 
                            ? selectedCategoryName.split(' > ')[1] 
                            : "서브 카테고리를 선택하세요"
                          }
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-full min-w-[200px] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                        {subCategories.length === 0 ? (
                          <DropdownMenuItem disabled className="text-gray-500">
                            서브 카테고리가 없습니다
                          </DropdownMenuItem>
                        ) : (
                          subCategories.map((subCategory) => (
                            <DropdownMenuItem 
                              key={subCategory.id}
                              onClick={() => handleSubCategorySelect(subCategory)}
                              className="cursor-pointer text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 px-3 py-2"
                            >
                              <span className="text-sm font-medium">{subCategory.name}</span>
                            </DropdownMenuItem>
                          ))
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                    
                    <Dialog open={isAddSubCategoryOpen} onOpenChange={setIsAddSubCategoryOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="icon">
                          <Plus className="w-4 h-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>새 서브 카테고리 추가</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label>선택된 메인 카테고리: <Badge variant="secondary">{selectedMainCategoryName}</Badge></Label>
                            <Label htmlFor="newSubCategory">서브 카테고리명</Label>
                            <Input
                              id="newSubCategory"
                              value={newSubCategoryName}
                              onChange={(e) => setNewSubCategoryName(e.target.value)}
                              placeholder="서브 카테고리명을 입력하세요"
                            />
                          </div>
                          <div className="flex gap-2 justify-end">
                            <Button variant="outline" onClick={() => setIsAddSubCategoryOpen(false)}>
                              취소
                            </Button>
                            <Button onClick={handleAddSubCategory}>
                              추가
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                )}
              </div>
              
              {selectedCategoryName && (
                <p className="text-sm text-muted-foreground">
                  선택된 카테고리: {selectedCategoryName}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="customerPrice">개인 가격 (원)</Label>
                <Input
                  id="customerPrice"
                  value={formData.customerPrice}
                  onChange={createPriceChangeHandler(handleInputChange, 'customerPrice')}
                  placeholder="개인 대상 가격"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="businessPrice">법인 가격 (원)</Label>
                <Input
                  id="businessPrice"
                  value={formData.businessPrice}
                  onChange={createPriceChangeHandler(handleInputChange, 'businessPrice')}
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
                  value={formData.discountPrice}
                  onChange={createPriceChangeHandler(handleInputChange, 'discountPrice')}
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

            <div className="space-y-2">
              <Label htmlFor="expressions">상품 표현</Label>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Input
                    id="expressions"
                    value={currentExpression}
                    onChange={(e) => setCurrentExpression(e.target.value)}
                    placeholder="상품 표현을 입력하고 Enter를 눌러주세요"
                    onCompositionStart={() => setIsComposing(true)}
                    onCompositionEnd={() => setIsComposing(false)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') e.preventDefault();
                    }}
                    onKeyUp={(e) => {
                      if (e.key === 'Enter' && !isComposing && currentExpression.trim()) {
                        setExpressions(prev => [...prev, currentExpression.trim()]);
                        setCurrentExpression('');
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (currentExpression.trim()) {
                        setExpressions(prev => [...prev, currentExpression.trim()]);
                        setCurrentExpression('');
                      }
                    }}
                  >
                    추가
                  </Button>
                </div>
                {expressions.length > 0 && (
                  <div className="space-y-1 border border-border rounded-lg p-3 bg-muted/20">
                    <p className="text-sm font-medium text-muted-foreground mb-2">등록된 표현들:</p>
                    {expressions.map((expression, index) => (
                      <div key={index} className="flex items-center justify-between text-sm bg-background rounded px-2 py-1">
                        <span>{expression}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setExpressions(prev => prev.filter((_, i) => i !== index))}
                          className="h-6 w-6 p-0 hover:bg-destructive hover:text-destructive-foreground"
                        >
                          ×
                        </Button>
                      </div>
                    ))}
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

        {/* 카테고리 관리 */}
        <Card>
          <CardHeader>
            <CardTitle>카테고리 관리</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mainCategories.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  등록된 메인 카테고리가 없습니다.
                </p>
              ) : (
                mainCategories.map((mainCategory, mainIndex) => (
                  <div key={mainCategory.id} className="border border-border rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{mainIndex + 1} )</span>
                        <h3 className="font-semibold">{mainCategory.category}</h3>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          서브 카테고리 {Object.keys(mainCategory.subCategories).length}개
                        </Badge>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => openEditDialog('main', mainCategory.id.toString(), mainCategory.category)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => openDeleteDialog('main', mainCategory.id.toString(), mainCategory.category)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    
                    {/* 서브 카테고리 목록 */}
                    {Object.keys(mainCategory.subCategories).length > 0 && (
                      <div className="mt-2 ml-4">
                        <p className="text-sm font-medium text-muted-foreground mb-1">서브 카테고리 :</p>
                        <div className="space-y-1">
                          {Object.entries(mainCategory.subCategories).map(([subId, subName], subIndex) => (
                            <div key={subId} className="flex justify-between items-center text-sm">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{subIndex + 1}.</span>
                                <span className="text-muted-foreground">{subName}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => openEditDialog('sub', subId, subName)}
                                >
                                  <Edit2 className="w-3 h-3" />
                                </Button>
                                <Button 
                                  variant="destructive" 
                                  size="sm"
                                  onClick={() => openDeleteDialog('sub', subId, subName)}
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {Object.keys(mainCategory.subCategories).length === 0 && (
                      <p className="text-xs text-muted-foreground ml-4">서브 카테고리가 없습니다.</p>
                    )}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 카테고리 수정 다이얼로그 */}
      <Dialog open={isEditCategoryOpen} onOpenChange={setIsEditCategoryOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCategory?.type === 'main' ? '메인' : '서브'} 카테고리 수정
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="editCategoryId">카테고리 ID</Label>
              <Input
                id="editCategoryId"
                value={editingCategory?.id || ''}
                disabled
                className="bg-gray-100"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editCategoryName">카테고리명</Label>
              <Input
                id="editCategoryName"
                value={editCategoryName}
                onChange={(e) => setEditCategoryName(e.target.value)}
                placeholder="카테고리명을 입력하세요"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setIsEditCategoryOpen(false)}>
                취소
              </Button>
              <Button onClick={handleEditCategory}>
                수정
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 카테고리 삭제 확인 다이얼로그 */}
      <Dialog open={isDeleteCategoryOpen} onOpenChange={setIsDeleteCategoryOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>카테고리 삭제 확인</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              정말로 <strong>"{deletingCategory?.name}"</strong> {deletingCategory?.type === 'main' ? '메인' : '서브'} 카테고리를 삭제하시겠습니까?
            </p>
            <p className="text-xs text-red-500">
              삭제된 카테고리는 복구할 수 없습니다.
            </p>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setIsDeleteCategoryOpen(false)}>
                취소
              </Button>
              <Button variant="destructive" onClick={handleDeleteCategory}>
                삭제
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductManagement;
