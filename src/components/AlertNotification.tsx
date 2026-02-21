import { useEffect, useState } from 'react';
import { Bell, X } from 'lucide-react';
import type { PriceAlert } from '../types';

interface Props {
  alert: PriceAlert;
  onDismiss: () => void;
}

export function AlertNotification({ alert, onDismiss }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
    const timer = setTimeout(onDismiss, 8000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div
      className="flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg transition-all duration-300"
      style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--green)',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateX(0)' : 'translateX(100px)',
        minWidth: 280,
      }}
    >
      <Bell size={16} style={{ color: 'var(--green)' }} />
      <div className="flex-1">
        <div className="text-xs font-semibold">{alert.symbol} Alert Triggered</div>
        <div className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>
          Price {alert.direction === 'above' ? 'rose above' : 'fell below'} ${alert.targetPrice}
        </div>
      </div>
      <button onClick={onDismiss} style={{ background: 'none', color: 'var(--text-secondary)' }}><X size={14} /></button>
    </div>
  );
}
