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
  
  // 약관 모달 상태
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [currentTermsType, setCurrentTermsType] = useState<'individual' | 'corporate'>('individual');

  // 약관 동의 처리
  const handleTermsAgree = () => {
    if (currentTermsType === 'individual') {
      setIndividualForm(prev => ({ ...prev, termsAccepted: true }));
    } else {
      setCorporateForm(prev => ({ ...prev, termsAccepted: true }));
    }
    setIsTermsModalOpen(false);
  };

  const handlePrivacyAgree = () => {
    if (currentTermsType === 'individual') {
      setIndividualForm(prev => ({ ...prev, privacyAccepted: true }));
    } else {
      setCorporateForm(prev => ({ ...prev, privacyAccepted: true }));
    }
    setIsPrivacyModalOpen(false);
  };
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
                  
                  <div className="space-y-2">
                    <div className="space-y-1">
                      <Label>이메일 (필수)</Label>
                      <p className="text-xs text-muted-foreground">ID/PW를 찾을 때 사용될 수 있습니다.</p>
                    </div>
                    <Input 
                      placeholder="example@email.com" 
                      type="email"
                      value={individualForm.email}
                      onChange={(e) => setIndividualForm(prev => ({ ...prev, email: e.target.value }))}
                      disabled={!individualForm.isIdChecked || !individualForm.isIdAvailable}
                    />
                  </div>
                  
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
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="terms1" 
                          checked={individualForm.termsAccepted}
                          disabled
                        />
                        <label htmlFor="terms1" className="text-sm">
                          이용약관에 동의합니다 (필수)
                        </label>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setCurrentTermsType('individual');
                          setIsTermsModalOpen(true);
                        }}
                      >
                        {individualForm.termsAccepted ? '확인' : '보기'}
                      </Button>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="privacy1" 
                          checked={individualForm.privacyAccepted}
                          disabled
                        />
                        <label htmlFor="privacy1" className="text-sm">
                          개인정보 처리방침에 동의합니다 (필수)
                        </label>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setCurrentTermsType('individual');
                          setIsPrivacyModalOpen(true);
                        }}
                      >
                        {individualForm.privacyAccepted ? '확인' : '보기'}
                      </Button>
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
                    <div className="space-y-1">
                      <Label>이메일 (필수)</Label>
                      <p className="text-xs text-muted-foreground">ID/PW를 찾을 때 사용될 수 있습니다.</p>
                    </div>
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
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="terms2" 
                          checked={corporateForm.termsAccepted}
                          disabled
                        />
                        <label htmlFor="terms2" className="text-sm">
                          이용약관에 동의합니다 (필수)
                        </label>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setCurrentTermsType('corporate');
                          setIsTermsModalOpen(true);
                        }}
                      >
                        {corporateForm.termsAccepted ? '확인' : '보기'}
                      </Button>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="privacy2" 
                          checked={corporateForm.privacyAccepted}
                          disabled
                        />
                        <label htmlFor="privacy2" className="text-sm">
                          개인정보 처리방침에 동의합니다 (필수)
                        </label>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setCurrentTermsType('corporate');
                          setIsPrivacyModalOpen(true);
                        }}
                      >
                        {corporateForm.privacyAccepted ? '확인' : '보기'}
                      </Button>
                    </div>
                  </div>

                  {/* 미완료 필드 안내 */}
                  {!isCorporateFormValid && (
                    <div className="p-4 border border-destructive/50 bg-destructive/10 rounded-lg">
                      <div className="flex items-start gap-2 mb-3">
                        <X className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <h4 className="font-semibold text-sm text-destructive mb-2">다음 항목을 완료해주세요:</h4>
                          <ul className="space-y-1.5 text-sm">
                            {!corporateForm.corporateType && (
                              <li className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-destructive"></span>
                                <span>법인 회원 유형을 선택해주세요</span>
                              </li>
                            )}
                            {!corporateForm.businessType && (
                              <li className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-destructive"></span>
                                <span>법인 업종을 선택해주세요</span>
                              </li>
                            )}
                            {corporateForm.corporateType === 'franchise' && !corporateForm.headquartersName && (
                              <li className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-destructive"></span>
                                <span>본사를 선택해주세요</span>
                              </li>
                            )}
                            {corporateForm.corporateType === 'franchise' && !corporateForm.branchName && (
                              <li className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-destructive"></span>
                                <span>지점명을 입력해주세요</span>
                              </li>
                            )}
                            {corporateForm.corporateType === 'franchise' && !corporateForm.managerName && (
                              <li className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-destructive"></span>
                                <span>매니저 이름을 입력해주세요</span>
                              </li>
                            )}
                            {corporateForm.corporateType === 'franchise' && !corporateForm.isPhoneVerified && (
                              <li className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-destructive"></span>
                                <span>매니저 핸드폰 인증을 완료해주세요</span>
                              </li>
                            )}
                            {corporateForm.corporateType === 'franchise' && (!corporateForm.companyPhone1 || !corporateForm.companyPhone2 || !corporateForm.companyPhone3) && (
                              <li className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-destructive"></span>
                                <span>회사 전화번호를 입력해주세요</span>
                              </li>
                            )}
                            {corporateForm.corporateType === 'franchise' && !corporateForm.address && (
                              <li className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-destructive"></span>
                                <span>주소를 검색해주세요</span>
                              </li>
                            )}
                            {!corporateForm.companyName && (
                              <li className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-destructive"></span>
                                <span>회사명을 입력해주세요</span>
                              </li>
                            )}
                            {(!corporateForm.businessNumber1 || !corporateForm.businessNumber2 || !corporateForm.businessNumber3) && (
                              <li className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-destructive"></span>
                                <span>사업자등록번호를 입력해주세요</span>
                              </li>
                            )}
                            {!corporateForm.isIdAvailable && (
                              <li className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-destructive"></span>
                                <span>아이디 중복확인을 완료해주세요</span>
                              </li>
                            )}
                            {!isCorporatePasswordMatch && (
                              <li className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-destructive"></span>
                                <span>비밀번호를 확인해주세요</span>
                              </li>
                            )}
                            {!corporateForm.email && (
                              <li className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-destructive"></span>
                                <span>이메일을 입력해주세요</span>
                              </li>
                            )}
                            {corporateForm.corporateType === 'headquarters' && !corporateForm.phone && (
                              <li className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-destructive"></span>
                                <span>회사 전화번호를 입력해주세요</span>
                              </li>
                            )}
                            {corporateForm.corporateType === 'headquarters' && !corporateForm.address && (
                              <li className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-destructive"></span>
                                <span>주소를 검색해주세요</span>
                              </li>
                            )}
                            {!corporateForm.termsAccepted && (
                              <li className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-destructive"></span>
                                <span>이용약관에 동의해주세요</span>
                              </li>
                            )}
                            {!corporateForm.privacyAccepted && (
                              <li className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-destructive"></span>
                                <span>개인정보 처리방침에 동의해주세요</span>
                              </li>
                            )}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}

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

      {/* 이용약관 모달 */}
      <Dialog open={isTermsModalOpen} onOpenChange={setIsTermsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>이용약관</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 text-sm overflow-y-auto flex-1 pr-2">
            <section>
              <h3 className="font-semibold text-base mb-2">제1조 (목적)</h3>
              <p className="text-muted-foreground leading-relaxed">
                이 약관은 DRAGON COMPANY(전자상거래 사업자)가 운영하는 DRAGON WATER 사이버 몰(이하 "몰"이라 한다)에서 제공하는 인터넷 관련 서비스(이하 "서비스"라 한다)를 이용함에 있어 사이버 몰과 이용자의 권리․의무 및 책임사항을 규정함을 목적으로 합니다.
              </p>
              <p className="text-xs text-muted-foreground/80 mt-2">
                ※「PC통신, 무선 등을 이용하는 전자상거래에 대해서도 그 성질에 반하지 않는 한 이 약관을 준용합니다.」
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">제2조 (정의)</h3>
              <ul className="space-y-2 text-muted-foreground leading-relaxed">
                <li>① "몰"이란 DRAGON COMPANY가 재화 또는 용역(이하 "재화 등"이라 함)을 이용자에게 제공하기 위하여 컴퓨터 등 정보통신설비를 이용하여 재화 등을 거래할 수 있도록 설정한 가상의 영업장을 말하며, 아울러 사이버몰을 운영하는 사업자의 의미로도 사용합니다.</li>
                <li>② "이용자"란 "몰"에 접속하여 이 약관에 따라 "몰"이 제공하는 서비스를 받는 회원 및 비회원을 말합니다.</li>
                <li>③ '회원'이라 함은 "몰"에 회원등록을 한 자로서, 계속적으로 "몰"이 제공하는 서비스를 이용할 수 있는 자를 말합니다.</li>
                <li>④ '비회원'이라 함은 회원에 가입하지 않고 "몰"이 제공하는 서비스를 이용하는 자를 말합니다.</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">제3조 (약관 등의 명시와 설명 및 개정)</h3>
              <ul className="space-y-2 text-muted-foreground leading-relaxed">
                <li>① "몰"은 이 약관의 내용과 상호 및 대표자 성명, 영업소 소재지 주소, 전화번호, 사업자등록번호, 통신판매업 신고번호, 개인정보관리책임자 등을 이용자가 쉽게 알 수 있도록 초기 서비스화면에 게시합니다.</li>
                <li>② "몰"은 이용자가 약관에 동의하기에 앞서 약관에 정하여져 있는 내용 중 청약철회․배송책임․환불조건 등과 같은 중요한 내용을 이용자가 이해할 수 있도록 별도의 연결화면 또는 팝업화면 등을 제공하여 이용자의 확인을 구하여야 합니다.</li>
                <li>③ "몰"은 「전자상거래 등에서의 소비자보호에 관한 법률」, 「약관의 규제에 관한 법률」, 「전자문서 및 전자거래기본법」, 「전자금융거래법」, 「전자서명법」, 「정보통신망 이용촉진 및 정보보호 등에 관한 법률」, 「방문판매 등에 관한 법률」, 「소비자기본법」 등 관련 법을 위배하지 않는 범위에서 이 약관을 개정할 수 있습니다.</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">제4조 (서비스의 제공 및 변경)</h3>
              <ul className="space-y-2 text-muted-foreground leading-relaxed">
                <li>① "몰"은 다음과 같은 업무를 수행합니다:
                  <ul className="list-disc ml-6 mt-1 space-y-1">
                    <li>재화 또는 용역에 대한 정보 제공 및 구매계약의 체결</li>
                    <li>구매계약이 체결된 재화 또는 용역의 배송</li>
                    <li>기타 "몰"이 정하는 업무</li>
                  </ul>
                </li>
                <li>② "몰"은 재화 또는 용역의 품절 또는 기술적 사양의 변경 등의 경우에는 장차 체결되는 계약에 의해 제공할 재화 또는 용역의 내용을 변경할 수 있습니다.</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">제5조 (서비스의 중단)</h3>
              <ul className="space-y-2 text-muted-foreground leading-relaxed">
                <li>① "몰"은 컴퓨터 등 정보통신설비의 보수점검․교체 및 고장, 통신의 두절 등의 사유가 발생한 경우에는 서비스의 제공을 일시적으로 중단할 수 있습니다.</li>
                <li>② 사업종목의 전환, 사업의 포기, 업체 간의 통합 등의 이유로 서비스를 제공할 수 없게 되는 경우에는 "몰"은 제8조에 정한 방법으로 이용자에게 통지하고 당초 "몰"에서 제시한 조건에 따라 소비자에게 보상합니다.</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">제6조 (회원가입)</h3>
              <ul className="space-y-2 text-muted-foreground leading-relaxed">
                <li>① 이용자는 "몰"이 정한 가입 양식에 따라 회원정보를 기입한 후 이 약관에 동의한다는 의사표시를 함으로서 회원가입을 신청합니다.</li>
                <li>② "몰"은 제1항과 같이 회원으로 가입할 것을 신청한 이용자 중 다음 각 호에 해당하지 않는 한 회원으로 등록합니다:
                  <ul className="list-disc ml-6 mt-1 space-y-1">
                    <li>등록 내용에 허위, 기재누락, 오기가 있는 경우</li>
                    <li>기타 회원으로 등록하는 것이 "몰"의 기술상 현저히 지장이 있다고 판단되는 경우</li>
                  </ul>
                </li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">제7조 (회원 탈퇴 및 자격 상실 등)</h3>
              <ul className="space-y-2 text-muted-foreground leading-relaxed">
                <li>① 회원은 "몰"에 언제든지 탈퇴를 요청할 수 있으며 "몰"은 즉시 회원탈퇴를 처리합니다.</li>
                <li>② 회원이 다음 각 호의 사유에 해당하는 경우, "몰"은 회원자격을 제한 및 정지시킬 수 있습니다:
                  <ul className="list-disc ml-6 mt-1 space-y-1">
                    <li>가입 신청 시에 허위 내용을 등록한 경우</li>
                    <li>"몰"을 이용하여 법령 또는 이 약관이 금지하거나 공서양속에 반하는 행위를 하는 경우</li>
                  </ul>
                </li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">제8조 (회원에 대한 통지)</h3>
              <p className="text-muted-foreground leading-relaxed">
                ① "몰"이 회원에 대한 통지를 하는 경우, 회원이 "몰"과 미리 약정하여 지정한 전자우편 주소로 할 수 있습니다.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">제9조 (구매신청 및 개인정보 제공 동의 등)</h3>
              <ul className="space-y-2 text-muted-foreground leading-relaxed">
                <li>① "몰"이용자는 "몰"상에서 다음 또는 이와 유사한 방법에 의하여 구매를 신청하며, "몰"은 이용자가 구매신청을 함에 있어서 다음의 각 내용을 알기 쉽게 제공하여야 합니다:
                  <ul className="list-disc ml-6 mt-1 space-y-1">
                    <li>재화 등의 검색 및 선택</li>
                    <li>받는 사람의 성명, 주소, 전화번호, 전자우편주소 등의 입력</li>
                    <li>약관내용, 청약철회권이 제한되는 서비스, 배송료․설치비 등의 비용부담 확인</li>
                  </ul>
                </li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">제10조 (계약의 성립)</h3>
              <ul className="space-y-2 text-muted-foreground leading-relaxed">
                <li>① "몰"은 제9조와 같은 구매신청에 대하여 다음 각 호에 해당하면 승낙하지 않을 수 있습니다:
                  <ul className="list-disc ml-6 mt-1 space-y-1">
                    <li>신청 내용에 허위, 기재누락, 오기가 있는 경우</li>
                    <li>미성년자가 담배, 주류 등 청소년보호법에서 금지하는 재화를 구매하는 경우</li>
                  </ul>
                </li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">제11조 (지급방법)</h3>
              <p className="text-muted-foreground leading-relaxed">
                "몰"에서 구매한 재화 또는 용역에 대한 대금지급방법은 계좌이체, 신용카드 결제, 온라인무통장입금 등의 방법으로 할 수 있습니다.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">제12조 (청약철회 등)</h3>
              <ul className="space-y-2 text-muted-foreground leading-relaxed">
                <li>① "몰"과 재화등의 구매에 관한 계약을 체결한 이용자는 「전자상거래 등에서의 소비자보호에 관한 법률」 제13조 제2항에 따라 계약내용에 관한 서면을 받은 날부터 7일 이내에는 청약의 철회를 할 수 있습니다.</li>
                <li>② 이용자는 재화 등을 배송 받은 경우 다음 각 호의 경우에는 반품 및 교환을 할 수 없습니다:
                  <ul className="list-disc ml-6 mt-1 space-y-1">
                    <li>이용자에게 책임 있는 사유로 재화 등이 멸실 또는 훼손된 경우</li>
                    <li>이용자의 사용 또는 일부 소비에 의하여 재화 등의 가치가 현저히 감소한 경우</li>
                  </ul>
                </li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">제13조 (개인정보보호)</h3>
              <ul className="space-y-2 text-muted-foreground leading-relaxed">
                <li>① "몰"은 이용자의 개인정보 수집시 서비스제공을 위하여 필요한 범위에서 최소한의 개인정보를 수집합니다.</li>
                <li>② "몰"은 이용자의 개인정보를 수집·이용하는 때에는 당해 이용자에게 그 목적을 고지하고 동의를 받습니다.</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">제14조 (분쟁해결)</h3>
              <p className="text-muted-foreground leading-relaxed">
                ① "몰"은 이용자가 제기하는 정당한 의견이나 불만을 반영하고 그 피해를 보상처리하기 위하여 피해보상처리기구를 설치․운영합니다.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">제15조 (재판권 및 준거법)</h3>
              <ul className="space-y-2 text-muted-foreground leading-relaxed">
                <li>① "몰"과 이용자 간에 발생한 전자상거래 분쟁에 관한 소송은 제소 당시의 이용자의 주소에 의하고, 주소가 없는 경우에는 거소를 관할하는 지방법원의 전속관할로 합니다.</li>
                <li>② "몰"과 이용자 간에 제기된 전자상거래 소송에는 한국법을 적용합니다.</li>
              </ul>
            </section>
          </div>
          <div className="flex gap-2 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setIsTermsModalOpen(false)}
              className="flex-1"
            >
              취소
            </Button>
            <Button
              onClick={handleTermsAgree}
              className="flex-1"
            >
              동의합니다
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* 개인정보 처리방침 모달 */}
      <Dialog open={isPrivacyModalOpen} onOpenChange={setIsPrivacyModalOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>개인정보 처리방침</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 text-sm overflow-y-auto flex-1 pr-2">
            <section>
              <h3 className="font-semibold text-base mb-2">1. 개인정보의 수집 및 이용 목적</h3>
              <p className="text-muted-foreground mb-2 leading-relaxed">
                DRAGON COMPANY(이하 "회사")는 다음의 목적을 위해 개인정보를 처리합니다:
              </p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4 leading-relaxed">
                <li>회원 가입 및 관리: 회원 가입의사 확인, 회원제 서비스 제공, 본인 식별․인증, 회원자격 유지․관리</li>
                <li>재화 또는 서비스 제공: 물품 배송, 서비스 제공, 계약서․청구서 발송, 콘텐츠 제공, 맞춤 서비스 제공</li>
                <li>고객 상담 및 민원 처리: 민원사항 확인, 사실조사를 위한 연락․통지, 처리결과 통보</li>
                <li>마케팅 및 광고 활용: 신규 서비스 개발 및 맞춤 서비스 제공, 이벤트 및 광고성 정보 제공 (선택사항)</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">2. 수집하는 개인정보의 항목</h3>
              <p className="text-muted-foreground mb-2 leading-relaxed">
                회사는 회원가입, 상담, 서비스 신청 등을 위해 아래와 같은 개인정보를 수집하고 있습니다:
              </p>
              <ul className="space-y-2 text-muted-foreground leading-relaxed">
                <li>① 개인회원 필수항목: 이름, 아이디, 비밀번호, 이메일, 전화번호, 주소</li>
                <li>② 법인회원 추가항목: 회사명, 사업자등록번호, 대표자명, 회사 전화번호, 회사 주소</li>
                <li>③ 서비스 이용 과정에서 자동으로 생성되어 수집될 수 있는 정보: IP주소, 쿠키, 서비스 이용 기록, 방문 기록, 불량 이용 기록 등</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">3. 개인정보의 처리 및 보유 기간</h3>
              <p className="text-muted-foreground mb-2 leading-relaxed">
                회사는 법령에 따른 개인정보 보유․이용기간 또는 정보주체로부터 개인정보를 수집 시에 동의받은 개인정보 보유․이용기간 내에서 개인정보를 처리․보유합니다.
              </p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4 leading-relaxed">
                <li>회원 탈퇴 시까지 (단, 관계 법령 위반에 따른 수사․조사 등이 진행 중인 경우에는 해당 수사․조사 종료 시까지)</li>
                <li>전자상거래법에 따른 보존 의무:
                  <ul className="list-circle ml-6 mt-1 space-y-1">
                    <li>계약 또는 청약철회 등에 관한 기록: 5년</li>
                    <li>대금결제 및 재화 등의 공급에 관한 기록: 5년</li>
                    <li>소비자의 불만 또는 분쟁처리에 관한 기록: 3년</li>
                  </ul>
                </li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">4. 개인정보의 제3자 제공에 관한 사항</h3>
              <p className="text-muted-foreground leading-relaxed">
                회사는 원칙적으로 이용자의 개인정보를 외부에 제공하지 않습니다. 다만, 아래의 경우에는 예외로 합니다:
              </p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4 mt-2 leading-relaxed">
                <li>이용자들이 사전에 동의한 경우</li>
                <li>법령의 규정에 의거하거나, 수사 목적으로 법령에 정해진 절차와 방법에 따라 수사기관의 요구가 있는 경우</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">5. 개인정보 처리의 위탁에 관한 사항</h3>
              <p className="text-muted-foreground leading-relaxed">
                회사는 원활한 서비스 제공을 위해 필요한 경우 개인정보 처리업무를 외부 전문업체에 위탁하여 운영할 수 있습니다. 이 경우 개인정보 보호법 제26조에 따라 위탁계약 시 개인정보가 안전하게 관리될 수 있도록 필요한 사항을 규정하고 있습니다.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">6. 정보주체와 법정대리인의 권리․의무 및 그 행사방법</h3>
              <p className="text-muted-foreground mb-2 leading-relaxed">
                이용자는 개인정보주체로서 다음과 같은 권리를 행사할 수 있습니다:
              </p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4 leading-relaxed">
                <li>개인정보 열람 요구</li>
                <li>오류 등이 있을 경우 정정 요구</li>
                <li>삭제 요구</li>
                <li>처리정지 요구</li>
              </ul>
              <p className="text-muted-foreground mt-2 leading-relaxed">
                위 권리 행사는 개인정보 보호법 시행규칙 별지 제8호 서식에 따라 서면, 전자우편 등을 통하여 하실 수 있으며 회사는 이에 대해 지체 없이 조치하겠습니다.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">7. 개인정보의 파기절차 및 파기방법</h3>
              <p className="text-muted-foreground mb-2 leading-relaxed">
                회사는 원칙적으로 개인정보 처리목적이 달성된 경우에는 지체없이 해당 개인정보를 파기합니다. 파기의 절차, 기한 및 방법은 다음과 같습니다:
              </p>
              <ul className="space-y-2 text-muted-foreground leading-relaxed">
                <li>① 파기절차: 이용자가 입력한 정보는 목적 달성 후 별도의 DB에 옮겨져 내부 방침 및 기타 관련 법령에 따라 일정기간 저장된 후 혹은 즉시 파기됩니다.</li>
                <li>② 파기방법: 전자적 파일 형태의 정보는 기록을 재생할 수 없는 기술적 방법을 사용합니다. 종이에 출력된 개인정보는 분쇄기로 분쇄하거나 소각을 통하여 파기합니다.</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">8. 개인정보의 안전성 확보 조치</h3>
              <p className="text-muted-foreground mb-2 leading-relaxed">
                회사는 개인정보보호법 제29조에 따라 다음과 같이 안전성 확보에 필요한 기술적/관리적 및 물리적 조치를 하고 있습니다:
              </p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4 leading-relaxed">
                <li>개인정보 취급 직원의 최소화 및 교육: 개인정보를 취급하는 직원을 지정하고 담당자에 한정시켜 최소화</li>
                <li>개인정보의 암호화: 이용자의 개인정보는 비밀번호는 암호화 되어 저장 및 관리</li>
                <li>해킹 등에 대비한 기술적 대책: 해킹이나 컴퓨터 바이러스 등에 의한 개인정보 유출 및 훼손을 막기 위하여 보안프로그램을 설치하고 주기적인 갱신·점검</li>
                <li>개인정보에 대한 접근 제한: 개인정보를 처리하는 데이터베이스시스템에 대한 접근권한의 부여, 변경, 말소를 통하여 개인정보에 대한 접근통제를 위하여 필요한 조치</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">9. 개인정보 보호책임자 및 담당부서</h3>
              <p className="text-muted-foreground mb-2 leading-relaxed">
                회사는 개인정보 처리에 관한 업무를 총괄해서 책임지고, 개인정보 처리와 관련한 정보주체의 불만처리 및 피해구제 등을 위하여 아래와 같이 개인정보 보호책임자를 지정하고 있습니다:
              </p>
              <ul className="space-y-1 text-muted-foreground ml-4 leading-relaxed">
                <li>▶ 개인정보 보호책임자</li>
                <li>성명: 문용현</li>
                <li>직책: 대표</li>
                <li>연락처: 010-4658-7418, ttgy61@naver.com</li>
              </ul>
              <p className="text-muted-foreground mt-2 leading-relaxed">
                ※ 개인정보 보호 담당부서로 연결됩니다.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">10. 개인정보 열람청구</h3>
              <p className="text-muted-foreground leading-relaxed">
                정보주체는 개인정보 보호법 제35조에 따른 개인정보의 열람 청구를 아래의 부서에 할 수 있습니다. 회사는 정보주체의 개인정보 열람청구가 신속하게 처리되도록 노력하겠습니다.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">11. 권익침해 구제방법</h3>
              <p className="text-muted-foreground mb-2 leading-relaxed">
                정보주체는 개인정보침해로 인한 구제를 받기 위하여 개인정보분쟁조정위원회, 한국인터넷진흥원 개인정보침해신고센터 등에 분쟁해결이나 상담 등을 신청할 수 있습니다:
              </p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4 leading-relaxed">
                <li>개인정보분쟁조정위원회: (국번없이) 1833-6972 (www.kopico.go.kr)</li>
                <li>개인정보침해신고센터: (국번없이) 118 (privacy.kisa.or.kr)</li>
                <li>대검찰청: (국번없이) 1301 (www.spo.go.kr)</li>
                <li>경찰청: (국번없이) 182 (ecrm.cyber.go.kr)</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">12. 개인정보 처리방침의 변경</h3>
              <p className="text-muted-foreground leading-relaxed">
                본 개인정보 처리방침은 법령․정책 또는 보안기술의 변경에 따라 내용의 추가․삭제 및 수정이 있을 시에는 변경사항의 시행 7일 전부터 홈페이지의 '공지사항'을 통하여 고지할 것입니다.
              </p>
            </section>
          </div>
          <div className="flex gap-2 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setIsPrivacyModalOpen(false)}
              className="flex-1"
            >
              취소
            </Button>
            <Button
              onClick={handlePrivacyAgree}
              className="flex-1"
            >
              동의합니다
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Register;