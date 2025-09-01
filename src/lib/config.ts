// 중요한 설정값들을 관리하는 파일
// 이 파일은 .gitignore에 추가되어야 합니다

// 결제 시스템 설정
export const PAYMENT_CONFIG = {
  // 실제 서비스에서는 이 값을 환경변수나 보안 저장소에서 가져와야 합니다
  clientId: process.env.NICEPAYMENT_CLIENT_ID,
};

// API 설정
export const API_CONFIG = {
  baseUrl: process.env.NODE_ENV === 'production' 
    ? 'https://your-production-api.com' 
    : 'http://localhost:8080',
};