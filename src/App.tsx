import { useState, useEffect } from 'react';
import { useGameState } from './hooks/useGameState';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useKeyboardNav } from './hooks/useKeyboardNav';
import { useGamepadInput } from './hooks/useGamepadInput';

import { Header } from './components/Header/Header';
import { StatsPanel } from './components/Stats/StatsPanel';
import { MarketView } from './components/Market/MarketView';
import { InventoryView } from './components/Inventory/InventoryView';
import { TravelPanel } from './components/Travel/TravelPanel';
import { EventLog } from './components/EventLog/EventLog';
import { EncounterModal } from './components/Encounter/EncounterModal';
import { FinanceModal } from './components/Finance/FinanceModal';
import { BuyModal } from './components/Modals/BuyModal';
import { SellModal } from './components/Modals/SellModal';
import { TheftModal } from './components/Modals/TheftModal';
import { FreeTokenModal } from './components/Modals/FreeTokenModal';
import { ItemDropModal } from './components/Modals/ItemDropModal';
import { VendorModal } from './components/Modals/VendorModal';
import { TitleScreen } from './components/Screens/TitleScreen';
import { GameOverScreen } from './components/Screens/GameOverScreen';
import { GearLoadoutScreen } from './components/Screens/GearLoadoutScreen';
import { GearPanel } from './components/Gear/GearPanel';

import type { AssetId } from './constants/assets';
import type { CommunityId } from './constants/communities';
import type { ModalType } from './types/game';
import type { GearItemId } from './constants/items';
import { fetchUnlockedGear, getPlayerId } from './lib/gearUnlocks';
import { computeGearEffects, getAllGear } from './utils/gearEffects';

export default function App() {
  const [darkMode, setDarkMode] = useLocalStorage<boolean>('token_wars_theme', false);
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [selectedAssetId, setSelectedAssetId] = useState<AssetId | null>(null);
  const [financeTab, setFinanceTab] = useState<'debt' | 'deposit' | 'withdraw'>('debt');
  const [screenPhase, setScreenPhase] = useState<'title' | 'loadout' | 'game'>('title');
  const [hoveredAssetId, setHoveredAssetId] = useState<AssetId | null>(null);
  const [unlockedGear, setUnlockedGear] = useState<GearItemId[]>([]);

  const {
    state,
    scores,
    hasSave,
    startNewGame,
    travel,
    dismissFreeToken,
    dismissTheft,
    collectItem,
    dismissItemDrop,
    purchaseFromVendor,
    declineVendor,
    finishGame,
    resolveEncounterRun,
    resolveEncounterFight,
    buyAsset,
    sellAsset,
    payDebt,
    deposit,
    withdraw,
    submitScore,
    clearSave,
  } = useGameState();

  useKeyboardNav(screenPhase === 'game');
  useGamepadInput(screenPhase === 'game');

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    const playerId = getPlayerId();
    fetchUnlockedGear(playerId).then(setUnlockedGear);
  }, []);

  function toggleDark() {
    setDarkMode(prev => !prev);
  }

  function handleNewGame() {
    clearSave();
    if (unlockedGear.length > 0) {
      setScreenPhase('loadout');
    } else {
      startNewGame([], 0);
      setScreenPhase('game');
      setActiveModal(null);
    }
  }

  function handleLoadoutStart(selectedGear: GearItemId[], extraDebt: number) {
    startNewGame(selectedGear, extraDebt);
    setScreenPhase('game');
    setActiveModal(null);
  }

  function handleLoadoutSkip() {
    startNewGame([], 0);
    setScreenPhase('game');
    setActiveModal(null);
  }

  function handleContinue() {
    setScreenPhase('game');
  }

  function handleBuyClick(assetId: AssetId) {
    setSelectedAssetId(assetId);
    setActiveModal('buy');
  }

  function handleSellClick(assetId: AssetId) {
    setSelectedAssetId(assetId);
    setActiveModal('sell');
  }

  function handleOpenBank() {
    setFinanceTab('deposit');
    setActiveModal('finance');
  }

  function handleOpenDebt() {
    setFinanceTab('debt');
    setActiveModal('finance');
  }

  function handleTravel(communityId: CommunityId) {
    setActiveModal(null);
    travel(communityId);
  }

  const allGear = getAllGear(state);
  const gearEffects = computeGearEffects(allGear);
  const effectiveCapacity = state.capacity + gearEffects.capacityBonus;
  const usedCapacity = state.inventory.reduce((sum, i) => sum + i.quantity, 0);
  const isGameOver = state.game_phase === 'gameover';

  const firstAssetId = Object.keys(state.market_prices)[0] as AssetId | undefined;
  const buyAssetId: AssetId = selectedAssetId ?? firstAssetId ?? 'grok';
  const buyMarketEntry = state.market_prices[buyAssetId];

  const pendingTheft = state.pending_thefts?.[0] ?? null;
  const pendingFreeToken = state.pending_free_tokens?.[0] ?? null;
  const pendingItemDrop = state.pending_item_drop ?? null;
  const pendingVendor = state.pending_vendor ?? null;

  const hasBlockingModal = pendingTheft || pendingFreeToken || pendingItemDrop || pendingVendor;

  if (screenPhase === 'loadout') {
    return (
      <div className={darkMode ? 'dark' : ''}>
        <GearLoadoutScreen
          unlockedGearIds={unlockedGear}
          onStart={handleLoadoutStart}
          onSkip={handleLoadoutSkip}
        />
      </div>
    );
  }

  if (screenPhase === 'title' && !isGameOver) {
    return (
      <div className={darkMode ? 'dark' : ''}>
        <TitleScreen
          scores={scores}
          hasSave={hasSave()}
          darkMode={darkMode}
          onToggleDark={toggleDark}
          onNewGame={handleNewGame}
          onContinue={handleContinue}
        />
      </div>
    );
  }

  if (isGameOver) {
    return (
      <div className={darkMode ? 'dark' : ''}>
        <GameOverScreen
          state={state}
          onSubmitScore={(name, updateLatest) => submitScore(name, updateLatest)}
          onNewGame={() => {
            handleNewGame();
          }}
        />
      </div>
    );
  }

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div
        className="flex flex-col bg-slate-100 dark:bg-slate-950 sm:overflow-hidden"
        style={{ height: '100dvh', maxWidth: '1024px', margin: '0 auto' }}
      >
        <Header darkMode={darkMode} onToggleDark={toggleDark} />

        <div className="flex-1 flex flex-col gap-px sm:gap-2 sm:p-2 sm:min-h-0 overflow-y-auto sm:overflow-hidden">
          <div className="flex flex-col sm:flex-row gap-px sm:gap-2 flex-none">
            <div className="flex-1">
              <StatsPanel
                state={state}
                onOpenBank={handleOpenBank}
                onOpenDebt={handleOpenDebt}
              />
            </div>
            <div className="flex-1">
              <TravelPanel
                currentCommunity={state.current_community}
                currentDay={state.current_day}
                onTravel={handleTravel}
                onFinish={finishGame}
              />
            </div>
          </div>

          <GearPanel
            equippedGear={state.equipped_gear ?? []}
            foundGear={state.found_gear ?? []}
          />

          <div className="flex flex-col sm:flex-1 sm:grid sm:grid-cols-2 gap-px sm:gap-2 sm:min-h-0">
            <MarketView state={state} hoveredAssetId={hoveredAssetId} onHoverAsset={setHoveredAssetId} onBuy={handleBuyClick} />
            <InventoryView state={state} hoveredAssetId={hoveredAssetId} onHoverAsset={setHoveredAssetId} onSell={handleSellClick} />
          </div>
        </div>

        <EventLog events={state.event_log} />

        {state.game_phase === 'encounter' && state.encounter_state && !pendingTheft && (
          <EncounterModal
            encounter={state.encounter_state}
            onRun={(success) => resolveEncounterRun(success)}
            onFight={(success, healthLost) => resolveEncounterFight(success, healthLost)}
          />
        )}

        {pendingTheft && (
          <TheftModal
            type={pendingTheft.type}
            amountLost={pendingTheft.amountLost}
            newTotal={pendingTheft.newTotal}
            onClose={dismissTheft}
          />
        )}

        {pendingFreeToken && !pendingTheft && (
          <FreeTokenModal
            assetId={pendingFreeToken.assetId}
            quantity={pendingFreeToken.quantity}
            communityName={pendingFreeToken.communityName}
            onClose={dismissFreeToken}
          />
        )}

        {pendingItemDrop && !pendingTheft && !pendingFreeToken && (
          <ItemDropModal
            drop={pendingItemDrop}
            state={state}
            onCollect={collectItem}
            onDismiss={dismissItemDrop}
          />
        )}

        {pendingVendor && !pendingTheft && !pendingFreeToken && !pendingItemDrop && (
          <VendorModal
            vendor={pendingVendor}
            state={state}
            onPurchase={purchaseFromVendor}
            onDecline={declineVendor}
          />
        )}

        {activeModal === 'buy' && buyMarketEntry && !hasBlockingModal && (
          <BuyModal
            assetId={buyAssetId}
            marketEntry={buyMarketEntry}
            cash={state.current_cash}
            bankSavings={state.bank_savings}
            usedCapacity={usedCapacity}
            totalCapacity={effectiveCapacity}
            onBuy={(id, qty) => { buyAsset(id, qty); setActiveModal(null); }}
            onClose={() => setActiveModal(null)}
          />
        )}

        {activeModal === 'sell' && selectedAssetId && !hasBlockingModal && (() => {
          const invItem = state.inventory.find(i => i.assetId === selectedAssetId);
          const mp = state.market_prices[selectedAssetId];
          if (!invItem || !mp) return null;
          return (
            <SellModal
              assetId={selectedAssetId}
              marketEntry={mp}
              inventoryItem={invItem}
              onSell={(id, qty) => { sellAsset(id, qty); setActiveModal(null); }}
              onClose={() => setActiveModal(null)}
            />
          );
        })()}

        {activeModal === 'finance' && !hasBlockingModal && (
          <FinanceModal
            cash={state.current_cash}
            bankSavings={state.bank_savings}
            debt={state.current_debt}
            initialTab={financeTab}
            onClose={() => setActiveModal(null)}
            onPayDebt={amount => { payDebt(amount); setActiveModal(null); }}
            onDeposit={amount => { deposit(amount); }}
            onWithdraw={amount => { withdraw(amount); }}
          />
        )}
      </div>
    </div>
  );
}
