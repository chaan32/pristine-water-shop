import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Edit, Trash2, Search } from 'lucide-react';

const ProductEdit = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const products = [
    { 
      id: 1, 
      name: '샤워 정수 필터', 
      category: '샤워 필터', 
      price: 89000, 
      stock: 50, 
      status: '판매중',
      createdAt: '2024-01-15'
    },
    { 
      id: 2, 
      name: '주방 정수 필터', 
      category: '주방 필터', 
      price: 120000, 
      stock: 30, 
      status: '판매중',
      createdAt: '2024-01-10'
    },
    { 
      id: 3, 
      name: '산업용 대용량 필터', 
      category: '산업용', 
      price: 350000, 
      stock: 0, 
      status: '품절',
      createdAt: '2024-01-05'
    },
    { 
      id: 4, 
      name: '휴대용 소형 필터', 
      category: '휴대용', 
      price: 45000, 
      stock: 100, 
      status: '판매중',
      createdAt: '2024-01-01'
    }
  ];

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (id: number) => {
    console.log('상품 수정:', id);
    // 실제 수정 로직 구현
  };

  const handleDelete = (id: number) => {
    console.log('상품 삭제:', id);
    // 실제 삭제 로직 구현
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
                <TableHead>가격</TableHead>
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
                  <TableCell>₩{product.price.toLocaleString()}</TableCell>
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
                        onClick={() => handleEdit(product.id)}
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
    </div>
  );
};

export default ProductEdit;