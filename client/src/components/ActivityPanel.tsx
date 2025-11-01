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
    <div className="bg-gray-900/95 backdrop-blur-md border border-blue-700/50 rounded-lg overflow-hidden shadow-xl p-3 space-y-2 min-w-48">
      <div className="text-blue-400 font-bold text-xs mb-2">⚙️ Active Tasks</div>
      
      {isMoving && (
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-blue-300 flex items-center gap-1">
              <span className="animate-pulse">⛵</span>
              <span>Sailing</span>
            </span>
            <span className="font-mono text-white font-bold">{getTravelTimeRemaining().toFixed(1)}s</span>
          </div>
          <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-100"
              style={{ width: `${getTravelProgress()}%` }}
            />
          </div>
        </div>
      )}

      {isCollecting && (
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-green-300 flex items-center gap-1">
              <span className="animate-pulse">🔧</span>
              <span>Collecting</span>
            </span>
            <span className="font-mono text-white font-bold">{getCollectionTimeRemaining().toFixed(1)}s</span>
          </div>
          <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-green-500 to-emerald-400 transition-all duration-100"
              style={{ width: `${getCollectionProgress()}%` }}
            />
          </div>
        </div>
      )}

      {combatState.isInCombat && (
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-red-300 flex items-center gap-1">
              <span className="animate-pulse">⚔️</span>
              <span>Combat</span>
            </span>
            <span className="font-mono text-white font-bold">{getCombatTimeRemaining().toFixed(1)}s</span>
          </div>
          <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-red-500 to-orange-400 transition-all duration-100"
              style={{ width: `${getCombatProgress()}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
