import { useState, useEffect } from "react";
import { useGameStore, EnemyShip, Collectible } from "@/lib/stores/useGameStore";
import { NPC_CONFIGS } from "@/config/npcConfig";

interface ContextMenuProps {
  position: { x: number; y: number };
  target: {
    type: "enemy" | "collectible" | "artifact";
    data: any;
  } | null;
  onClose: () => void;
}

export function ContextMenu({ position, target, onClose }: ContextMenuProps) {
  if (!target) return null;

  const renderEnemyInfo = (enemy: EnemyShip) => {
    const config = NPC_CONFIGS[enemy.npcType];
    if (!config) return null;

    return (
      <div className="bg-gray-900/98 backdrop-blur-md border-2 border-red-700/80 rounded-lg p-4 min-w-[280px] max-w-[320px] shadow-2xl">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="text-red-400 font-bold text-lg">{config.name}</h3>
            <p className="text-gray-400 text-xs">Level {enemy.level} {config.label}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-300 transition-colors text-xl leading-none"
          >
            ×
          </button>
        </div>
        
        <p className="text-gray-300 text-sm mb-3 leading-relaxed">{config.description}</p>
        
        <div className="space-y-2 border-t border-gray-700/50 pt-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-400 text-xs">Health:</span>
            <span className="text-white text-sm font-mono">
              {enemy.health} / {enemy.maxHealth}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-gray-400 text-xs">XP Reward:</span>
            <span className="text-green-400 text-sm font-mono">
              {config.stats.experienceReward} XP
            </span>
          </div>
          
          {config.stats.baseDamage && (
            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-xs">Attack:</span>
              <span className="text-orange-400 text-sm font-mono">
                {config.stats.baseDamage + (config.stats.damagePerLevel || 0) * (enemy.level - 1)}
              </span>
            </div>
          )}
          
          <div className="border-t border-gray-700/50 pt-2 mt-2">
            <p className="text-gray-400 text-xs mb-1">Potential Loot:</p>
            <div className="flex flex-wrap gap-1">
              {config.dropTable.map((drop, idx) => (
                <span
                  key={idx}
                  className="bg-cyan-900/40 border border-cyan-700/50 text-cyan-200 text-xs px-2 py-0.5 rounded"
                >
                  {drop.type} ({Math.floor(drop.dropChance * 100)}%)
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderCollectibleInfo = (collectible: Collectible) => {
    const typeNames: Record<string, string> = {
      timber: "Timber Salvage",
      alloy: "Alloy Scrap",
      circuit: "Circuit Relics",
      biofiber: "Biofibers",
    };

    const typeDescriptions: Record<string, string> = {
      timber: "Reclaimed wood from submerged structures. Essential for basic construction.",
      alloy: "Corroded metal fragments. Can be refined for structural use.",
      circuit: "Pre-flood electronic components. Valuable for advanced technology.",
      biofiber: "Mutated organic materials. Used in medical and agricultural applications.",
    };

    return (
      <div className="bg-gray-900/98 backdrop-blur-md border-2 border-cyan-700/80 rounded-lg p-4 min-w-[280px] max-w-[320px] shadow-2xl">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="text-cyan-400 font-bold text-lg">{typeNames[collectible.type]}</h3>
            <p className="text-gray-400 text-xs">Resource Node</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-300 transition-colors text-xl leading-none"
          >
            ×
          </button>
        </div>
        
        <p className="text-gray-300 text-sm mb-3 leading-relaxed">
          {typeDescriptions[collectible.type]}
        </p>
        
        <div className="space-y-2 border-t border-gray-700/50 pt-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-400 text-xs">Richness:</span>
            <span className="text-white text-sm font-mono">
              {collectible.richness}/10
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-gray-400 text-xs">Collection Time:</span>
            <span className="text-cyan-400 text-sm font-mono">
              {(collectible.collectionTime / 1000).toFixed(1)}s
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-gray-400 text-xs">Position:</span>
            <span className="text-gray-300 text-sm font-mono">
              ({collectible.position.x}, {collectible.position.y})
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div
      style={{
        position: "fixed",
        left: `${position.x}px`,
        top: `${position.y}px`,
        zIndex: 9999,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {target.type === "enemy" && renderEnemyInfo(target.data)}
      {target.type === "collectible" && renderCollectibleInfo(target.data)}
    </div>
  );
}

export function useContextMenu() {
  const [contextMenu, setContextMenu] = useState<{
    position: { x: number; y: number };
    target: { type: "enemy" | "collectible" | "artifact"; data: any } | null;
  } | null>(null);

  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);
  const [longPressPosition, setLongPressPosition] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      
      const canvas = document.querySelector("canvas");
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const canvasX = e.clientX - rect.left;
      const canvasY = e.clientY - rect.top;

      const target = findTargetAtPosition(canvasX, canvasY, rect);
      
      if (target) {
        setContextMenu({
          position: { x: e.clientX, y: e.clientY },
          target,
        });
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;

      const touch = e.touches[0];
      setLongPressPosition({ x: touch.clientX, y: touch.clientY });

      const timer = setTimeout(() => {
        const canvas = document.querySelector("canvas");
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const canvasX = touch.clientX - rect.left;
        const canvasY = touch.clientY - rect.top;

        const target = findTargetAtPosition(canvasX, canvasY, rect);
        
        if (target) {
          setContextMenu({
            position: { x: touch.clientX, y: touch.clientY },
            target,
          });
        }
      }, 500);

      setLongPressTimer(timer);
    };

    const handleTouchEnd = () => {
      if (longPressTimer) {
        clearTimeout(longPressTimer);
        setLongPressTimer(null);
      }
      setLongPressPosition(null);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!longPressPosition || e.touches.length !== 1) return;

      const touch = e.touches[0];
      const dx = touch.clientX - longPressPosition.x;
      const dy = touch.clientY - longPressPosition.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance > 10) {
        if (longPressTimer) {
          clearTimeout(longPressTimer);
          setLongPressTimer(null);
        }
        setLongPressPosition(null);
      }
    };

    const handleClick = (e: MouseEvent) => {
      if (contextMenu && !(e.target as HTMLElement).closest('.context-menu')) {
        setContextMenu(null);
      }
    };

    window.addEventListener("contextmenu", handleContextMenu);
    window.addEventListener("touchstart", handleTouchStart);
    window.addEventListener("touchend", handleTouchEnd);
    window.addEventListener("touchmove", handleTouchMove);
    window.addEventListener("click", handleClick);

    return () => {
      window.removeEventListener("contextmenu", handleContextMenu);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchend", handleTouchEnd);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("click", handleClick);
      
      if (longPressTimer) {
        clearTimeout(longPressTimer);
      }
    };
  }, [contextMenu, longPressTimer, longPressPosition]);

  return {
    contextMenu,
    closeContextMenu: () => setContextMenu(null),
  };
}

function findTargetAtPosition(
  canvasX: number,
  canvasY: number,
  rect: DOMRect
): { type: "enemy" | "collectible" | "artifact"; data: any } | null {
  const state = useGameStore.getState();
  const tileSize = 40;
  const { cameraTransform } = state;
  
  const screenX = canvasX - cameraTransform.containerX;
  const screenY = canvasY - cameraTransform.containerY;
  
  const worldX = cameraTransform.pivotX + screenX / cameraTransform.scale;
  const worldY = cameraTransform.pivotY + screenY / cameraTransform.scale;

  const clickRadius = 20;

  for (const enemy of state.enemyShips) {
    const enemyWorldX = enemy.visualPosition.x * tileSize;
    const enemyWorldY = enemy.visualPosition.y * tileSize;
    const dx = worldX - enemyWorldX;
    const dy = worldY - enemyWorldY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance <= clickRadius) {
      return { type: "enemy", data: enemy };
    }
  }

  for (const collectible of state.collectibles) {
    const collectibleWorldX = collectible.position.x * tileSize;
    const collectibleWorldY = collectible.position.y * tileSize;
    const dx = worldX - collectibleWorldX;
    const dy = worldY - collectibleWorldY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance <= clickRadius) {
      return { type: "collectible", data: collectible };
    }
  }

  return null;
}
