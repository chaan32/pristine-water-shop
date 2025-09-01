// 중요한 설정값들을 관리하는 파일
// 이 파일은 .gitignore에 추가되어야 합니다

// 결제 시스템 설정
export const PAYMENT_CONFIG = {
  // NicePay 클라이언트 ID (공개키이므로 코드에 직접 저장 가능)
  clientId: 'S2_af4543a0be4d49a98122e01ec2cd9398', // 실제 클라이언트 ID로 변경 필요
};

// API 설정
export const API_CONFIG = {
  baseUrl: process.env.NODE_ENV === 'production' 
    ? 'https://your-production-api.com' 
    : 'http://localhost:8080',
};