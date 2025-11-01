import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { useSkillsStore } from "./useSkillsStore";
import { NPC_CONFIGS, calculateNPCHealth, generateLoot, getRandomNPCType, getRandomNPCLevel } from "@/config/npcConfig";

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

export interface Artifact {
  id: string;
  position: Position;
  name: string;
  description: string;
  lore: string;
  category: "technology" | "culture" | "infrastructure" | "personal" | "nature";
  rarity: "common" | "uncommon" | "rare";
  isCollected: boolean;
  clueRevealed: boolean;
}

export interface Tile {
  x: number;
  y: number;
  isWalkable: boolean;
  isExplored: boolean;
  isHighlighted: boolean;
}

export interface Island {
  id: string;
  positions: Position[];
  resources: {
    [key: string]: number;
  };
}

export interface EnemyShip {
  id: string;
  npcType: string;
  level: number;
  position: Position;
  visualPosition: { x: number; y: number };
  rotation: number;
  health: number;
  maxHealth: number;
  loot: {
    [key: string]: number;
  };
  currentPath: Position[];
  moveSpeed: number;
  nextMoveTime: number;
}

export interface CombatState {
  isInCombat: boolean;
  enemyId: string | null;
  combatStartTime: number | null;
  combatDuration: number;
  combatProgress: number;
}

export type CrewState = "idle" | "deployed" | "collecting" | "awaitingPickup" | "drifting" | "captured";

export interface CrewMember {
  id: string;
  position: Position;
  visualPosition: { x: number; y: number };
  state: CrewState;
  deployedAt: number | null;
  driftStartTime: number | null;
  poachingEnemyId: string | null;
  poachStartTime: number | null;
}

export interface Cove {
  id: string;
  position: Position;
  hasCrewMember: boolean;
  crewMemberRecruitCost: number;
  lootTable: {
    type: "timber" | "alloy" | "circuit" | "biofiber";
    quantity: number;
  }[];
  looted: boolean;
}

interface GameState {
  phase: GamePhase;
  
  player: Player;
  playerRotation: number;
  collectibles: Collectible[];
  collectedCount: number;
  collectedItems: CollectedItem[];
  artifacts: Artifact[];
  islands: Island[];
  selectedIsland: Island | null;
  coves: Cove[];
  selectedCove: Cove | null;
  enemyShips: EnemyShip[];
  combatState: CombatState;
  crewMembers: CrewMember[];
  maxCrewCapacity: number;
  tiles: Tile[][];
  
  currentPath: Position[];
  isMoving: boolean;
  targetPosition: Position | null;
  travelStartTime: number | null;
  travelDuration: number | null;
  
  hoveredTile: Position | null;
  
  gridSize: number;
  
  isInventoryOpen: boolean;
  isShopOpen: boolean;
  isArtifactLogOpen: boolean;
  isArchivistOpen: boolean;
  activePowerUps: PowerUp[];
  mapUnlocks: MapUnlock[];
  visionRadius: number;
  
  shipUpgrades: ShipUpgrade;
  currency: number;
  
  showCancelConfirmation: boolean;
  pendingTargetPosition: Position | null;
  
  archivistUnlocked: boolean;
  
  isCameraFollowing: boolean;
  cameraOffset: { x: number; z: number };
  zoomLevel: number;
  cameraTransform: {
    pivotX: number;
    pivotY: number;
    scale: number;
    containerX: number;
    containerY: number;
  };
  
  start: () => void;
  restart: () => void;
  end: () => void;
  
  setTargetPosition: (position: Position | null) => void;
  setTargetPositionWithConfirmation: (position: Position | null) => void;
  confirmCancelCollection: () => void;
  dismissCancelConfirmation: () => void;
  updatePlayerPosition: (position: Position) => void;
  updateVisualPosition: (x: number, y: number) => void;
  setPlayerRotation: (rotation: number) => void;
  setPath: (path: Position[]) => void;
  setIsMoving: (isMoving: boolean) => void;
  collectItem: (id: string) => void;
  
  setSelectedIsland: (island: Island | null) => void;
  updateIsland: (island: Island) => void;
  
  updateEnemyShip: (ship: EnemyShip) => void;
  removeEnemyShip: (id: string) => void;
  startCombat: (enemyId: string) => void;
  updateCombatProgress: (progress: number) => void;
  completeCombat: () => void;
  checkAutoAttack: () => void;
  checkAutoCollect: () => void;
  
  toggleInventory: () => void;
  toggleShop: () => void;
  toggleArtifactLog: () => void;
  toggleArchivist: () => void;
  purchasePowerUp: (type: PowerUp["type"], cost: number) => boolean;
  purchaseMapUnlock: (unlockId: string) => boolean;
  purchaseShipUpgrade: (upgradeType: keyof ShipUpgrade) => boolean;
  sellAllCargo: () => void;
  activatePowerUp: (type: PowerUp["type"], duration?: number) => void;
  revealMapArea: (unlockId: string) => void;
  collectArtifact: (id: string) => void;
  purchaseArtifactClue: (artifactId: string) => boolean;
  checkArchivistUnlock: () => void;
  
  toggleCameraFollow: () => void;
  setCameraOffset: (offset: { x: number; z: number }) => void;
  setZoomLevel: (level: number) => void;
  updateCameraTransform: (transform: { pivotX: number; pivotY: number; scale: number; containerX: number; containerY: number }) => void;
  
  startTravel: (duration: number) => void;
  
  revealTilesAround: (position: Position, radius: number) => void;
  highlightPath: (path: Position[]) => void;
  clearHighlights: () => void;
  setHoveredTile: (position: Position | null) => void;
  
  getDistance: (from: Position, to: Position) => number;
  getTravelTime: (distance: number) => number;
  getCargoCount: () => number;
  getMaxCargo: () => number;
  getCurrency: () => Record<string, number>;
  
  deployCrewMember: (position: Position, collectibleId: string) => void;
  retrieveCrewMember: (crewId: string) => void;
  updateCrewMember: (crew: CrewMember) => void;
  removeCrewMember: (crewId: string) => void;
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

// Collection timing constants (in milliseconds)
const COLLECTION_BASE_TIMES = {
  timber: 4000,      // Most common, quickest (4s)
  alloy: 6000,       // Heavy materials take longer (6s)
  circuit: 5000,     // Delicate electronics (5s)
  biofiber: 4500,    // Organic materials (4.5s)
};

const RICHNESS_MULTIPLIERS = [1, 1.5, 2]; // Indexed by (richness - 1)

// Calculate deterministic collection time based on resource type and richness
function calculateCollectionTime(
  type: "timber" | "alloy" | "circuit" | "biofiber",
  richness: number
): number {
  const baseTime = COLLECTION_BASE_TIMES[type];
  const multiplier = RICHNESS_MULTIPLIERS[richness - 1] || 1;
  return baseTime * multiplier;
}

const createInitialPlayer = (): Player => ({
  position: { x: 20, y: 20 },
  visualPosition: { x: 20, y: 20 },
});

const createCollectiblesAndArtifacts = (): { collectibles: Collectible[], artifacts: Artifact[], islands: Island[], occupied: Set<string> } => {
  const occupied = new Set<string>();
  occupied.add("20,20");
  
  const islands = createIslands(occupied);
  
  const collectibles: Collectible[] = [];
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
    const type = types[Math.floor(Math.random() * types.length)];
    const collectionTime = calculateCollectionTime(type, richness);
    
    collectibles.push({
      id: `collectible-${i}`,
      position,
      type,
      richness,
      collectionTime,
    });
  }
  
  const artifacts = createArtifacts(occupied);
  
  return { collectibles, artifacts, islands, occupied };
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

const createInitialCrew = (): CrewMember[] => {
  const crewNames = ["Crew-1", "Crew-2", "Crew-3", "Crew-4"];
  return crewNames.map(name => ({
    id: name,
    position: { x: 20, y: 20 },
    visualPosition: { x: 20, y: 20 },
    state: "idle" as CrewState,
    deployedAt: null,
    driftStartTime: null,
    poachingEnemyId: null,
    poachStartTime: null,
  }));
};

const createCoves = (occupied: Set<string>): Cove[] => {
  const coves: Cove[] = [];
  const coveCount = 4;
  const types: ("timber" | "alloy" | "circuit" | "biofiber")[] = ["timber", "alloy", "circuit", "biofiber"];
  
  for (let i = 0; i < coveCount; i++) {
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
    
    const lootCount = Math.floor(Math.random() * 3) + 1;
    const lootTable = [];
    for (let j = 0; j < lootCount; j++) {
      lootTable.push({
        type: types[Math.floor(Math.random() * types.length)],
        quantity: Math.floor(Math.random() * 3) + 1,
      });
    }
    
    coves.push({
      id: `cove-${i}`,
      position,
      hasCrewMember: Math.random() > 0.5,
      crewMemberRecruitCost: 100,
      lootTable,
      looted: false,
    });
  }
  
  return coves;
};

const createIslands = (occupied: Set<string>): Island[] => {
  const islands: Island[] = [];
  const islandCount = 8;
  const types: ("timber" | "alloy" | "circuit" | "biofiber")[] = ["timber", "alloy", "circuit", "biofiber"];
  
  for (let i = 0; i < islandCount; i++) {
    const width = Math.floor(Math.random() * 3) + 3;
    const height = Math.floor(Math.random() * 3) + 3;
    
    let startX: number;
    let startY: number;
    let canPlace = false;
    let attempts = 0;
    
    do {
      startX = Math.floor(Math.random() * (GRID_SIZE - width));
      startY = Math.floor(Math.random() * (GRID_SIZE - height));
      
      canPlace = true;
      for (let y = startY; y < startY + height && canPlace; y++) {
        for (let x = startX; x < startX + width && canPlace; x++) {
          if (occupied.has(`${x},${y}`)) {
            canPlace = false;
          }
        }
      }
      
      attempts++;
      if (attempts > 100) break;
    } while (!canPlace);
    
    if (!canPlace) continue;
    
    const positions: Position[] = [];
    for (let y = startY; y < startY + height; y++) {
      for (let x = startX; x < startX + width; x++) {
        positions.push({ x, y });
        occupied.add(`${x},${y}`);
      }
    }
    
    const resourceCount = Math.floor(Math.random() * 3) + 1;
    const resources: Island["resources"] = {};
    for (let r = 0; r < resourceCount; r++) {
      const type = types[Math.floor(Math.random() * types.length)];
      const quantity = Math.floor(Math.random() * 5) + 2;
      resources[type] = (resources[type] || 0) + quantity;
    }
    
    islands.push({
      id: `island-${i}`,
      positions,
      resources,
    });
  }
  
  return islands;
};

const createArtifacts = (occupied: Set<string>): Artifact[] => {
  const artifactData = [
    { name: "Server Rack Fragment", description: "Corroded metal from a data center", lore: "A twisted piece of metal bearing faded corporate logos. Once housed the digital memories of millions, now a corroded monument to lost connectivity.", category: "technology" as const, rarity: "common" as const },
    { name: "Subway Token", description: "Brass transit token from 2065", lore: "A brass token from the Metro Transit Authority, dated 2065. The inscription reads 'Your journey continues.' It didn't.", category: "personal" as const, rarity: "common" as const },
    { name: "Wedding Photo Album", description: "Water-damaged celebration photos", lore: "Water-damaged photos of celebrations under blue skies. The final page shows a beachside ceremony—the same beach now 200 feet underwater.", category: "personal" as const, rarity: "uncommon" as const },
    { name: "Traffic Light Controller", description: "Electronic intersection control box", lore: "An electronic box that once orchestrated vehicle flow through busy intersections. Its last command was eternal red.", category: "infrastructure" as const, rarity: "common" as const },
    { name: "Museum Plaque", description: "Bronze plaque with scratched graffiti", lore: "Bronze plaque: 'The Age of Oil: 1850-2070.' Someone scratched underneath: 'We knew. We didn't care.'", category: "culture" as const, rarity: "uncommon" as const },
    { name: "Child's Tablet Device", description: "Educational device frozen on glaciers lesson", lore: "A learning device frozen on a geography lesson about glaciers. 'These ice sheets will last forever!' the cheerful narrator promised.", category: "technology" as const, rarity: "common" as const },
    { name: "Office Coffee Mug", description: "Ceramic mug from a submerged high-rise", lore: "'World's Best Dad' printed on ceramic. Found in a submerged high-rise, still sitting on a desk as if waiting for Monday morning.", category: "personal" as const, rarity: "common" as const },
    { name: "Weather Station Log", description: "Final readings before evacuation", lore: "Final entry: 'Ocean temp +4.2°C above baseline. Evacuation protocols initiated. May God help us all.'", category: "technology" as const, rarity: "rare" as const },
    { name: "Theater Marquee Letter", description: "Letter 'E' from Grand Cinema sign", lore: "The letter 'E' from the Grand Cinema's sign. Its last showing: 'An Inconvenient Truth.' Nobody came.", category: "culture" as const, rarity: "uncommon" as const },
    { name: "Sports Championship Ring", description: "Gold ring from 2068 World Series", lore: "Gold ring celebrating the 2068 World Series. The winning team's stadium is now a reef teeming with fish.", category: "culture" as const, rarity: "uncommon" as const },
    { name: "Bridge Cable Sample", description: "Steel cable from Harbor Bridge", lore: "Steel cable from the Harbor Bridge, rated to last 200 years. It lasted 73 before the waters claimed it.", category: "infrastructure" as const, rarity: "common" as const },
    { name: "Voting Ballot Box", description: "Sealed box from 2064 election", lore: "Sealed ballot box from the 2064 election. The winner promised climate action. The box stayed sealed underwater.", category: "culture" as const, rarity: "uncommon" as const },
    { name: "Solar Panel Array", description: "Rooftop renewable energy system", lore: "A rooftop solar installation meant to save the world. It powered the building's lights as the waters rose past the windows.", category: "technology" as const, rarity: "common" as const },
    { name: "Restaurant Menu", description: "Laminated menu from seafood restaurant", lore: "Laminated menu from 'Neptune's Bounty Seafood.' Ironic that Neptune took everything back.", category: "culture" as const, rarity: "common" as const },
    { name: "Flood Barrier Blueprint", description: "Unbuilt coastal protection plans", lore: "Engineering plans for coastal barriers, approved but never built. Budget cuts, they said. Too expensive, they said.", category: "infrastructure" as const, rarity: "rare" as const },
    { name: "Smartphone", description: "Device with unsent final message", lore: "Its last text, unsent: 'The water's at the door. I love you all.' The message waits eternally in the outbox.", category: "personal" as const, rarity: "uncommon" as const },
    { name: "University Diploma", description: "Environmental Science degree, 2066", lore: "Degree in Environmental Science, 2066. The graduate dedicated their life to warning others. The warnings went unheeded.", category: "personal" as const, rarity: "rare" as const },
    { name: "Power Grid Relay", description: "Failed electrical network component", lore: "Component from the city's electrical network. It failed when seawater flooded the substations, plunging millions into darkness.", category: "infrastructure" as const, rarity: "uncommon" as const },
  ];

  const artifacts: Artifact[] = [];
  
  for (let i = 0; i < artifactData.length; i++) {
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
    
    artifacts.push({
      id: `artifact-${i}`,
      position,
      name: artifactData[i].name,
      description: artifactData[i].description,
      lore: artifactData[i].lore,
      category: artifactData[i].category,
      rarity: artifactData[i].rarity,
      isCollected: false,
      clueRevealed: false,
    });
  }
  
  return artifacts;
};

const createEnemyShips = (occupied: Set<string>): EnemyShip[] => {
  const enemyShips: EnemyShip[] = [];
  const enemyCount = 5;
  
  for (let i = 0; i < enemyCount; i++) {
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
    
    const npcType = getRandomNPCType();
    const level = getRandomNPCLevel(npcType);
    const maxHealth = calculateNPCHealth(npcType, level);
    const loot = generateLoot(npcType);
    const config = NPC_CONFIGS[npcType];
    
    enemyShips.push({
      id: `enemy-${i}`,
      npcType,
      level,
      position,
      visualPosition: { x: position.x, y: position.y },
      rotation: Math.random() * Math.PI * 2,
      health: maxHealth,
      maxHealth,
      loot,
      currentPath: [],
      moveSpeed: config?.stats.moveSpeed || 0.5,
      nextMoveTime: Date.now() + Math.random() * 5000 + 3000,
    });
  }
  
  return enemyShips;
};

export const useGameStore = create<GameState>()(
  subscribeWithSelector((set, get) => {
    const { collectibles, artifacts, islands, occupied } = createCollectiblesAndArtifacts();
    const tiles = createInitialTiles();
    const coves = createCoves(occupied);
    const enemyShips = createEnemyShips(occupied);
    
    islands.forEach(island => {
      island.positions.forEach(pos => {
        if (tiles[pos.y] && tiles[pos.y][pos.x]) {
          tiles[pos.y][pos.x].isWalkable = false;
        }
      });
    });
    
    return {
    phase: "ready",
    
    player: createInitialPlayer(),
    playerRotation: 0,
    collectibles,
    collectedCount: 0,
    collectedItems: [],
    artifacts,
    islands,
    selectedIsland: null,
    coves,
    selectedCove: null,
    enemyShips,
    combatState: {
      isInCombat: false,
      enemyId: null,
      combatStartTime: null,
      combatDuration: 5000,
      combatProgress: 0,
    },
    crewMembers: createInitialCrew(),
    maxCrewCapacity: 6,
    tiles,
    
    currentPath: [],
    isMoving: false,
    targetPosition: null,
    travelStartTime: null,
    travelDuration: null,
    
    hoveredTile: null,
    
    gridSize: GRID_SIZE,
    
    isInventoryOpen: false,
    isShopOpen: false,
    isArtifactLogOpen: false,
    isArchivistOpen: false,
    activePowerUps: [],
    mapUnlocks: createMapUnlocks(),
    visionRadius: 5,
    
    shipUpgrades: createInitialShipUpgrades(),
    currency: 0,
    
    showCancelConfirmation: false,
    pendingTargetPosition: null,
    
    archivistUnlocked: false,
    
    isCameraFollowing: true,
    cameraOffset: { x: 0, z: 0 },
    zoomLevel: 65,
    cameraTransform: {
      pivotX: (GRID_SIZE * 40) / 2,
      pivotY: (GRID_SIZE * 40) / 2,
      scale: 1,
      containerX: 0,
      containerY: 0,
    },
    
    start: () => {
      const initialPlayer = createInitialPlayer();
      set({ phase: "playing" });
      get().revealTilesAround(initialPlayer.position, get().visionRadius);
      console.log("Game started - Explore and collect!");
    },
    
    restart: () => {
      const initialPlayer = createInitialPlayer();
      const { collectibles, artifacts, islands, occupied } = createCollectiblesAndArtifacts();
      const tiles = createInitialTiles();
      const coves = createCoves(occupied);
      const enemyShips = createEnemyShips(occupied);
      
      islands.forEach(island => {
        island.positions.forEach(pos => {
          if (tiles[pos.y] && tiles[pos.y][pos.x]) {
            tiles[pos.y][pos.x].isWalkable = false;
          }
        });
      });
      
      set({
        phase: "ready",
        player: initialPlayer,
        playerRotation: 0,
        collectibles,
        collectedCount: 0,
        collectedItems: [],
        artifacts,
        islands,
        selectedIsland: null,
        coves,
        selectedCove: null,
        enemyShips,
        combatState: {
          isInCombat: false,
          enemyId: null,
          combatStartTime: null,
          combatDuration: 5000,
          combatProgress: 0,
        },
        crewMembers: createInitialCrew(),
        maxCrewCapacity: 6,
        tiles,
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
        isCameraFollowing: true,
        cameraOffset: { x: 0, z: 0 },
        zoomLevel: 65,
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
      set({ targetPosition: position });
    },
    
    confirmCancelCollection: () => {
      // No longer needed - collection is instant
    },
    
    dismissCancelConfirmation: () => {
      // No longer needed - collection is instant
    },
    
    updatePlayerPosition: (position: Position) => {
      set(state => ({
        player: { ...state.player, position }
      }));
      get().revealTilesAround(position, get().visionRadius);
      
      useSkillsStore.getState().addXp("sailing", 10);
      
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
    
    setPlayerRotation: (rotation: number) => {
      set({ playerRotation: rotation });
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
      
      const xpAmount = collectible.richness * 15;
      useSkillsStore.getState().addXp("salvaging", xpAmount);
      
      if (get().collectibles.length === 0) {
        setTimeout(() => {
          get().end();
        }, 500);
      }
    },
    
    revealTilesAround: (position: Position, radius: number) => {
      let newlyExploredCount = 0;
      
      set(state => {
        const newTiles = state.tiles.map(row =>
          row.map(tile => {
            const distance = Math.sqrt(
              Math.pow(tile.x - position.x, 2) + Math.pow(tile.y - position.y, 2)
            );
            
            if (distance <= radius && !tile.isExplored) {
              newlyExploredCount++;
              return { ...tile, isExplored: true };
            } else if (distance <= radius) {
              return { ...tile, isExplored: true };
            }
            return tile;
          })
        );
        return { tiles: newTiles };
      });
      
      if (newlyExploredCount > 0) {
        useSkillsStore.getState().addXp("exploration", newlyExploredCount * 5);
      }
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
    
    setSelectedIsland: (island: Island | null) => {
      set({ selectedIsland: island });
    },
    
    updateIsland: (island: Island) => {
      set(state => ({
        islands: state.islands.map(i => i.id === island.id ? island : i)
      }));
    },
    
    updateEnemyShip: (ship: EnemyShip) => {
      set(state => ({
        enemyShips: state.enemyShips.map(s => s.id === ship.id ? ship : s)
      }));
    },
    
    removeEnemyShip: (id: string) => {
      set(state => ({
        enemyShips: state.enemyShips.filter(s => s.id !== id)
      }));
    },
    
    startCombat: (enemyId: string) => {
      const enemy = get().enemyShips.find(s => s.id === enemyId);
      if (!enemy || get().combatState.isInCombat) return;
      
      set({
        combatState: {
          isInCombat: true,
          enemyId,
          combatStartTime: Date.now(),
          combatDuration: 5000,
          combatProgress: 0,
        }
      });
    },
    
    updateCombatProgress: (progress: number) => {
      set(state => ({
        combatState: {
          ...state.combatState,
          combatProgress: progress,
        }
      }));
    },
    
    completeCombat: () => {
      const { combatState, enemyShips, collectibles } = get();
      if (!combatState.isInCombat || !combatState.enemyId) return;
      
      const enemy = enemyShips.find(s => s.id === combatState.enemyId);
      if (enemy) {
        const newCollectibles: Collectible[] = [];
        Object.entries(enemy.loot).forEach(([type, quantity]) => {
          for (let i = 0; i < quantity; i++) {
            newCollectibles.push({
              id: `${type}-${enemy.id}-${Date.now()}-${i}`,
              type: type as "timber" | "alloy" | "circuit" | "biofiber",
              position: { x: enemy.position.x, y: enemy.position.y },
              richness: 3,
              collectionTime: 2000,
            });
          }
        });
        
        set(state => ({
          collectibles: [...state.collectibles, ...newCollectibles]
        }));
        
        get().removeEnemyShip(enemy.id);
        console.log(`Defeated enemy ship! Dropped loot at (${enemy.position.x}, ${enemy.position.y}):`, enemy.loot);
        
        const config = NPC_CONFIGS[enemy.npcType];
        if (config) {
          useSkillsStore.getState().addXp("combat", config.stats.experienceReward);
        }
      }
      
      set({
        combatState: {
          isInCombat: false,
          enemyId: null,
          combatStartTime: null,
          combatDuration: 5000,
          combatProgress: 0,
        }
      });
    },
    
    toggleInventory: () => {
      set(state => ({ 
        isInventoryOpen: !state.isInventoryOpen,
        isShopOpen: false,
        isArtifactLogOpen: false,
        isArchivistOpen: false,
      }));
    },
    
    toggleShop: () => {
      set(state => ({ 
        isShopOpen: !state.isShopOpen,
        isInventoryOpen: false,
        isArtifactLogOpen: false,
        isArchivistOpen: false,
      }));
    },
    
    toggleArtifactLog: () => {
      set(state => ({ 
        isArtifactLogOpen: !state.isArtifactLogOpen,
        isInventoryOpen: false,
        isShopOpen: false,
        isArchivistOpen: false,
      }));
    },
    
    toggleArchivist: () => {
      set(state => ({ 
        isArchivistOpen: !state.isArchivistOpen,
        isInventoryOpen: false,
        isShopOpen: false,
        isArtifactLogOpen: false,
      }));
    },
    
    collectArtifact: (id: string) => {
      const artifact = get().artifacts.find(a => a.id === id);
      if (!artifact || artifact.isCollected) return;
      
      set(state => ({
        artifacts: state.artifacts.map(a => 
          a.id === id ? { ...a, isCollected: true } : a
        ),
      }));
      
      console.log(`Discovered artifact: ${artifact.name}`);
      console.log(`Lore: ${artifact.lore}`);
      
      get().checkArchivistUnlock();
    },
    
    purchaseArtifactClue: (artifactId: string) => {
      const artifact = get().artifacts.find(a => a.id === artifactId);
      if (!artifact || artifact.isCollected || artifact.clueRevealed) return false;
      
      const cost = 25;
      
      if (get().currency < cost) {
        console.log(`Not enough currency! Need ${cost}, have ${get().currency}`);
        return false;
      }
      
      set(state => ({
        currency: state.currency - cost,
        artifacts: state.artifacts.map(a => 
          a.id === artifactId ? { ...a, clueRevealed: true } : a
        ),
      }));
      
      get().revealTilesAround(artifact.position, 2);
      
      console.log(`Purchased clue for ${artifact.name}! Location revealed on map.`);
      return true;
    },
    
    checkArchivistUnlock: () => {
      const collectedArtifacts = get().artifacts.filter(a => a.isCollected).length;
      const totalUpgrades = Object.values(get().shipUpgrades).reduce((sum, level) => sum + level, 0);
      
      if (!get().archivistUnlocked && (collectedArtifacts >= 3 || totalUpgrades >= 8)) {
        set({ archivistUnlocked: true });
        console.log("🎉 The Archivist is now available at Watropolis Dockyard!");
      }
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
    
    toggleCameraFollow: () => {
      set(state => ({ 
        isCameraFollowing: !state.isCameraFollowing,
        cameraOffset: state.isCameraFollowing ? state.cameraOffset : { x: 0, z: 0 }
      }));
    },
    
    setCameraOffset: (offset: { x: number; z: number }) => {
      set({ 
        cameraOffset: offset,
        isCameraFollowing: false
      });
    },
    
    setZoomLevel: (level: number) => {
      set({ zoomLevel: Math.max(50, Math.min(600, level)) });
    },
    
    updateCameraTransform: (transform) => {
      set({ cameraTransform: transform });
    },
    
    deployCrewMember: (position: Position, collectibleId: string) => {
      const availableCrew = get().crewMembers.filter(c => c.state === "idle");
      
      if (availableCrew.length === 0) {
        console.log("No crew members available for deployment");
        return;
      }
      
      const crew = availableCrew[0];
      const updatedCrew: CrewMember = {
        ...crew,
        position,
        visualPosition: { x: position.x, y: position.y },
        state: "collecting",
        deployedAt: Date.now(),
        collectingItemId: collectibleId,
        collectionStartTime: Date.now(),
        collectionDuration: 12000,
      };
      
      set(state => ({
        crewMembers: state.crewMembers.map(c => c.id === crew.id ? updatedCrew : c)
      }));
      
      console.log(`Deployed crew member ${crew.id} to collect at (${position.x}, ${position.y})`);
      
      setTimeout(() => {
        const currentCrew = get().crewMembers.find(c => c.id === crew.id);
        if (currentCrew && currentCrew.state === "collecting") {
          get().updateCrewMember({
            ...currentCrew,
            state: "awaitingPickup",
          });
          console.log(`Crew member ${crew.id} finished collecting, awaiting pickup`);
        }
      }, 12000);
    },
    
    retrieveCrewMember: (crewId: string) => {
      const crew = get().crewMembers.find(c => c.id === crewId);
      if (!crew || crew.state !== "awaitingPickup") {
        console.log("Crew member not ready for pickup");
        return;
      }
      
      if (crew.collectingItemId) {
        get().collectItem(crew.collectingItemId);
      }
      
      const updatedCrew: CrewMember = {
        ...crew,
        state: "idle",
        position: get().player.position,
        visualPosition: { x: get().player.position.x, y: get().player.position.y },
        deployedAt: null,
        collectingItemId: null,
        collectionStartTime: null,
        collectionDuration: null,
      };
      
      set(state => ({
        crewMembers: state.crewMembers.map(c => c.id === crewId ? updatedCrew : c)
      }));
      
      console.log(`Retrieved crew member ${crewId}`);
    },
    
    updateCrewMember: (crew: CrewMember) => {
      set(state => ({
        crewMembers: state.crewMembers.map(c => c.id === crew.id ? crew : c)
      }));
    },
    
    removeCrewMember: (crewId: string) => {
      set(state => ({
        crewMembers: state.crewMembers.filter(c => c.id !== crewId)
      }));
    },
    
    checkAutoAttack: () => {
      const state = get();
      
      if (state.combatState.isInCombat || state.isMoving || state.isCollecting) {
        return;
      }
      
      const playerPos = state.player.position;
      const enemiesInRange = state.enemyShips.filter(enemy => {
        const distance = Math.abs(enemy.position.x - playerPos.x) + Math.abs(enemy.position.y - playerPos.y);
        return distance <= 3;
      });
      
      if (enemiesInRange.length > 0) {
        const nearestEnemy = enemiesInRange.reduce((nearest, enemy) => {
          const nearestDist = Math.abs(nearest.position.x - playerPos.x) + Math.abs(nearest.position.y - playerPos.y);
          const enemyDist = Math.abs(enemy.position.x - playerPos.x) + Math.abs(enemy.position.y - playerPos.y);
          return enemyDist < nearestDist ? enemy : nearest;
        });
        
        console.log(`Auto-attacking enemy ${nearestEnemy.id} at distance ${Math.abs(nearestEnemy.position.x - playerPos.x) + Math.abs(nearestEnemy.position.y - playerPos.y)}`);
        get().startCombat(nearestEnemy.id);
      }
    },
    
    checkAutoCollect: () => {
      const state = get();
      
      if (state.combatState.isInCombat || state.isCollecting) {
        return;
      }
      
      const playerPos = state.player.position;
      const collectiblesInRange = state.collectibles.filter(collectible => {
        const distance = Math.abs(collectible.position.x - playerPos.x) + Math.abs(collectible.position.y - playerPos.y);
        return distance <= 2;
      });
      
      if (collectiblesInRange.length > 0 && !state.isMoving) {
        const nearest = collectiblesInRange.reduce((nearest, collectible) => {
          const nearestDist = Math.abs(nearest.position.x - playerPos.x) + Math.abs(nearest.position.y - playerPos.y);
          const collectibleDist = Math.abs(collectible.position.x - playerPos.x) + Math.abs(collectible.position.y - playerPos.y);
          return collectibleDist < nearestDist ? collectible : nearest;
        });
        
        console.log(`Auto-collecting ${nearest.type} at distance ${Math.abs(nearest.position.x - playerPos.x) + Math.abs(nearest.position.y - playerPos.y)}`);
        get().startCollection(nearest.id);
      }
    },
  };
  })
);
