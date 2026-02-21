// Clean data layer - swap mock imports for real API calls later
import { allStocks, getStock } from '../data/stocks';
import type { StockData, OHLCV } from '../types';

export const DataService = {
  getAllStocks(): StockData[] { return allStocks; },
  getStock(symbol: string): StockData | undefined { return getStock(symbol); },
  getPrice(symbol: string, date?: string): OHLCV | undefined {
    const stock = getStock(symbol);
    if (!stock) return undefined;
    if (!date) return stock.prices[stock.prices.length - 1];
    return stock.prices.find(p => p.time === date);
  },
  getPricesUpTo(symbol: string, date: string): OHLCV[] {
    const stock = getStock(symbol);
    if (!stock) return [];
    return stock.prices.filter(p => p.time <= date);
  },
};
