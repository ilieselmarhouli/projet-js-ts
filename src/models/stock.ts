export interface HistoryPoint {
  date: string;
  price: number;
  volume: number;
}

export interface Stock {
  symbol: string;
  name: string;
  sector: string;
  currentPrice: number;
  currency: string;
  history: HistoryPoint[];
}

export type ChartType = "line" | "bar";
export type PeriodOption = 7 | 30 | 90 | 9999;
