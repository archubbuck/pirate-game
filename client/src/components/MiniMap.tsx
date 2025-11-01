import { useGameStore } from "@/lib/stores/useGameStore";
import { useState } from "react";

export function MiniMap() {
  const [isExpanded, setIsExpanded] = useState(false);
  const tiles = useGameStore((state) => state.tiles);
  const player = useGameStore((state) => state.player);
  const islands = useGameStore((state) => state.islands);
  const enemyShips = useGameStore((state) => state.enemyShips);
  const gridSize = useGameStore((state) => state.gridSize);
  
  const mapSize = isExpanded ? 200 : 120;
  const tileSize = mapSize / gridSize;

  return (
    <div className="bg-gray-900/95 backdrop-blur-md border border-blue-700/50 rounded-lg overflow-hidden shadow-xl">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-3 py-2 flex items-center justify-between hover:bg-gray-800/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">🗺️</span>
          <span className="text-blue-400 font-bold text-sm">Mini Map</span>
        </div>
        <span className="text-xs text-gray-400">{isExpanded ? "▼" : "▶"}</span>
      </button>

      {isExpanded && (
        <div className="p-3 animate-in slide-in-from-top duration-200">
          <div 
            className="relative bg-gray-950/50 border border-gray-700/30 rounded overflow-hidden"
            style={{ width: mapSize, height: mapSize }}
          >
            {tiles.map((row, y) =>
              row.map((tile, x) => {
                const isIsland = islands.some(island =>
                  island.positions.some(pos => pos.x === x && pos.y === y)
                );
                
                return (
                  <div
                    key={`${x}-${y}`}
                    className="absolute"
                    style={{
                      left: x * tileSize,
                      top: y * tileSize,
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
              })
            )}

            {enemyShips.map((ship) => (
              <div
                key={ship.id}
                className="absolute rounded-full bg-red-500"
                style={{
                  left: ship.visualPosition.x * tileSize - tileSize / 4,
                  top: ship.visualPosition.y * tileSize - tileSize / 4,
                  width: tileSize / 2,
                  height: tileSize / 2,
                }}
              />
            ))}

            <div
              className="absolute rounded-full bg-cyan-400 shadow-lg"
              style={{
                left: player.visualPosition.x * tileSize - tileSize / 3,
                top: player.visualPosition.y * tileSize - tileSize / 3,
                width: (tileSize * 2) / 3,
                height: (tileSize * 2) / 3,
              }}
            />
          </div>
          
          <div className="mt-2 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-cyan-400"></div>
              <span className="text-gray-400">You</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-red-500"></div>
              <span className="text-gray-400">Enemies</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-amber-700 rounded-sm"></div>
              <span className="text-gray-400">Islands</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
