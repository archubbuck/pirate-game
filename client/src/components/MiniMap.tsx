import { useGameStore } from "@/lib/stores/useGameStore";

export function MiniMap() {
  const tiles = useGameStore((state) => state.tiles);
  const player = useGameStore((state) => state.player);
  const islands = useGameStore((state) => state.islands);
  const enemyShips = useGameStore((state) => state.enemyShips);
  const gridSize = useGameStore((state) => state.gridSize);
  
  const mapSize = 180;
  const tileSize = mapSize / gridSize;

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
