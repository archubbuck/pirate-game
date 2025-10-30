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

export interface CollectedItem {
  id: string;
  type: string;
}

export interface PowerUp {
  type: "speed" | "vision" | "magnet";
  expiresAt?: number;
}

export interface MapUnlock {
  id: string;
  name: string;
  cost: number;
  unlocked: boolean;
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
  collectedItems: CollectedItem[];
  tiles: Tile[][];
  
  currentPath: Position[];
  isMoving: boolean;
  targetPosition: Position | null;
  
  hoveredTile: Position | null;
  
  gridSize: number;
  
  isInventoryOpen: boolean;
  isShopOpen: boolean;
  activePowerUps: PowerUp[];
  mapUnlocks: MapUnlock[];
  visionRadius: number;
  
  start: () => void;
  restart: () => void;
  end: () => void;
  
  setTargetPosition: (position: Position | null) => void;
  updatePlayerPosition: (position: Position) => void;
  updateVisualPosition: (x: number, y: number) => void;
  setPath: (path: Position[]) => void;
  setIsMoving: (isMoving: boolean) => void;
  collectItem: (id: string) => void;
  
  toggleInventory: () => void;
  toggleShop: () => void;
  purchasePowerUp: (type: PowerUp["type"], cost: number) => boolean;
  purchaseMapUnlock: (unlockId: string) => boolean;
  activatePowerUp: (type: PowerUp["type"], duration?: number) => void;
  revealMapArea: (unlockId: string) => void;
  
  revealTilesAround: (position: Position, radius: number) => void;
  highlightPath: (path: Position[]) => void;
  clearHighlights: () => void;
  setHoveredTile: (position: Position | null) => void;
  
  getDistance: (from: Position, to: Position) => number;
  getCurrency: () => Record<string, number>;
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

const createMapUnlocks = (): MapUnlock[] => [
  { id: "unlock1", name: "Northern Territory", cost: 5, unlocked: false },
  { id: "unlock2", name: "Eastern Expanse", cost: 8, unlocked: false },
  { id: "unlock3", name: "Southern Depths", cost: 10, unlocked: false },
  { id: "unlock4", name: "Western Frontier", cost: 12, unlocked: false },
];

export const useGameStore = create<GameState>()(
  subscribeWithSelector((set, get) => ({
    phase: "ready",
    
    player: createInitialPlayer(),
    collectibles: createCollectibles(),
    collectedCount: 0,
    collectedItems: [],
    tiles: createInitialTiles(),
    
    currentPath: [],
    isMoving: false,
    targetPosition: null,
    
    hoveredTile: null,
    
    gridSize: GRID_SIZE,
    
    isInventoryOpen: false,
    isShopOpen: false,
    activePowerUps: [],
    mapUnlocks: createMapUnlocks(),
    visionRadius: 5,
    
    start: () => {
      const initialPlayer = createInitialPlayer();
      set({ phase: "playing" });
      get().revealTilesAround(initialPlayer.position, get().visionRadius);
      console.log("Game started - Explore and collect!");
    },
    
    restart: () => {
      const initialPlayer = createInitialPlayer();
      set({
        phase: "ready",
        player: initialPlayer,
        collectibles: createCollectibles(),
        collectedCount: 0,
        collectedItems: [],
        tiles: createInitialTiles(),
        currentPath: [],
        isMoving: false,
        targetPosition: null,
        hoveredTile: null,
        isInventoryOpen: false,
        isShopOpen: false,
        activePowerUps: [],
        mapUnlocks: createMapUnlocks(),
        visionRadius: 5,
      });
      console.log("Game restarted");
    },
    
    end: () => {
      set({ phase: "ended" });
      console.log("Game ended");
    },
    
    setTargetPosition: (position: Position | null) => {
      set({ targetPosition: position });
    },
    
    updatePlayerPosition: (position: Position) => {
      set(state => ({
        player: { ...state.player, position }
      }));
      get().revealTilesAround(position, get().visionRadius);
      
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
      const collectible = get().collectibles.find(c => c.id === id);
      if (!collectible) return;
      
      set(state => ({
        collectibles: state.collectibles.filter(c => c.id !== id),
        collectedCount: state.collectedCount + 1,
        collectedItems: [...state.collectedItems, { id: collectible.id, type: collectible.type }],
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
    
    toggleInventory: () => {
      set(state => ({ 
        isInventoryOpen: !state.isInventoryOpen,
        isShopOpen: false,
      }));
    },
    
    toggleShop: () => {
      set(state => ({ 
        isShopOpen: !state.isShopOpen,
        isInventoryOpen: false,
      }));
    },
    
    getCurrency: () => {
      const items = get().collectedItems;
      const currency: Record<string, number> = {};
      items.forEach(item => {
        currency[item.type] = (currency[item.type] || 0) + 1;
      });
      return currency;
    },
    
    purchasePowerUp: (type: PowerUp["type"], cost: number) => {
      const currency = get().getCurrency();
      const totalItems = Object.values(currency).reduce((sum, count) => sum + count, 0);
      
      if (totalItems < cost) {
        console.log(`Not enough items! Need ${cost}, have ${totalItems}`);
        return false;
      }
      
      const itemsToRemove = cost;
      let removed = 0;
      const newCollectedItems = [...get().collectedItems];
      
      while (removed < itemsToRemove && newCollectedItems.length > 0) {
        newCollectedItems.pop();
        removed++;
      }
      
      set({ collectedItems: newCollectedItems });
      
      get().activatePowerUp(type, type === "speed" ? 30000 : type === "vision" ? 60000 : 45000);
      console.log(`Purchased ${type} power-up for ${cost} items`);
      return true;
    },
    
    purchaseMapUnlock: (unlockId: string) => {
      const unlock = get().mapUnlocks.find(u => u.id === unlockId);
      if (!unlock || unlock.unlocked) return false;
      
      const currency = get().getCurrency();
      const totalItems = Object.values(currency).reduce((sum, count) => sum + count, 0);
      
      if (totalItems < unlock.cost) {
        console.log(`Not enough items! Need ${unlock.cost}, have ${totalItems}`);
        return false;
      }
      
      const itemsToRemove = unlock.cost;
      let removed = 0;
      const newCollectedItems = [...get().collectedItems];
      
      while (removed < itemsToRemove && newCollectedItems.length > 0) {
        newCollectedItems.pop();
        removed++;
      }
      
      set(state => ({
        collectedItems: newCollectedItems,
        mapUnlocks: state.mapUnlocks.map(u => 
          u.id === unlockId ? { ...u, unlocked: true } : u
        ),
      }));
      
      get().revealMapArea(unlockId);
      console.log(`Unlocked ${unlock.name} for ${unlock.cost} items`);
      return true;
    },
    
    activatePowerUp: (type: PowerUp["type"], duration?: number) => {
      const expiresAt = duration ? Date.now() + duration : undefined;
      
      set(state => ({
        activePowerUps: [...state.activePowerUps.filter(p => p.type !== type), { type, expiresAt }],
      }));
      
      if (type === "vision") {
        set({ visionRadius: 8 });
        get().revealTilesAround(get().player.position, 8);
      }
      
      if (expiresAt) {
        setTimeout(() => {
          set(state => ({
            activePowerUps: state.activePowerUps.filter(p => p.type !== type),
          }));
          
          if (type === "vision") {
            set({ visionRadius: 5 });
          }
          
          console.log(`${type} power-up expired`);
        }, duration);
      }
    },
    
    revealMapArea: (unlockId: string) => {
      let revealRegion: { minX: number; maxX: number; minY: number; maxY: number } | null = null;
      
      if (unlockId === "unlock1") {
        revealRegion = { minX: 0, maxX: GRID_SIZE - 1, minY: 0, maxY: 10 };
      } else if (unlockId === "unlock2") {
        revealRegion = { minX: GRID_SIZE - 10, maxX: GRID_SIZE - 1, minY: 0, maxY: GRID_SIZE - 1 };
      } else if (unlockId === "unlock3") {
        revealRegion = { minX: 0, maxX: GRID_SIZE - 1, minY: GRID_SIZE - 10, maxY: GRID_SIZE - 1 };
      } else if (unlockId === "unlock4") {
        revealRegion = { minX: 0, maxX: 10, minY: 0, maxY: GRID_SIZE - 1 };
      }
      
      if (revealRegion) {
        set(state => {
          const newTiles = state.tiles.map((row, y) =>
            row.map((tile, x) => {
              if (revealRegion && 
                  x >= revealRegion.minX && x <= revealRegion.maxX &&
                  y >= revealRegion.minY && y <= revealRegion.maxY) {
                return { ...tile, isExplored: true };
              }
              return tile;
            })
          );
          return { tiles: newTiles };
        });
      }
    },
    
    getDistance: (from: Position, to: Position) => {
      return Math.max(Math.abs(from.x - to.x), Math.abs(from.y - to.y));
    },
  }))
);
