import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

export type GamePhase = "ready" | "playing" | "ended";

export interface Position {
  x: number;
  y: number;
}

export interface Entity {
  id: string;
  position: Position;
  health: number;
  maxHealth: number;
  energy: number;
  maxEnergy: number;
  attackCooldown: number;
  moveCooldown: number;
  damage: number;
}

export interface GameStats {
  eliminations: number;
  turnsSurvived: number;
  damageDealt: number;
  damageTaken: number;
}

export interface Tile {
  x: number;
  y: number;
  isWalkable: boolean;
  isHighlighted: boolean;
  highlightType: "move" | "attack" | "none";
}

interface FightSimulatorState {
  phase: GamePhase;
  currentTurn: number;
  isPlayerTurn: boolean;
  tickProgress: number;
  
  player: Entity;
  enemies: Entity[];
  tiles: Tile[][];
  stats: GameStats;
  
  selectedTile: Position | null;
  hoveredTile: Position | null;
  
  gridSize: number;
  tickDuration: number;
  
  start: () => void;
  restart: () => void;
  end: () => void;
  
  moveEntity: (entityId: string, position: Position) => void;
  attackEntity: (attackerId: string, targetId: string) => void;
  
  updateCooldowns: () => void;
  processTick: () => void;
  processEnemyAI: () => void;
  
  highlightTiles: (type: "move" | "attack" | "none", positions: Position[]) => void;
  clearHighlights: () => void;
  setSelectedTile: (position: Position | null) => void;
  setHoveredTile: (position: Position | null) => void;
  
  isValidMove: (from: Position, to: Position) => boolean;
  isInAttackRange: (from: Position, to: Position) => boolean;
  getDistance: (from: Position, to: Position) => number;
}

const GRID_SIZE = 15;
const TICK_DURATION = 600;

const createInitialTiles = (): Tile[][] => {
  const tiles: Tile[][] = [];
  for (let y = 0; y < GRID_SIZE; y++) {
    tiles[y] = [];
    for (let x = 0; x < GRID_SIZE; x++) {
      tiles[y][x] = {
        x,
        y,
        isWalkable: true,
        isHighlighted: false,
        highlightType: "none",
      };
    }
  }
  return tiles;
};

const createInitialPlayer = (): Entity => ({
  id: "player",
  position: { x: 7, y: 12 },
  health: 100,
  maxHealth: 100,
  energy: 100,
  maxEnergy: 100,
  attackCooldown: 0,
  moveCooldown: 0,
  damage: 20,
});

const createInitialEnemies = (): Entity[] => [
  {
    id: "enemy-1",
    position: { x: 5, y: 3 },
    health: 60,
    maxHealth: 60,
    energy: 80,
    maxEnergy: 80,
    attackCooldown: 0,
    moveCooldown: 0,
    damage: 15,
  },
  {
    id: "enemy-2",
    position: { x: 9, y: 3 },
    health: 60,
    maxHealth: 60,
    energy: 80,
    maxEnergy: 80,
    attackCooldown: 0,
    moveCooldown: 0,
    damage: 15,
  },
];

export const useFightSimulator = create<FightSimulatorState>()(
  subscribeWithSelector((set, get) => ({
    phase: "ready",
    currentTurn: 0,
    isPlayerTurn: true,
    tickProgress: 0,
    
    player: createInitialPlayer(),
    enemies: createInitialEnemies(),
    tiles: createInitialTiles(),
    stats: {
      eliminations: 0,
      turnsSurvived: 0,
      damageDealt: 0,
      damageTaken: 0,
    },
    
    selectedTile: null,
    hoveredTile: null,
    
    gridSize: GRID_SIZE,
    tickDuration: TICK_DURATION,
    
    start: () => {
      set({ phase: "playing", currentTurn: 0 });
      console.log("Game started");
    },
    
    restart: () => {
      set({
        phase: "ready",
        currentTurn: 0,
        isPlayerTurn: true,
        tickProgress: 0,
        player: createInitialPlayer(),
        enemies: createInitialEnemies(),
        tiles: createInitialTiles(),
        stats: {
          eliminations: 0,
          turnsSurvived: 0,
          damageDealt: 0,
          damageTaken: 0,
        },
        selectedTile: null,
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
    
    isValidMove: (from: Position, to: Position) => {
      const { tiles, player, enemies } = get();
      const distance = get().getDistance(from, to);
      
      if (distance > 2) return false;
      if (to.x < 0 || to.x >= GRID_SIZE || to.y < 0 || to.y >= GRID_SIZE) return false;
      if (!tiles[to.y][to.x].isWalkable) return false;
      
      const occupiedByEnemy = enemies.some(e => e.position.x === to.x && e.position.y === to.y);
      const occupiedByPlayer = player.position.x === to.x && player.position.y === to.y;
      
      return !occupiedByEnemy && !occupiedByPlayer;
    },
    
    isInAttackRange: (from: Position, to: Position) => {
      const distance = get().getDistance(from, to);
      return distance <= 3;
    },
    
    moveEntity: (entityId: string, position: Position) => {
      const { player, enemies, stats } = get();
      
      if (entityId === "player") {
        if (player.moveCooldown > 0) {
          console.log("Move on cooldown");
          return;
        }
        
        if (!get().isValidMove(player.position, position)) {
          console.log("Invalid move");
          return;
        }
        
        set({
          player: {
            ...player,
            position,
            moveCooldown: 1,
            energy: Math.max(0, player.energy - 10),
          },
        });
        
        console.log(`Player moved to (${position.x}, ${position.y})`);
      } else {
        const enemy = enemies.find(e => e.id === entityId);
        if (!enemy) return;
        
        if (!get().isValidMove(enemy.position, position)) return;
        
        set({
          enemies: enemies.map(e =>
            e.id === entityId
              ? { ...e, position, moveCooldown: 1 }
              : e
          ),
        });
      }
      
      get().clearHighlights();
    },
    
    attackEntity: (attackerId: string, targetId: string) => {
      const { player, enemies, stats } = get();
      
      if (attackerId === "player") {
        if (player.attackCooldown > 0) {
          console.log("Attack on cooldown");
          return;
        }
        
        const target = enemies.find(e => e.id === targetId);
        if (!target) return;
        
        if (!get().isInAttackRange(player.position, target.position)) {
          console.log("Target out of range");
          return;
        }
        
        const newHealth = Math.max(0, target.health - player.damage);
        const killed = newHealth === 0;
        
        set({
          player: {
            ...player,
            attackCooldown: 2,
            energy: Math.max(0, player.energy - 20),
          },
          enemies: enemies.filter(e => e.id !== targetId || newHealth > 0).map(e =>
            e.id === targetId ? { ...e, health: newHealth } : e
          ),
          stats: {
            ...stats,
            damageDealt: stats.damageDealt + player.damage,
            eliminations: killed ? stats.eliminations + 1 : stats.eliminations,
          },
        });
        
        console.log(`Player attacked ${targetId} for ${player.damage} damage`);
        
        if (killed) {
          console.log(`${targetId} eliminated!`);
        }
        
        if (get().enemies.length === 0) {
          setTimeout(() => get().end(), 1000);
        }
      } else {
        const attacker = enemies.find(e => e.id === attackerId);
        if (!attacker || attacker.attackCooldown > 0) return;
        
        if (!get().isInAttackRange(attacker.position, player.position)) return;
        
        const newHealth = Math.max(0, player.health - attacker.damage);
        
        set({
          player: {
            ...player,
            health: newHealth,
          },
          enemies: enemies.map(e =>
            e.id === attackerId
              ? { ...e, attackCooldown: 2 }
              : e
          ),
          stats: {
            ...stats,
            damageTaken: stats.damageTaken + attacker.damage,
          },
        });
        
        console.log(`${attackerId} attacked player for ${attacker.damage} damage`);
        
        if (newHealth === 0) {
          setTimeout(() => get().end(), 1000);
        }
      }
      
      get().clearHighlights();
    },
    
    updateCooldowns: () => {
      const { player, enemies } = get();
      
      set({
        player: {
          ...player,
          attackCooldown: Math.max(0, player.attackCooldown - 1),
          moveCooldown: Math.max(0, player.moveCooldown - 1),
          energy: Math.min(player.maxEnergy, player.energy + 15),
        },
        enemies: enemies.map(e => ({
          ...e,
          attackCooldown: Math.max(0, e.attackCooldown - 1),
          moveCooldown: Math.max(0, e.moveCooldown - 1),
        })),
      });
    },
    
    processTick: () => {
      const { phase, currentTurn, stats } = get();
      
      if (phase !== "playing") return;
      
      get().updateCooldowns();
      
      set({
        currentTurn: currentTurn + 1,
        stats: {
          ...stats,
          turnsSurvived: currentTurn + 1,
        },
      });
      
      setTimeout(() => {
        get().processEnemyAI();
      }, 300);
    },
    
    processEnemyAI: () => {
      const { enemies, player, phase } = get();
      
      if (phase !== "playing") return;
      
      enemies.forEach(enemy => {
        if (enemy.health <= 0) return;
        
        const distanceToPlayer = get().getDistance(enemy.position, player.position);
        
        if (distanceToPlayer <= 3 && enemy.attackCooldown === 0) {
          get().attackEntity(enemy.id, "player");
        } else if (enemy.moveCooldown === 0 && distanceToPlayer > 2) {
          const dx = player.position.x - enemy.position.x;
          const dy = player.position.y - enemy.position.y;
          
          const stepX = dx === 0 ? 0 : dx > 0 ? 1 : -1;
          const stepY = dy === 0 ? 0 : dy > 0 ? 1 : -1;
          
          const newPos = {
            x: enemy.position.x + stepX,
            y: enemy.position.y + stepY,
          };
          
          if (get().isValidMove(enemy.position, newPos)) {
            get().moveEntity(enemy.id, newPos);
          } else {
            const altPos1 = { x: enemy.position.x + stepX, y: enemy.position.y };
            const altPos2 = { x: enemy.position.x, y: enemy.position.y + stepY };
            
            if (get().isValidMove(enemy.position, altPos1)) {
              get().moveEntity(enemy.id, altPos1);
            } else if (get().isValidMove(enemy.position, altPos2)) {
              get().moveEntity(enemy.id, altPos2);
            }
          }
        }
      });
    },
    
    highlightTiles: (type: "move" | "attack" | "none", positions: Position[]) => {
      set(state => {
        const newTiles = state.tiles.map(row =>
          row.map(tile => ({
            ...tile,
            isHighlighted: positions.some(p => p.x === tile.x && p.y === tile.y),
            highlightType: positions.some(p => p.x === tile.x && p.y === tile.y) ? type : "none",
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
            highlightType: "none" as const,
          }))
        );
        return { tiles: newTiles };
      });
    },
    
    setSelectedTile: (position: Position | null) => {
      set({ selectedTile: position });
    },
    
    setHoveredTile: (position: Position | null) => {
      set({ hoveredTile: position });
    },
  }))
);
