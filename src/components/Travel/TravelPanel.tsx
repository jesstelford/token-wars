import { MapPin, Navigation, AlertTriangle } from 'lucide-react';
import { COMMUNITIES } from '../../constants/communities';
import type { CommunityId } from '../../constants/communities';

interface TravelPanelProps {
  currentCommunity: CommunityId;
  currentDay: number;
  onTravel: (communityId: CommunityId) => void;
}

export function TravelPanel({ currentCommunity, currentDay, onTravel }: TravelPanelProps) {
  const isLastDay = currentDay >= 31;
  const currentCommunityData = COMMUNITIES.find(c => c.id === currentCommunity);

  return (
    <div className="flex flex-col border-0 sm:border border-slate-200 dark:border-slate-700 rounded-none sm:rounded-lg overflow-hidden bg-white dark:bg-slate-900">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex-none">
        <Navigation className="w-4 h-4 text-slate-500 dark:text-slate-400" />
        <h2 className="text-xs font-bold uppercase tracking-widest text-slate-600 dark:text-slate-300">Travel</h2>
        <div className="flex items-center gap-1 ml-2">
          <MapPin className="w-3 h-3 text-sky-500 shrink-0" />
          <span className="text-xs font-semibold text-sky-700 dark:text-sky-300">{currentCommunityData?.name}</span>
        </div>
        {isLastDay && (
          <span className="ml-auto flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
            <AlertTriangle className="w-3 h-3" />
            Final day
          </span>
        )}
      </div>

      <div className="flex-1 p-2 grid grid-cols-2 gap-1 content-start">
        {COMMUNITIES.map(community => {
          const isCurrent = community.id === currentCommunity;

          return (
            <button
              key={community.id}
              onClick={() => !isCurrent && !isLastDay && onTravel(community.id as CommunityId)}
              disabled={isCurrent || isLastDay}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-left transition-all focus:outline-none focus:ring-2 focus:ring-sky-500 ${
                isCurrent
                  ? 'bg-sky-100 dark:bg-sky-900/40 border border-sky-300 dark:border-sky-700 cursor-default'
                  : isLastDay
                  ? 'opacity-40 cursor-not-allowed bg-slate-50 dark:bg-slate-800 border border-transparent'
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

      <div className="px-3 py-1.5 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-400 dark:text-slate-500 flex-none">
        Travel uses 1 day
      </div>
    </div>
  );
}
