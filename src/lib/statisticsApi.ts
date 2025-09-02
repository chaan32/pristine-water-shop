import axios from 'axios';
import { API_CONFIG } from './config';

// Types
export type ChartDataPoint = [number, number];
export type ChartData = Array<ChartDataPoint>;

export interface CumulativeStats {
  orders: number;
  sales: number;
}

// Create axios instance
const statisticsApi = axios.create({
  baseURL: API_CONFIG.baseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
statisticsApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Sales API functions
export const salesApi = {
  getTotal: async (): Promise<number> => {
    const response = await statisticsApi.get('/api/admin/statistics/sales/total');
    return response.data;
  },

  getYearly: async (): Promise<ChartData> => {
    const response = await statisticsApi.get('/api/admin/statistics/sales/yearly');
    return response.data;
  },

  getMonthly: async (year: number): Promise<ChartData> => {
    const response = await statisticsApi.get(`/api/admin/statistics/sales/monthly/${year}`);
    return response.data;
  },

  getDaily: async (year: number, month: number): Promise<ChartData> => {
    const response = await statisticsApi.get(`/api/admin/statistics/sales/daily/${year}/${month}`);
    return response.data;
  },
};

// Orders API functions  
export const ordersApi = {
  getTotal: async (): Promise<number> => {
    const response = await statisticsApi.get('/api/admin/statistics/orders/total');
    return response.data;
  },

  getYearly: async (): Promise<ChartData> => {
    const response = await statisticsApi.get('/api/admin/statistics/orders/yearly');
    return response.data;
  },

  getMonthly: async (year: number): Promise<ChartData> => {
    const response = await statisticsApi.get(`/api/admin/statistics/orders/monthly/${year}`);
    return response.data;
  },

  getDaily: async (year: number, month: number): Promise<ChartData> => {
    const response = await statisticsApi.get(`/api/admin/statistics/orders/daily/${year}/${month}`);
    return response.data;
  },
};

// Cumulative stats API
export const getCumulativeStats = async (): Promise<CumulativeStats> => {
  const response = await statisticsApi.get('/api/admin/statistics/cumulative');
  return response.data;
};