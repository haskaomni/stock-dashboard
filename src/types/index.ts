export interface OHLCV {
  time: string; // YYYY-MM-DD
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface StockInfo {
  symbol: string;
  name: string;
  sector: string;
  marketCap: number;
  peRatio: number;
  pbRatio: number;
  evEbitda: number;
  dividendYield: number;
  beta: number;
  eps: number;
  revenue: number;
  earningsDate: string;
  earningsExpectedEps: number;
  earningsActualEps?: number;
}

export interface FinancialData {
  year: number;
  quarter?: number;
  revenue: number;
  netIncome: number;
  grossProfit: number;
  operatingIncome: number;
  totalAssets: number;
  totalLiabilities: number;
  totalEquity: number;
  freeCashFlow: number;
}

export interface AnalystForecast {
  analyst: string;
  targetPrice: number;
  rating: 'Buy' | 'Hold' | 'Sell' | 'Strong Buy' | 'Strong Sell';
  date: string;
}

export interface StockData {
  info: StockInfo;
  prices: OHLCV[];
  financials: FinancialData[];
  forecasts: AnalystForecast[];
}

export interface PortfolioPosition {
  symbol: string;
  shares: number;
  avgCost: number;
  buyDate: string;
}

export interface PriceAlert {
  id: string;
  symbol: string;
  targetPrice: number;
  direction: 'above' | 'below';
  triggered: boolean;
}

export interface WatchlistItem {
  symbol: string;
  addedAt: string;
}
