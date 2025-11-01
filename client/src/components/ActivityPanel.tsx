import { useGameStore } from "@/lib/stores/useGameStore";
import { useState, useEffect } from "react";

export function ActivityPanel() {
  const isMoving = useGameStore((state) => state.isMoving);
  const isCollecting = useGameStore((state) => state.isCollecting);
  const travelStartTime = useGameStore((state) => state.travelStartTime);
  const travelDuration = useGameStore((state) => state.travelDuration);
  const collectionStartTime = useGameStore((state) => state.collectionStartTime);
  const collectionDuration = useGameStore((state) => state.collectionDuration);
  const combatState = useGameStore((state) => state.combatState);
  
  const [, setTick] = useState(0);
  
  useEffect(() => {
    if (!isMoving && !isCollecting && !combatState.isInCombat) return;
    
    const interval = setInterval(() => {
      setTick(t => t + 1);
    }, 100);
    
    return () => clearInterval(interval);
  }, [isMoving, isCollecting, combatState.isInCombat]);

  const getTravelProgress = () => {
    if (!isMoving || !travelStartTime || !travelDuration) return 0;
    const elapsed = Date.now() - travelStartTime;
    return Math.min(100, (elapsed / travelDuration) * 100);
  };

  const getTravelTimeRemaining = () => {
    if (!isMoving || !travelStartTime || !travelDuration) return 0;
    const elapsed = Date.now() - travelStartTime;
    const remaining = Math.max(0, travelDuration - elapsed);
    return remaining / 1000;
  };

  const getCollectionProgress = () => {
    if (!isCollecting || !collectionStartTime || !collectionDuration) return 0;
    const elapsed = Date.now() - collectionStartTime;
    return Math.min(100, (elapsed / collectionDuration) * 100);
  };

  const getCollectionTimeRemaining = () => {
    if (!isCollecting || !collectionStartTime || !collectionDuration) return 0;
    const elapsed = Date.now() - collectionStartTime;
    const remaining = Math.max(0, collectionDuration - elapsed);
    return remaining / 1000;
  };

  const getCombatProgress = () => {
    return combatState.combatProgress;
  };

  const getCombatTimeRemaining = () => {
    if (!combatState.isInCombat || !combatState.combatStartTime) return 0;
    const elapsed = Date.now() - combatState.combatStartTime;
    const remaining = Math.max(0, combatState.combatDuration - elapsed);
    return remaining / 1000;
  };

  const hasActivity = isMoving || isCollecting || combatState.isInCombat;

  if (!hasActivity) return null;

  return (
    <div className="bg-stone-800 border-4 border-stone-950 rounded shadow-2xl p-2 space-y-2 min-w-48" style={{ boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.5), 0 4px 8px rgba(0,0,0,0.8)' }}>
      <div className="text-amber-200 font-bold text-xs mb-1 border-b-2 border-stone-950 pb-1 bg-gradient-to-b from-amber-900/20 to-transparent px-1" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}>
        ⚙️ Active Tasks
      </div>
      
      {isMoving && (
        <div className="space-y-1 bg-stone-900/50 rounded px-2 py-1 border border-stone-950/50">
          <div className="flex items-center justify-between text-xs">
            <span className="text-blue-300 flex items-center gap-1">
              <span className="animate-pulse">⛵</span>
              <span>Sailing</span>
            </span>
            <span className="font-mono text-amber-200 font-bold">{getTravelTimeRemaining().toFixed(1)}s</span>
          </div>
          <div className="w-full h-1.5 bg-black/60 rounded border border-stone-950/50 overflow-hidden" style={{ boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.8)' }}>
            <div
              className="h-full bg-gradient-to-r from-blue-600 to-cyan-500 transition-all duration-100"
              style={{ width: `${getTravelProgress()}%` }}
            />
          </div>
        </div>
      )}

      {isCollecting && (
        <div className="space-y-1 bg-stone-900/50 rounded px-2 py-1 border border-stone-950/50">
          <div className="flex items-center justify-between text-xs">
            <span className="text-green-300 flex items-center gap-1">
              <span className="animate-pulse">🔧</span>
              <span>Collecting</span>
            </span>
            <span className="font-mono text-amber-200 font-bold">{getCollectionTimeRemaining().toFixed(1)}s</span>
          </div>
          <div className="w-full h-1.5 bg-black/60 rounded border border-stone-950/50 overflow-hidden" style={{ boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.8)' }}>
            <div
              className="h-full bg-gradient-to-r from-green-600 to-emerald-500 transition-all duration-100"
              style={{ width: `${getCollectionProgress()}%` }}
            />
          </div>
        </div>
      )}

      {combatState.isInCombat && (
        <div className="space-y-1 bg-stone-900/50 rounded px-2 py-1 border border-stone-950/50">
          <div className="flex items-center justify-between text-xs">
            <span className="text-red-300 flex items-center gap-1">
              <span className="animate-pulse">⚔️</span>
              <span>Combat</span>
            </span>
            <span className="font-mono text-amber-200 font-bold">{getCombatTimeRemaining().toFixed(1)}s</span>
          </div>
          <div className="w-full h-1.5 bg-black/60 rounded border border-stone-950/50 overflow-hidden" style={{ boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.8)' }}>
            <div
              className="h-full bg-gradient-to-r from-red-600 to-orange-500 transition-all duration-100"
              style={{ width: `${getCombatProgress()}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
