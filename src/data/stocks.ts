import type { StockData, OHLCV, FinancialData, AnalystForecast, StockInfo } from '../types';

// Seed-based pseudo-random for reproducibility
function seededRandom(seed: number) {
  let s = seed;
  return () => { s = (s * 16807 + 0) % 2147483647; return (s - 1) / 2147483646; };
}

function generateOHLCV(basePrice: number, volatility: number, trend: number, seed: number): OHLCV[] {
  const rand = seededRandom(seed);
  const data: OHLCV[] = [];
  let price = basePrice;
  const startDate = new Date('2025-02-21');

  for (let i = 0; i < 252; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    if (date.getDay() === 0 || date.getDay() === 6) continue;

    const dailyReturn = (rand() - 0.48) * volatility + trend / 252;
    price *= (1 + dailyReturn);
    const open = price * (1 + (rand() - 0.5) * 0.01);
    const close = price;
    const high = Math.max(open, close) * (1 + rand() * 0.015);
    const low = Math.min(open, close) * (1 - rand() * 0.015);
    const volume = Math.floor(5000000 + rand() * 20000000);

    data.push({
      time: date.toISOString().split('T')[0],
      open: +open.toFixed(2),
      high: +high.toFixed(2),
      low: +low.toFixed(2),
      close: +close.toFixed(2),
      volume,
    });
  }
  return data;
}

function generateFinancials(baseRevenue: number, seed: number): FinancialData[] {
  const rand = seededRandom(seed);
  const data: FinancialData[] = [];
  for (let y = 2021; y <= 2025; y++) {
    const rev = baseRevenue * (1 + (y - 2021) * 0.08 + (rand() - 0.3) * 0.1);
    data.push({
      year: y,
      revenue: +rev.toFixed(0),
      netIncome: +(rev * (0.1 + rand() * 0.15)).toFixed(0),
      grossProfit: +(rev * (0.4 + rand() * 0.2)).toFixed(0),
      operatingIncome: +(rev * (0.15 + rand() * 0.1)).toFixed(0),
      totalAssets: +(rev * (2 + rand())).toFixed(0),
      totalLiabilities: +(rev * (1 + rand() * 0.5)).toFixed(0),
      totalEquity: +(rev * (0.8 + rand() * 0.5)).toFixed(0),
      freeCashFlow: +(rev * (0.05 + rand() * 0.1)).toFixed(0),
    });
  }
  return data;
}

const ratings: AnalystForecast['rating'][] = ['Strong Buy', 'Buy', 'Hold', 'Sell', 'Strong Sell'];

function generateForecasts(currentPrice: number, seed: number): AnalystForecast[] {
  const rand = seededRandom(seed);
  const names = ['Goldman Sachs', 'Morgan Stanley', 'JP Morgan', 'Barclays', 'UBS', 'Citi', 'Deutsche Bank', 'BofA'];
  return names.map(analyst => ({
    analyst,
    targetPrice: +(currentPrice * (0.85 + rand() * 0.4)).toFixed(2),
    rating: ratings[Math.floor(rand() * 4)],
    date: `2026-0${1 + Math.floor(rand() * 2)}-${10 + Math.floor(rand() * 18)}`,
  }));
}

const stockConfigs: { info: Omit<StockInfo, 'eps' | 'revenue'>; basePrice: number; vol: number; trend: number; baseRev: number; seed: number }[] = [
  { info: { symbol: 'AAPL', name: 'Apple Inc.', sector: 'Technology', marketCap: 3200e9, peRatio: 32.5, pbRatio: 48.2, evEbitda: 26.1, dividendYield: 0.5, beta: 1.18, earningsDate: '2026-04-24', earningsExpectedEps: 2.35 }, basePrice: 228, vol: 0.022, trend: 0.12, baseRev: 383e9, seed: 1 },
  { info: { symbol: 'MSFT', name: 'Microsoft Corp.', sector: 'Technology', marketCap: 3100e9, peRatio: 36.2, pbRatio: 13.1, evEbitda: 27.8, dividendYield: 0.7, beta: 0.92, earningsDate: '2026-04-22', earningsExpectedEps: 3.15 }, basePrice: 415, vol: 0.020, trend: 0.15, baseRev: 227e9, seed: 2 },
  { info: { symbol: 'GOOGL', name: 'Alphabet Inc.', sector: 'Technology', marketCap: 2100e9, peRatio: 25.8, pbRatio: 7.2, evEbitda: 18.5, dividendYield: 0.0, beta: 1.05, earningsDate: '2026-04-29', earningsExpectedEps: 1.92 }, basePrice: 175, vol: 0.024, trend: 0.10, baseRev: 328e9, seed: 3 },
  { info: { symbol: 'AMZN', name: 'Amazon.com Inc.', sector: 'Consumer Cyclical', marketCap: 2050e9, peRatio: 42.1, pbRatio: 8.5, evEbitda: 22.3, dividendYield: 0.0, beta: 1.15, earningsDate: '2026-05-01', earningsExpectedEps: 1.45 }, basePrice: 198, vol: 0.026, trend: 0.18, baseRev: 620e9, seed: 4 },
  { info: { symbol: 'NVDA', name: 'NVIDIA Corp.', sector: 'Technology', marketCap: 2800e9, peRatio: 65.3, pbRatio: 52.1, evEbitda: 55.2, dividendYield: 0.02, beta: 1.65, earningsDate: '2026-05-21', earningsExpectedEps: 0.88 }, basePrice: 135, vol: 0.035, trend: 0.35, baseRev: 80e9, seed: 5 },
  { info: { symbol: 'TSLA', name: 'Tesla Inc.', sector: 'Consumer Cyclical', marketCap: 780e9, peRatio: 72.4, pbRatio: 16.8, evEbitda: 48.5, dividendYield: 0.0, beta: 2.05, earningsDate: '2026-04-17', earningsExpectedEps: 0.72 }, basePrice: 245, vol: 0.042, trend: -0.05, baseRev: 96e9, seed: 6 },
  { info: { symbol: 'META', name: 'Meta Platforms', sector: 'Technology', marketCap: 1500e9, peRatio: 28.9, pbRatio: 9.2, evEbitda: 16.8, dividendYield: 0.3, beta: 1.22, earningsDate: '2026-04-23', earningsExpectedEps: 5.82 }, basePrice: 590, vol: 0.028, trend: 0.20, baseRev: 156e9, seed: 7 },
  { info: { symbol: 'JPM', name: 'JPMorgan Chase', sector: 'Financial Services', marketCap: 620e9, peRatio: 12.5, pbRatio: 2.0, evEbitda: 0, dividendYield: 2.2, beta: 1.08, earningsDate: '2026-04-11', earningsExpectedEps: 4.65 }, basePrice: 215, vol: 0.018, trend: 0.08, baseRev: 154e9, seed: 8 },
  { info: { symbol: 'V', name: 'Visa Inc.', sector: 'Financial Services', marketCap: 570e9, peRatio: 30.2, pbRatio: 14.5, evEbitda: 24.1, dividendYield: 0.7, beta: 0.95, earningsDate: '2026-04-22', earningsExpectedEps: 2.68 }, basePrice: 285, vol: 0.016, trend: 0.11, baseRev: 35e9, seed: 9 },
  { info: { symbol: 'JNJ', name: 'Johnson & Johnson', sector: 'Healthcare', marketCap: 380e9, peRatio: 16.8, pbRatio: 6.1, evEbitda: 14.2, dividendYield: 3.0, beta: 0.55, earningsDate: '2026-04-15', earningsExpectedEps: 2.82 }, basePrice: 158, vol: 0.014, trend: 0.04, baseRev: 98e9, seed: 10 },
];

export const allStocks: StockData[] = stockConfigs.map(cfg => {
  const prices = generateOHLCV(cfg.basePrice, cfg.vol, cfg.trend, cfg.seed);
  const lastPrice = prices[prices.length - 1]?.close ?? cfg.basePrice;
  return {
    info: {
      ...cfg.info,
      eps: +(lastPrice / cfg.info.peRatio).toFixed(2),
      revenue: cfg.baseRev,
    } as StockInfo,
    prices,
    financials: generateFinancials(cfg.baseRev, cfg.seed + 100),
    forecasts: generateForecasts(lastPrice, cfg.seed + 200),
  };
});

export function getStock(symbol: string): StockData | undefined {
  return allStocks.find(s => s.info.symbol === symbol);
}
