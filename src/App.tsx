import { useState, useCallback, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { StockDetail } from './components/StockDetail';
import { ComparisonChart } from './components/ComparisonChart';
import { PortfolioPanel } from './components/PortfolioPanel';
import { EarningsCalendar } from './components/EarningsCalendar';
import { AlertNotification } from './components/AlertNotification';
import { useLocalStorage } from './hooks/useLocalStorage';
import { DataService } from './services/dataService';
import type { WatchlistItem, PriceAlert, PortfolioPosition } from './types';

type View = 'detail' | 'compare' | 'portfolio' | 'earnings';

export default function App() {
  const stocks = DataService.getAllStocks();
  const allDates = stocks[0]?.prices.map(p => p.time) ?? [];
  const [selectedSymbol, setSelectedSymbol] = useState('AAPL');
  const [view, setView] = useState<View>('detail');
  const [watchlist, setWatchlist] = useLocalStorage<WatchlistItem[]>('watchlist', []);
  const [compareSymbols, setCompareSymbols] = useLocalStorage<string[]>('compareSymbols', ['AAPL', 'MSFT']);
  const [alerts, setAlerts] = useLocalStorage<PriceAlert[]>('priceAlerts', []);
  const [portfolio, setPortfolio] = useLocalStorage<PortfolioPosition[]>('portfolio', []);
  const [simIndex, setSimIndex] = useState(allDates.length - 1);
  const [triggeredAlerts, setTriggeredAlerts] = useState<PriceAlert[]>([]);

  const currentDate = allDates[simIndex] ?? allDates[allDates.length - 1];

  // Check alerts on sim change
  useEffect(() => {
    const newTriggered: PriceAlert[] = [];
    setAlerts(prev => prev.map(a => {
      if (a.triggered) return a;
      const price = DataService.getPrice(a.symbol, currentDate);
      if (!price) return a;
      const hit = a.direction === 'above' ? price.close >= a.targetPrice : price.close <= a.targetPrice;
      if (hit) { newTriggered.push({ ...a, triggered: true }); return { ...a, triggered: true }; }
      return a;
    }));
    if (newTriggered.length) setTriggeredAlerts(prev => [...prev, ...newTriggered]);
  }, [simIndex, currentDate]);

  const toggleWatchlist = useCallback((symbol: string) => {
    setWatchlist(prev =>
      prev.find(w => w.symbol === symbol)
        ? prev.filter(w => w.symbol !== symbol)
        : [...prev, { symbol, addedAt: new Date().toISOString() }]
    );
  }, [setWatchlist]);

  const addAlert = useCallback((symbol: string, targetPrice: number, direction: 'above' | 'below') => {
    setAlerts(prev => [...prev, { id: Date.now().toString(), symbol, targetPrice, direction, triggered: false }]);
  }, [setAlerts]);

  const removeAlert = useCallback((id: string) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  }, [setAlerts]);

  const addPosition = useCallback((symbol: string, shares: number) => {
    const price = DataService.getPrice(symbol, currentDate);
    if (!price) return;
    setPortfolio(prev => [...prev, { symbol, shares, avgCost: price.close, buyDate: currentDate }]);
  }, [setPortfolio, currentDate]);

  const removePosition = useCallback((idx: number) => {
    setPortfolio(prev => prev.filter((_, i) => i !== idx));
  }, [setPortfolio]);

  const dismissAlert = useCallback((id: string) => {
    setTriggeredAlerts(prev => prev.filter(a => a.id !== id));
  }, []);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        stocks={stocks}
        selected={selectedSymbol}
        onSelect={(s) => { setSelectedSymbol(s); setView('detail'); }}
        watchlist={watchlist}
        onToggleWatchlist={toggleWatchlist}
        view={view}
        onViewChange={setView}
        currentDate={currentDate}
      />
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Time Simulation Bar */}
        <div className="flex items-center gap-3 px-4 py-2 border-b" style={{ borderColor: 'var(--border)', background: 'var(--bg-secondary)' }}>
          <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Time Simulation</span>
          <input
            type="range"
            min={0}
            max={allDates.length - 1}
            value={simIndex}
            onChange={e => setSimIndex(+e.target.value)}
            className="flex-1 h-1 accent-blue-500"
          />
          <span className="text-xs font-mono" style={{ color: 'var(--accent)' }}>{currentDate}</span>
        </div>

        <div className="flex-1 overflow-auto px-8 py-6">
          {view === 'detail' && (
            <StockDetail
              symbol={selectedSymbol}
              currentDate={currentDate}
              isWatchlisted={!!watchlist.find(w => w.symbol === selectedSymbol)}
              onToggleWatchlist={() => toggleWatchlist(selectedSymbol)}
              alerts={alerts.filter(a => a.symbol === selectedSymbol)}
              onAddAlert={addAlert}
              onRemoveAlert={removeAlert}
              onAddPosition={addPosition}
            />
          )}
          {view === 'compare' && (
            <ComparisonChart
              symbols={compareSymbols}
              currentDate={currentDate}
              allStocks={stocks}
              onChangeSymbols={setCompareSymbols}
            />
          )}
          {view === 'portfolio' && (
            <PortfolioPanel
              positions={portfolio}
              currentDate={currentDate}
              onRemove={removePosition}
              onAdd={addPosition}
              allSymbols={stocks.map(s => s.info.symbol)}
            />
          )}
          {view === 'earnings' && (
            <EarningsCalendar stocks={stocks} currentDate={currentDate} />
          )}
        </div>
      </main>

      {/* Alert notifications */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
        {triggeredAlerts.map(a => (
          <AlertNotification key={a.id} alert={a} onDismiss={() => dismissAlert(a.id)} />
        ))}
      </div>
    </div>
  );
}
