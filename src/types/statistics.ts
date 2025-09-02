// Statistics API Response Types
export type StatisticsPairArray = Array<[number, number]>;

export interface CumulativeStats {
  orders: number;
  sales: number;
}

export interface ChartDataPoint {
  period: string;
  sales: number;
  orders: number;
}

export type TimeRange = 'yearly' | 'monthly' | 'daily';