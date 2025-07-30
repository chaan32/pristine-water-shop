import { useState } from 'react';
import Header from '@/components/Layout/Header';
import Footer from '@/components/Layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { UserPlus, Building, User, Check, X, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Register = () => {
  const { toast } = useToast();
  const [individualForm, setIndividualForm] = useState({
    id: '',
    password: '',
    confirmPassword: '',
    termsAccepted: false,
    privacyAccepted: false,
    isIdChecked: false,
    isIdAvailable: false,
    address: '',
    detailAddress: '',
    phone: '',
    isPhoneVerified: false
  });

  const [corporateForm, setCorporateForm] = useState({
    id: '',
    password: '',
    confirmPassword: '',
    termsAccepted: false,
    privacyAccepted: false,
    businessType: '',
    businessRegistration: null as File | null,
    isIdChecked: false,
    isIdAvailable: false,
    address: '',
    detailAddress: '',
    phone: '',
    isPhoneVerified: false
  });

  // 휴대폰 인증 함수
  const handlePhoneVerification = (type: 'individual' | 'corporate') => {
    const phone = type === 'individual' ? individualForm.phone : corporateForm.phone;
    
    if (!phone.trim()) {
      toast({
        title: "오류",
        description: "휴대폰 번호를 입력해주세요.",
        variant: "destructive"
      });
      return;
    }

    // 임시 인증 처리 (실제로는 PASS API 호출)
    setTimeout(() => {
      if (type === 'individual') {
        setIndividualForm(prev => ({ ...prev, isPhoneVerified: true }));
      } else {
        setCorporateForm(prev => ({ ...prev, isPhoneVerified: true }));
      }
      
      toast({
        title: "인증 완료",
        description: "휴대폰 인증이 완료되었습니다.",
        variant: "default"
      });
    }, 1000);
  };

  // 카카오 주소 검색 함수
  const handleAddressSearch = (type: 'individual' | 'corporate') => {
    new (window as any).daum.Postcode({
      oncomplete: function(data: any) {
        // 팝업에서 검색결과 항목을 클릭했을때 실행할 코드를 작성하는 부분.
        let addr = ''; // 주소 변수

        // 사용자가 선택한 주소 타입에 따라 해당 주소 값을 가져온다.
        if (data.userSelectedType === 'R') { // 사용자가 도로명 주소를 선택했을 경우
          addr = data.roadAddress;
        } else { // 사용자가 지번 주소를 선택했을 경우(J)
          addr = data.jibunAddress;
        }

        // 선택된 주소를 폼에 설정
        if (type === 'individual') {
          setIndividualForm(prev => ({ ...prev, address: addr }));
        } else {
          setCorporateForm(prev => ({ ...prev, address: addr }));
        }
      }
    }).open();
  };

  const isIndividualPasswordMatch = individualForm.password && individualForm.confirmPassword && individualForm.password === individualForm.confirmPassword;
  const isIndividualPasswordMismatch = individualForm.password && individualForm.confirmPassword && individualForm.password !== individualForm.confirmPassword;
  const isIndividualFormValid = isIndividualPasswordMatch && individualForm.termsAccepted && individualForm.privacyAccepted && individualForm.isIdChecked && individualForm.isIdAvailable;

  const isCorporatePasswordMatch = corporateForm.password && corporateForm.confirmPassword && corporateForm.password === corporateForm.confirmPassword;
  const isCorporatePasswordMismatch = corporateForm.password && corporateForm.confirmPassword && corporateForm.password !== corporateForm.confirmPassword;
  const isCorporateFormValid = isCorporatePasswordMatch && corporateForm.termsAccepted && corporateForm.privacyAccepted && corporateForm.businessType && corporateForm.businessRegistration && corporateForm.isIdChecked && corporateForm.isIdAvailable;

  const handleIdCheck = (type: 'individual' | 'corporate') => {
    const id = type === 'individual' ? individualForm.id : corporateForm.id;
    
    if (!id.trim()) {
      alert('아이디를 입력해주세요.');
      return;
    }

    // 임시 아이디 중복 체크 로직 (실제로는 백엔드 API 호출)
    const isAvailable = !['admin', 'test', 'user', 'manager'].includes(id.toLowerCase());
    
    if (type === 'individual') {
      setIndividualForm(prev => ({ 
        ...prev, 
        isIdChecked: true, 
        isIdAvailable: isAvailable 
      }));
    } else {
      setCorporateForm(prev => ({ 
        ...prev, 
        isIdChecked: true, 
        isIdAvailable: isAvailable 
      }));
    }

    if (isAvailable) {
      alert('사용 가능한 아이디입니다.');
    } else {
      alert('이미 사용중인 아이디입니다.');
    }
  };

  const handleBusinessRegistrationUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // 이미지 파일만 허용
      if (file.type.startsWith('image/')) {
        setCorporateForm(prev => ({ ...prev, businessRegistration: file }));
      } else {
        alert('이미지 파일만 업로드 가능합니다. (JPG, PNG, HEIC 등)');
      }
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-4">회원가입</h1>
            <p className="text-lg text-muted-foreground">개인/법인 회원가입을 선택해주세요</p>
          </div>

          <Tabs defaultValue="individual" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="individual" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                개인회원
              </TabsTrigger>
              <TabsTrigger value="corporate" className="flex items-center gap-2">
                <Building className="w-4 h-4" />
                법인회원
              </TabsTrigger>
            </TabsList>

            <TabsContent value="individual" className="mt-8">
              <Card className="water-drop">
                <CardHeader>
                  <CardTitle>개인회원 가입</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <Input placeholder="이름" />
                  
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Input 
                        placeholder="아이디" 
                        value={individualForm.id}
                        onChange={(e) => setIndividualForm(prev => ({ 
                          ...prev, 
                          id: e.target.value,
                          isIdChecked: false,
                          isIdAvailable: false 
                        }))}
                        className="flex-1"
                      />
                      <Button 
                        type="button"
                        variant="outline" 
                        onClick={() => handleIdCheck('individual')}
                        disabled={!individualForm.id.trim()}
                      >
                        중복확인
                      </Button>
                    </div>
                    {individualForm.isIdChecked && (
                      <div className="flex items-center gap-2 text-sm">
                        {individualForm.isIdAvailable ? (
                          <>
                            <Check className="w-4 h-4 text-green-600" />
                            <span className="text-green-600">사용 가능한 아이디입니다.</span>
                          </>
                        ) : (
                          <>
                            <X className="w-4 h-4 text-red-600" />
                            <span className="text-red-600">이미 사용중인 아이디입니다.</span>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-4">
                    <Input 
                      type="password" 
                      placeholder="비밀번호"
                      value={individualForm.password}
                      onChange={(e) => setIndividualForm(prev => ({ ...prev, password: e.target.value }))}
                      disabled={!individualForm.isIdChecked || !individualForm.isIdAvailable}
                    />
                    <div className="space-y-2">
                      <Input 
                        type="password" 
                        placeholder="비밀번호 확인"
                        value={individualForm.confirmPassword}
                        onChange={(e) => setIndividualForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        disabled={!individualForm.isIdChecked || !individualForm.isIdAvailable}
                      />
                      {individualForm.confirmPassword && (
                        <div className="flex items-center gap-2 text-sm">
                          {isIndividualPasswordMatch ? (
                            <>
                              <Check className="w-4 h-4 text-green-600" />
                              <span className="text-green-600">비밀번호가 일치합니다.</span>
                            </>
                          ) : isIndividualPasswordMismatch ? (
                            <>
                              <X className="w-4 h-4 text-red-600" />
                              <span className="text-red-600">비밀번호가 일치하지 않습니다.</span>
                            </>
                          ) : null}
                        </div>
                      )}
                    </div>
                  </div>
                  <Input 
                    type="email" 
                    placeholder="이메일" 
                    disabled={!individualForm.isIdChecked || !individualForm.isIdAvailable}
                  />
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Input 
                        placeholder="휴대폰 번호" 
                        value={individualForm.phone}
                        onChange={(e) => setIndividualForm(prev => ({ ...prev, phone: e.target.value }))}
                        className="flex-1" 
                        disabled={!individualForm.isIdChecked || !individualForm.isIdAvailable}
                      />
                      <Button 
                        type="button"
                        variant="outline"
                        onClick={() => handlePhoneVerification('individual')}
                        disabled={!individualForm.isIdChecked || !individualForm.isIdAvailable || individualForm.isPhoneVerified}
                      >
                        {individualForm.isPhoneVerified ? '인증완료' : '인증'}
                      </Button>
                    </div>
                    {individualForm.isPhoneVerified && (
                      <div className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-green-600" />
                        <span className="text-green-600">휴대폰 인증이 완료되었습니다.</span>
                      </div>
                    )}
                  </div>
                  
                  {/* 주소 입력 */}
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <Input 
                        placeholder="주소" 
                        value={individualForm.address}
                        readOnly
                        className="flex-1"
                        disabled={!individualForm.isIdChecked || !individualForm.isIdAvailable}
                      />
                      <Button 
                        type="button"
                        variant="outline" 
                        onClick={() => handleAddressSearch('individual')}
                        disabled={!individualForm.isIdChecked || !individualForm.isIdAvailable}
                      >
                        주소검색
                      </Button>
                    </div>
                    <Input 
                      placeholder="상세주소" 
                      value={individualForm.detailAddress}
                      onChange={(e) => setIndividualForm(prev => ({ ...prev, detailAddress: e.target.value }))}
                      disabled={!individualForm.isIdChecked || !individualForm.isIdAvailable || !individualForm.address}
                    />
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="terms1" 
                        checked={individualForm.termsAccepted}
                        onCheckedChange={(checked) => setIndividualForm(prev => ({ ...prev, termsAccepted: !!checked }))}
                      />
                      <label htmlFor="terms1" className="text-sm">이용약관에 동의합니다 (필수)</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="privacy1" 
                        checked={individualForm.privacyAccepted}
                        onCheckedChange={(checked) => setIndividualForm(prev => ({ ...prev, privacyAccepted: !!checked }))}
                      />
                      <label htmlFor="privacy1" className="text-sm">개인정보 처리방침에 동의합니다 (필수)</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="marketing1" />
                      <label htmlFor="marketing1" className="text-sm">마케팅 정보 수신에 동의합니다 (선택)</label>
                    </div>
                  </div>

                  <Button 
                    className="w-full water-drop" 
                    size="lg"
                    disabled={!isIndividualFormValid}
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    개인회원 가입
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="corporate" className="mt-8">
              <Card className="water-drop">
                <CardHeader>
                  <CardTitle>법인회원 가입</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input placeholder="회사명" />
                    <Input placeholder="사업자등록번호" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input placeholder="대표자명" />
                    <Input placeholder="담당자명" />
                  </div>
                  
                  {/* 법인 업종 선택 */}
                  <div className="space-y-2">
                    <Label htmlFor="businessType">법인 업종 (필수)</Label>
                    <Select onValueChange={(value) => setCorporateForm(prev => ({ ...prev, businessType: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="업종을 선택해주세요" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bakery">베이커리 법인</SelectItem>
                        <SelectItem value="cafe">카페 법인</SelectItem>
                        <SelectItem value="franchise">프랜차이즈 법인</SelectItem>
                        <SelectItem value="restaurant">레스토랑 법인</SelectItem>
                        <SelectItem value="hotel">호텔/펜션 법인</SelectItem>
                        <SelectItem value="other">기타</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Input 
                        placeholder="아이디" 
                        value={corporateForm.id}
                        onChange={(e) => setCorporateForm(prev => ({ 
                          ...prev, 
                          id: e.target.value,
                          isIdChecked: false,
                          isIdAvailable: false 
                        }))}
                        className="flex-1"
                      />
                      <Button 
                        type="button"
                        variant="outline" 
                        onClick={() => handleIdCheck('corporate')}
                        disabled={!corporateForm.id.trim()}
                      >
                        중복확인
                      </Button>
                    </div>
                    {corporateForm.isIdChecked && (
                      <div className="flex items-center gap-2 text-sm">
                        {corporateForm.isIdAvailable ? (
                          <>
                            <Check className="w-4 h-4 text-green-600" />
                            <span className="text-green-600">사용 가능한 아이디입니다.</span>
                          </>
                        ) : (
                          <>
                            <X className="w-4 h-4 text-red-600" />
                            <span className="text-red-600">이미 사용중인 아이디입니다.</span>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-4">
                    <Input 
                      type="password" 
                      placeholder="비밀번호"
                      value={corporateForm.password}
                      onChange={(e) => setCorporateForm(prev => ({ ...prev, password: e.target.value }))}
                      disabled={!corporateForm.isIdChecked || !corporateForm.isIdAvailable}
                    />
                    <div className="space-y-2">
                      <Input 
                        type="password" 
                        placeholder="비밀번호 확인"
                        value={corporateForm.confirmPassword}
                        onChange={(e) => setCorporateForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        disabled={!corporateForm.isIdChecked || !corporateForm.isIdAvailable}
                      />
                      {corporateForm.confirmPassword && (
                        <div className="flex items-center gap-2 text-sm">
                          {isCorporatePasswordMatch ? (
                            <>
                              <Check className="w-4 h-4 text-green-600" />
                              <span className="text-green-600">비밀번호가 일치합니다.</span>
                            </>
                          ) : isCorporatePasswordMismatch ? (
                            <>
                              <X className="w-4 h-4 text-red-600" />
                              <span className="text-red-600">비밀번호가 일치하지 않습니다.</span>
                            </>
                          ) : null}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input 
                      type="email" 
                      placeholder="이메일"
                      disabled={!corporateForm.isIdChecked || !corporateForm.isIdAvailable}
                    />
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <Input 
                          placeholder="회사 전화번호"
                          value={corporateForm.phone}
                          onChange={(e) => setCorporateForm(prev => ({ ...prev, phone: e.target.value }))}
                          className="flex-1"
                          disabled={!corporateForm.isIdChecked || !corporateForm.isIdAvailable}
                        />
                        <Button 
                          type="button"
                          variant="outline"
                          onClick={() => handlePhoneVerification('corporate')}
                          disabled={!corporateForm.isIdChecked || !corporateForm.isIdAvailable || corporateForm.isPhoneVerified}
                        >
                          {corporateForm.isPhoneVerified ? '인증완료' : '인증'}
                        </Button>
                      </div>
                      {corporateForm.isPhoneVerified && (
                        <div className="flex items-center gap-2 text-sm">
                          <Check className="w-4 h-4 text-green-600" />
                          <span className="text-green-600">휴대폰 인증이 완료되었습니다.</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* 주소 입력 */}
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <Input 
                        placeholder="회사 주소" 
                        value={corporateForm.address}
                        readOnly
                        className="flex-1"
                        disabled={!corporateForm.isIdChecked || !corporateForm.isIdAvailable}
                      />
                      <Button 
                        type="button"
                        variant="outline" 
                        onClick={() => handleAddressSearch('corporate')}
                        disabled={!corporateForm.isIdChecked || !corporateForm.isIdAvailable}
                      >
                        주소검색
                      </Button>
                    </div>
                    <Input 
                      placeholder="상세주소" 
                      value={corporateForm.detailAddress}
                      onChange={(e) => setCorporateForm(prev => ({ ...prev, detailAddress: e.target.value }))}
                      disabled={!corporateForm.isIdChecked || !corporateForm.isIdAvailable || !corporateForm.address}
                    />
                  </div>
                  
                  {/* 사업자등록증 업로드 */}
                  <div className="space-y-2">
                    <Label htmlFor="businessRegistration">사업자등록증 업로드 (필수)</Label>
                    <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-muted-foreground/50 transition-colors">
                      <input
                        id="businessRegistration"
                        type="file"
                        accept="image/*"
                        onChange={handleBusinessRegistrationUpload}
                        className="hidden"
                      />
                      <label
                        htmlFor="businessRegistration"
                        className="cursor-pointer flex flex-col items-center gap-2"
                      >
                        <Upload className="w-8 h-8 text-muted-foreground" />
                        <div className="text-sm">
                          {corporateForm.businessRegistration ? (
                            <div className="space-y-1">
                              <p className="text-green-600 font-medium">
                                ✓ {corporateForm.businessRegistration.name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                다른 파일을 선택하려면 클릭하세요
                              </p>
                            </div>
                          ) : (
                            <div className="space-y-1">
                              <p className="font-medium">사업자등록증을 업로드하세요</p>
                              <p className="text-xs text-muted-foreground">
                                JPG, PNG, HEIC 등 이미지 파일만 가능
                              </p>
                            </div>
                          )}
                        </div>
                      </label>
                    </div>
                  </div>
                  
                  <div className="bg-secondary/50 p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-2">
                      * 법인회원은 별도 인증 절차가 필요합니다.
                    </p>
                    <p className="text-sm text-muted-foreground">
                      * 가입 승인까지 1-2일 소요될 수 있습니다.
                    </p>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="terms2" 
                        checked={corporateForm.termsAccepted}
                        onCheckedChange={(checked) => setCorporateForm(prev => ({ ...prev, termsAccepted: !!checked }))}
                      />
                      <label htmlFor="terms2" className="text-sm">이용약관에 동의합니다 (필수)</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="privacy2" 
                        checked={corporateForm.privacyAccepted}
                        onCheckedChange={(checked) => setCorporateForm(prev => ({ ...prev, privacyAccepted: !!checked }))}
                      />
                      <label htmlFor="privacy2" className="text-sm">개인정보 처리방침에 동의합니다 (필수)</label>
                    </div>
                  </div>

                  <Button 
                    className="w-full water-drop" 
                    size="lg"
                    disabled={!isCorporateFormValid}
                  >
                    <Building className="w-4 h-4 mr-2" />
                    법인회원 가입 신청
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Register;