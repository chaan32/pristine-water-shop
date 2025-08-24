// Centralized API helpers and base URL
// Note: Avoid using Vite env vars per project guidelines; adjust base URL here if needed.
import { jwtDecode } from 'jwt-decode';

export const API_BASE_URL = 'http://localhost:8080';

// JWT Token interfaces
interface JwtPayload {
  id: number;
  email: string;
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
  // 사용자 정보는 더 이상 localStorage에 저장하지 않음
  localStorage.removeItem('userId');
  localStorage.removeItem('userType');
  localStorage.removeItem('userEmail');
};

// JWT 디코딩 및 사용자 정보 추출
export const decodeAccessToken = (): JwtPayload | null => {
  const token = getAccessToken();
  if (!token) return null;
  
  try {
    return jwtDecode<JwtPayload>(token);
  } catch (error) {
    console.error('Token decode error:', error);
    return null;
  }
};

export const getUserInfo = () => {
  const decoded = decodeAccessToken();
  if (!decoded) return null;
  
  return {
    id: decoded.id,
    email: decoded.email,
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
      setTokens(data.accessToken, refreshToken);
      return true;
    } else {
      clearTokens();
      return false;
    }
  } catch (error) {
    console.error('Token refresh failed:', error);
    clearTokens();
    return false;
  }
};

export const authHeaders = () => {
  const token = getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export async function apiFetch(input: string, init: RequestInit = {}, skipTokenRefresh = false): Promise<Response> {
  const isFormData = typeof FormData !== 'undefined' && init.body instanceof FormData;
  const baseHeaders: HeadersInit = isFormData ? {} : { 'Content-Type': 'application/json' };
  
  // 토큰이 만료되었는지 확인하고 갱신 시도
  if (!skipTokenRefresh && getAccessToken() && isTokenExpired()) {
    const refreshed = await refreshAccessToken();
    if (!refreshed) {
      // 토큰 갱신 실패 시 로그인 페이지로 리다이렉트
      window.location.href = '/login';
      throw new Error('Authentication failed');
    }
  }
  
  const headers: HeadersInit = {
    ...baseHeaders,
    ...authHeaders(),
    ...(init.headers || {}),
  };

  // 요청 데이터 로깅
  const method = init.method || 'GET';
  const url = `${API_BASE_URL}${input}`;
  
  let requestData = null;
  if (init.body) {
    if (isFormData) {
      // FormData는 직접 출력할 수 없으므로 키 목록만 표시
      const formDataEntries: any = {};
      try {
        for (const [key, value] of (init.body as FormData).entries()) {
          if (value instanceof File) {
            formDataEntries[key] = `[File: ${value.name}]`;
          } else {
            formDataEntries[key] = value;
          }
        }
        requestData = formDataEntries;
      } catch (e) {
        requestData = '[FormData object]';
      }
    } else {
      try {
        requestData = JSON.parse(init.body as string);
      } catch (e) {
        requestData = init.body;
      }
    }
  }

  console.log(`🚀 API Request = { 
    url: "${input}", 
    method: "${method}",
    data: ${JSON.stringify(requestData, null, 2)} 
  }`);

  const response = await fetch(url, { ...init, headers });

  // 401 Unauthorized 응답 처리
  if (response.status === 401 && !skipTokenRefresh) {
    console.log('🔄 Token expired, attempting refresh...');
    const refreshed = await refreshAccessToken();
    
    if (refreshed) {
      // 새로운 토큰으로 재시도
      const newHeaders = {
        ...baseHeaders,
        ...authHeaders(),
        ...(init.headers || {}),
      };
      const retryResponse = await fetch(url, { ...init, headers: newHeaders });
      
      // 재시도 응답 로깅
      try {
        const clonedResponse = retryResponse.clone();
        const responseData = await clonedResponse.json();
        console.log(`📨 API Retry Response = { 
          url: "${input}",
          status: ${retryResponse.status},
          data: ${JSON.stringify(responseData, null, 2)} 
        }`);
      } catch (e) {
        try {
          const clonedResponse = retryResponse.clone();
          const textData = await clonedResponse.text();
          console.log(`📨 API Retry Response = { 
            url: "${input}",
            status: ${retryResponse.status},
            data: "${textData}" 
          }`);
        } catch (textError) {
          console.log(`📨 API Retry Response = { 
            url: "${input}",
            status: ${retryResponse.status},
            data: "[Unable to parse response]" 
          }`);
        }
      }
      
      return retryResponse;
    } else {
      // 토큰 갱신 실패 시 로그인 페이지로 리다이렉트
      window.location.href = '/login';
      throw new Error('Authentication failed');
    }
  }

  // 응답 데이터 로깅
  try {
    const clonedResponse = response.clone();
    const responseData = await clonedResponse.json();
    console.log(`📨 API Response = { 
      url: "${input}",
      status: ${response.status},
      data: ${JSON.stringify(responseData, null, 2)} 
    }`);
  } catch (e) {
    // JSON이 아닌 응답의 경우
    try {
      const clonedResponse = response.clone();
      const textData = await clonedResponse.text();
      console.log(`📨 API Response = { 
        url: "${input}",
        status: ${response.status},
        data: "${textData}" 
      }`);
    } catch (textError) {
      console.log(`📨 API Response = { 
        url: "${input}",
        status: ${response.status},
        data: "[Unable to parse response]" 
      }`);
    }
  }

  return response;
}

// Shared DTOs
export type CartItemDto = { productId: number; quantity: number };

// ===========================================
// CENTRALIZED API CALLS
// ===========================================

// Auth APIs
export const authApi = {
  login: (data: { username: string; password: string; deviceInfo?: any }) =>
    apiFetch('/api/auth/login', { method: 'POST', body: JSON.stringify(data) }, true),
  
  checkId: (id: string) =>
    apiFetch(`/api/check-id/${id}`, {}, true),
  
  sendAuthMail: (email: string) =>
    apiFetch('/api/auth/send/authentication/mail', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }, true),

  verifyAuthMail: (email: string, authCode: string) =>
    apiFetch('/api/auth/try/mail', {
      method: 'POST',
      body: JSON.stringify({ email, authCode }),
    }, true),

  refreshToken: (refreshToken: string) =>
    apiFetch('/api/auth/token', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    }, true),
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

// Review APIs
export const reviewApi = {
  createReview: (data: any) => apiFetch('/api/shop/products/review', { method: 'POST', body: JSON.stringify(data) }),
};
