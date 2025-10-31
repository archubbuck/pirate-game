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
  
  useEffect(() => {
    const updateInterval = setInterval(() => {
      const now = Date.now();
      const deltaTime = (now - lastUpdateTime.current) / 1000;
      lastUpdateTime.current = now;
      
      enemyShips.forEach(ship => {
        if (ship.currentPath.length === 0 && now >= ship.nextMoveTime) {
          const newPath = findRandomPath(ship.position, gridSize, tiles);
          updateEnemyShip({
            ...ship,
            currentPath: newPath,
            nextMoveTime: now + Math.random() * 8000 + 5000,
          });
        }
        
        if (ship.currentPath.length > 0) {
          const nextPos = ship.currentPath[0];
          const dx = nextPos.x - ship.visualPosition.x;
          const dy = nextPos.y - ship.visualPosition.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 0.05) {
            const newPath = ship.currentPath.slice(1);
            updateEnemyShip({
              ...ship,
              position: nextPos,
              visualPosition: { x: nextPos.x, y: nextPos.y },
              currentPath: newPath,
              rotation: Math.atan2(dy, dx),
            });
          } else {
            const moveAmount = ship.moveSpeed * deltaTime;
            const ratio = Math.min(moveAmount / distance, 1);
            
            updateEnemyShip({
              ...ship,
              visualPosition: {
                x: ship.visualPosition.x + dx * ratio,
                y: ship.visualPosition.y + dy * ratio,
              },
              rotation: Math.atan2(dy, dx),
            });
          }
        }
      });
    }, 100);
    
    return () => clearInterval(updateInterval);
  }, [enemyShips, gridSize, tiles, updateEnemyShip]);
  
  return null;
}
