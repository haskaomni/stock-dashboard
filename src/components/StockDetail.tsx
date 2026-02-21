import { useState } from 'react';
import { Star, Bell, ShoppingCart } from 'lucide-react';
import { DataService } from '../services/dataService';
import { CandlestickChart } from './CandlestickChart';
import { useTechnicals } from '../hooks/useTechnicals';
import type { PriceAlert } from '../types';

interface Props {
  symbol: string;
  currentDate: string;
  isWatchlisted: boolean;
  onToggleWatchlist: () => void;
  alerts: PriceAlert[];
  onAddAlert: (symbol: string, price: number, dir: 'above' | 'below') => void;
  onRemoveAlert: (id: string) => void;
  onAddPosition: (symbol: string, shares: number) => void;
}

type Tab = 'overview' | 'financials' | 'valuation' | 'technical';

export function StockDetail({ symbol, currentDate, isWatchlisted, onToggleWatchlist, alerts, onAddAlert, onRemoveAlert, onAddPosition }: Props) {
  const [tab, setTab] = useState<Tab>('overview');
  const [alertPrice, setAlertPrice] = useState('');
  const [alertDir, setAlertDir] = useState<'above' | 'below'>('above');
  const [buyShares, setBuyShares] = useState('10');
  const [showMA, setShowMA] = useState(true);
  const [showBB, setShowBB] = useState(false);

  const stock = DataService.getStock(symbol);
  if (!stock) return <div>Stock not found</div>;

  const prices = DataService.getPricesUpTo(symbol, currentDate);
  const current = prices[prices.length - 1];
  const prev = prices.length > 1 ? prices[prices.length - 2] : current;
  const change = current && prev ? current.close - prev.close : 0;
  const changePct = prev ? (change / prev.close * 100) : 0;
  const isUp = change >= 0;
  const technicals = useTechnicals(prices);

  const tabs: { key: Tab; label: string }[] = [
    { key: 'overview', label: 'Overview' },
    { key: 'financials', label: 'Financials' },
    { key: 'valuation', label: 'Valuation' },
    { key: 'technical', label: 'Technical' },
  ];

  const fmt = (n: number) => {
    if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
    if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
    if (n >= 1e6) return `$${(n / 1e6).toFixed(0)}M`;
    return `$${n.toFixed(2)}`;
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">{symbol}</h1>
            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{stock.info.name}</span>
            <span className="text-[10px] px-2 py-0.5 rounded" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>{stock.info.sector}</span>
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-bold font-mono">${current?.close.toFixed(2)}</span>
            <span className="text-lg font-mono" style={{ color: isUp ? 'var(--green)' : 'var(--red)' }}>
              {isUp ? '+' : ''}{change.toFixed(2)} ({isUp ? '+' : ''}{changePct.toFixed(2)}%)
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={onToggleWatchlist} className="btn-ghost flex items-center gap-1" style={{ color: isWatchlisted ? 'var(--yellow)' : undefined }}>
            <Star size={14} fill={isWatchlisted ? 'var(--yellow)' : 'none'} /> {isWatchlisted ? 'Watching' : 'Watch'}
          </button>
        </div>
      </div>

      {/* Quick actions row */}
      <div className="flex gap-2 flex-wrap">
        <div className="card flex items-center gap-2 text-xs">
          <Bell size={12} style={{ color: 'var(--accent)' }} />
          <input value={alertPrice} onChange={e => setAlertPrice(e.target.value)} placeholder="Price" className="w-16 text-xs" />
          <select value={alertDir} onChange={e => setAlertDir(e.target.value as any)} className="text-xs">
            <option value="above">Above</option>
            <option value="below">Below</option>
          </select>
          <button className="btn-primary text-xs" onClick={() => { if (alertPrice) { onAddAlert(symbol, +alertPrice, alertDir); setAlertPrice(''); } }}>Set Alert</button>
        </div>
        <div className="card flex items-center gap-2 text-xs">
          <ShoppingCart size={12} style={{ color: 'var(--green)' }} />
          <input value={buyShares} onChange={e => setBuyShares(e.target.value)} className="w-16 text-xs" />
          <span style={{ color: 'var(--text-secondary)' }}>shares</span>
          <button className="btn-primary text-xs" onClick={() => onAddPosition(symbol, +buyShares)}>Buy</button>
        </div>
        {alerts.length > 0 && (
          <div className="card text-xs">
            <span style={{ color: 'var(--text-secondary)' }}>Alerts: </span>
            {alerts.map(a => (
              <span key={a.id} className="inline-flex items-center gap-1 mr-2">
                <span style={{ color: a.triggered ? 'var(--green)' : 'var(--yellow)' }}>
                  {a.direction === 'above' ? '↑' : '↓'}${a.targetPrice}
                </span>
                <button onClick={() => onRemoveAlert(a.id)} style={{ color: 'var(--red)', background: 'none', padding: 0 }}>×</button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b" style={{ borderColor: 'var(--border)' }}>
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`pb-2 text-sm transition-colors ${tab === t.key ? 'tab-active' : ''}`}
            style={{ color: tab === t.key ? 'var(--accent)' : 'var(--text-secondary)', background: 'none' }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === 'overview' && (
        <div className="space-y-3">
          <div className="flex gap-2 text-xs">
            <label className="flex items-center gap-1 cursor-pointer" style={{ color: 'var(--text-secondary)' }}>
              <input type="checkbox" checked={showMA} onChange={() => setShowMA(!showMA)} /> MA
            </label>
            <label className="flex items-center gap-1 cursor-pointer" style={{ color: 'var(--text-secondary)' }}>
              <input type="checkbox" checked={showBB} onChange={() => setShowBB(!showBB)} /> Bollinger
            </label>
          </div>
          <CandlestickChart prices={prices} ma20={technicals.ma20} ma50={technicals.ma50} bbUpper={technicals.bbUpper} bbLower={technicals.bbLower} showMA={showMA} showBB={showBB} />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {[
              ['Market Cap', fmt(stock.info.marketCap)],
              ['Volume', current ? current.volume.toLocaleString() : '-'],
              ['P/E Ratio', stock.info.peRatio.toFixed(1)],
              ['EPS', `$${stock.info.eps}`],
              ['Beta', stock.info.beta.toFixed(2)],
              ['Dividend Yield', `${stock.info.dividendYield.toFixed(1)}%`],
              ['Day High', `$${current?.high.toFixed(2)}`],
              ['Day Low', `$${current?.low.toFixed(2)}`],
            ].map(([label, val]) => (
              <div key={label as string} className="card">
                <div className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>{label}</div>
                <div className="text-sm font-mono font-semibold">{val}</div>
              </div>
            ))}
          </div>
          {/* Analyst forecasts */}
          <div className="card">
            <h3 className="text-sm font-semibold mb-2">Analyst Forecasts</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {stock.forecasts.map(f => (
                <div key={f.analyst} className="p-2 rounded text-xs" style={{ background: 'var(--bg-tertiary)' }}>
                  <div className="font-semibold">{f.analyst}</div>
                  <div className="font-mono">${f.targetPrice}</div>
                  <div style={{ color: f.rating.includes('Buy') ? 'var(--green)' : f.rating === 'Hold' ? 'var(--yellow)' : 'var(--red)' }}>{f.rating}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === 'financials' && (
        <div className="card overflow-auto">
          <table className="w-full text-xs">
            <thead>
              <tr style={{ color: 'var(--text-secondary)' }}>
                <th className="text-left py-2 px-2">Year</th>
                <th className="text-right py-2 px-2">Revenue</th>
                <th className="text-right py-2 px-2">Net Income</th>
                <th className="text-right py-2 px-2">Gross Profit</th>
                <th className="text-right py-2 px-2">Op. Income</th>
                <th className="text-right py-2 px-2">FCF</th>
                <th className="text-right py-2 px-2">Total Assets</th>
                <th className="text-right py-2 px-2">Equity</th>
              </tr>
            </thead>
            <tbody>
              {stock.financials.map(f => (
                <tr key={f.year} className="border-t" style={{ borderColor: 'var(--border)' }}>
                  <td className="py-2 px-2 font-semibold">{f.year}</td>
                  <td className="text-right py-2 px-2 font-mono">{fmt(f.revenue)}</td>
                  <td className="text-right py-2 px-2 font-mono">{fmt(f.netIncome)}</td>
                  <td className="text-right py-2 px-2 font-mono">{fmt(f.grossProfit)}</td>
                  <td className="text-right py-2 px-2 font-mono">{fmt(f.operatingIncome)}</td>
                  <td className="text-right py-2 px-2 font-mono">{fmt(f.freeCashFlow)}</td>
                  <td className="text-right py-2 px-2 font-mono">{fmt(f.totalAssets)}</td>
                  <td className="text-right py-2 px-2 font-mono">{fmt(f.totalEquity)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'valuation' && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {[
              ['P/E Ratio', stock.info.peRatio.toFixed(1)],
              ['P/B Ratio', stock.info.pbRatio.toFixed(1)],
              ['EV/EBITDA', stock.info.evEbitda.toFixed(1)],
              ['Dividend Yield', `${stock.info.dividendYield.toFixed(1)}%`],
            ].map(([label, val]) => (
              <div key={label as string} className="card">
                <div className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>{label}</div>
                <div className="text-xl font-mono font-bold">{val}</div>
              </div>
            ))}
          </div>
          <div className="card">
            <h3 className="text-sm font-semibold mb-3">DCF Estimate (Simple)</h3>
            {(() => {
              const lastFin = stock.financials[stock.financials.length - 1];
              const fcf = lastFin?.freeCashFlow ?? 0;
              const growthRate = 0.08;
              const discountRate = 0.10;
              const terminalGrowth = 0.025;
              let dcfValue = 0;
              for (let y = 1; y <= 10; y++) {
                dcfValue += (fcf * Math.pow(1 + growthRate, y)) / Math.pow(1 + discountRate, y);
              }
              const terminalValue = (fcf * Math.pow(1 + growthRate, 10) * (1 + terminalGrowth)) / (discountRate - terminalGrowth);
              dcfValue += terminalValue / Math.pow(1 + discountRate, 10);
              const sharesOut = stock.info.marketCap / (current?.close ?? 1);
              const fairValue = dcfValue / sharesOut;
              const upside = ((fairValue - (current?.close ?? 0)) / (current?.close ?? 1) * 100);
              return (
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>Fair Value</div>
                    <div className="text-lg font-mono font-bold">${fairValue.toFixed(2)}</div>
                  </div>
                  <div>
                    <div className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>Current Price</div>
                    <div className="text-lg font-mono">${current?.close.toFixed(2)}</div>
                  </div>
                  <div>
                    <div className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>Upside</div>
                    <div className="text-lg font-mono" style={{ color: upside > 0 ? 'var(--green)' : 'var(--red)' }}>
                      {upside > 0 ? '+' : ''}{upside.toFixed(1)}%
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {tab === 'technical' && (
        <div className="space-y-3">
          <CandlestickChart prices={prices} ma20={technicals.ma20} ma50={technicals.ma50} bbUpper={technicals.bbUpper} bbLower={technicals.bbLower} showMA={true} showBB={true} height={350} />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {[
              ['RSI (14)', technicals.rsi[technicals.rsi.length - 1]?.toFixed(1) ?? '-', technicals.rsi[technicals.rsi.length - 1]! > 70 ? 'var(--red)' : technicals.rsi[technicals.rsi.length - 1]! < 30 ? 'var(--green)' : 'var(--text-primary)'],
              ['MACD', technicals.macdLine[technicals.macdLine.length - 1]?.toFixed(4) ?? '-', (technicals.macdLine[technicals.macdLine.length - 1] ?? 0) > 0 ? 'var(--green)' : 'var(--red)'],
              ['Support', `$${technicals.support.toFixed(2)}`, 'var(--green)'],
              ['Resistance', `$${technicals.resistance.toFixed(2)}`, 'var(--red)'],
              ['MA20', technicals.ma20[technicals.ma20.length - 1]?.toFixed(2) ?? '-', 'var(--accent)'],
              ['MA50', technicals.ma50[technicals.ma50.length - 1]?.toFixed(2) ?? '-', 'var(--yellow)'],
            ].map(([label, val, color]) => (
              <div key={label as string} className="card">
                <div className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>{label}</div>
                <div className="text-lg font-mono font-bold" style={{ color: color as string }}>{val}</div>
              </div>
            ))}
          </div>
          <div className="card">
            <h3 className="text-sm font-semibold mb-2">Signals</h3>
            <div className="space-y-1 text-xs">
              {(() => {
                const signals: { label: string; signal: string; color: string }[] = [];
                const rsi = technicals.rsi[technicals.rsi.length - 1];
                if (rsi !== null && rsi !== undefined) {
                  if (rsi > 70) signals.push({ label: 'RSI', signal: 'Overbought', color: 'var(--red)' });
                  else if (rsi < 30) signals.push({ label: 'RSI', signal: 'Oversold', color: 'var(--green)' });
                  else signals.push({ label: 'RSI', signal: 'Neutral', color: 'var(--text-secondary)' });
                }
                const ma20v = technicals.ma20[technicals.ma20.length - 1];
                const ma50v = technicals.ma50[technicals.ma50.length - 1];
                if (ma20v && ma50v) {
                  if (ma20v > ma50v) signals.push({ label: 'MA Cross', signal: 'Bullish (20>50)', color: 'var(--green)' });
                  else signals.push({ label: 'MA Cross', signal: 'Bearish (20<50)', color: 'var(--red)' });
                }
                const macd = technicals.macdLine[technicals.macdLine.length - 1];
                if (macd !== null && macd !== undefined) {
                  signals.push({ label: 'MACD', signal: macd > 0 ? 'Bullish' : 'Bearish', color: macd > 0 ? 'var(--green)' : 'var(--red)' });
                }
                if (current) {
                  const distToSupport = ((current.close - technicals.support) / current.close * 100).toFixed(1);
                  const distToResist = ((technicals.resistance - current.close) / current.close * 100).toFixed(1);
                  signals.push({ label: 'Support Distance', signal: `${distToSupport}%`, color: 'var(--text-secondary)' });
                  signals.push({ label: 'Resistance Distance', signal: `${distToResist}%`, color: 'var(--text-secondary)' });
                }
                return signals.map(s => (
                  <div key={s.label} className="flex justify-between py-1 border-b" style={{ borderColor: 'var(--border)' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>{s.label}</span>
                    <span style={{ color: s.color }} className="font-semibold">{s.signal}</span>
                  </div>
                ));
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
