import { useEffect, useRef } from "react";
import { useGameStore, type EnemyShip, type Position } from "@/lib/stores/useGameStore";

function findRandomPath(start: Position, gridSize: number, tiles: any[][]): Position[] {
  const directions = [
    { x: 1, y: 0 }, { x: -1, y: 0 }, { x: 0, y: 1 }, { x: 0, y: -1 },
    { x: 1, y: 1 }, { x: -1, y: -1 }, { x: 1, y: -1 }, { x: -1, y: 1 },
  ];
  
  const dir = directions[Math.floor(Math.random() * directions.length)];
  const steps = Math.floor(Math.random() * 3) + 2;
  
  const path: Position[] = [];
  let current = { ...start };
  
  for (let i = 0; i < steps; i++) {
    const next = { x: current.x + dir.x, y: current.y + dir.y };
    
    if (
      next.x >= 0 &&
      next.x < gridSize &&
      next.y >= 0 &&
      next.y < gridSize &&
      tiles[next.y]?.[next.x]?.isWalkable
    ) {
      path.push(next);
      current = next;
    } else {
      break;
    }
  }
  
  return path;
}

export function EnemyAIController() {
  const enemyShips = useGameStore((state) => state.enemyShips);
  const gridSize = useGameStore((state) => state.gridSize);
  const tiles = useGameStore((state) => state.tiles);
  const updateEnemyShip = useGameStore((state) => state.updateEnemyShip);
  
  const lastUpdateTime = useRef(performance.now());
  const shipProgress = useRef<Map<string, number>>(new Map());
  const TILE_TRANSITION_TIME = 600;
  
  useEffect(() => {
    let animationFrameId: number;
    
    const animate = () => {
      const now = performance.now();
      const delta = now - lastUpdateTime.current;
      lastUpdateTime.current = now;
      
      const currentTime = Date.now();
      
      enemyShips.forEach(ship => {
        if (ship.currentPath.length === 0 && currentTime >= ship.nextMoveTime) {
          const newPath = findRandomPath(ship.position, gridSize, tiles);
          if (newPath.length > 0) {
            updateEnemyShip({
              ...ship,
              currentPath: newPath,
              nextMoveTime: currentTime + Math.random() * 8000 + 5000,
            });
            shipProgress.current.set(ship.id, 0);
          }
        }
        
        if (ship.currentPath.length > 0) {
          const currentProgress = shipProgress.current.get(ship.id) || 0;
          const newProgress = currentProgress + delta;
          
          const nextPos = ship.currentPath[0];
          const t = Math.min(newProgress / TILE_TRANSITION_TIME, 1);
          
          const currentX = ship.position.x;
          const currentY = ship.position.y;
          const targetX = nextPos.x;
          const targetY = nextPos.y;
          
          const visualX = currentX + (targetX - currentX) * t;
          const visualY = currentY + (targetY - currentY) * t;
          
          const dx = targetX - currentX;
          const dy = targetY - currentY;
          const rotation = dx !== 0 || dy !== 0 ? Math.atan2(dy, dx) : ship.rotation;
          
          if (newProgress >= TILE_TRANSITION_TIME) {
            const newPath = ship.currentPath.slice(1);
            updateEnemyShip({
              ...ship,
              position: nextPos,
              visualPosition: { x: nextPos.x, y: nextPos.y },
              currentPath: newPath,
              rotation,
            });
            shipProgress.current.set(ship.id, 0);
          } else {
            updateEnemyShip({
              ...ship,
              visualPosition: {
                x: visualX,
                y: visualY,
              },
              rotation,
            });
            shipProgress.current.set(ship.id, newProgress);
          }
        }
      });
      
      animationFrameId = requestAnimationFrame(animate);
    };
    
    animationFrameId = requestAnimationFrame(animate);
    
    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [enemyShips, gridSize, tiles, updateEnemyShip]);
  
  return null;
}
