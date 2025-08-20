// Centralized API helpers and base URL
// Note: Avoid using Vite env vars per project guidelines; adjust base URL here if needed.
export const API_BASE_URL = 'http://localhost:8080';

export const getAccessToken = (): string | null => {
  try {
    return localStorage.getItem('accessToken');
  } catch {
    return null;
  }
};

export const authHeaders = () => {
  const token = getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export async function apiFetch(input: string, init: RequestInit = {}) {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...authHeaders(),
    ...(init.headers || {}),
  };
  return fetch(`${API_BASE_URL}${input}`, { ...init, headers });
}

// Shared DTOs
export type CartItemDto = { productId: number; quantity: number };

// ===========================================
// CENTRALIZED API CALLS
// ===========================================

// Auth APIs
export const authApi = {
  login: (data: { username: string; password: string; deviceInfo?: any }) =>
    apiFetch('/api/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  
  checkId: (id: string) =>
    apiFetch(`/api/check-id/${id}`),
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
  uploadImage: (formData: FormData) => apiFetch('/api/admin/products/upload/image', { method: 'POST', body: formData, headers: {} }),
  
  // Product Images
  getProductImages: (productId: string) => apiFetch(`/api/admin/products/${productId}/images`),
  uploadProductImage: (formData: FormData) => apiFetch('/api/admin/products/images/upload', { method: 'POST', body: formData, headers: {} }),
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
};
