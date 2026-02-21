import { useEffect, useRef } from 'react';
import { createChart, ColorType, CandlestickSeries, LineSeries, HistogramSeries } from 'lightweight-charts';
import type { OHLCV } from '../types';

interface Props {
  prices: OHLCV[];
  ma20?: (number | null)[];
  ma50?: (number | null)[];
  bbUpper?: (number | null)[];
  bbLower?: (number | null)[];
  showMA?: boolean;
  showBB?: boolean;
  height?: number;
}

export function CandlestickChart({ prices, ma20, ma50, bbUpper, bbLower, showMA = true, showBB = false, height = 400 }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || prices.length === 0) return;

    const chart = createChart(containerRef.current, {
      width: containerRef.current.clientWidth,
      height,
      layout: { background: { type: ColorType.Solid, color: '#161b22' }, textColor: '#8b949e', fontSize: 11 },
      grid: { vertLines: { color: '#21262d' }, horzLines: { color: '#21262d' } },
      crosshair: { mode: 0 },
      rightPriceScale: { borderColor: '#30363d' },
      timeScale: { borderColor: '#30363d', timeVisible: false },
    });

    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#3fb950',
      downColor: '#f85149',
      borderUpColor: '#3fb950',
      borderDownColor: '#f85149',
      wickUpColor: '#3fb950',
      wickDownColor: '#f85149',
    });
    candleSeries.setData(prices.map(p => ({ time: p.time, open: p.open, high: p.high, low: p.low, close: p.close })));

    if (showMA && ma20) {
      const ma20Series = chart.addSeries(LineSeries, { color: '#58a6ff', lineWidth: 1, priceLineVisible: false });
      ma20Series.setData(prices.map((p, i) => ({ time: p.time, value: ma20[i]! })).filter(d => d.value !== null));
    }
    if (showMA && ma50) {
      const ma50Series = chart.addSeries(LineSeries, { color: '#d29922', lineWidth: 1, priceLineVisible: false });
      ma50Series.setData(prices.map((p, i) => ({ time: p.time, value: ma50[i]! })).filter(d => d.value !== null));
    }
    if (showBB && bbUpper && bbLower) {
      const bbUpSeries = chart.addSeries(LineSeries, { color: '#8b949e44', lineWidth: 1, priceLineVisible: false });
      bbUpSeries.setData(prices.map((p, i) => ({ time: p.time, value: bbUpper[i]! })).filter(d => d.value !== null));
      const bbLoSeries = chart.addSeries(LineSeries, { color: '#8b949e44', lineWidth: 1, priceLineVisible: false });
      bbLoSeries.setData(prices.map((p, i) => ({ time: p.time, value: bbLower[i]! })).filter(d => d.value !== null));
    }

    // Volume
    const volSeries = chart.addSeries(HistogramSeries, {
      color: '#58a6ff33',
      priceFormat: { type: 'volume' },
      priceScaleId: '',
    });
    volSeries.priceScale().applyOptions({ scaleMargins: { top: 0.85, bottom: 0 } });
    volSeries.setData(prices.map(p => ({
      time: p.time,
      value: p.volume,
      color: p.close >= p.open ? '#3fb95033' : '#f8514933',
    })));

    chart.timeScale().fitContent();

    const handleResize = () => {
      if (containerRef.current) chart.applyOptions({ width: containerRef.current.clientWidth });
    };
    window.addEventListener('resize', handleResize);
    return () => { window.removeEventListener('resize', handleResize); chart.remove(); };
  }, [prices, ma20, ma50, bbUpper, bbLower, showMA, showBB, height]);

  return <div ref={containerRef} />;
}
