// Centralized API helpers and base URL
import { jwtDecode } from 'jwt-decode';
import { API_CONFIG, createApiEndpoint } from './config';

export const API_BASE_URL = API_CONFIG.baseUrl;

// Legacy localStorage cleanup (ensure only tokens are stored)
try {
  ['userInfo', 'userinfo', 'secretToken'].forEach((k) => localStorage.removeItem(k));
} catch {}


// JWT Token interfaces
interface JwtPayload {
  id: number;
  username: string;
  role: string;
  exp: number;
  iat: number;
  sub: string;
}

// Token management functions
export const getAccessToken = (): string | null => {
  try {
    return localStorage.getItem('accessToken');
  } catch {
    return null;
  }
};

export const getRefreshToken = (): string | null => {
  try {
    return localStorage.getItem('refreshToken');
  } catch {
    return null;
  }
};

export const setTokens = (accessToken: string, refreshToken: string) => {
  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('refreshToken', refreshToken);
};

export const clearTokens = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
};

// JWT 디코딩 및 사용자 정보 추출
export const decodeAccessToken = (): JwtPayload | null => {
  const token = getAccessToken();
  if (!token) return null;
  
  try {
    return jwtDecode<JwtPayload>(token);
  } catch (error) {
    return null;
  }
};

export const getUserInfo = () => {
  const decoded = decodeAccessToken();
  if (!decoded) return null;
  
  return {
    id: decoded.id,
    name: decoded.username,
    role: decoded.role,
    isLoggedIn: true
  };
};

export const isTokenExpired = (token?: string): boolean => {
  const tokenToCheck = token || getAccessToken();
  if (!tokenToCheck) return true;
  
  try {
    const decoded = jwtDecode<JwtPayload>(tokenToCheck);
    return Date.now() >= decoded.exp * 1000;
  } catch {
    return true;
  }
};


// Token refresh function
export const refreshAccessToken = async (): Promise<boolean> => {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    clearTokens();
    return false;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (response.ok) {
      const data = await response.json();
      if (data.success && data.data) {
        setTokens(data.data.accessToken, data.data.refreshToken);
        return true;
      }
    }
    // 리프레시 토큰이 만료되는 등 재발급 실패 시
    clearTokens();
    window.location.href = '/login'; // 로그인 페이지로 이동
    return false;

  } catch (error) {
    clearTokens();
    window.location.href = '/login'; // 로그인 페이지로 이동
    return false;
  }
};

export const authHeaders = () => {
  const token = getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export async function apiFetch(input: string, init: RequestInit = {}): Promise<Response> {
  // 요청 헤더 설정
  const isFormData = init.body instanceof FormData;
  const baseHeaders: HeadersInit = isFormData ? {} : { 'Content-Type': 'application/json' };
  const headers: HeadersInit = {
    ...baseHeaders,
    ...authHeaders(), // 현재 accessToken을 가져와 헤더에 포함
    ...(init.headers || {}),
  };

  // 1. 원래 요청을 먼저 보냅니다.
  const response = await fetch(`${API_BASE_URL}${input}`, { ...init, headers });

  // 2. 응답이 401 (Unauthorized) 에러인 경우에만 재발급 로직을 실행합니다.
  if (response.status === 401) {
    const refreshed = await refreshAccessToken();

    if (refreshed) {
      // 토큰 재발급에 성공했다면, 새로운 토큰으로 헤더를 다시 만들어 원래 요청을 재시도합니다.
      const newHeaders: HeadersInit = {
        ...baseHeaders,
        ...authHeaders(), // refreshAccessToken 함수가 새 토큰을 저장했으므로, 이 함수는 새 토큰을 가져옵니다.
        ...(init.headers || {}),
      };
      return await fetch(`${API_BASE_URL}${input}`, { ...init, headers: newHeaders });
    } else {
      // 재발급 실패 시 에러를 발생시켜 로그인 페이지로 이동하도록 합니다.
      throw new Error('Authentication failed: Unable to refresh token.');
    }
  }

  // 401 에러가 아니면 원래 응답을 그대로 반환합니다.
  return response;
}
// Shared DTOs
export type CartItemDto = { productId: number; quantity: number };

// ===========================================
// CENTRALIZED API CALLS
// ===========================================

// Auth APIs (uses direct fetch to avoid circular dependency with apiFetch)
export const authApi = {
  login: (data: { username: string; password: string; deviceInfo?: any }) =>
    fetch(`${API_BASE_URL}/api/auth/login`, { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data) 
    }),
  
  checkId: (id: string) =>
    fetch(`${API_BASE_URL}/api/check-id/${id}`),
  
  sendAuthMail: (email: string) =>
    fetch(`${API_BASE_URL}/api/auth/send/authentication/mail`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    }),

  verifyAuthMail: (email: string, verifyCode: string) =>
    fetch(`${API_BASE_URL}/api/auth/try/mail`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, verifyCode }),
    }),

  sendAuthPhone: (phone: string) =>
    fetch(`${API_BASE_URL}/api/auth/send/authentication/phone`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone }),
    }),

  verifyAuthPhone: (phone: string, verifyCode: string) => {
    return fetch(`${API_BASE_URL}/api/auth/try/phone`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, verifyCode }),
    });
  },

  refreshToken: (refreshToken: string) =>
    fetch(`${API_BASE_URL}/api/auth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    }),
};

// User APIs  
export const userApi = {
  getMe: () => apiFetch('/api/users/me'),
  updateMe: (data: any) => apiFetch('/api/users/me', { method: 'PUT', body: JSON.stringify(data) }),
  getOrders: (page = 1, limit = 10) => apiFetch(`/api/users/orders?page=${page}&limit=${limit}`),
};

// Shop APIs
export const shopApi = {
  getProducts: () => apiFetch('/api/shop/products'),
  getProduct: (id: string) => apiFetch(`/api/shop/${id}`),
  getProductReviews: (id: string) => apiFetch(`/api/shop/${id}/comments`),
  getProductInquiries: (id: string) => apiFetch(`/api/shop/${id}/inquiries`),
  createInquiry: (data: { userId: number; productId: number; question: string }) =>
    apiFetch('/api/shop/inquiry', { method: 'POST', body: JSON.stringify(data) }),
  getAllCategories: () => apiFetch('/api/shop/all/categories'),
  getDisplayProducts: () => apiFetch('/api/shop/display'),
};

// Cart APIs
export const cartApi = {
  get: () => apiFetch('/api/cart'),
  add: (data: { productId: number; quantity: number }) =>
    apiFetch('/api/cart/add', { method: 'POST', body: JSON.stringify(data) }),
  update: (data: { productId: number; quantity: number }) =>
    apiFetch('/api/cart', { method: 'POST', body: JSON.stringify(data) }),
  remove: (productId: number) => apiFetch(`/api/cart/${productId}`, { method: 'DELETE' }),
};

// Register APIs
export const registerApi = {
  individual: (data: any) => apiFetch('/api/register/individual', { method: 'POST', body: JSON.stringify(data) }),
  corporate: (data: any) => apiFetch('/api/register/corporate', { method: 'POST', body: JSON.stringify(data) }),
  searchHeadquarters: (term: string) => apiFetch(`/api/search/headquarters?term=${term}`),
};

// Admin APIs
export const adminApi = {
  // Members
  getMembers: () => apiFetch('/api/admin/members'),
  getMemberOrders: (memberId: number) => apiFetch(`/api/admin/members/${memberId}/orders`),
  
  // Products
  getProducts: () => apiFetch('/api/admin/products'),
  getProduct: (id: string) => apiFetch(`/api/admin/products/${id}`),
  addProduct: (data: any) => apiFetch('/api/admin/products/add', { method: 'POST', body: JSON.stringify(data) }),
  editProduct: (data: any) => apiFetch('/api/admin/products/edit', { method: 'POST', body: JSON.stringify(data) }),
  updateProduct: (id: string, data: any) => apiFetch(`/api/admin/products/edit/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteProduct: (id: string) => apiFetch(`/api/admin/products/${id}`, { method: 'DELETE' }),
  
  // Product Content
  getProductContent: (productId: string) => apiFetch(`/api/admin/products/${productId}/content`),
  saveProductContent: (data: any) => apiFetch('/api/admin/products/content', { method: 'POST', body: JSON.stringify(data) }),
  saveProductContentFormData: (formData: FormData) => apiFetch('/api/admin/products/content', { method: 'POST', body: formData }),
  uploadImage: (formData: FormData) => apiFetch('/api/admin/products/upload/image', { method: 'POST', body: formData }),
  
  // Product Images
  getProductImages: (productId: string) => apiFetch(`/api/admin/products/${productId}/images`),
  uploadProductImage: (formData: FormData) => apiFetch('/api/admin/products/images/upload', { method: 'POST', body: formData }),
  updateProductImages: (data: any) => apiFetch('/api/admin/products/images', { method: 'PUT', body: JSON.stringify(data) }),
  setThumbnail: (data: any) => apiFetch('/api/admin/products/images/thumbnail', { method: 'POST', body: JSON.stringify(data) }),
  
  // Categories
  getMainCategories: () => apiFetch('/api/admin/main/categories'),
  getSubCategories: (mainCategoryId: number) => apiFetch(`/api/admin/sub/categories/${mainCategoryId}`),
  addMainCategory: (data: { name: string }) => apiFetch('/api/admin/main/categories/add', { method: 'POST', body: JSON.stringify(data) }),
  addSubCategory: (data: { name: string; id: number }) => apiFetch('/api/admin/sub/categories/add', { method: 'POST', body: JSON.stringify(data) }),
  updateMainCategory: (id: string, name: string) => apiFetch(`/api/admin/main/categories/${id}/${name}`, { method: 'PUT' }),
  updateSubCategory: (id: string, name: string) => apiFetch(`/api/admin/sub/categories/${id}/${name}`, { method: 'PUT' }),
  deleteMainCategory: (id: string) => apiFetch(`/api/admin/main/categories/${id}`, { method: 'DELETE' }),
  deleteSubCategory: (id: string) => apiFetch(`/api/admin/sub/categories/${id}`, { method: 'DELETE' }),
  
  // Expressions
  getExpressions: () => apiFetch('/api/admin/expressions'),
  addExpression: (data: { expression: string }) => apiFetch('/api/admin/expressions', { method: 'POST', body: JSON.stringify(data) }),
  addProductExpression: (data: { productId: number | string; expression: string }) =>
    apiFetch('/api/admin/expressions', { method: 'POST', body: JSON.stringify(data) }),
  deleteProductExpression: (data: { productId: number | string; expressionId: string }) =>
    apiFetch('/api/admin/expressions', { method: 'DELETE', body: JSON.stringify(data) }),
  
  // Main Page Products
  getMainPageProducts: () => apiFetch('/api/admin/main-page-products'),
  updateMainPageProducts: (data: any) => apiFetch('/api/admin/main-page-products', { method: 'POST', body: JSON.stringify(data) }),
  
  // Orders
  getOrders: () => apiFetch('/api/admin/orders'),
  updateOrderTracking: (id: string, data: any) => apiFetch(`/api/admin/orders/${id}/tracking`, { method: 'PUT', body: JSON.stringify(data) }),
  
  // Corporate Requests
  getCorporateRequests: () => apiFetch('/api/admin/corporate-requests'),
  approveCorporateRequest: (id: number, data: { isHeadquarters: boolean }) =>
    apiFetch(`/api/admin/corporate-requests/${id}/approve`, { method: 'POST', body: JSON.stringify(data) }),
  rejectCorporateRequest: (id: number) => apiFetch(`/api/admin/corporate-requests/${id}/reject`, { method: 'POST' }),
  
  // FAQ
  getFaqCategories: () => apiFetch('/api/admin/faq/categories'),
  getFaqs: (categoryId: string) => apiFetch(`/api/admin/faq?categoryId=${categoryId}`),
  addFaqCategory: (data: { name: string }) => apiFetch('/api/admin/faq/categories', { method: 'POST', body: JSON.stringify(data) }),
  addFaq: (data: { categoryId: string; question: string; answer: string }) =>
    apiFetch('/api/admin/faq/add', { method: 'POST', body: JSON.stringify(data) }),
  updateFaq: (id: string, data: { categoryId: string; question: string; answer: string }) =>
    apiFetch(`/api/admin/faq/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteFaq: (id: string) => apiFetch(`/api/admin/faq/${id}`, { method: 'DELETE' }),
  
  // Notices
  getNotices: () => apiFetch('/api/admin/notices'),
  addNotice: (data: any) => apiFetch('/api/admin/notices', { method: 'POST', body: JSON.stringify(data) }),
  updateNotice: (id: string, data: any) => apiFetch(`/api/admin/notices/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteNotice: (id: string) => apiFetch(`/api/admin/notices/${id}`, { method: 'DELETE' }),
  
// Inquiries
  getProductInquiries: (params?: string) => apiFetch(`/api/admin/product-inquiries${params ? `?${params}` : ''}`),
  getProductInquiriesByProduct: (productId: string) => apiFetch(`/api/admin/product-inquiries/${productId}`),
  getGeneralInquiries: (params?: string) => apiFetch(`/api/admin/inquiries${params ? `?${params}` : ''}`),
  answerProductInquiry: (data: any) => apiFetch('/api/admin/product-inquiries/answer', { method: 'POST', body: JSON.stringify(data) }),
  answerGeneralInquiry: (data: any) => apiFetch('/api/admin/inquiries/answer', { method: 'POST', body: JSON.stringify(data) }),
  
  // Claims
  getClaims: () => apiFetch('/api/admin/claims'),
  approveClaim: (claimId: number, data?: any) => apiFetch(`/api/admin/claims/${claimId}/approved`, { method: 'POST', body: data ? JSON.stringify(data) : undefined }),
  rejectClaim: (claimId: number, data: any) => apiFetch(`/api/admin/claims/${claimId}/rejected`, { method: 'POST', body: JSON.stringify(data) }),
  
  // Statistics
  getTotalSales: () => apiFetch('/api/admin/statistics/sales/total'),
  getYearlySales: () => apiFetch('/api/admin/statistics/sales/yearly'),
  getMonthlySales: (year: number) => apiFetch(`/api/admin/statistics/sales/monthly/${year}`),
  getDailySales: (year: number, month: number) => apiFetch(`/api/admin/statistics/sales/daily/${year}/${month}`),
  getTotalOrders: () => apiFetch('/api/admin/statistics/orders/total'),
  getYearlyOrders: () => apiFetch('/api/admin/statistics/orders/yearly'),
  getMonthlyOrders: (year: number) => apiFetch(`/api/admin/statistics/orders/monthly/${year}`),
  getDailyOrders: (year: number, month: number) => apiFetch(`/api/admin/statistics/orders/daily/${year}/${month}`),
  getCumulativeStats: () => apiFetch('/api/admin/statistics/cumulative'),
};

// Support APIs
export const supportApi = {
  getNotices: () => apiFetch('/api/notices'),
  getNotice: (id: string) => apiFetch(`/api/notices/${id}`),
  viewNotice: (id: string) => apiFetch(`/api/notices/${id}/view`, { method: 'POST' }),
  createInquiry: (data: any) => apiFetch('/api/inquiries', { method: 'POST', body: JSON.stringify(data) }),
  createInquiryWithFiles: (formData: FormData) => apiFetch('/api/inquiries', { method: 'POST', body: formData }),
  getFaqCategories: () => apiFetch('/api/faq/categories'),
  getFaqs: (categoryId: string) => apiFetch(`/api/faq?categoryId=${categoryId}`),
};

// Order APIs  
export const orderApi = {
  getRecipientInfo: (userId: string) => apiFetch(`/api/order/recipient/same/${userId}`),
  createOrder: (data: any) => apiFetch('/api/order', { method: 'POST', body: JSON.stringify(data) }),
  payOrder: (orderNumber: string) => apiFetch(`/api/order/${orderNumber}/pay`, { method: 'POST' }),
  clearCart: () => apiFetch('/api/cart', { method: 'DELETE' }),
};

// Password APIs
export const passwordApi = {
  changePassword: (data: { newPassword: string }) => apiFetch('/api/auth/change/password', { method: 'PUT', body: JSON.stringify(data) }),
  recheck: (data: { password: string }) => apiFetch('/api/auth/login/recheck', { method: 'POST', body: JSON.stringify(data) }),
};

// Find (ID/Password Recovery) APIs
export const findApi = {
  // 비밀번호 찾기 1단계: 본인 인증 수단으로 인증번호 발송
  passwordCert: (data: { method: 'email' | 'phone'; value: string; loginId: string }) =>
    apiFetch('/api/auth/find/password/cert', { method: 'POST', body: JSON.stringify(data) }),
  // 비밀번호 찾기 2단계: 인증코드 검증 및 임시 비밀번호 발급
  passwordReset: (data: { verifyCode: string; value: string; method: 'email' | 'phone' }) =>
    apiFetch('/api/auth/find/password/reset', { method: 'POST', body: JSON.stringify(data) }),
  // 아이디 찾기 1단계: 인증번호 발송
  loginIdCert: (data: { method: 'email' | 'phone'; value: string }) =>
    apiFetch('/api/auth/find/loginId/cert', { method: 'POST', body: JSON.stringify(data) }),
  // 아이디 찾기 2단계: 인증코드 검증 후 아이디 전송
  loginIdSend: (data: { verifyCode: string; value: string; method: 'email' | 'phone' }) =>
    apiFetch('/api/auth/find/loginId/send', { method: 'POST', body: JSON.stringify(data) }),
};

// Review APIs
export const reviewApi = {
  createReview: (data: any) => apiFetch('/api/shop/products/review', { method: 'POST', body: JSON.stringify(data) }),
  deleteReview: (reviewId: number) => apiFetch(`/api/reviews/${reviewId}`, { method: 'DELETE' }),
};

// Headquarters API
export const headquartersApi = {
  getActiveBranches: () => apiFetch('/api/users/headquarters/active/branches'),
};
