import { useGameStore } from "@/lib/stores/useGameStore";

export function MiniMap() {
  const tiles = useGameStore((state) => state.tiles);
  const player = useGameStore((state) => state.player);
  const islands = useGameStore((state) => state.islands);
  const enemyShips = useGameStore((state) => state.enemyShips);
  const gridSize = useGameStore((state) => state.gridSize);
  const visionRadius = useGameStore((state) => state.visionRadius);
  
  const mapSize = 180;
  const minimapRadius = 15;
  const minimapViewSize = minimapRadius * 2 + 1;
  const tileSize = mapSize / minimapViewSize;
  
  const centerX = player.position.x;
  const centerY = player.position.y;
  
  const baseMinX = centerX - minimapRadius;
  const baseMinY = centerY - minimapRadius;
  
  const minX = Math.max(0, baseMinX);
  const maxX = Math.min(gridSize - 1, centerX + minimapRadius);
  const minY = Math.max(0, baseMinY);
  const maxY = Math.min(gridSize - 1, centerY + minimapRadius);
  
  const getHexDistance = (x1: number, y1: number, x2: number, y2: number): number => {
    const q1 = x1 - Math.floor(y1 / 2);
    const r1 = y1;
    const q2 = x2 - Math.floor(y2 / 2);
    const r2 = y2;
    return (Math.abs(q1 - q2) + Math.abs(r1 - r2) + Math.abs((q1 + r1) - (q2 + r2))) / 2;
  };

  return (
    <div className="bg-stone-800 border-4 border-stone-950 rounded shadow-2xl" style={{ boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.5), 0 4px 8px rgba(0,0,0,0.8)' }}>
      <div className="bg-gradient-to-b from-amber-900/20 to-transparent px-2 py-1.5 border-b-2 border-stone-950">
        <div className="flex items-center gap-2">
          <span className="text-base">🗺️</span>
          <span className="text-amber-200 font-bold text-sm tracking-wide" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}>
            Mini Map
          </span>
        </div>
      </div>

      <div className="p-2">
        <div 
          className="relative bg-black/60 border-2 border-stone-950 rounded overflow-hidden"
          style={{ 
            width: mapSize, 
            height: mapSize,
            boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.8)'
          }}
        >
          {tiles.map((row, y) => {
            if (y < minY || y > maxY) return null;
            return row.map((tile, x) => {
              if (x < minX || x > maxX) return null;
              
              const distance = getHexDistance(x, y, centerX, centerY);
              const inVision = distance <= visionRadius;
              
              if (!inVision) return null;
              
              const isIsland = islands.some(island =>
                island.positions.some(pos => pos.x === x && pos.y === y)
              );
              
              const mapX = (x - baseMinX) * tileSize;
              const mapY = (y - baseMinY) * tileSize;
              
              return (
                <div
                  key={`${x}-${y}`}
                  className="absolute"
                  style={{
                    left: mapX,
                    top: mapY,
                    width: tileSize,
                    height: tileSize,
                    backgroundColor: isIsland
                      ? '#8b7355'
                      : tile.isExplored
                      ? '#1a4d68'
                      : '#0a0a0a',
                    opacity: tile.isExplored ? 1 : 0.3,
                  }}
                />
              );
            });
          })}

          {enemyShips.filter(ship => {
            const inRange = ship.visualPosition.x >= minX && ship.visualPosition.x <= maxX &&
                            ship.visualPosition.y >= minY && ship.visualPosition.y <= maxY;
            const distance = getHexDistance(ship.visualPosition.x, ship.visualPosition.y, centerX, centerY);
            return inRange && distance <= visionRadius;
          }).map((ship) => (
            <div
              key={ship.id}
              className="absolute rounded-full bg-red-500"
              style={{
                left: (ship.visualPosition.x - baseMinX) * tileSize - tileSize / 4,
                top: (ship.visualPosition.y - baseMinY) * tileSize - tileSize / 4,
                width: tileSize / 2,
                height: tileSize / 2,
              }}
            />
          ))}

          <div
            className="absolute rounded-full bg-cyan-400 shadow-lg"
            style={{
              left: (player.visualPosition.x - baseMinX) * tileSize - tileSize / 3,
              top: (player.visualPosition.y - baseMinY) * tileSize - tileSize / 3,
              width: (tileSize * 2) / 3,
              height: (tileSize * 2) / 3,
            }}
          />
        </div>
        
        <div className="mt-1.5 flex items-center justify-between text-xs bg-stone-900/50 px-2 py-1 rounded border border-stone-950/50">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-cyan-400"></div>
            <span className="text-stone-300 text-xs">You</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-red-500"></div>
            <span className="text-stone-300 text-xs">Foes</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-amber-700 rounded-sm"></div>
            <span className="text-stone-300 text-xs">Land</span>
          </div>
        </div>
      </div>
    </div>
  );
}
