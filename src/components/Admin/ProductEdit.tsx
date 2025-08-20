import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Edit, Trash2, Search, Save, Upload, Plus, ChevronDown, Filter, Image } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Switch } from '@/components/ui/switch';
import ImageManagementModal from './ImageManagementModal';

const ProductEdit = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
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
    status: '',
    isNew: false,
    isRecommendation: false,
    isBest: false
  });
  
  // 2단계 카테고리 관련 상태
  const [mainCategories, setMainCategories] = useState<{ id: number; category: string; subCategories: Record<string, string> }[]>([]);
  const [subCategories, setSubCategories] = useState<{ id: string; name: string }[]>([]);
  const [selectedMainCategoryId, setSelectedMainCategoryId] = useState<number | null>(null);
  const [selectedMainCategoryName, setSelectedMainCategoryName] = useState('');
  const [selectedCategoryName, setSelectedCategoryName] = useState('');
  
  // 새 카테고리 추가 관련
  const [newMainCategoryName, setNewMainCategoryName] = useState('');
  const [newSubCategoryName, setNewSubCategoryName] = useState('');
  const [isAddMainCategoryOpen, setIsAddMainCategoryOpen] = useState(false);
  const [isAddSubCategoryOpen, setIsAddSubCategoryOpen] = useState(false);
  
  // 상품 표현 관련
  const [expressions, setExpressions] = useState<Record<string, string>>({});
  const [currentExpression, setCurrentExpression] = useState('');
  const [isComposing, setIsComposing] = useState(false);
  
  // 이미지 관리 모달 관련
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  
  // 메인페이지 구성 상품 관련
  const [mainPageProducts, setMainPageProducts] = useState({
    bestProducts: [],
    newProducts: [],
    recommendedProducts: []
  });
  
  const { toast } = useToast();

  // 메인페이지 구성 불러오기 API
  const fetchMainPageProducts = async () => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) return;

      const response = await fetch('http://localhost:8080/api/admin/main-page-products', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        // 단일 값 또는 null을 배열 형태로 변환
        setMainPageProducts({
          bestProducts: data.bestProducts ? [data.bestProducts] : [],
          newProducts: data.newProducts ? [data.newProducts] : [],
          recommendedProducts: data.recommendedProducts ? [data.recommendedProducts] : []
        });
      }
    } catch (error) {
      console.error('Error fetching main page products:', error);
    }
  };

  // 메인페이지 구성 저장 API
  const handleSaveMainPageProducts = async () => {
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

      // 선택된 상품 ID 또는 null 추출
      const selectedBestProduct = mainPageProducts.bestProducts.length > 0 && mainPageProducts.bestProducts[0] !== 'none' 
        ? Number(mainPageProducts.bestProducts[0]) 
        : null;
      const selectedNewProduct = mainPageProducts.newProducts.length > 0 && mainPageProducts.newProducts[0] !== 'none' 
        ? Number(mainPageProducts.newProducts[0]) 
        : null;
      const selectedRecommendedProduct = mainPageProducts.recommendedProducts.length > 0 && mainPageProducts.recommendedProducts[0] !== 'none' 
        ? Number(mainPageProducts.recommendedProducts[0]) 
        : null;

      const response = await fetch('http://localhost:8080/api/admin/main-page-products', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          bestProducts: selectedBestProduct,
          newProducts: selectedNewProduct,
          recommendedProducts: selectedRecommendedProduct
        })
      });

      if (!response.ok) {
        throw new Error('메인페이지 구성 저장에 실패했습니다.');
      }

      toast({
        title: "메인페이지 구성 저장",
        description: "메인페이지 제품 구성이 저장되었습니다.",
      });
    } catch (error) {
      toast({
        title: "오류",
        description: "메인페이지 구성 저장에 실패했습니다.",
        variant: "destructive"
      });
      console.error('Error saving main page products:', error);
    }
  };

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

  // 메인 카테고리 조회
  const fetchMainCategories = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('http://localhost:8080/api/admin/main/categories', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
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
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`http://localhost:8080/api/admin/sub/categories/${mainCategoryId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('서브 카테고리 응답:', data);
        
        // 응답을 표준 구조로 변환 { id: string, name: string }
        const subCategoryArray = (Array.isArray(data) ? data : []).map((item: any) => ({
          id: String(item?.id ?? item?.categoryId ?? item?.value ?? ''),
          name: String(item?.name ?? item?.category ?? item?.label ?? ''),
        }));
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
      const token = localStorage.getItem('accessToken');
      const response = await fetch('http://localhost:8080/api/admin/main/categories/add', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newMainCategoryName.trim() }),
      });
      
      if (response.ok) {
        toast({
          title: "메인 카테고리 추가 성공",
          description: "새로운 메인 카테고리가 추가되었습니다.",
        });
        
        setNewMainCategoryName('');
        setIsAddMainCategoryOpen(false);
        fetchMainCategories();
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
      const token = localStorage.getItem('accessToken');
      const response = await fetch('http://localhost:8080/api/admin/sub/categories/add', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          name: newSubCategoryName.trim(),
          id: selectedMainCategoryId 
        }),
      });
      
      if (response.ok) {
        toast({
          title: "서브 카테고리 추가 성공",
          description: "새로운 서브 카테고리가 추가되었습니다.",
        });
        
        setNewSubCategoryName('');
        setIsAddSubCategoryOpen(false);
        fetchSubCategories(selectedMainCategoryId);
        fetchMainCategories();
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
    setSelectedCategoryName('');
    setEditForm(prev => ({ ...prev, categoryId: '' }));
    
    if (Object.keys(mainCategory.subCategories).length > 0) {
      fetchSubCategories(mainCategory.id);
    } else {
      setSubCategories([]);
    }
  };

  // 서브 카테고리 선택 시
  const handleSubCategorySelect = (subCategory: { id: string; name: string }) => {
    if (subCategory && subCategory.name && subCategory.id) {
      setSelectedCategoryName(`${selectedMainCategoryName} > ${subCategory.name}`);
      handleInputChange('categoryId', subCategory.id);
      handleInputChange('category', subCategory.name);
    } else {
      console.error('서브카테고리 정보가 올바르지 않습니다:', subCategory);
      toast({
        title: "오류",
        description: "서브카테고리 선택 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchMainCategories();
    fetchMainPageProducts();
  }, []);

  const filteredProducts = products.filter(product => {
    const matchesSearch = (product.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.mainCategory || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.subCategory || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.category || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = !categoryFilter || 
      (product.mainCategory || '').toLowerCase().includes(categoryFilter.toLowerCase()) ||
      (product.subCategory || '').toLowerCase().includes(categoryFilter.toLowerCase());
    
    const matchesStatus = !statusFilter || product.status === statusFilter;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // 카테고리 목록 생성 (필터용)
  const availableCategories = [...new Set(products.map(p => p.mainCategory).filter(Boolean))];
  const availableStatuses = [...new Set(products.map(p => p.status).filter(Boolean))];

  // Expression 추가 함수 (IME 안전 처리)
  const handleAddExpression = async (value?: string) => {
    const expression = (value ?? currentExpression).trim();
    if (!expression || !selectedProduct) return;
    
    try {
      const accessToken = localStorage.getItem('accessToken');
      const response = await fetch('http://localhost:8080/api/admin/expressions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          productId: selectedProduct.id,
          expression: expression
        })
      });

      if (response.ok) {
        const data = await response.json();
        setExpressions(prev => ({
          ...prev,
          [data.id]: expression
        }));
        setCurrentExpression('');
        toast({
          title: "표현 추가 완료",
          description: "새로운 표현이 추가되었습니다.",
        });
      }
    } catch (error) {
      console.log(error);
      toast({
        title: "오류",
        description: "표현 추가에 실패했습니다.",
        variant: "destructive"
      });
    }
  };

  // Expression 삭제 함수
  const handleDeleteExpression = async (expressionId: string) => {
    if (!selectedProduct) return;
    
    try {
      const accessToken = localStorage.getItem('accessToken');
      const response = await fetch('http://localhost:8080/api/admin/expressions', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          productId: selectedProduct.id,
          expressionId: expressionId
        })
      });

      if (response.ok) {
        setExpressions(prev => {
          const newExpressions = { ...prev };
          delete newExpressions[expressionId];
          return newExpressions;
        });
        toast({
          title: "표현 삭제 완료",
          description: "표현이 삭제되었습니다.",
        });
      }
    } catch (error) {
      toast({
        title: "오류",
        description: "표현 삭제에 실패했습니다.",
        variant: "destructive"
      });
    }
  };

  const handleEdit = async (product: any) => {
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
      status: product.status || '',
      isNew: product.isNew || false,
      isRecommendation: product.isRecommendation || false,
      isBest: product.isBest || false
    });
    
    // 기존 카테고리 정보로 메인카테고리와 서브카테고리 설정
    if (product.mainCategory) {
      const mainCategory = mainCategories.find(cat => cat.category === product.mainCategory);
      if (mainCategory) {
        setSelectedMainCategoryId(mainCategory.id);
        setSelectedMainCategoryName(mainCategory.category);
        
        // 서브카테고리가 있으면 불러오기
        if (product.subCategory) {
          await fetchSubCategories(mainCategory.id);
          setSelectedCategoryName(`${product.mainCategory} > ${product.subCategory}`);
        } else {
          setSelectedCategoryName(product.mainCategory);
        }
      }
    } else {
      // 카테고리 정보 초기화
      setSelectedMainCategoryId(null);
      setSelectedMainCategoryName('');
      setSelectedCategoryName('');
      setSubCategories([]);
    }
    
    setExpressions(product.expressions || {});
    setCurrentExpression('');
    setIsEditOpen(true);
  };

  const handleSave = async () => {
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
          status: editForm.status,
          isNew: editForm.isNew,
          isRecommendation: editForm.isRecommendation,
          isBest: editForm.isBest
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
      fetchProducts();
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

      const response = await fetch(`http://localhost:8080/api/admin/products/${id}`, {
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
      
      fetchProducts();
    } catch (error) {
      toast({
        title: "오류",
        description: "상품 삭제에 실패했습니다.",
        variant: "destructive"
      });
      console.error('Error deleting product:', error);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
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
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="상품명 또는 카테고리로 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            
            {/* 카테고리 필터 */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="min-w-[120px] justify-between">
                  <Filter className="w-4 h-4 mr-2" />
                  {categoryFilter || "카테고리"}
                  <ChevronDown className="w-4 h-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-white dark:bg-gray-800 border">
                <DropdownMenuItem 
                  onClick={() => setCategoryFilter('')}
                  className={!categoryFilter ? "bg-primary/10" : ""}
                >
                  전체 카테고리
                </DropdownMenuItem>
                {availableCategories.map((category) => (
                  <DropdownMenuItem 
                    key={category}
                    onClick={() => setCategoryFilter(category)}
                    className={categoryFilter === category ? "bg-primary/10" : ""}
                  >
                    {category}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* 상태 필터 */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="min-w-[100px] justify-between">
                  {statusFilter || "상태"}
                  <ChevronDown className="w-4 h-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-white dark:bg-gray-800 border">
                <DropdownMenuItem 
                  onClick={() => setStatusFilter('')}
                  className={!statusFilter ? "bg-primary/10" : ""}
                >
                  전체 상태
                </DropdownMenuItem>
                {availableStatuses.map((status) => (
                  <DropdownMenuItem 
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={statusFilter === status ? "bg-primary/10" : ""}
                  >
                    {status}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            
            {/* 필터 초기화 버튼 */}
            {(categoryFilter || statusFilter) && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => {
                  setCategoryFilter('');
                  setStatusFilter('');
                }}
              >
                필터 초기화
              </Button>
            )}
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
                  <TableHead>메인 카테고리</TableHead>
                  <TableHead>서브 카테고리</TableHead>
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
                    <TableCell className="font-medium">
                      <div className="space-y-1">
                        <div>{product.name || '-'}</div>
                        <div className="flex gap-1 flex-wrap">
                          {product.isNew && (
                            <Badge variant="default" className="text-xs">
                              NEW
                            </Badge>
                          )}
                          {product.isRecommendation && (
                            <Badge variant="secondary" className="text-xs">
                              추천
                            </Badge>
                          )}
                          {product.isBest && (
                            <Badge variant="destructive" className="text-xs">
                              BEST
                            </Badge>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{product.mainCategory || '-'}</TableCell>
                    <TableCell>{product.subCategory || '-'}</TableCell>
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
                    <TableCell className="text-muted-foreground">
                      {product.createdAt ? product.createdAt.split('T')[0] : '-'}
                    </TableCell>
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
            <div className="space-y-4">
              {/* 기본 정보 */}
              <div className="grid grid-cols-1 gap-4">
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
                        <Button variant="outline" size="icon" onClick={() => setIsAddMainCategoryOpen(true)}>
                          <Plus className="w-4 h-4" />
                        </Button>
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
                          <Button variant="outline" size="icon" onClick={() => setIsAddSubCategoryOpen(true)}>
                            <Plus className="w-4 h-4" />
                          </Button>
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
              </div>

              {/* 가격 정보 */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="edit-customerPrice">개인 가격</Label>
                  <Input
                    id="edit-customerPrice"
                    type="number"
                    value={editForm.customerPrice}
                    onChange={(e) => handleInputChange('customerPrice', e.target.value)}
                    placeholder="개인 가격"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-businessPrice">사업자 가격</Label>
                  <Input
                    id="edit-businessPrice"
                    type="number"
                    value={editForm.businessPrice}
                    onChange={(e) => handleInputChange('businessPrice', e.target.value)}
                    placeholder="사업자 가격"
                  />
                </div>
              </div>

              {/* 할인 및 재고 정보 */}
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="edit-discountPrice">할인 금액</Label>
                  <Input
                    id="edit-discountPrice"
                    type="number"
                    value={editForm.discountPrice}
                    onChange={(e) => handleInputChange('discountPrice', e.target.value)}
                    placeholder="할인 금액"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-discountPercent">할인율 (%)</Label>
                  <Input
                    id="edit-discountPercent"
                    type="number"
                    value={editForm.discountPercent}
                    onChange={(e) => handleInputChange('discountPercent', e.target.value)}
                    placeholder="할인율"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-stock">재고</Label>
                  <Input
                    id="edit-stock"
                    type="number"
                    value={editForm.stock}
                    onChange={(e) => handleInputChange('stock', e.target.value)}
                    placeholder="재고"
                  />
                </div>
              </div>

                <div className="space-y-2">
                  <Label>상태</Label>
                  <div className="flex gap-2">
                    {['판매 중', '품절', '판매 중단'].map((status) => (
                      <Button
                        key={status}
                        type="button"
                        variant={editForm.status === status ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleInputChange('status', status)}
                        className={`${
                          editForm.status === status 
                            ? status === '판매 중' 
                              ? 'bg-primary text-primary-foreground' 
                              : status === '품절' 
                              ? 'bg-destructive text-destructive-foreground' 
                              : 'bg-secondary text-secondary-foreground'
                            : 'hover:bg-accent hover:text-accent-foreground'
                        }`}
                      >
                        {status}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* 상품 뱃지 설정 */}
                <div className="space-y-4">
                  <Label>상품 뱃지 설정</Label>
                  <div className="grid grid-cols-1 gap-4 p-4 border border-border rounded-lg bg-muted/20">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label className="text-sm font-medium">NEW 뱃지</Label>
                        <p className="text-xs text-muted-foreground">신제품 표시</p>
                      </div>
                      <Switch
                        checked={editForm.isNew}
                        onCheckedChange={(checked) => handleInputChange('isNew', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label className="text-sm font-medium">추천 뱃지</Label>
                        <p className="text-xs text-muted-foreground">추천 제품 표시</p>
                      </div>
                      <Switch
                        checked={editForm.isRecommendation}
                        onCheckedChange={(checked) => handleInputChange('isRecommendation', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label className="text-sm font-medium">BEST 뱃지</Label>
                        <p className="text-xs text-muted-foreground">베스트 제품 표시</p>
                      </div>
                      <Switch
                        checked={editForm.isBest}
                        onCheckedChange={(checked) => handleInputChange('isBest', checked)}
                      />
                    </div>
                  </div>
                </div>

                 {/* 상품 표현 관리 */}
                <div className="space-y-4">
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
                          if (e.key === 'Enter' && !isComposing) {
                            handleAddExpression((e.target as HTMLInputElement).value);
                          }
                        }}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleAddExpression(currentExpression)}
                      >
                        추가
                      </Button>
                    </div>
                    {Object.keys(expressions).length > 0 && (
                      <div className="space-y-1 border border-border rounded-lg p-3 bg-muted/20">
                        <p className="text-sm font-medium text-muted-foreground mb-2">등록된 표현들:</p>
                        {Object.entries(expressions).map(([id, expression]) => (
                          <div key={id} className="flex items-center justify-between text-sm bg-background rounded px-2 py-1">
                            <span>{expression}</span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteExpression(id)}
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

                <div className="flex gap-2 pt-4">
                  <Button onClick={handleSave} className="flex-1">
                    <Save className="w-4 h-4 mr-2" />
                    저장
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsImageModalOpen(true)}
                    className="flex-1"
                  >
                    <Image className="w-4 h-4 mr-2" />
                    이미지 관리
                  </Button>
                  <Button variant="outline" onClick={() => setIsEditOpen(false)} className="flex-1">
                    취소
                  </Button>
                </div>
              </div>
            )}
        </DialogContent>
      </Dialog>

      {/* 이미지 관리 모달 */}
      {selectedProduct && (
        <ImageManagementModal
          isOpen={isImageModalOpen}
          onOpenChange={setIsImageModalOpen}
          productId={selectedProduct.id}
          productName={selectedProduct.name}
        />
      )}

      {/* 메인페이지 구성 상품 선택 */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>메인페이지 구성 상품</CardTitle>
          <p className="text-sm text-muted-foreground">
            각 뱃지를 가진 제품 중에서 메인페이지에 표시할 제품을 선택하세요.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* BEST 제품 선택 */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge variant="destructive" className="text-xs">BEST</Badge>
              <Label className="font-medium">베스트 제품</Label>
            </div>
            <Select
              value={mainPageProducts.bestProducts[0]?.toString() || ""}
              onValueChange={(value) => {
                setMainPageProducts(prev => ({
                  ...prev,
                  bestProducts: value !== 'none' ? [parseInt(value)] : []
                }));
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="베스트 제품을 선택하세요" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-800 border">
                <SelectItem value="none">선택 해제</SelectItem>
                {products
                  .filter(product => product.isBest)
                  .map(product => (
                    <SelectItem key={product.id} value={product.id.toString()}>
                      {product.name} ({product.mainCategory} &gt; {product.subCategory})
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            {products.filter(product => product.isBest).length === 0 && (
              <p className="text-sm text-muted-foreground">BEST 뱃지가 설정된 제품이 없습니다.</p>
            )}
          </div>

          {/* NEW 제품 선택 */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge variant="default" className="text-xs">NEW</Badge>
              <Label className="font-medium">신제품</Label>
            </div>
            <Select
              value={mainPageProducts.newProducts[0]?.toString() || ""}
              onValueChange={(value) => {
                setMainPageProducts(prev => ({
                  ...prev,
                  newProducts: value !== 'none' ? [parseInt(value)] : []
                }));
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="신제품을 선택하세요" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-800 border">
                <SelectItem value="none">선택 해제</SelectItem>
                {products
                  .filter(product => product.isNew)
                  .map(product => (
                    <SelectItem key={product.id} value={product.id.toString()}>
                      {product.name} ({product.mainCategory} &gt; {product.subCategory})
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            {products.filter(product => product.isNew).length === 0 && (
              <p className="text-sm text-muted-foreground">NEW 뱃지가 설정된 제품이 없습니다.</p>
            )}
          </div>

          {/* 추천 제품 선택 */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">추천</Badge>
              <Label className="font-medium">추천 제품</Label>
            </div>
            <Select
              value={mainPageProducts.recommendedProducts[0]?.toString() || ""}
              onValueChange={(value) => {
                setMainPageProducts(prev => ({
                  ...prev,
                  recommendedProducts: value !== 'none' ? [parseInt(value)] : []
                }));
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="추천 제품을 선택하세요" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-800 border">
                <SelectItem value="none">선택 해제</SelectItem>
                {products
                  .filter(product => product.isRecommendation)
                  .map(product => (
                    <SelectItem key={product.id} value={product.id.toString()}>
                      {product.name} ({product.mainCategory} &gt; {product.subCategory})
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            {products.filter(product => product.isRecommendation).length === 0 && (
              <p className="text-sm text-muted-foreground">추천 뱃지가 설정된 제품이 없습니다.</p>
            )}
          </div>

          <div className="flex justify-end pt-4">
            <Button onClick={handleSaveMainPageProducts}>
              메인페이지 구성 저장
            </Button>
          </div>
        </CardContent>
      </Card>
      
    </div>
  );
};

export default ProductEdit;
