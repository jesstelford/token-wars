import { MapPin, Navigation, CheckCircle } from 'lucide-react';
import { COMMUNITIES } from '../../constants/communities';
import type { CommunityId } from '../../constants/communities';

interface TravelPanelProps {
  currentCommunity: CommunityId;
  currentDay: number;
  onTravel: (communityId: CommunityId) => void;
  onFinish: () => void;
}

export function TravelPanel({ currentCommunity, currentDay, onTravel, onFinish }: TravelPanelProps) {
  const isLastDay = currentDay >= 31;
  const currentCommunityData = COMMUNITIES.find(c => c.id === currentCommunity);

  return (
    <div className="flex flex-col border-0 sm:border border-slate-200 dark:border-slate-700 rounded-none sm:rounded-lg overflow-hidden bg-white dark:bg-slate-900">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex-none">
        <Navigation className="w-4 h-4 text-slate-500 dark:text-slate-400" />
        <h2 className="text-xs font-bold uppercase tracking-widest text-slate-600 dark:text-slate-300">Travel</h2>
        <div className="ml-auto flex items-center gap-1">
          {isLastDay ? (
            <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
              Day 31 — Final Day
            </span>
          ) : (
            <>
              <MapPin className="w-3 h-3 text-sky-500 shrink-0" />
              <span className="text-xs font-semibold text-sky-700 dark:text-sky-300">{currentCommunityData?.name}</span>
            </>
          )}
        </div>
      </div>

      <div className="relative flex-1 p-2">
        <div className={`grid grid-cols-2 gap-1 content-start ${isLastDay ? 'blur-sm pointer-events-none select-none' : ''}`}>
          {COMMUNITIES.map(community => {
            const isCurrent = community.id === currentCommunity;
            return (
              <button
                key={community.id}
                onClick={() => !isCurrent && onTravel(community.id as CommunityId)}
                disabled={isCurrent}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-left transition-all focus:outline-none focus:ring-2 focus:ring-sky-500 ${
                  isCurrent
                    ? 'bg-sky-100 dark:bg-sky-900/40 border border-sky-300 dark:border-sky-700 cursor-default'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 cursor-pointer'
                }`}
              >
                <MapPin className={`w-3 h-3 shrink-0 ${isCurrent ? 'text-sky-600 dark:text-sky-400' : 'text-slate-400'}`} />
                <span className={`text-xs font-medium truncate ${isCurrent ? 'text-sky-700 dark:text-sky-300' : 'text-slate-700 dark:text-slate-300'}`}>
                  {community.name}
                </span>
              </button>
            );
          })}
        </div>

        {isLastDay && (
          <div className="absolute inset-0 flex items-center justify-center p-2">
            <button
              onClick={onFinish}
              className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-lg transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
            >
              <CheckCircle className="w-4 h-4" />
              Finish Game
            </button>
          </div>
        )}
      </div>

    </div>
  );
}
