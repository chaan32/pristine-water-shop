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

interface Headquarters {
  id: string;
  name: string;
  businessNumber: string;
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
    businessNumber: '',
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
    phone: '',
    isPhoneVerified: false,
    // 프랜차이즈 지점 회원 전용 필드
    headquartersName: '',
    branchName: '',
    headquartersId: ''  // 본사 ID
  });

  // 본사 검색 모달 상태
  const [isHeadquartersModalOpen, setIsHeadquartersModalOpen] = useState(false);
  const [headquartersSearchTerm, setHeadquartersSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false); // 검색 중 로딩 상태
  const [searchedHeadquarters, setSearchedHeadquarters] = useState<Headquarters[]>([]);
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




  // 임시 본사 데이터 (실제로는 API에서 가져옴)
  const mockHeadquarters = [
    { id: '1', name: '스타벅스 코리아', businessNumber: '123-45-67890' },
    { id: '2', name: '맥도날드 코리아', businessNumber: '234-56-78901' },
    { id: '3', name: '롯데리아', businessNumber: '345-67-89012' },
    { id: '4', name: 'KFC 코리아', businessNumber: '456-78-90123' },
    { id: '5', name: '버거킹 코리아', businessNumber: '567-89-01234' },
  ];

  const filteredHeadquarters = mockHeadquarters.filter(hq => 
    hq.name.toLowerCase().includes(headquartersSearchTerm.toLowerCase())
  );

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

    /*
    ==================== API 요청 명세 (휴대폰 인증) ====================
    Method: POST
    URL: http://localhost:8080/api/verify/phone
    Headers: {
      'Content-Type': 'application/json'
    }
    
    Request Body:
    {
      "phone": string,          // 휴대폰 번호 (하이픈 포함/미포함 모두 지원)
      "type": "sms" | "call"   // 인증 방식 (SMS 또는 음성통화)
    }
    
    ==================== 예상 응답 명세 ====================
    성공 시 (200 OK):
    {
      "success": true,
      "message": "인증번호가 발송되었습니다.",
      "verificationId": string, // 인증 세션 ID
      "expiresAt": string      // 만료 시간 (ISO 8601 형식)
    }
    
    실패 시:
    - 400 Bad Request: 잘못된 휴대폰 번호 형식
    - 429 Too Many Requests: 요청 횟수 초과
    - 500 Internal Server Error: 서버 내부 오류
    
    ==================== 인증번호 확인 API ====================
    Method: POST
    URL: http://localhost:8080/api/verify/phone/confirm
    Headers: {
      'Content-Type': 'application/json'
    }
    
    Request Body:
    {
      "verificationId": string, // 인증 세션 ID
      "code": string           // 사용자가 입력한 인증번호
    }
    
    응답:
    성공 시 (200 OK):
    {
      "success": true,
      "message": "휴대폰 인증이 완료되었습니다.",
      "verified": true
    }
    */
    
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
          setIndividualForm(prev => ({ ...prev, address: addr, postalCode: data.zonecode }));
        } else {
          setCorporateForm(prev => ({ ...prev, address: addr, postalCode: data.zonecode }));
        }
      }
    }).open();
  };

  const isIndividualPasswordMatch = individualForm.password && individualForm.confirmPassword && individualForm.password === individualForm.confirmPassword;
  const isIndividualPasswordMismatch = individualForm.password && individualForm.confirmPassword && individualForm.password !== individualForm.confirmPassword;
  const isIndividualFormValid = isIndividualPasswordMatch && individualForm.termsAccepted && individualForm.privacyAccepted && individualForm.isIdChecked && individualForm.isIdAvailable;

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
    corporateForm.businessNumber &&
    corporateForm.address &&
    corporateForm.phone &&
    corporateForm.businessRegistration && // 사업자등록증 필수
    // 프랜차이즈 지점 회원인 경우 추가 검증
    (corporateForm.corporateType !== 'franchise' || (corporateForm.headquartersName && corporateForm.branchName));

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
      /*
      ==================== API 요청 명세 ====================
      Method: GET
      URL: http://localhost:8080/api/check-id/{id}
      Headers: {
        'Content-Type': 'application/json'
      }
      
      Path Parameters:
      - id: string (중복 확인할 아이디)
      
      ==================== 예상 응답 명세 ====================
      성공 시 (200 OK):
      {
        "available": boolean,  // true: 사용 가능, false: 사용 불가
        "message": string      // 선택적, 응답 메시지
      }
      
      실패 시:
      - 400 Bad Request: 잘못된 아이디 형식
      - 500 Internal Server Error: 서버 내부 오류
      */
      const response = await fetch(`http://localhost:8080/api/check-id/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

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
    setCorporateForm(prev => ({
      ...prev,
      headquartersName: headquarters.name,
      companyName: headquarters.name, // 회사명도 본사명으로 자동 채우기
      businessNumber: headquarters.businessNumber, // 사업자번호도 자동 채우기
      headquartersId: headquarters.id
    }));
    setIsHeadquartersModalOpen(false);
    setHeadquartersSearchTerm(''); // 모달 닫을 때 검색어 초기화
  };

  const fetchHeadquarters = async (term: string) => {
    setIsSearching(true);
    try {
      const response = await fetch(`http://localhost:8080/api/search/headquarters?term=${term}`);
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
    try {
      /*
      ==================== API 요청 명세 ====================
      Method: POST
      URL: http://localhost:8080/api/register/individual
      Headers: {
        'Content-Type': 'application/json'
      }
      
      Request Body:
      {
        "memberType": "individual",
        "id": string,              // 아이디 (중복 확인 완료된 상태)
        "password": string,        // 비밀번호
        "name": string,           // 이름
        "email": string,          // 이메일
        "phone": string,          // 휴대폰 번호
        "address": string,        // 주소
        "detailAddress": string,  // 상세주소
        "termsAccepted": boolean, // 이용약관 동의
        "privacyAccepted": boolean, // 개인정보처리방침 동의
        "marketingAccepted": boolean // 마케팅 수신 동의
      }
      
      ==================== 예상 응답 명세 ====================
      성공 시 (201 Created):
      {
        "success": true,
        "message": "회원가입이 완료되었습니다.",
        "memberId": string,       // 생성된 회원 ID
        "data": {
          "id": string,
          "name": string,
          "email": string,
          "memberType": "individual",
          "createdAt": string     // ISO 8601 형식
        }
      }
      
      실패 시:
      - 400 Bad Request: 필수 필드 누락 또는 유효성 검사 실패
      - 409 Conflict: 이미 존재하는 아이디/이메일
      - 500 Internal Server Error: 서버 내부 오류
      */
      const requestData = {
        memberType: "individual",
        id: individualForm.id,
        password: individualForm.password,
        name: individualForm.name,
        email: individualForm.email,
        phone: individualForm.phone,
        address: individualForm.address,
        detailAddress: individualForm.detailAddress,
        postalCode: individualForm.postalCode,
        termsAccepted: individualForm.termsAccepted,
        privacyAccepted: individualForm.privacyAccepted,
        marketingAccepted: false
      };

      const response = await fetch('http://localhost:8080/api/register/individual', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      });

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
    try {
      const requestData = {
        memberType: "corporate",
        corporateType: corporateForm.corporateType,
        id: corporateForm.id,
        password: corporateForm.password,
        email: corporateForm.email,
        companyName: corporateForm.companyName,
        businessNumber: corporateForm.businessNumber,
        businessType: corporateForm.businessType,
        phone: corporateForm.phone,
        address: corporateForm.address,
        detailAddress: corporateForm.detailAddress,
        postalCode: corporateForm.postalCode,
        termsAccepted: corporateForm.termsAccepted,
        privacyAccepted: corporateForm.privacyAccepted,
         ...(corporateForm.corporateType === 'franchise' && {
           headquartersId: corporateForm.headquartersId,
           headquartersName: corporateForm.headquartersName,
           branchName: corporateForm.branchName
         })
      };

      // 사업자등록증 파일이 있는 경우 FormData 사용
      let body;
      let headers: HeadersInit = {};

      if (corporateForm.businessRegistration) {
        const formData = new FormData();
        formData.append('data', JSON.stringify(requestData));
        formData.append('businessRegistration', corporateForm.businessRegistration);
        body = formData;
      } else {
        headers['Content-Type'] = 'application/json';
        body = JSON.stringify(requestData);
      }


      // 법인 유형별로 다른 endpoint 사용
      let endpoint;
      switch (corporateForm.corporateType) {
        case 'franchise':
          endpoint = 'http://localhost:8080/api/register/franchise';
          break;
        case 'headquarters':
          endpoint = 'http://localhost:8080/api/register/headquarters';
          break;
        case 'single':
        default:
          endpoint = 'http://localhost:8080/api/register/corporate';
          break;
      }

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

  // 본사 선택 함수
  // const handleHeadquartersSelect = (headquarters: { id: string; name: string; businessNumber: string }) => {
  //   setCorporateForm(prev => ({
  //     ...prev,
  //     headquartersName: headquarters.name,
  //     companyName: headquarters.name,
  //     businessNumber: headquarters.businessNumber,
  //     headquartersId: headquarters.id  // 본사 ID 추가
  //   }));
  //   setIsHeadquartersModalOpen(false);
  //   setHeadquartersSearchTerm('');
  // };


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
                    value={individualForm.email}
                    onChange={(e) => setIndividualForm(prev => ({ ...prev, email: e.target.value }))}
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
                      <div className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-muted/50">
                        <RadioGroupItem value="single" id="single" />
                        <Label htmlFor="single" className="cursor-pointer flex-1">
                          <div className="font-medium">단일 법인 회원</div>
                          <div className="text-sm text-muted-foreground">일반 법인</div>
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

                  {/* 프랜차이즈 지점 회원 전용 필드 */}
                  {corporateForm.corporateType === 'franchise' && (
                    <div className="space-y-4 border rounded-lg p-4 bg-muted/20">
                      <h3 className="font-medium text-sm text-muted-foreground">프랜차이즈 지점 정보</h3>
                      
                      {/* 본사명 선택 */}
                      <div className="space-y-2">
                        <Label>본사명 (필수)</Label>
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
                                <Search className="w-4 h-4 mr-2" />
                                본사 선택
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-md">
                              <DialogHeader>
                                <DialogTitle>본사 선택</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <Input
                                    placeholder="본사명으로 검색..."
                                    value={headquartersSearchTerm}
                                    onChange={(e) => setHeadquartersSearchTerm(e.target.value)}
                                />
                                <div className="max-h-60 overflow-y-auto space-y-2">
                                  {isSearching ? (
                                      <div className="text-center py-4 text-muted-foreground">검색 중...</div>
                                  ) : searchedHeadquarters.length > 0 ? (
                                      searchedHeadquarters.map((hq) => (
                                          <div
                                              key={hq.id}
                                              className="border rounded-lg p-3 cursor-pointer hover:bg-muted/50"
                                              onClick={() => handleHeadquartersSelect(hq)}
                                          >
                                            <div className="font-medium">{hq.name}</div>
                                            <div className="text-sm text-muted-foreground">
                                              사업자번호: {hq.businessNumber}
                                            </div>
                                          </div>
                                      ))
                                  ) : (
                                      <div className="text-center py-4 text-muted-foreground">
                                        {headquartersSearchTerm ? '검색 결과가 없습니다.' : '검색어를 입력해주세요.'}
                                      </div>
                                  )}
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>

                      {/* 지점명 입력 */}
                      <div className="space-y-2">
                        <Label>지점명 (필수)</Label>
                        <Input 
                          placeholder="지점명을 입력해주세요" 
                          value={corporateForm.branchName}
                          onChange={(e) => setCorporateForm(prev => ({ ...prev, branchName: e.target.value }))}
                        />
                      </div>
                    </div>
                  )}

                  {/* 회사 명 / 사업자등록번호 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input 
                      placeholder="회사명" 
                      value={corporateForm.companyName}
                      onChange={(e) => setCorporateForm(prev => ({ ...prev, companyName: e.target.value }))}
                    />
                    <Input 
                      placeholder="사업자등록번호" 
                      value={corporateForm.businessNumber}
                      onChange={(e) => setCorporateForm(prev => ({ ...prev, businessNumber: e.target.value }))}
                    />
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
                      value={corporateForm.email}
                      onChange={(e) => setCorporateForm(prev => ({ ...prev, email: e.target.value }))}
                      disabled={!corporateForm.isIdChecked || !corporateForm.isIdAvailable}
                    />
                    <Input 
                      placeholder="회사 전화번호"
                      value={corporateForm.phone}
                      onChange={(e) => setCorporateForm(prev => ({ ...prev, phone: e.target.value }))}
                      disabled={!corporateForm.isIdChecked || !corporateForm.isIdAvailable}
                    />
                  </div>
                  
                  {/* 주소 입력 */}
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
                  
                  {/* 사업자등록증 업로드 */}
                  <div className="space-y-2">
                    <Label htmlFor="businessRegistration">사업자등록증 업로드 (필수)</Label>
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
    </div>
  );
};

export default Register;