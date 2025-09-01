
// 중앙화된 설정 관리 파일

// 환경 설정 타입
export type Environment = 'development' | 'production';

// API 설정 타입
export interface ApiConfig {
  readonly baseUrl: string;
  readonly timeout: number;
}

// 결제 시스템 설정 타입
export interface PaymentConfig {
  readonly clientId: string;
  readonly scriptUrl: string;
  readonly returnUrl: string;
  readonly headquartersReturnUrl: string;
}

// 외부 서비스 URL 타입
export interface ExternalUrls {
  readonly tracking: {
    readonly epost: string;
    readonly cjlogistics: string;
  };
  readonly storage: {
    readonly ncloudStorage: string;
  };
}

// 현재 환경
export const ENVIRONMENT: Environment = import.meta.env.MODE as Environment;

// API 설정
export const API_CONFIG: ApiConfig = {
  baseUrl: ENVIRONMENT === 'production' 
    ? 'https://your-production-api.com' 
    : 'http://localhost:8080',
  timeout: 10000,
} as const;

// 결제 시스템 설정
export const PAYMENT_CONFIG: PaymentConfig = {
  clientId: import.meta.env.VITE_NICEPAYMENT_CLIENT_ID || '',
  scriptUrl: 'https://pay.nicepay.co.kr/v1/js/',
  returnUrl: `${API_CONFIG.baseUrl}/api/payments/return`,
  headquartersReturnUrl: `${API_CONFIG.baseUrl}/api/payments/return/headquarters`,
} as const;

// 외부 서비스 URL들
export const EXTERNAL_URLS: ExternalUrls = {
  tracking: {
    epost: 'https://service.epost.go.kr/trace.RetrieveDomRigiTraceList.comm?sid1=',
    cjlogistics: 'https://trace.cjlogistics.com/next/tracking.html?wblNo=',
  },
  storage: {
    ncloudStorage: 'https://kr.object.ncloudstorage.com/dragoncompany-cloudstorage/',
  },
} as const;

// API 엔드포인트 생성 헬퍼
export const createApiEndpoint = (path: string): string => {
  return `${API_CONFIG.baseUrl}/api${path}`;
};

// 추적 URL 생성 헬퍼
export const createTrackingUrl = (service: 'epost' | 'cjlogistics', trackingNumber: string): string => {
  return `${EXTERNAL_URLS.tracking[service]}${trackingNumber}`;
};

// 스토리지 URL 생성 헬퍼
export const createStorageUrl = (fileName: string): string => {
  return `${EXTERNAL_URLS.storage.ncloudStorage}${fileName}`;
};
