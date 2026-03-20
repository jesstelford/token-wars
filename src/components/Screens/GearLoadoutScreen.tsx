import { useState } from 'react';
import { Shield, ChevronRight, SkipForward, Lock, Check } from 'lucide-react';
import { GEAR_ITEMS, GEAR_MAP, RARITY_COLORS, MAX_GEAR_SLOTS } from '../../constants/items';
import type { GearItemId } from '../../constants/items';
import { getStartingDebtCost } from '../../utils/gearEffects';
import { GearIcon } from '../Gear/GearIcon';
import { formatCurrencyFull } from '../../utils/formatting';
import { INITIAL_DEBT } from '../../constants/assets';
import { Header } from '../Header/Header';

interface GearLoadoutScreenProps {
  unlockedGearIds: GearItemId[];
  onStart: (selectedGear: GearItemId[], extraDebt: number) => void;
  onSkip: () => void;
}

const RARITY_ORDER = ['common', 'uncommon', 'rare', 'legendary'] as const;
const RARITY_LABELS = { common: 'Common', uncommon: 'Uncommon', rare: 'Rare', legendary: 'Legendary' };

export function GearLoadoutScreen({ unlockedGearIds, onStart, onSkip }: GearLoadoutScreenProps) {
  const [selected, setSelected] = useState<GearItemId[]>([]);

  const extraDebt = getStartingDebtCost(selected);
  const totalDebt = INITIAL_DEBT + extraDebt;

  function toggleItem(id: GearItemId) {
    if (!unlockedGearIds.includes(id)) return;
    setSelected(prev => {
      if (prev.includes(id)) return prev.filter(x => x !== id);
      if (prev.length >= MAX_GEAR_SLOTS) return prev;
      return [...prev, id];
    });
  }

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: 'var(--color-bg-root)' }}
    >
      <div className="flex flex-col min-h-screen max-w-4xl mx-auto w-full">
        <Header />

        <div className="flex-1 overflow-y-auto pb-48">
          <div className="w-full max-w-2xl mx-auto px-4 py-8">
            <div className="flex items-center gap-3 mb-2">
              <Shield className="w-6 h-6" style={{ color: 'var(--color-accent)' }} />
              <h2
                className="text-2xl font-black"
                style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text-heading)' }}
              >
                Gear Loadout
              </h2>
            </div>
            <p
              className="text-sm mb-6 leading-relaxed"
              style={{ color: 'var(--color-text-secondary)', fontFamily: 'var(--font-body)' }}
            >
              Select up to {MAX_GEAR_SLOTS} pieces of gear to start with. Each item increases your starting debt.
              Locked items can be unlocked by finding them during a run.
            </p>

            <div className="space-y-6">
              {RARITY_ORDER.map(rarity => {
                const items = GEAR_ITEMS.filter(g => g.rarity === rarity);
                const colors = RARITY_COLORS[rarity];
                return (
                  <div key={rarity}>
                    <div className="flex items-center gap-2 mb-3">
                      <span
                        className={`text-xs font-bold uppercase tracking-widest px-2 py-0.5 ${colors.badge}`}
                        style={{ borderRadius: 'var(--radius-sm)' }}
                      >
                        {RARITY_LABELS[rarity]}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {items.map(item => {
                        const isUnlocked = unlockedGearIds.includes(item.id);
                        const isSelected = selected.includes(item.id);
                        const isDisabled = !isUnlocked || (!isSelected && selected.length >= MAX_GEAR_SLOTS);

                        return (
                          <button
                            key={item.id}
                            onClick={() => toggleItem(item.id)}
                            disabled={isDisabled}
                            className="relative flex items-start gap-3 p-3 border text-left transition-all focus:outline-none"
                            style={{
                              borderRadius: 'var(--radius-md)',
                              background: isSelected ? 'var(--color-accent-muted)' : 'var(--color-bg-surface)',
                              borderColor: isSelected ? 'var(--color-accent)' : 'var(--color-border)',
                              opacity: isDisabled && !isSelected ? 0.5 : 1,
                              cursor: isDisabled ? 'not-allowed' : 'pointer',
                            }}
                          >
                            {!isUnlocked && (
                              <div
                                className="absolute inset-0 flex items-center justify-center z-10"
                                style={{
                                  borderRadius: 'var(--radius-md)',
                                  background: 'rgba(0,0,0,0.25)',
                                  backdropFilter: 'blur(1px)',
                                }}
                              >
                                <Lock className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
                              </div>
                            )}
                            <div
                              className="flex-none w-9 h-9 flex items-center justify-center"
                              style={{
                                borderRadius: 'var(--radius-sm)',
                                background: isSelected ? 'var(--color-accent-muted)' : 'var(--color-bg-muted)',
                                border: `1px solid ${isSelected ? 'var(--color-accent)' : 'var(--color-border)'}`,
                              }}
                            >
                              <GearIcon
                                name={item.icon}
                                className="w-4 h-4"
                                style={{ color: isSelected ? 'var(--color-accent)' : 'var(--color-text-muted)' }}
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <span
                                  className="text-sm font-semibold leading-tight"
                                  style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-body)' }}
                                >
                                  {isUnlocked ? item.name : '???'}
                                </span>
                                <span
                                  className="text-xs shrink-0 font-bold"
                                  style={{
                                    fontFamily: 'var(--font-mono)',
                                    color: isSelected ? 'var(--color-danger)' : 'var(--color-text-muted)',
                                  }}
                                >
                                  +{formatCurrencyFull(item.debtCost)}
                                </span>
                              </div>
                              <p
                                className="text-xs mt-0.5 leading-snug"
                                style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)' }}
                              >
                                {isUnlocked ? item.effectSummary : 'Find this item in a run to unlock it.'}
                              </p>
                            </div>
                            {isSelected && (
                              <div
                                className={`absolute bottom-2 right-2 w-4 h-4 rounded-full flex items-center justify-center ${colors.badge}`}
                              >
                                <Check className="w-2.5 h-2.5" strokeWidth={3} />
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div
          className="fixed bottom-0 left-0 right-0 z-10 shadow-lg"
          style={{
            background: 'var(--color-bg-surface)',
            borderTop: '1px solid var(--color-border)',
          }}
        >
          <div className="w-full max-w-4xl mx-auto px-4 py-4">
            <div className="max-w-2xl mx-auto">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span
                    className="text-sm font-semibold"
                    style={{ color: 'var(--color-text-secondary)', fontFamily: 'var(--font-body)' }}
                  >
                    Gear slots
                  </span>
                  <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
                    {selected.length} / {MAX_GEAR_SLOTS}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Starting debt</span>
                  <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-secondary)' }}>${INITIAL_DEBT.toLocaleString()}</span>
                  {extraDebt > 0 && (
                    <>
                      <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>+</span>
                      <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-danger)', fontWeight: 700 }}>
                        +{formatCurrencyFull(extraDebt)}
                      </span>
                      <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>=</span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 900, color: 'var(--color-danger)' }}>
                        {formatCurrencyFull(totalDebt)}
                      </span>
                    </>
                  )}
                </div>
              </div>

              {selected.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {selected.map(id => {
                    const item = GEAR_MAP[id];
                    const colors = RARITY_COLORS[item.rarity];
                    return (
                      <div
                        key={id}
                        className={`flex items-center gap-1.5 px-2 py-1 border ${colors.border} ${colors.bg}`}
                        style={{ borderRadius: 'var(--radius-sm)' }}
                      >
                        <GearIcon name={item.icon} className={`w-3 h-3 ${colors.text}`} />
                        <span className={`text-xs font-semibold ${colors.text}`}>{item.name}</span>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={onSkip}
                  className="theme-btn-secondary flex items-center gap-2 px-5 py-3 text-sm font-semibold"
                >
                  <SkipForward className="w-4 h-4" />
                  No Gear
                </button>
                <button
                  onClick={() => onStart(selected, extraDebt)}
                  className="theme-btn-primary flex-1 flex items-center justify-center gap-2 py-3 text-sm"
                >
                  <ChevronRight className="w-4 h-4" />
                  {selected.length > 0
                    ? `Start with ${selected.length} piece${selected.length > 1 ? 's' : ''} of Gear`
                    : 'Start Run'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
