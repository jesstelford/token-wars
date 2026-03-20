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
    <div
      className="theme-panel flex flex-col border-0 sm:border overflow-hidden"
      style={{ borderRadius: '0', borderColor: 'var(--color-border)' }}
    >
      <div className="theme-panel-header flex items-center gap-2 px-3 py-2 flex-none">
        <Navigation className="w-4 h-4" style={{ color: 'var(--panel-header-text)' }} />
        <h2
          className="text-xs font-bold uppercase tracking-widest"
          style={{ color: 'var(--panel-header-text)', fontFamily: 'var(--font-heading)' }}
        >
          Travel
        </h2>
        <div className="ml-auto flex items-center gap-1">
          {isLastDay ? (
            <span
              className="flex items-center gap-1 text-xs font-bold"
              style={{ color: 'var(--color-success)', fontFamily: 'var(--font-heading)' }}
            >
              Day 31 — Final Day
            </span>
          ) : (
            <>
              <MapPin className="w-3 h-3 shrink-0" style={{ color: 'var(--color-accent)' }} />
              <span
                className="text-xs font-semibold"
                style={{ color: 'var(--color-accent)', fontFamily: 'var(--font-body)' }}
              >
                {currentCommunityData?.name}
              </span>
            </>
          )}
        </div>
      </div>

      <div className="relative flex-1 p-2" style={{ background: 'var(--color-bg-surface)' }}>
        <div className={`grid grid-cols-2 gap-1 content-start ${isLastDay ? 'blur-sm pointer-events-none select-none' : ''}`}>
          {COMMUNITIES.map(community => {
            const isCurrent = community.id === currentCommunity;
            return (
              <button
                key={community.id}
                onClick={() => !isCurrent && onTravel(community.id as CommunityId)}
                disabled={isCurrent}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-left transition-all focus:outline-none"
                style={{
                  borderRadius: 'var(--radius-sm)',
                  background: isCurrent ? 'var(--travel-current-bg)' : 'transparent',
                  border: `1px solid ${isCurrent ? 'var(--travel-current-border)' : 'transparent'}`,
                  cursor: isCurrent ? 'default' : 'pointer',
                }}
                onMouseEnter={e => {
                  if (!isCurrent) {
                    (e.currentTarget as HTMLButtonElement).style.background = 'var(--travel-hover-bg)';
                    (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--travel-hover-border)';
                  }
                }}
                onMouseLeave={e => {
                  if (!isCurrent) {
                    (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                    (e.currentTarget as HTMLButtonElement).style.borderColor = 'transparent';
                  }
                }}
              >
                <MapPin
                  className="w-3 h-3 shrink-0"
                  style={{ color: isCurrent ? 'var(--color-accent)' : 'var(--color-text-muted)' }}
                />
                <span
                  className="text-xs font-medium truncate"
                  style={{
                    color: isCurrent ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                    fontFamily: 'var(--font-body)',
                  }}
                >
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
              className="theme-btn-primary flex items-center gap-2 px-6 py-3 text-sm"
              style={{ background: 'var(--color-success)', borderColor: 'var(--color-success)', color: 'var(--color-text-inverse)' }}
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
