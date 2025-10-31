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
  type: "timber" | "alloy" | "circuit" | "biofiber";
  richness: number;
  collectionTime: number;
}

export interface CollectedItem {
  id: string;
  type: "timber" | "alloy" | "circuit" | "biofiber";
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

export interface ShipUpgrade {
  engine: number;
  scanner: number;
  salvageRig: number;
  cargoHold: number;
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
  travelStartTime: number | null;
  travelDuration: number | null;
  
  isCollecting: boolean;
  collectionStartTime: number | null;
  collectionDuration: number | null;
  collectingItemId: string | null;
  
  hoveredTile: Position | null;
  
  gridSize: number;
  
  isInventoryOpen: boolean;
  isShopOpen: boolean;
  activePowerUps: PowerUp[];
  mapUnlocks: MapUnlock[];
  visionRadius: number;
  
  shipUpgrades: ShipUpgrade;
  currency: number;
  
  showCancelConfirmation: boolean;
  pendingTargetPosition: Position | null;
  
  start: () => void;
  restart: () => void;
  end: () => void;
  
  setTargetPosition: (position: Position | null) => void;
  setTargetPositionWithConfirmation: (position: Position | null) => void;
  confirmCancelCollection: () => void;
  dismissCancelConfirmation: () => void;
  updatePlayerPosition: (position: Position) => void;
  updateVisualPosition: (x: number, y: number) => void;
  setPath: (path: Position[]) => void;
  setIsMoving: (isMoving: boolean) => void;
  collectItem: (id: string) => void;
  
  toggleInventory: () => void;
  toggleShop: () => void;
  purchasePowerUp: (type: PowerUp["type"], cost: number) => boolean;
  purchaseMapUnlock: (unlockId: string) => boolean;
  purchaseShipUpgrade: (upgradeType: keyof ShipUpgrade) => boolean;
  sellAllCargo: () => void;
  activatePowerUp: (type: PowerUp["type"], duration?: number) => void;
  revealMapArea: (unlockId: string) => void;
  
  startTravel: (duration: number) => void;
  startCollection: (itemId: string, duration: number) => void;
  cancelCollection: () => void;
  completeCollection: () => void;
  
  revealTilesAround: (position: Position, radius: number) => void;
  highlightPath: (path: Position[]) => void;
  clearHighlights: () => void;
  setHoveredTile: (position: Position | null) => void;
  
  getDistance: (from: Position, to: Position) => number;
  getTravelTime: (distance: number) => number;
  getEstimatedCollectionTime: (actualTime: number) => number;
  getCargoCount: () => number;
  getMaxCargo: () => number;
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
  
  const types: ("timber" | "alloy" | "circuit" | "biofiber")[] = ["timber", "alloy", "circuit", "biofiber"];
  
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
    
    const richness = Math.floor(Math.random() * 3) + 1;
    const collectionTime = richness * 3000 + Math.random() * 2000;
    
    collectibles.push({
      id: `collectible-${i}`,
      position,
      type: types[Math.floor(Math.random() * types.length)],
      richness,
      collectionTime,
    });
  }
  
  return collectibles;
};

const createMapUnlocks = (): MapUnlock[] => [
  { id: "unlock1", name: "Sunken Metro Line", cost: 50, unlocked: false },
  { id: "unlock2", name: "Coral Expanse", cost: 100, unlocked: false },
  { id: "unlock3", name: "Tempest Graveyard", cost: 150, unlocked: false },
  { id: "unlock4", name: "Glacier Runoff", cost: 200, unlocked: false },
];

const createInitialShipUpgrades = (): ShipUpgrade => ({
  engine: 1,
  scanner: 1,
  salvageRig: 1,
  cargoHold: 1,
});

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
    travelStartTime: null,
    travelDuration: null,
    
    isCollecting: false,
    collectionStartTime: null,
    collectionDuration: null,
    collectingItemId: null,
    
    hoveredTile: null,
    
    gridSize: GRID_SIZE,
    
    isInventoryOpen: false,
    isShopOpen: false,
    activePowerUps: [],
    mapUnlocks: createMapUnlocks(),
    visionRadius: 5,
    
    shipUpgrades: createInitialShipUpgrades(),
    currency: 0,
    
    showCancelConfirmation: false,
    pendingTargetPosition: null,
    
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
        travelStartTime: null,
        travelDuration: null,
        isCollecting: false,
        collectionStartTime: null,
        collectionDuration: null,
        collectingItemId: null,
        hoveredTile: null,
        isInventoryOpen: false,
        isShopOpen: false,
        activePowerUps: [],
        mapUnlocks: createMapUnlocks(),
        visionRadius: 5,
        shipUpgrades: createInitialShipUpgrades(),
        currency: 0,
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
    
    setTargetPositionWithConfirmation: (position: Position | null) => {
      if (get().isCollecting) {
        set({ 
          showCancelConfirmation: true,
          pendingTargetPosition: position 
        });
      } else {
        set({ targetPosition: position });
      }
    },
    
    confirmCancelCollection: () => {
      const pendingTarget = get().pendingTargetPosition;
      get().cancelCollection();
      set({ 
        showCancelConfirmation: false,
        targetPosition: pendingTarget,
        pendingTargetPosition: null 
      });
    },
    
    dismissCancelConfirmation: () => {
      set({ 
        showCancelConfirmation: false,
        pendingTargetPosition: null 
      });
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
      if (get().currency < cost) {
        console.log(`Not enough currency! Need ${cost}, have ${get().currency}`);
        return false;
      }
      
      set(state => ({ currency: state.currency - cost }));
      get().activatePowerUp(type, type === "speed" ? 30000 : type === "vision" ? 60000 : 45000);
      console.log(`Purchased ${type} power-up for ${cost} currency`);
      return true;
    },
    
    purchaseMapUnlock: (unlockId: string) => {
      const unlock = get().mapUnlocks.find(u => u.id === unlockId);
      if (!unlock || unlock.unlocked) return false;
      
      if (get().currency < unlock.cost) {
        console.log(`Not enough currency! Need ${unlock.cost}, have ${get().currency}`);
        return false;
      }
      
      set(state => ({
        currency: state.currency - unlock.cost,
        mapUnlocks: state.mapUnlocks.map(u => 
          u.id === unlockId ? { ...u, unlocked: true } : u
        ),
      }));
      
      get().revealMapArea(unlockId);
      console.log(`Unlocked ${unlock.name} for ${unlock.cost} currency`);
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
    
    getTravelTime: (distance: number) => {
      const baseSpeed = 1000;
      const engineLevel = get().shipUpgrades.engine;
      const speedBoost = get().activePowerUps.some(p => p.type === "speed") ? 0.5 : 1;
      return (distance * baseSpeed) / engineLevel * speedBoost;
    },
    
    getEstimatedCollectionTime: (actualTime: number) => {
      const scannerLevel = get().shipUpgrades.scanner;
      const minAccuracy = 0.6;
      const maxAccuracy = 1.0;
      const accuracy = minAccuracy + ((maxAccuracy - minAccuracy) * (scannerLevel - 1) / 4);
      const variance = 1 - accuracy;
      const randomFactor = 1 - variance + (Math.random() * variance * 2);
      return actualTime * randomFactor;
    },
    
    getCargoCount: () => {
      return get().collectedItems.length;
    },
    
    getMaxCargo: () => {
      const baseCapacity = 10;
      return baseCapacity + (get().shipUpgrades.cargoHold - 1) * 5;
    },
    
    startTravel: (duration: number) => {
      set({
        travelStartTime: Date.now(),
        travelDuration: duration,
      });
    },
    
    startCollection: (itemId: string, duration: number) => {
      const cargoCount = get().getCargoCount();
      const maxCargo = get().getMaxCargo();
      
      if (cargoCount >= maxCargo) {
        console.log("Cargo hold is full! Return to Watropolis to sell materials.");
        return;
      }
      
      const salvageRigLevel = get().shipUpgrades.salvageRig;
      const actualDuration = duration / salvageRigLevel;
      
      set({
        isCollecting: true,
        collectionStartTime: Date.now(),
        collectionDuration: actualDuration,
        collectingItemId: itemId,
      });
      
      console.log(`Starting collection of ${itemId}, estimated ${(actualDuration / 1000).toFixed(1)}s`);
    },
    
    cancelCollection: () => {
      set({
        isCollecting: false,
        collectionStartTime: null,
        collectionDuration: null,
        collectingItemId: null,
      });
      console.log("Collection cancelled - resources forfeited");
    },
    
    completeCollection: () => {
      const itemId = get().collectingItemId;
      if (itemId) {
        get().collectItem(itemId);
      }
      set({
        isCollecting: false,
        collectionStartTime: null,
        collectionDuration: null,
        collectingItemId: null,
      });
    },
    
    sellAllCargo: () => {
      const items = get().collectedItems;
      const sellValue = items.length * 10;
      
      set(state => ({
        currency: state.currency + sellValue,
        collectedItems: [],
      }));
      
      console.log(`Sold ${items.length} items for ${sellValue} currency`);
    },
    
    purchaseShipUpgrade: (upgradeType: keyof ShipUpgrade) => {
      const currentLevel = get().shipUpgrades[upgradeType];
      const cost = currentLevel * 50;
      
      if (get().currency < cost) {
        console.log(`Not enough currency! Need ${cost}, have ${get().currency}`);
        return false;
      }
      
      set(state => ({
        currency: state.currency - cost,
        shipUpgrades: {
          ...state.shipUpgrades,
          [upgradeType]: currentLevel + 1,
        },
      }));
      
      console.log(`Upgraded ${upgradeType} to level ${currentLevel + 1} for ${cost} currency`);
      return true;
    },
  }))
);
