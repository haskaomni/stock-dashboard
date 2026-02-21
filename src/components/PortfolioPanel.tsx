import { useState } from 'react';
import { Trash2, Plus } from 'lucide-react';
import { DataService } from '../services/dataService';
import type { PortfolioPosition } from '../types';

interface Props {
  positions: PortfolioPosition[];
  currentDate: string;
  onRemove: (idx: number) => void;
  onAdd: (symbol: string, shares: number) => void;
  allSymbols: string[];
}

export function PortfolioPanel({ positions, currentDate, onRemove, onAdd, allSymbols }: Props) {
  const [newSymbol, setNewSymbol] = useState(allSymbols[0]);
  const [newShares, setNewShares] = useState('10');

  let totalCost = 0, totalValue = 0;
  const rows = positions.map((p, i) => {
    const price = DataService.getPrice(p.symbol, currentDate);
    const currentPrice = price?.close ?? p.avgCost;
    const value = currentPrice * p.shares;
    const cost = p.avgCost * p.shares;
    const pnl = value - cost;
    const pnlPct = (pnl / cost) * 100;
    totalCost += cost;
    totalValue += value;
    return { ...p, currentPrice, value, cost, pnl, pnlPct, idx: i };
  });

  const totalPnl = totalValue - totalCost;
  const totalPnlPct = totalCost > 0 ? (totalPnl / totalCost * 100) : 0;

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold">Portfolio Sandbox</h2>

      {/* Add position */}
      <div className="card flex items-center gap-3 text-xs">
        <Plus size={14} style={{ color: 'var(--accent)' }} />
        <select value={newSymbol} onChange={e => setNewSymbol(e.target.value)} className="text-xs">
          {allSymbols.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <input value={newShares} onChange={e => setNewShares(e.target.value)} className="w-20" placeholder="Shares" />
        <button className="btn-primary" onClick={() => { onAdd(newSymbol, +newShares); }}>Buy</button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="card">
          <div className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>Total Value</div>
          <div className="text-xl font-mono font-bold">${totalValue.toFixed(2)}</div>
        </div>
        <div className="card">
          <div className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>Total Cost</div>
          <div className="text-xl font-mono">${totalCost.toFixed(2)}</div>
        </div>
        <div className="card">
          <div className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>P&L</div>
          <div className="text-xl font-mono font-bold" style={{ color: totalPnl >= 0 ? 'var(--green)' : 'var(--red)' }}>
            {totalPnl >= 0 ? '+' : ''}${totalPnl.toFixed(2)} ({totalPnlPct >= 0 ? '+' : ''}{totalPnlPct.toFixed(1)}%)
          </div>
        </div>
      </div>

      {/* Positions table */}
      {rows.length > 0 ? (
        <div className="card overflow-auto">
          <table className="w-full text-xs">
            <thead>
              <tr style={{ color: 'var(--text-secondary)' }}>
                <th className="text-left py-2 px-2">Symbol</th>
                <th className="text-right py-2 px-2">Shares</th>
                <th className="text-right py-2 px-2">Avg Cost</th>
                <th className="text-right py-2 px-2">Current</th>
                <th className="text-right py-2 px-2">Value</th>
                <th className="text-right py-2 px-2">P&L</th>
                <th className="text-right py-2 px-2">P&L %</th>
                <th className="py-2 px-2"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map(r => (
                <tr key={r.idx} className="border-t" style={{ borderColor: 'var(--border)' }}>
                  <td className="py-2 px-2 font-semibold">{r.symbol}</td>
                  <td className="text-right py-2 px-2 font-mono">{r.shares}</td>
                  <td className="text-right py-2 px-2 font-mono">${r.avgCost.toFixed(2)}</td>
                  <td className="text-right py-2 px-2 font-mono">${r.currentPrice.toFixed(2)}</td>
                  <td className="text-right py-2 px-2 font-mono">${r.value.toFixed(2)}</td>
                  <td className="text-right py-2 px-2 font-mono" style={{ color: r.pnl >= 0 ? 'var(--green)' : 'var(--red)' }}>
                    {r.pnl >= 0 ? '+' : ''}${r.pnl.toFixed(2)}
                  </td>
                  <td className="text-right py-2 px-2 font-mono" style={{ color: r.pnlPct >= 0 ? 'var(--green)' : 'var(--red)' }}>
                    {r.pnlPct >= 0 ? '+' : ''}{r.pnlPct.toFixed(1)}%
                  </td>
                  <td className="py-2 px-2">
                    <button onClick={() => onRemove(r.idx)} style={{ background: 'none', color: 'var(--red)' }}><Trash2 size={12} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="card text-center text-sm" style={{ color: 'var(--text-secondary)' }}>
          No positions yet. Add stocks above to start tracking.
        </div>
      )}
    </div>
  );
}
