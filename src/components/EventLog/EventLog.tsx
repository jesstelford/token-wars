import { Bell, TrendingUp, TrendingDown, Shield, Zap, Package, Coins, Info, CheckCircle } from 'lucide-react';
import type { GameEvent, EventType } from '../../types/game';

interface EventLogProps {
  events: GameEvent[];
}

const EVENT_ICONS: Record<EventType, React.ReactNode> = {
  surge: <TrendingUp className="w-3.5 h-3.5" style={{ color: 'var(--color-warning)' }} />,
  crash: <TrendingDown className="w-3.5 h-3.5" style={{ color: 'var(--color-danger)' }} />,
  robbery: <Shield className="w-3.5 h-3.5" style={{ color: 'var(--color-warning)' }} />,
  bank_hack: <Zap className="w-3.5 h-3.5" style={{ color: 'var(--color-danger)' }} />,
  ftc: <Shield className="w-3.5 h-3.5" style={{ color: 'var(--color-danger)' }} />,
  ftc_win: <CheckCircle className="w-3.5 h-3.5" style={{ color: 'var(--color-success)' }} />,
  inventory_expansion: <Package className="w-3.5 h-3.5" style={{ color: 'var(--color-success)' }} />,
  resource_influx: <Coins className="w-3.5 h-3.5" style={{ color: 'var(--color-success)' }} />,
  gear_found: <Package className="w-3.5 h-3.5" style={{ color: 'var(--color-accent)' }} />,
  vendor: <Coins className="w-3.5 h-3.5" style={{ color: 'var(--color-accent)' }} />,
  info: <Info className="w-3.5 h-3.5" style={{ color: 'var(--color-text-muted)' }} />,
};

const EVENT_STYLES: Record<EventType, { borderColor: string; bg: string }> = {
  surge: { borderColor: 'var(--event-surge-border)', bg: 'var(--event-surge-bg)' },
  crash: { borderColor: 'var(--event-crash-border)', bg: 'var(--event-crash-bg)' },
  robbery: { borderColor: 'var(--event-crash-border)', bg: 'var(--event-crash-bg)' },
  bank_hack: { borderColor: 'var(--event-crash-border)', bg: 'var(--event-crash-bg)' },
  ftc: { borderColor: 'var(--event-crash-border)', bg: 'var(--event-crash-bg)' },
  ftc_win: { borderColor: 'var(--color-success)', bg: 'var(--color-success-muted)' },
  inventory_expansion: { borderColor: 'var(--color-success)', bg: 'var(--color-success-muted)' },
  resource_influx: { borderColor: 'var(--color-success)', bg: 'var(--color-success-muted)' },
  gear_found: { borderColor: 'var(--color-accent)', bg: 'var(--color-accent-muted)' },
  vendor: { borderColor: 'var(--color-accent)', bg: 'var(--color-accent-muted)' },
  info: { borderColor: 'var(--event-info-border)', bg: 'transparent' },
};

const ROW_HEIGHT = 36;
const MAX_VISIBLE = 3;

export function EventLog({ events }: EventLogProps) {
  if (events.length === 0) return null;

  return (
    <div
      className="flex-none"
      style={{
        borderTop: '1px solid var(--color-border)',
        background: 'var(--color-bg-surface)',
      }}
    >
      <div
        className="flex items-center gap-2 px-3 py-1.5"
        style={{
          background: 'var(--panel-header-bg)',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        <Bell className="w-3.5 h-3.5" style={{ color: 'var(--color-text-muted)' }} />
        <span
          className="text-xs font-bold uppercase tracking-widest"
          style={{ color: 'var(--panel-header-text)', fontFamily: 'var(--font-heading)' }}
        >
          Feed
        </span>
      </div>
      <div
        className="overflow-y-auto"
        style={{ maxHeight: `${ROW_HEIGHT * MAX_VISIBLE}px` }}
      >
        {events.map(event => {
          const style = EVENT_STYLES[event.type];
          return (
            <div
              key={event.id}
              className="flex items-start gap-2 px-3 py-2"
              style={{
                borderLeft: `2px solid ${style.borderColor}`,
                background: style.bg,
                borderBottom: '1px solid var(--color-border-light)',
              }}
            >
              <span className="mt-0.5 shrink-0">{EVENT_ICONS[event.type]}</span>
              <span
                className="text-xs leading-relaxed"
                style={{ color: 'var(--color-text-secondary)', fontFamily: 'var(--font-body)' }}
              >
                {event.message}
              </span>
              <span
                className="ml-auto text-xs shrink-0"
                style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}
              >
                D{event.day}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
