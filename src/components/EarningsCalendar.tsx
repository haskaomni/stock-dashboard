import type { StockData } from '../types';

interface Props {
  stocks: StockData[];
  currentDate: string;
}

export function EarningsCalendar({ stocks, currentDate }: Props) {
  const sorted = [...stocks].sort((a, b) => a.info.earningsDate.localeCompare(b.info.earningsDate));

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold">Earnings Calendar</h2>
      <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
        Current simulation date: <span className="font-mono" style={{ color: 'var(--accent)' }}>{currentDate}</span>
      </div>
      <div className="grid gap-3">
        {sorted.map(s => {
          const isPast = s.info.earningsDate <= currentDate;
          return (
            <div key={s.info.symbol} className="card flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded flex items-center justify-center text-xs font-bold" style={{ background: 'var(--bg-tertiary)' }}>
                  {s.info.symbol.slice(0, 2)}
                </div>
                <div>
                  <div className="text-sm font-semibold">{s.info.symbol} — {s.info.name}</div>
                  <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>{s.info.sector}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs font-mono" style={{ color: isPast ? 'var(--text-secondary)' : 'var(--accent)' }}>
                  {s.info.earningsDate}
                </div>
                <div className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>
                  Expected EPS: <span className="font-mono">${s.info.earningsExpectedEps.toFixed(2)}</span>
                </div>
                {isPast && s.info.earningsActualEps !== undefined && (
                  <div className="text-[10px]">
                    Actual: <span className="font-mono" style={{ color: s.info.earningsActualEps >= s.info.earningsExpectedEps ? 'var(--green)' : 'var(--red)' }}>
                      ${s.info.earningsActualEps.toFixed(2)}
                    </span>
                  </div>
                )}
                <div className="text-[10px] mt-0.5">
                  <span className="px-1.5 py-0.5 rounded" style={{
                    background: isPast ? 'var(--bg-tertiary)' : 'var(--accent)' + '22',
                    color: isPast ? 'var(--text-secondary)' : 'var(--accent)',
                  }}>
                    {isPast ? 'Reported' : 'Upcoming'}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
