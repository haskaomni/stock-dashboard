import { useState } from 'react';
import { Search, BarChart3, Briefcase, Calendar, Star, TrendingUp, TrendingDown, GitCompareArrows } from 'lucide-react';
import { DataService } from '../services/dataService';
import type { StockData, WatchlistItem } from '../types';

interface Props {
  stocks: StockData[];
  selected: string;
  onSelect: (s: string) => void;
  watchlist: WatchlistItem[];
  onToggleWatchlist: (s: string) => void;
  view: string;
  onViewChange: (v: any) => void;
  currentDate: string;
}

export function Sidebar({ stocks, selected, onSelect, watchlist, onToggleWatchlist, view, onViewChange, currentDate }: Props) {
  const [search, setSearch] = useState('');
  const [showWatchlistOnly, setShowWatchlistOnly] = useState(false);

  const watchlistSymbols = new Set(watchlist.map(w => w.symbol));
  const filtered = stocks.filter(s => {
    const q = search.toLowerCase();
    const matchesSearch = s.info.symbol.toLowerCase().includes(q) || s.info.name.toLowerCase().includes(q);
    const matchesWatchlist = !showWatchlistOnly || watchlistSymbols.has(s.info.symbol);
    return matchesSearch && matchesWatchlist;
  });

  return (
    <div className="w-64 flex flex-col border-r" style={{ borderColor: 'var(--border)', background: 'var(--bg-secondary)' }}>
      {/* Logo */}
      <div className="p-4 border-b flex items-center gap-2" style={{ borderColor: 'var(--border)' }}>
        <BarChart3 size={20} color="var(--accent)" />
        <span className="font-bold text-sm tracking-wide">STOCK TERMINAL</span>
      </div>

      {/* Nav */}
      <div className="flex border-b" style={{ borderColor: 'var(--border)' }}>
        {[
          { key: 'detail', icon: TrendingUp, label: 'Stocks' },
          { key: 'compare', icon: GitCompareArrows, label: 'Compare' },
          { key: 'portfolio', icon: Briefcase, label: 'Portfolio' },
          { key: 'earnings', icon: Calendar, label: 'Calendar' },
        ].map(item => (
          <button
            key={item.key}
            onClick={() => onViewChange(item.key)}
            className="flex-1 py-2 flex flex-col items-center gap-0.5 text-[10px] transition-colors"
            style={{
              color: view === item.key ? 'var(--accent)' : 'var(--text-secondary)',
              borderBottom: view === item.key ? '2px solid var(--accent)' : '2px solid transparent',
            }}
          >
            <item.icon size={14} />
            {item.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="p-2 border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="relative">
          <Search size={14} className="absolute left-2 top-2" style={{ color: 'var(--text-secondary)' }} />
          <input
            type="text"
            placeholder="Search stocks..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-7 text-xs"
          />
        </div>
        <button
          onClick={() => setShowWatchlistOnly(!showWatchlistOnly)}
          className="mt-1 text-[10px] flex items-center gap-1 px-1"
          style={{ color: showWatchlistOnly ? 'var(--yellow)' : 'var(--text-secondary)' }}
        >
          <Star size={10} fill={showWatchlistOnly ? 'var(--yellow)' : 'none'} />
          {showWatchlistOnly ? 'All stocks' : 'Watchlist only'}
        </button>
      </div>

      {/* Stock List */}
      <div className="flex-1 overflow-auto">
        {filtered.map(stock => {
          const price = DataService.getPrice(stock.info.symbol, currentDate);
          const prevPrice = DataService.getPricesUpTo(stock.info.symbol, currentDate);
          const prev = prevPrice.length > 1 ? prevPrice[prevPrice.length - 2] : undefined;
          const change = price && prev ? ((price.close - prev.close) / prev.close * 100) : 0;
          const isUp = change >= 0;
          const isSelected = stock.info.symbol === selected;

          return (
            <div
              key={stock.info.symbol}
              onClick={() => onSelect(stock.info.symbol)}
              className="flex items-center justify-between px-3 py-2 cursor-pointer transition-colors"
              style={{
                background: isSelected ? 'var(--bg-tertiary)' : 'transparent',
                borderLeft: isSelected ? '3px solid var(--accent)' : '3px solid transparent',
              }}
            >
              <div className="flex items-center gap-2">
                <button
                  onClick={e => { e.stopPropagation(); onToggleWatchlist(stock.info.symbol); }}
                  className="p-0"
                  style={{ background: 'none' }}
                >
                  <Star size={12} fill={watchlistSymbols.has(stock.info.symbol) ? 'var(--yellow)' : 'none'} color={watchlistSymbols.has(stock.info.symbol) ? 'var(--yellow)' : 'var(--text-secondary)'} />
                </button>
                <div>
                  <div className="text-xs font-semibold">{stock.info.symbol}</div>
                  <div className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>{stock.info.name}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs font-mono">${price?.close.toFixed(2)}</div>
                <div className="text-[10px] font-mono flex items-center gap-0.5 justify-end" style={{ color: isUp ? 'var(--green)' : 'var(--red)' }}>
                  {isUp ? <TrendingUp size={9} /> : <TrendingDown size={9} />}
                  {isUp ? '+' : ''}{change.toFixed(2)}%
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
