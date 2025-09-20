import {useEffect, useState} from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Layout/Header';
import Footer from '@/components/Layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { UserPlus, Building, User, Check, X, Upload, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { authApi, registerApi } from '@/lib/api';
import { API_CONFIG } from '@/lib/config';
import PhoneVerificationModal from '@/components/Auth/PhoneVerificationModal';
import { validatePassword, getPasswordCriteria } from '@/lib/utils';

interface Headquarters {
    id: string;
    name: string;
    businessNumber: string;
    businessNumber1?: string;
    businessNumber2?: string;
    businessNumber3?: string;
  }

const Register = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [individualForm, setIndividualForm] = useState({
    id: '',
    password: '',
    confirmPassword: '',
    name: '',
    email: '',
    termsAccepted: false,
    privacyAccepted: false,
    isIdChecked: false,
    isIdAvailable: false,
    address: '',
    detailAddress: '',
    postalCode: '',
    phone: '',
    isPhoneVerified: false
  });
  const [corporateForm, setCorporateForm] = useState({
    id: '',
    password: '',
    confirmPassword: '',
    email: '',
    companyName: '',
    businessNumber1: '',
    businessNumber2: '',
    businessNumber3: '',
    termsAccepted: false,
    privacyAccepted: false,
    corporateType: '', // 'headquarters', 'franchise', 'single'
    businessType: '',
    businessRegistration: null as File | null,
    isIdChecked: false,
    isIdAvailable: false,
    address: '',
    detailAddress: '',
    postalCode: '',
    phone: '', // 본사용 회사전화번호 (인증 없음)
    isPhoneVerified: false,
    // 프랜차이즈 지점 회원 전용 필드
    headquartersName: '',
    branchName: '',
    headquartersId: '',  // 본사 ID
    managerName: '',     // 매니저 이름
    managerPhone: '',    // 매니저 개인 핸드폰 (인증 필요)
    // 회사 전화번호 (3개 필드로 분리, 인증 없음)
    companyPhone1: '',
    companyPhone2: '',
    companyPhone3: ''
  });
  // 본사 검색 모달 상태
  const [isHeadquartersModalOpen, setIsHeadquartersModalOpen] = useState(false);
  const [headquartersSearchTerm, setHeadquartersSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false); // 검색 중 로딩 상태
  const [searchedHeadquarters, setSearchedHeadquarters] = useState<Headquarters[]>([]);
  
  // 핸드폰 인증 모달 상태
  const [isPhoneModalOpen, setIsPhoneModalOpen] = useState(false);
  const [currentPhoneType, setCurrentPhoneType] = useState<'individual' | 'franchise'>('individual');
  // 검색어가 변경될 때마다 API를 호출 (디바운싱 적용)
  useEffect(() => {
    // 검색어가 비어있으면 목록을 비움
    if (!headquartersSearchTerm.trim()) {
      setSearchedHeadquarters([]);
      return;
    }

    // 디바운싱: 사용자가 타이핑을 멈춘 후 300ms 뒤에 API 호출
    const debounceTimer = setTimeout(() => {
      fetchHeadquarters(headquartersSearchTerm);
    }, 300);

    // 컴포넌트 언마운트 또는 검색어 변경 시 타이머 정리
    return () => clearTimeout(debounceTimer);
  }, [headquartersSearchTerm]);



  // 핸드폰 인증 모달 관련 함수들
  const handlePhoneVerificationClick = (type: 'individual' | 'franchise') => {
    setCurrentPhoneType(type);
    setIsPhoneModalOpen(true);
  };

  const handlePhoneVerificationSuccess = (phoneNumber: string) => {
    if (currentPhoneType === 'individual') {
      setIndividualForm(prev => ({ ...prev, phone: phoneNumber, isPhoneVerified: true }));
    } else if (currentPhoneType === 'franchise') {
      setCorporateForm(prev => ({ ...prev, managerPhone: phoneNumber, isPhoneVerified: true }));
    }
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
          setIndividualForm(prev => ({ ...prev, address: addr, postalCode: data.zonecode }));
        } else {
          setCorporateForm(prev => ({ ...prev, address: addr, postalCode: data.zonecode }));
        }
      }
    }).open();
  };

  const isIndividualPasswordMatch = individualForm.password && individualForm.confirmPassword && individualForm.password === individualForm.confirmPassword;
  const isIndividualPasswordMismatch = individualForm.password && individualForm.confirmPassword && individualForm.password !== individualForm.confirmPassword;
  const isIndividualFormValid = isIndividualPasswordMatch && individualForm.termsAccepted && individualForm.privacyAccepted && individualForm.isIdChecked && individualForm.isIdAvailable && individualForm.email;

  const individualPasswordCriteria = getPasswordCriteria(individualForm.password);

  const isCorporatePasswordMatch = corporateForm.password && corporateForm.confirmPassword && corporateForm.password === corporateForm.confirmPassword;
  const isCorporatePasswordMismatch = corporateForm.password && corporateForm.confirmPassword && corporateForm.password !== corporateForm.confirmPassword;
  const isCorporateFormValid = isCorporatePasswordMatch && 
    corporateForm.termsAccepted && 
    corporateForm.privacyAccepted && 
    corporateForm.corporateType && 
    corporateForm.businessType && 
    corporateForm.isIdChecked && 
    corporateForm.isIdAvailable &&
    corporateForm.email &&
    corporateForm.companyName &&
    corporateForm.businessNumber1 &&
    corporateForm.businessNumber2 &&
    corporateForm.businessNumber3 &&
    corporateForm.address &&
    (corporateForm.corporateType === 'headquarters' ? corporateForm.phone : true) && // 본사는 회사전화번호 필수
    // 프랜차이즈 지점 회원인 경우 추가 검증
    (corporateForm.corporateType !== 'franchise' || (corporateForm.headquartersName && corporateForm.branchName && corporateForm.managerName && corporateForm.managerPhone && corporateForm.isPhoneVerified && corporateForm.companyPhone1 && corporateForm.companyPhone2 && corporateForm.companyPhone3));

  const corporatePasswordCriteria = getPasswordCriteria(corporateForm.password);

  const handleIdCheck = async (type: 'individual' | 'corporate') => {
    const id = type === 'individual' ? individualForm.id : corporateForm.id;
    
    if (!id.trim()) {
      toast({
        title: "오류",
        description: "아이디를 입력해주세요.",
        variant: "destructive"
      });
      return;
    }

    // 아이디 유효성 검사 (영문, 숫자만 허용, 4-20자)
    const idRegex = /^[a-zA-Z0-9]{4,20}$/;
    if (!idRegex.test(id)) {
      toast({
        title: "오류",
        description: "아이디는 영문, 숫자 조합으로 4-20자여야 합니다.",
        variant: "destructive"
      });
      return;
    }

    try {
      const response = await authApi.checkId(id);

      if (!response.ok) {
        throw new Error('서버 오류가 발생했습니다.');
      }

      const data = await response.json();
      const isAvailable = data.available;
      
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
        toast({
          title: "사용 가능",
          description: "사용 가능한 아이디입니다.",
          variant: "default"
        });
      } else {
        toast({
          title: "사용 불가",
          description: "이미 사용중인 아이디입니다.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('ID check error:', error);
      toast({
        title: "오류",
        description: "중복 확인 중 오류가 발생했습니다. 다시 시도해주세요.",
        variant: "destructive"
      });
    }
  };

  const handleBusinessRegistrationUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // 이미지와 PDF 파일 허용
      if (file.type.startsWith('image/') || file.type === 'application/pdf') {
        setCorporateForm(prev => ({ ...prev, businessRegistration: file }));
      } else {
        alert('이미지 파일 또는 PDF 파일만 업로드 가능합니다.');
      }
    }
  };

  // 본사 선택 함수
  const handleHeadquartersSelect = (headquarters: Headquarters) => {
    // 사업자번호 분리 (00-000-00000 형식)
    const businessParts = headquarters.businessNumber.split('-');
    setCorporateForm(prev => ({
      ...prev,
      headquartersName: headquarters.name,
      companyName: headquarters.name, // 회사명도 본사명으로 자동 채우기
      businessNumber1: businessParts[0] || '',
      businessNumber2: businessParts[1] || '',
      businessNumber3: businessParts[2] || '',
      headquartersId: headquarters.id
    }));
    setIsHeadquartersModalOpen(false);
    setHeadquartersSearchTerm(''); // 모달 닫을 때 검색어 초기화
  };

  const fetchHeadquarters = async (term: string) => {
    setIsSearching(true);
    try {
      const response = await registerApi.searchHeadquarters(term);
      if (!response.ok) {
        throw new Error('본사 검색에 실패했습니다.');
      }
      const data = await response.json();
      // 백엔드에서 id가 Long 타입이므로 문자열로 변환
      const formattedData = data.map((hq: any) => ({
        ...hq,
        id: String(hq.id),
      }));
      setSearchedHeadquarters(formattedData);
    } catch (error) {
      console.error(error);
      toast({ title: "오류", description: "본사 검색 중 오류가 발생했습니다.", variant: "destructive" });
    } finally {
      setIsSearching(false);
    }
  };

  // 회원가입 처리 함수
  const handleIndividualRegister = async () => {
    // 비밀번호 유효성 검사
    const passwordValidation = validatePassword(individualForm.password);
    if (!passwordValidation.isValid) {
      toast({
        title: "오류",
        description: passwordValidation.message,
        variant: "destructive"
      });
      return;
    }

    try {
      const requestData = {
        memberType: "individual",
        id: individualForm.id,
        password: individualForm.password,
        name: individualForm.name,
        email: individualForm.email,
        phone: individualForm.phone.replace(/-/g, ''), // 하이픈 제거
        address: individualForm.address,
        detailAddress: individualForm.detailAddress,
        postalCode: individualForm.postalCode,
        termsAccepted: individualForm.termsAccepted,
        privacyAccepted: individualForm.privacyAccepted,
        marketingAccepted: false
      };

      const response = await registerApi.individual(requestData);

      if (response.ok) {
        navigate('/registration-success?type=individual');
      } else {
        throw new Error('회원가입 실패');
      }
    } catch (error) {
      toast({
        title: "오류",
        description: "회원가입 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    }
  };

  const handleCorporateRegister = async () => {
    // 비밀번호 유효성 검사
    const passwordValidation = validatePassword(corporateForm.password);
    if (!passwordValidation.isValid) {
      toast({
        title: "오류",
        description: passwordValidation.message,
        variant: "destructive"
      });
      return;
    }

    try {
      const requestData = {
        memberType: "corporate",
        corporateType: corporateForm.corporateType,
        id: corporateForm.id,
        password: corporateForm.password,
        email: corporateForm.email,
        companyName: corporateForm.companyName,
        businessNumber: `${corporateForm.businessNumber1}-${corporateForm.businessNumber2}-${corporateForm.businessNumber3}`,
        businessType: corporateForm.businessType,
        phone: corporateForm.corporateType === 'headquarters' 
          ? corporateForm.phone.replace(/-/g, '') 
          : corporateForm.corporateType === 'franchise' 
            ? `${corporateForm.companyPhone1}-${corporateForm.companyPhone2}-${corporateForm.companyPhone3}`.replace(/-/g, '')
            : '', // 본사는 회사전화번호, 지점은 회사전화번호
        address: corporateForm.address,
        detailAddress: corporateForm.detailAddress,
        postalCode: corporateForm.postalCode,
        termsAccepted: corporateForm.termsAccepted,
        privacyAccepted: corporateForm.privacyAccepted,
         ...(corporateForm.corporateType === 'franchise' && {
           headquartersId: corporateForm.headquartersId,
           headquartersName: corporateForm.headquartersName,
           branchName: corporateForm.branchName,
           managerName: corporateForm.managerName,
           managerPhone: corporateForm.managerPhone.replace(/-/g, '')
         })
      };

      // 항상 FormData 사용 (파일은 선택 사항)
      const formData = new FormData();
      formData.append('data', JSON.stringify(requestData));
      if (corporateForm.businessRegistration) {
        formData.append('businessRegistration', corporateForm.businessRegistration);
      }
      const body = formData;
      const headers: HeadersInit = {}; // Content-Type은 브라우저가 자동 설정


      // 법인 유형별로 다른 endpoint 사용
      let endpoint;
      switch (corporateForm.corporateType) {
        case 'franchise':
          endpoint = `${API_CONFIG.baseUrl}/api/register/franchise`;
          break;
        case 'headquarters':
          endpoint = `${API_CONFIG.baseUrl}/api/register/headquarters`;
          break;
        case 'single':
        default:
          endpoint = `${API_CONFIG.baseUrl}/api/register/corporate`;
          break;
      }

      // API: POST /api/register/{type} - Register corporate account
      const response = await fetch(endpoint, {
        method: 'POST',
        headers,
        body
      });

      if (response.ok) {
        navigate(`/registration-success?type=${corporateForm.corporateType}`);
      } else {
        throw new Error('회원가입 실패');
      }
    } catch (error) {
      toast({
        title: "오류",
        description: "회원가입 중 오류가 발생했습니다.",
        variant: "destructive"
      });
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
                  <Input 
                    placeholder="이름" 
                    value={individualForm.name}
                    onChange={(e) => setIndividualForm(prev => ({ ...prev, name: e.target.value }))}
                  />
                  
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
                    <div className="space-y-2">
                      <Input 
                        type="password" 
                        placeholder="비밀번호 (영문소문자, 숫자 포함 8자 이상)"
                        value={individualForm.password}
                        onChange={(e) => setIndividualForm(prev => ({ ...prev, password: e.target.value }))}
                        disabled={!individualForm.isIdChecked || !individualForm.isIdAvailable}
                      />
                      {individualForm.password && (
                        <div className="space-y-1 text-sm">
                          <div className={`flex items-center gap-1 ${individualPasswordCriteria.hasMinLength ? 'text-green-600' : 'text-red-600'}`}>
                            {individualPasswordCriteria.hasMinLength ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                            <span>8자 이상</span>
                          </div>
                          <div className={`flex items-center gap-1 ${individualPasswordCriteria.hasLowercase ? 'text-green-600' : 'text-red-600'}`}>
                            {individualPasswordCriteria.hasLowercase ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                            <span>영문소문자 포함</span>
                          </div>
                          <div className={`flex items-center gap-1 ${individualPasswordCriteria.hasNumber ? 'text-green-600' : 'text-red-600'}`}>
                            {individualPasswordCriteria.hasNumber ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                            <span>숫자 포함</span>
                          </div>
                        </div>
                      )}
                    </div>
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
                    placeholder="이메일" 
                    type="email"
                    value={individualForm.email}
                    onChange={(e) => setIndividualForm(prev => ({ ...prev, email: e.target.value }))}
                    disabled={!individualForm.isIdChecked || !individualForm.isIdAvailable}
                  />
                  
                  {/* 핸드폰 인증 */}
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Input 
                        placeholder="핸드폰 인증 버튼을 통해 인증을 해주세요"
                        value={individualForm.phone}
                        readOnly
                        disabled={individualForm.isPhoneVerified}
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => handlePhoneVerificationClick('individual')}
                        disabled={individualForm.isPhoneVerified || !individualForm.isIdChecked || !individualForm.isIdAvailable}
                        className="whitespace-nowrap"
                      >
                        {individualForm.isPhoneVerified ? (
                          <>
                            <Check className="w-4 h-4 mr-1" />
                            인증완료
                          </>
                        ) : (
                          '핸드폰 인증'
                        )}
                      </Button>
                    </div>
                    {individualForm.isPhoneVerified && (
                      <div className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-green-600" />
                        <span className="text-green-600">핸드폰 인증이 완료되었습니다.</span>
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
                    onClick={handleIndividualRegister}
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
                  {/* 법인 유형 선택 */}
                  <div className="space-y-4">
                    <Label className="text-base font-semibold">법인 회원 유형 (필수)</Label>
                    <RadioGroup
                      value={corporateForm.corporateType}
                      onValueChange={(value) => setCorporateForm(prev => ({ 
                        ...prev, 
                        corporateType: value,
                        // 유형 변경 시 관련 필드 초기화
                        headquartersName: '',
                        branchName: ''
                      }))}
                      className="grid grid-cols-1 md:grid-cols-3 gap-4"
                    >
                      <div className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-muted/50">
                        <RadioGroupItem value="headquarters" id="headquarters" />
                        <Label htmlFor="headquarters" className="cursor-pointer flex-1">
                          <div className="font-medium">프랜차이즈 본사 회원</div>
                          <div className="text-sm text-muted-foreground">본사/가맹본부</div>
                        </Label>
                      </div>
                       <div className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-muted/50">
                         <RadioGroupItem value="franchise" id="franchise" />
                         <Label htmlFor="franchise" className="cursor-pointer flex-1">
                           <div className="font-medium">프랜차이즈 지점 회원</div>
                           <div className="text-sm text-muted-foreground">가맹점/지점</div>
                         </Label>
                       </div>
                     </RadioGroup>
                  </div>

                  {/* 법인 업종 선택 */}
                  <div className="space-y-2">
                    <Label htmlFor="businessType">법인 업종 (필수)</Label>
                    <Select 
                      value={corporateForm.businessType}
                      onValueChange={(value) => setCorporateForm(prev => ({ ...prev, businessType: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="프랜차이즈 업종" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fastFood">패스트푸드</SelectItem>
                        <SelectItem value="restaurant">외식업</SelectItem>
                        <SelectItem value="dessertCafe">디저트/카페</SelectItem>
                        <SelectItem value="beauty">미용업</SelectItem>
                        <SelectItem value="retail">소매업</SelectItem>
                        <SelectItem value="education">교육업</SelectItem>
                        <SelectItem value="fitness">피트니스/웰니스</SelectItem>
                        <SelectItem value="automotive">자동차 관련</SelectItem>
                        <SelectItem value="healthcare">의료/헬스케어</SelectItem>
                        <SelectItem value="other">기타</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* 프랜차이즈 지점 전용 필드 */}
                  {corporateForm.corporateType === 'franchise' && (
                    <div className="space-y-4 p-4 border rounded-lg bg-muted/20">
                      <h3 className="text-lg font-semibold text-foreground">프랜차이즈 지점 정보</h3>
                      
                      {/* 본사 검색 및 선택 */}
                      <div className="space-y-2">
                        <Label htmlFor="headquarters">본사명 (필수)</Label>
                        <div className="flex gap-2">
                          <Input 
                            placeholder="본사를 선택해주세요"
                            value={corporateForm.headquartersName}
                            readOnly
                            className="flex-1"
                          />
                          <Dialog open={isHeadquartersModalOpen} onOpenChange={setIsHeadquartersModalOpen}>
                            <DialogTrigger asChild>
                              <Button type="button" variant="outline">
                                <Search className="w-4 h-4 mr-1" />
                                본사 선택
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-md">
                              <DialogHeader>
                                <DialogTitle>본사 선택</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <Input
                                  placeholder="본사명을 검색해주세요"
                                  value={headquartersSearchTerm}
                                  onChange={(e) => setHeadquartersSearchTerm(e.target.value)}
                                  className="w-full"
                                />
                                
                                {isSearching && (
                                  <div className="text-center py-4">
                                    <div className="inline-block w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                                    <p className="mt-2 text-sm text-muted-foreground">검색 중...</p>
                                  </div>
                                )}
                                
                                <div className="max-h-60 overflow-y-auto">
                                  {searchedHeadquarters.length > 0 ? (
                                    <div className="space-y-2">
                                      {searchedHeadquarters.map((hq) => (
                                        <div
                                          key={hq.id}
                                          className="p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                                          onClick={() => handleHeadquartersSelect(hq)}
                                        >
                                          <div className="font-medium">{hq.name}</div>
                                          <div className="text-sm text-muted-foreground">
                                            사업자번호: {hq.businessNumber}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  ) : headquartersSearchTerm.trim() && !isSearching ? (
                                    <div className="text-center py-4 text-muted-foreground">
                                      검색 결과가 없습니다.
                                    </div>
                                  ) : null}
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>

                      {/* 지점명 */}
                      <div className="space-y-2">
                        <Label>지점명 (필수)</Label>
                        <Input 
                          placeholder="지점명을 입력해주세요"
                          value={corporateForm.branchName}
                          onChange={(e) => setCorporateForm(prev => ({ ...prev, branchName: e.target.value }))}
                        />
                      </div>

                      {/* 매니저 이름 */}
                      <div className="space-y-2">
                        <Label>매니저 이름 (필수)</Label>
                        <Input 
                          placeholder="매니저 이름을 입력해주세요"
                          value={corporateForm.managerName}
                          onChange={(e) => setCorporateForm(prev => ({ ...prev, managerName: e.target.value }))}
                        />
                      </div>

                      {/* 매니저 연락처 */}
                      <div className="space-y-2">
                        <Label>매니저 연락처 (필수)</Label>
                        <div className="flex gap-2">
                          <Input 
                            placeholder="핸드폰 인증 버튼을 통해 인증을 해주세요"
                            value={corporateForm.managerPhone}
                            readOnly
                            disabled={corporateForm.isPhoneVerified}
                            className="flex-1"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => handlePhoneVerificationClick('franchise')}
                            disabled={corporateForm.isPhoneVerified}
                            className="whitespace-nowrap"
                          >
                            {corporateForm.isPhoneVerified ? (
                              <>
                                <Check className="w-4 h-4 mr-1" />
                                인증완료
                              </>
                            ) : (
                              '핸드폰 인증'
                            )}
                          </Button>
                        </div>
                        {corporateForm.isPhoneVerified && (
                          <div className="flex items-center gap-2 text-sm">
                            <Check className="w-4 h-4 text-green-600" />
                            <span className="text-green-600">핸드폰 인증이 완료되었습니다.</span>
                          </div>
                        )}
                      </div>

                      {/* 회사 전화번호 (3개 필드, 인증 없음) */}
                      <div className="space-y-2">
                        <Label>회사 전화번호 (필수)</Label>
                        <div className="flex gap-2">
                          <Input 
                            placeholder="02"
                            maxLength={3}
                            value={corporateForm.companyPhone1}
                            onChange={(e) => setCorporateForm(prev => ({ ...prev, companyPhone1: e.target.value }))}
                            className="flex-1"
                          />
                          <span className="flex items-center">-</span>
                          <Input 
                            placeholder="1234"
                            maxLength={4}
                            value={corporateForm.companyPhone2}
                            onChange={(e) => setCorporateForm(prev => ({ ...prev, companyPhone2: e.target.value }))}
                            className="flex-1"
                          />
                          <span className="flex items-center">-</span>
                          <Input 
                            placeholder="5678"
                            maxLength={4}
                            value={corporateForm.companyPhone3}
                            onChange={(e) => setCorporateForm(prev => ({ ...prev, companyPhone3: e.target.value }))}
                            className="flex-1"
                          />
                        </div>
                      </div>

                      {/* 주소 입력 */}
                      <div className="space-y-4">
                        <Label>주소 (필수)</Label>
                        <div className="flex gap-2">
                          <Input 
                            placeholder="주소" 
                            value={corporateForm.address}
                            readOnly
                            className="flex-1"
                          />
                          <Button 
                            type="button"
                            variant="outline" 
                            onClick={() => handleAddressSearch('corporate')}
                          >
                            주소검색
                          </Button>
                        </div>
                        <Input 
                          placeholder="상세주소" 
                          value={corporateForm.detailAddress}
                          onChange={(e) => setCorporateForm(prev => ({ ...prev, detailAddress: e.target.value }))}
                          disabled={!corporateForm.address}
                        />
                      </div>
                    </div>
                  )}

                  {/* 회사명 */}
                  <div className="space-y-2">
                    <Label>회사명 (필수)</Label>
                    <Input 
                      placeholder="회사명" 
                      value={corporateForm.companyName}
                      onChange={(e) => setCorporateForm(prev => ({ ...prev, companyName: e.target.value }))}
                    />
                  </div>

                  {/* 사업자등록번호 */}
                  <div className="space-y-2">
                    <Label>사업자등록번호 (필수)</Label>
                    <div className="flex gap-2">
                      <Input 
                        placeholder="00"
                        maxLength={2}
                        value={corporateForm.businessNumber1}
                        onChange={(e) => setCorporateForm(prev => ({ ...prev, businessNumber1: e.target.value }))}
                        className="flex-1"
                      />
                      <span className="flex items-center">-</span>
                      <Input 
                        placeholder="000"
                        maxLength={3}
                        value={corporateForm.businessNumber2}
                        onChange={(e) => setCorporateForm(prev => ({ ...prev, businessNumber2: e.target.value }))}
                        className="flex-1"
                      />
                      <span className="flex items-center">-</span>
                      <Input 
                        placeholder="00000"
                        maxLength={5}
                        value={corporateForm.businessNumber3}
                        onChange={(e) => setCorporateForm(prev => ({ ...prev, businessNumber3: e.target.value }))}
                        className="flex-1"
                      />
                    </div>
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
                    <div className="space-y-2">
                      <Input 
                        type="password" 
                        placeholder="비밀번호 (영문소문자, 숫자 포함 8자 이상)"
                        value={corporateForm.password}
                        onChange={(e) => setCorporateForm(prev => ({ ...prev, password: e.target.value }))}
                        disabled={!corporateForm.isIdChecked || !corporateForm.isIdAvailable}
                      />
                      {corporateForm.password && (
                        <div className="space-y-1 text-sm">
                          <div className={`flex items-center gap-1 ${corporatePasswordCriteria.hasMinLength ? 'text-green-600' : 'text-red-600'}`}>
                            {corporatePasswordCriteria.hasMinLength ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                            <span>8자 이상</span>
                          </div>
                          <div className={`flex items-center gap-1 ${corporatePasswordCriteria.hasLowercase ? 'text-green-600' : 'text-red-600'}`}>
                            {corporatePasswordCriteria.hasLowercase ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                            <span>영문소문자 포함</span>
                          </div>
                          <div className={`flex items-center gap-1 ${corporatePasswordCriteria.hasNumber ? 'text-green-600' : 'text-red-600'}`}>
                            {corporatePasswordCriteria.hasNumber ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                            <span>숫자 포함</span>
                          </div>
                        </div>
                      )}
                    </div>
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
                  {/* 이메일 */}
                  <div className="space-y-2">
                    <Label>이메일 (필수) - ID/PW를 찾을 때 사용될 수 있습니다.</Label>
                    <Input
                      placeholder="example@email.com" 
                      type="email"
                      value={corporateForm.email}
                      onChange={(e) => setCorporateForm(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full"
                    />
                  </div>

                  {/* 전화번호 - 본사는 회사전화번호 */}
                  {corporateForm.corporateType === 'headquarters' && (
                    // 본사: 회사 전화번호 (인증 없음)
                    <div className="space-y-2">
                      <Label>회사 전화번호 (필수)</Label>
                      <Input 
                        placeholder="02-1234-5678"
                        value={corporateForm.phone}
                        onChange={(e) => setCorporateForm(prev => ({ ...prev, phone: e.target.value }))}
                        disabled={!corporateForm.isIdChecked || !corporateForm.isIdAvailable}
                      />
                    </div>
                  )}
                  
                  {/* 주소 입력 - 본사만 */}
                  {corporateForm.corporateType === 'headquarters' && (
                    <div className="space-y-4">
                      <div className="flex gap-2">
                        <Input 
                          placeholder="주소" 
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
                  )}
                  
                  {/* 사업자등록증 업로드 */}
                  <div className="space-y-2">
                    <Label htmlFor="businessRegistration">사업자등록증 업로드 (선택)</Label>
                    <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-muted-foreground/50 transition-colors">
                      <input
                        id="businessRegistration"
                        type="file"
                        accept="image/*,.pdf"
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
                                이미지 파일(JPG, PNG, HEIC) 또는 PDF 파일
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
                    onClick={handleCorporateRegister}
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
      
      {/* 핸드폰 인증 모달 */}
      <PhoneVerificationModal
        isOpen={isPhoneModalOpen}
        onClose={() => setIsPhoneModalOpen(false)}
        onVerificationSuccess={handlePhoneVerificationSuccess}
      />
    </div>
  );
};

export default Register;