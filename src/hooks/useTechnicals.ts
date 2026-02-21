import { useMemo } from 'react';
import type { OHLCV } from '../types';

function sma(data: number[], period: number): (number | null)[] {
  return data.map((_, i) => {
    if (i < period - 1) return null;
    const slice = data.slice(i - period + 1, i + 1);
    return slice.reduce((a, b) => a + b, 0) / period;
  });
}

function ema(data: number[], period: number): (number | null)[] {
  const k = 2 / (period + 1);
  const result: (number | null)[] = [];
  let prev: number | null = null;
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) { result.push(null); continue; }
    if (prev === null) {
      prev = data.slice(0, period).reduce((a, b) => a + b, 0) / period;
    } else {
      prev = data[i] * k + prev * (1 - k);
    }
    result.push(prev);
  }
  return result;
}

export function useTechnicals(prices: OHLCV[]) {
  return useMemo(() => {
    const closes = prices.map(p => p.close);

    const ma20 = sma(closes, 20);
    const ma50 = sma(closes, 50);
    const ma200 = sma(closes, 200);

    // RSI
    const rsi: (number | null)[] = [];
    const period = 14;
    for (let i = 0; i < closes.length; i++) {
      if (i < period) { rsi.push(null); continue; }
      let gains = 0, losses = 0;
      for (let j = i - period + 1; j <= i; j++) {
        const diff = closes[j] - closes[j - 1];
        if (diff > 0) gains += diff; else losses -= diff;
      }
      const rs = losses === 0 ? 100 : gains / losses;
      rsi.push(+(100 - 100 / (1 + rs)).toFixed(2));
    }

    // MACD
    const ema12 = ema(closes, 12);
    const ema26 = ema(closes, 26);
    const macdLine = ema12.map((v, i) => v !== null && ema26[i] !== null ? +(v - ema26[i]!).toFixed(4) : null);
    const macdVals = macdLine.filter(v => v !== null) as number[];
    const signalRaw = ema(macdVals, 9);
    let si = 0;
    const signal = macdLine.map(v => {
      if (v === null) return null;
      const s = signalRaw[si++];
      return s;
    });
    const histogram = macdLine.map((v, i) => v !== null && signal[i] !== null ? +(v - signal[i]!).toFixed(4) : null);

    // Bollinger Bands
    const bbUpper: (number | null)[] = [];
    const bbLower: (number | null)[] = [];
    for (let i = 0; i < closes.length; i++) {
      if (i < 19) { bbUpper.push(null); bbLower.push(null); continue; }
      const slice = closes.slice(i - 19, i + 1);
      const mean = slice.reduce((a, b) => a + b, 0) / 20;
      const std = Math.sqrt(slice.reduce((a, b) => a + (b - mean) ** 2, 0) / 20);
      bbUpper.push(+(mean + 2 * std).toFixed(2));
      bbLower.push(+(mean - 2 * std).toFixed(2));
    }

    // Support / Resistance (simple: recent 20-day low/high)
    const recent = closes.slice(-20);
    const support = Math.min(...recent);
    const resistance = Math.max(...recent);

    return { ma20, ma50, ma200, rsi, macdLine, signal, histogram, bbUpper, bbLower, support, resistance };
  }, [prices]);
}
