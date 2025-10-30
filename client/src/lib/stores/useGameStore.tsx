import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

export type GamePhase = "ready" | "playing" | "ended";

export interface Position {
  x: number;
  y: number;
}

export interface Player {
  position: Position;
  visualPosition: { x: number; y: number };
}

export interface Collectible {
  id: string;
  position: Position;
  type: string;
}

export interface Tile {
  x: number;
  y: number;
  isWalkable: boolean;
  isExplored: boolean;
  isHighlighted: boolean;
}

interface GameState {
  phase: GamePhase;
  
  player: Player;
  collectibles: Collectible[];
  collectedCount: number;
  tiles: Tile[][];
  
  currentPath: Position[];
  isMoving: boolean;
  targetPosition: Position | null;
  
  hoveredTile: Position | null;
  
  gridSize: number;
  
  start: () => void;
  restart: () => void;
  end: () => void;
  
  setTargetPosition: (position: Position | null) => void;
  updatePlayerPosition: (position: Position) => void;
  updateVisualPosition: (x: number, y: number) => void;
  setPath: (path: Position[]) => void;
  setIsMoving: (isMoving: boolean) => void;
  collectItem: (id: string) => void;
  
  revealTilesAround: (position: Position, radius: number) => void;
  highlightPath: (path: Position[]) => void;
  clearHighlights: () => void;
  setHoveredTile: (position: Position | null) => void;
  
  getDistance: (from: Position, to: Position) => number;
}

const GRID_SIZE = 40;
const COLLECTIBLE_COUNT = 30;

const createInitialTiles = (): Tile[][] => {
  const tiles: Tile[][] = [];
  for (let y = 0; y < GRID_SIZE; y++) {
    tiles[y] = [];
    for (let x = 0; x < GRID_SIZE; x++) {
      tiles[y][x] = {
        x,
        y,
        isWalkable: true,
        isExplored: false,
        isHighlighted: false,
      };
    }
  }
  return tiles;
};

const createInitialPlayer = (): Player => ({
  position: { x: 20, y: 20 },
  visualPosition: { x: 20, y: 20 },
});

const createCollectibles = (): Collectible[] => {
  const collectibles: Collectible[] = [];
  const occupied = new Set<string>();
  
  occupied.add("20,20");
  
  const types = ["gem", "coin", "star", "crystal"];
  
  for (let i = 0; i < COLLECTIBLE_COUNT; i++) {
    let position: Position;
    let posKey: string;
    
    do {
      position = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
      posKey = `${position.x},${position.y}`;
    } while (occupied.has(posKey));
    
    occupied.add(posKey);
    
    collectibles.push({
      id: `collectible-${i}`,
      position,
      type: types[Math.floor(Math.random() * types.length)],
    });
  }
  
  return collectibles;
};

export const useGameStore = create<GameState>()(
  subscribeWithSelector((set, get) => ({
    phase: "ready",
    
    player: createInitialPlayer(),
    collectibles: createCollectibles(),
    collectedCount: 0,
    tiles: createInitialTiles(),
    
    currentPath: [],
    isMoving: false,
    targetPosition: null,
    
    hoveredTile: null,
    
    gridSize: GRID_SIZE,
    
    start: () => {
      const initialPlayer = createInitialPlayer();
      set({ phase: "playing" });
      get().revealTilesAround(initialPlayer.position, 5);
      console.log("Game started - Explore and collect!");
    },
    
    restart: () => {
      const initialPlayer = createInitialPlayer();
      set({
        phase: "ready",
        player: initialPlayer,
        collectibles: createCollectibles(),
        collectedCount: 0,
        tiles: createInitialTiles(),
        currentPath: [],
        isMoving: false,
        targetPosition: null,
        hoveredTile: null,
      });
      console.log("Game restarted");
    },
    
    end: () => {
      set({ phase: "ended" });
      console.log("Game ended");
    },
    
    getDistance: (from: Position, to: Position) => {
      return Math.max(Math.abs(from.x - to.x), Math.abs(from.y - to.y));
    },
    
    setTargetPosition: (position: Position | null) => {
      set({ targetPosition: position });
    },
    
    updatePlayerPosition: (position: Position) => {
      set(state => ({
        player: { ...state.player, position }
      }));
      get().revealTilesAround(position, 5);
      
      const collectible = get().collectibles.find(
        c => c.position.x === position.x && c.position.y === position.y
      );
      
      if (collectible) {
        get().collectItem(collectible.id);
      }
    },
    
    updateVisualPosition: (x: number, y: number) => {
      set(state => ({
        player: { ...state.player, visualPosition: { x, y } }
      }));
    },
    
    setPath: (path: Position[]) => {
      set({ currentPath: path });
    },
    
    setIsMoving: (isMoving: boolean) => {
      set({ isMoving });
    },
    
    collectItem: (id: string) => {
      set(state => ({
        collectibles: state.collectibles.filter(c => c.id !== id),
        collectedCount: state.collectedCount + 1,
      }));
      console.log(`Collected item ${id}! Total: ${get().collectedCount}`);
      
      if (get().collectibles.length === 0) {
        setTimeout(() => {
          get().end();
        }, 500);
      }
    },
    
    revealTilesAround: (position: Position, radius: number) => {
      set(state => {
        const newTiles = state.tiles.map(row =>
          row.map(tile => {
            const distance = Math.sqrt(
              Math.pow(tile.x - position.x, 2) + Math.pow(tile.y - position.y, 2)
            );
            
            if (distance <= radius) {
              return { ...tile, isExplored: true };
            }
            return tile;
          })
        );
        return { tiles: newTiles };
      });
    },
    
    highlightPath: (path: Position[]) => {
      set(state => {
        const newTiles = state.tiles.map(row =>
          row.map(tile => ({
            ...tile,
            isHighlighted: path.some(p => p.x === tile.x && p.y === tile.y),
          }))
        );
        return { tiles: newTiles };
      });
    },
    
    clearHighlights: () => {
      set(state => {
        const newTiles = state.tiles.map(row =>
          row.map(tile => ({
            ...tile,
            isHighlighted: false,
          }))
        );
        return { tiles: newTiles };
      });
    },
    
    setHoveredTile: (position: Position | null) => {
      set({ hoveredTile: position });
    },
  }))
);
