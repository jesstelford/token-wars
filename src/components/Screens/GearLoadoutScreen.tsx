import { useState } from 'react';
import { Shield, ChevronRight, SkipForward, Lock, Check } from 'lucide-react';
import { GEAR_ITEMS, GEAR_MAP, RARITY_COLORS, MAX_GEAR_SLOTS } from '../../constants/items';
import type { GearItemId } from '../../constants/items';
import { getStartingDebtCost } from '../../utils/gearEffects';
import { GearIcon } from '../Gear/GearIcon';
import { formatCurrencyFull } from '../../utils/formatting';
import { INITIAL_DEBT } from '../../constants/assets';

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
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-start py-10 px-4">
      <div className="w-full max-w-2xl">
        <div className="flex items-center gap-3 mb-2">
          <Shield className="w-6 h-6 text-sky-400" />
          <h2 className="text-2xl font-black tracking-tight text-white">Gear Loadout</h2>
        </div>
        <p className="text-slate-400 text-sm mb-6 leading-relaxed">
          Select up to {MAX_GEAR_SLOTS} pieces of gear to start with. Each item increases your starting debt.
          Locked items can be unlocked by finding them during a run.
        </p>

        <div className="space-y-6 mb-8">
          {RARITY_ORDER.map(rarity => {
            const items = GEAR_ITEMS.filter(g => g.rarity === rarity);
            const colors = RARITY_COLORS[rarity];
            return (
              <div key={rarity}>
                <div className="flex items-center gap-2 mb-3">
                  <span className={`text-xs font-bold uppercase tracking-widest px-2 py-0.5 rounded ${colors.badge}`}>
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
                        className={`relative flex items-start gap-3 p-3 rounded-xl border text-left transition-all focus:outline-none focus:ring-2 focus:ring-sky-500 ${
                          isSelected
                            ? `${colors.border} bg-slate-800 ring-2 ring-offset-1 ring-offset-slate-950 ${colors.border.replace('border-', 'ring-')}`
                            : isUnlocked
                            ? 'border-slate-700 bg-slate-900 hover:border-slate-500 hover:bg-slate-800'
                            : 'border-slate-800 bg-slate-900/50 opacity-50 cursor-not-allowed'
                        }`}
                      >
                        {!isUnlocked && (
                          <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-slate-900/60 backdrop-blur-[1px] z-10">
                            <Lock className="w-4 h-4 text-slate-500" />
                          </div>
                        )}
                        <div className={`flex-none w-9 h-9 rounded-lg flex items-center justify-center border ${isSelected ? colors.border : 'border-slate-700'} ${isSelected ? colors.bg : 'bg-slate-800'}`}>
                          <GearIcon name={item.icon} className={`w-4 h-4 ${isSelected ? colors.text : 'text-slate-400'}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <span className={`text-sm font-semibold leading-tight ${isSelected ? 'text-white' : 'text-slate-200'}`}>
                              {isUnlocked ? item.name : '???'}
                            </span>
                            <span className={`text-xs font-mono font-bold shrink-0 ${isSelected ? 'text-rose-400' : 'text-slate-500'}`}>
                              +{formatCurrencyFull(item.debtCost)}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 mt-0.5 leading-snug">
                            {isUnlocked ? item.effectSummary : 'Find this item in a run to unlock it.'}
                          </p>
                        </div>
                        {isSelected && (
                          <div className={`absolute bottom-2 right-2 w-4 h-4 rounded-full flex items-center justify-center ${colors.badge}`}>
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

        <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-slate-300">Gear slots</span>
            <span className="text-sm font-mono text-slate-400">{selected.length} / {MAX_GEAR_SLOTS}</span>
          </div>
          {selected.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {selected.map(id => {
                const item = GEAR_MAP[id];
                const colors = RARITY_COLORS[item.rarity];
                return (
                  <div key={id} className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border ${colors.border} ${colors.bg}`}>
                    <GearIcon name={item.icon} className={`w-3 h-3 ${colors.text}`} />
                    <span className={`text-xs font-semibold ${colors.text}`}>{item.name}</span>
                  </div>
                );
              })}
            </div>
          )}
          <div className="border-t border-slate-800 pt-3 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500">Starting debt</span>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-sm font-mono text-slate-400">${INITIAL_DEBT.toLocaleString()}</span>
                {extraDebt > 0 && (
                  <>
                    <span className="text-xs text-slate-600">+</span>
                    <span className="text-sm font-mono text-rose-400">+{formatCurrencyFull(extraDebt)}</span>
                    <span className="text-xs text-slate-600">=</span>
                    <span className="text-sm font-mono font-bold text-rose-300">{formatCurrencyFull(totalDebt)}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onSkip}
            className="flex items-center gap-2 px-5 py-3 rounded-xl border border-slate-700 bg-slate-900 text-slate-400 hover:text-slate-200 hover:border-slate-600 text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500"
          >
            <SkipForward className="w-4 h-4" />
            No Gear
          </button>
          <button
            onClick={() => onStart(selected, extraDebt)}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-sm transition-colors shadow-lg focus:outline-none focus:ring-2 focus:ring-sky-400"
          >
            <ChevronRight className="w-4 h-4" />
            {selected.length > 0 ? `Start with ${selected.length} piece${selected.length > 1 ? 's' : ''} of Gear` : 'Start Run'}
          </button>
        </div>
      </div>
    </div>
  );
}
