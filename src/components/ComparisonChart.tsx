import { useEffect, useRef } from 'react';
import { createChart, ColorType, LineSeries } from 'lightweight-charts';
import { DataService } from '../services/dataService';
import type { StockData } from '../types';

const COLORS = ['#58a6ff', '#3fb950', '#f85149', '#d29922', '#bc8cff', '#f778ba', '#79c0ff', '#56d364'];

interface Props {
  symbols: string[];
  currentDate: string;
  allStocks: StockData[];
  onChangeSymbols: (s: string[]) => void;
}

export function ComparisonChart({ symbols, currentDate, allStocks, onChangeSymbols }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || symbols.length === 0) return;

    const chart = createChart(containerRef.current, {
      width: containerRef.current.clientWidth,
      height: 450,
      layout: { background: { type: ColorType.Solid, color: '#161b22' }, textColor: '#8b949e', fontSize: 11 },
      grid: { vertLines: { color: '#21262d' }, horzLines: { color: '#21262d' } },
      rightPriceScale: { borderColor: '#30363d' },
      timeScale: { borderColor: '#30363d' },
    });

    symbols.forEach((sym, i) => {
      const prices = DataService.getPricesUpTo(sym, currentDate);
      if (prices.length === 0) return;
      const basePrice = prices[0].close;
      const series = chart.addSeries(LineSeries, {
        color: COLORS[i % COLORS.length],
        lineWidth: 2,
        priceLineVisible: false,
        title: sym,
      });
      series.setData(prices.map(p => ({ time: p.time, value: ((p.close - basePrice) / basePrice) * 100 })));
    });

    chart.timeScale().fitContent();

    const handleResize = () => {
      if (containerRef.current) chart.applyOptions({ width: containerRef.current.clientWidth });
    };
    window.addEventListener('resize', handleResize);
    return () => { window.removeEventListener('resize', handleResize); chart.remove(); };
  }, [symbols, currentDate]);

  const toggleSymbol = (sym: string) => {
    if (symbols.includes(sym)) {
      if (symbols.length > 1) onChangeSymbols(symbols.filter(s => s !== sym));
    } else {
      onChangeSymbols([...symbols, sym]);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold">Stock Comparison (% Change)</h2>
      <div className="flex flex-wrap gap-2">
        {allStocks.map((s, i) => (
          <button
            key={s.info.symbol}
            onClick={() => toggleSymbol(s.info.symbol)}
            className="text-xs px-3 py-1 rounded-full border transition-all"
            style={{
              borderColor: symbols.includes(s.info.symbol) ? COLORS[symbols.indexOf(s.info.symbol) % COLORS.length] : 'var(--border)',
              background: symbols.includes(s.info.symbol) ? COLORS[symbols.indexOf(s.info.symbol) % COLORS.length] + '22' : 'transparent',
              color: symbols.includes(s.info.symbol) ? COLORS[symbols.indexOf(s.info.symbol) % COLORS.length] : 'var(--text-secondary)',
            }}
          >
            {s.info.symbol}
          </button>
        ))}
      </div>
      <div ref={containerRef} className="card" style={{ padding: 0, overflow: 'hidden' }} />
    </div>
  );
}
