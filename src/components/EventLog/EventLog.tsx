import { Bell, TrendingUp, TrendingDown, Shield, Zap, Package, Coins, Info } from 'lucide-react';
import type { GameEvent, EventType } from '../../types/game';

interface EventLogProps {
  events: GameEvent[];
}

const EVENT_ICONS: Record<EventType, React.ReactNode> = {
  surge: <TrendingUp className="w-3.5 h-3.5 text-amber-500" />,
  crash: <TrendingDown className="w-3.5 h-3.5 text-red-500" />,
  robbery: <Shield className="w-3.5 h-3.5 text-orange-500" />,
  bank_hack: <Zap className="w-3.5 h-3.5 text-red-600" />,
  ftc: <Shield className="w-3.5 h-3.5 text-red-500" />,
  inventory_expansion: <Package className="w-3.5 h-3.5 text-emerald-500" />,
  resource_influx: <Coins className="w-3.5 h-3.5 text-emerald-600" />,
  info: <Info className="w-3.5 h-3.5 text-slate-400" />,
};

const EVENT_BG: Record<EventType, string> = {
  surge: 'border-l-2 border-amber-400 bg-amber-50 dark:bg-amber-900/10',
  crash: 'border-l-2 border-red-400 bg-red-50 dark:bg-red-900/10',
  robbery: 'border-l-2 border-orange-400 bg-orange-50 dark:bg-orange-900/10',
  bank_hack: 'border-l-2 border-red-600 bg-red-50 dark:bg-red-900/15',
  ftc: 'border-l-2 border-red-500 bg-red-50 dark:bg-red-900/10',
  inventory_expansion: 'border-l-2 border-emerald-400 bg-emerald-50 dark:bg-emerald-900/10',
  resource_influx: 'border-l-2 border-emerald-500 bg-emerald-50 dark:bg-emerald-900/10',
  info: 'border-l-2 border-slate-200 dark:border-slate-700',
};

const ROW_HEIGHT = 36;
const MAX_VISIBLE = 3;

export function EventLog({ events }: EventLogProps) {
  if (events.length === 0) return null;

  return (
    <div className="border-t border-slate-200 dark:border-slate-700 flex-none bg-white dark:bg-slate-900">
      <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <Bell className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Feed</span>
      </div>
      <div
        className="overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800"
        style={{ maxHeight: `${ROW_HEIGHT * MAX_VISIBLE}px` }}
      >
        {events.map(event => (
          <div key={event.id} className={`flex items-start gap-2 px-3 py-2 ${EVENT_BG[event.type]}`}>
            <span className="mt-0.5 shrink-0">{EVENT_ICONS[event.type]}</span>
            <span className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{event.message}</span>
            <span className="ml-auto text-xs text-slate-400 dark:text-slate-500 font-mono shrink-0">D{event.day}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
