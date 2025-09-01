
// 중요한 설정값들을 관리하는 파일
// 이 파일은 .gitignore에 추가되어야 합니다

// 결제 시스템 설정
export const PAYMENT_CONFIG = {
  // NicePay 클라이언트 ID를 환경변수에서 가져옴
  clientId: import.meta.env.VITE_NICEPAYMENT_CLIENT_ID || process.env.REACT_APP_NICEPAYMENT_CLIENT_ID || '',
};

// API 설정
export const API_CONFIG = {
  baseUrl: process.env.NODE_ENV === 'production' 
    ? 'https://your-production-api.com' 
    : 'http://localhost:8080',
};
