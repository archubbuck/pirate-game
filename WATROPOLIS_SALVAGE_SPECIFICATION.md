# Watropolis Salvage - Complete Application Specification

## Executive Summary

Watropolis Salvage is a post-apocalyptic salvage exploration game where players captain a salvage vessel from Watropolis, a floating city built 60 years after catastrophic volcanic eruptions triggered global sea level rise. The game combines resource gathering, ship upgrades, tactical combat, crew management, and artifact discovery in a fog-of-war exploration system on a 40x40 grid.

---

## 1. Game World & Setting

### 1.1 Narrative Background

**Timeline:**
- Massive underwater volcanic eruptions accelerated ocean warming
- Rapid polar ice cap melting caused catastrophic sea level rise
- 60 years after the flood, survivors built Watropolis
- The old world lies beneath the waves, holding valuable salvage

**World State:**
- Ocean covers most land
- Watropolis: a great floating city built from salvaged materials
- Survivors make their living salvaging the sunken world
- Resources from pre-flood civilization are valuable for rebuilding

### 1.2 Player Role

The player is a salvage vessel captain operating from Watropolis with missions to:
- Sail the flooded world and explore unknown waters
- Collect salvage materials (Timber, Alloy, Circuit, Biofiber)
- Upgrade their vessel to improve capabilities
- Discover artifacts that reveal the story of the pre-flood world
- Contribute to rebuilding civilization

---

## 2. Core Gameplay Mechanics

### 2.1 Grid-Based Exploration System

**Map Specifications:**
- Grid size: 40x40 tiles
- Grid type: Hexagonal (though rendering uses square visualization)
- Starting position: Player spawns at (20, 20) - center of the map
- Movement: Click-to-move with A* pathfinding
- Diagonal movement: Supported (8-directional)

**Fog of War System:**
- Initial vision radius: 10 tiles
- Tiles become permanently explored when revealed
- Vision radius can be increased with "Sonar Beacon" power-up (+60s extended range)
- Unlocking sea routes reveals additional map areas

**Tile States:**
- `isWalkable`: Can player move here (false for islands)
- `isExplored`: Has player revealed this tile
- `isHighlighted`: Temporary highlight for pathfinding

### 2.2 Movement & Pathfinding

**A* Pathfinding Implementation:**
```typescript
// Heuristic: Manhattan distance
heuristic = |targetX - currentX| + |targetY - currentY|

// Movement costs:
// - Straight: 1.0
// - Diagonal: 1.414 (√2)

// Neighbors checked: 8-directional
neighbors = [
  {x+1, y}, {x-1, y}, {x, y+1}, {x, y-1},  // Orthogonal
  {x+1, y+1}, {x+1, y-1}, {x-1, y+1}, {x-1, y-1}  // Diagonal
]
```

**Travel Time Calculation:**
```typescript
baseTimePerTile = 600ms
engineLevel = shipUpgrades.engine

travelDuration = (distance × baseTimePerTile) / engineLevel
```

**Movement Animation:**
- Tile transition time: 600ms base
- Visual interpolation: Linear (t-based)
- Player rotation: `atan2(dy, dx) + Math.PI/2` (points toward movement direction)

**Path Highlighting:**
- Path tiles are highlighted when destination is selected
- Highlights cleared on arrival or cancellation

### 2.3 Resource Collection System

**Resource Types:**
1. **Timber Salvage** - Wood from pre-flood structures
2. **Alloy Scrap** - Metal frameworks and structural components
3. **Circuit Relics** - Pre-flood technology and electronic parts
4. **Biofibers** - Organic composites used as sealants

**Resource Generation:**
```typescript
// 30 collectibles spawned at game start
COLLECTIBLE_COUNT = 30

// Each collectible has:
{
  id: string,
  position: {x, y},
  type: "timber" | "alloy" | "circuit" | "biofiber",
  richness: 1-3  // Random value affecting collection time
}
```

**Collection Mechanics:**
- **Trigger:** Player arrives at collectible tile
- **Action:** Instant collection (no time delay in current implementation)
- **Capacity:** Limited by cargo hold (base: 10, +5 per cargo upgrade level)
- **Full cargo behavior:** Cannot collect when cargo is full; player notified

**Collection Time (Time-based system - if implemented):**
```typescript
baseCollectionTime = 3000ms + (richness × 2000ms)
scannerLevel = shipUpgrades.scanner
salvageRigLevel = shipUpgrades.salvageRig

// Scanner affects accuracy of time estimate (60%-100%)
accuracyFactor = 0.6 + (scannerLevel - 1) × 0.1  // Caps at 100% at level 5

// Salvage Rig reduces collection time
actualCollectionTime = baseCollectionTime / salvageRigLevel
```

### 2.4 Cargo & Economy System

**Cargo Management:**
```typescript
// Cargo capacity formula
baseCapacity = 10
cargoHoldLevel = shipUpgrades.cargoHold
maxCargo = baseCapacity + (cargoHoldLevel - 1) × 5

// Example progression:
// Level 1: 10 items
// Level 2: 15 items
// Level 3: 20 items
```

**Currency System:**
- Currency is separate from collected materials
- Starting currency: 0
- Selling cargo: At Watropolis Dockyard (home tile)
- Sale value: `cargoCount × 10 currency`
- "Sell All Cargo" button clears inventory and adds currency

**Economic Flow:**
1. Collect resources → Fill cargo hold
2. Return to Watropolis (20, 20)
3. Sell cargo for currency
4. Spend currency on upgrades, power-ups, or map unlocks

### 2.5 Ship Upgrade System

**Upgrade Categories:**

| Upgrade Type | Effect | Cost Formula | Max Level |
|--------------|--------|--------------|-----------|
| **Engine** | Increases travel speed | `level × 50` | Unlimited |
| **Scanner** | Improves collection time accuracy (60% → 100% at L5) | `level × 50` | 5 (functional cap) |
| **Salvage Rig** | Faster material collection | `level × 50` | Unlimited |
| **Cargo Hold** | +5 capacity per level | `level × 50` | Unlimited |

**Upgrade Implementation:**
```typescript
shipUpgrades = {
  engine: 1,      // Starting level
  scanner: 1,
  salvageRig: 1,
  cargoHold: 1
}

// Purchase logic
function purchaseShipUpgrade(type: "engine" | "scanner" | "salvageRig" | "cargoHold") {
  cost = shipUpgrades[type] × 50
  if (currency >= cost) {
    currency -= cost
    shipUpgrades[type] += 1
    return true
  }
  return false
}
```

**Visual Ship Evolution:**
- Ship appearance changes based on sailing skill level
- 4+ distinct ship designs for levels 1, 10+, 30+, 50+
- Generated using `shipGraphicsGenerator.ts` or SVG templates

### 2.6 Power-Up System

**Available Power-Ups:**

| Power-Up | Icon | Cost | Duration | Effect |
|----------|------|------|----------|--------|
| **Afterburner Rig** | ⚡ | 25 | 30s | Temporary speed boost |
| **Sonar Beacon** | 👁️ | 30 | 60s | Extended vision range |
| **Grapple Winch** | 🧲 | 35 | 45s | Auto-collect nearby materials |

**Power-Up Mechanics:**
```typescript
interface PowerUp {
  type: "speed" | "vision" | "magnet"
  expiresAt?: number  // Unix timestamp
}

// Activation
function activatePowerUp(type: PowerUp["type"], duration: number) {
  expiresAt = Date.now() + (duration × 1000)
  activePowerUps.push({ type, expiresAt })
  
  // Visual effects rendered on player ship
  // Auto-cleanup when expired
}
```

**Visual Effects:**
- Speed: Yellow/orange pulsing glow
- Vision: Cyan scan-line effect
- Magnet: Purple magnetic field visualization

### 2.7 Combat System

**Enemy Ship Types:**

```typescript
NPC_CONFIGS = {
  raider_skiff: {
    name: "Raider Skiff",
    baseHealth: 60,
    healthPerLevel: 15,
    baseDamage: 10,
    damagePerLevel: 3,
    moveSpeed: 0.6,
    aggroRange: 5,
    experienceReward: 40,
    levelRange: [1, 3],
    dropTable: [
      { type: "timber", min: 1, max: 2, chance: 0.7 },
      { type: "alloy", min: 1, max: 2, chance: 0.5 }
    ]
  },
  
  scavenger_barge: {
    name: "Scavenger Barge",
    baseHealth: 100,
    healthPerLevel: 25,
    baseDamage: 5,
    damagePerLevel: 2,
    moveSpeed: 0.3,
    aggroRange: 3,
    experienceReward: 60,
    levelRange: [2, 5],
    dropTable: [
      { type: "timber", min: 2, max: 4, chance: 0.8 },
      { type: "alloy", min: 1, max: 3, chance: 0.6 },
      { type: "circuit", min: 1, max: 2, chance: 0.4 }
    ]
  },
  
  pirate_corsair: {
    name: "Pirate Corsair",
    baseHealth: 120,
    healthPerLevel: 30,
    baseDamage: 15,
    damagePerLevel: 5,
    moveSpeed: 0.5,
    aggroRange: 6,
    experienceReward: 80,
    levelRange: [3, 7],
    dropTable: [
      { type: "alloy", min: 2, max: 4, chance: 0.9 },
      { type: "circuit", min: 1, max: 3, chance: 0.7 },
      { type: "biofiber", min: 1, max: 2, chance: 0.5 }
    ]
  },
  
  mutant_leviathan: {
    name: "Mutant Leviathan",
    baseHealth: 200,
    healthPerLevel: 50,
    baseDamage: 25,
    damagePerLevel: 8,
    moveSpeed: 0.4,
    aggroRange: 8,
    experienceReward: 150,
    levelRange: [5, 10],
    dropTable: [
      { type: "biofiber", min: 3, max: 6, chance: 1.0 },
      { type: "circuit", min: 2, max: 4, chance: 0.8 },
      { type: "alloy", min: 2, max: 3, chance: 0.6 }
    ]
  }
}
```

**Enemy Spawning:**
- Count: 5 enemy ships at game start
- Random NPC type selection
- Random level within NPC's level range
- Random starting positions (avoid player, collectibles, islands)
- Random rotation (0 - 2π radians)

**Combat Flow:**
1. Player moves adjacent to enemy ship
2. Combat automatically initiates
3. Combat UI overlay appears
4. Progress bar fills over combat duration (5000ms base)
5. On completion:
   - Enemy ship removed
   - Loot generated based on drop table
   - Loot added to player cargo (if space available)
   - Experience awarded to combat skill

**Enemy AI Behavior:**
```typescript
// Movement pattern
TILE_TRANSITION_TIME = 600ms
nextMoveDelay = random(5000-13000)ms

// Pathfinding
function findRandomPath(current: Position) {
  direction = random(8 directions)
  steps = random(2-4)
  return path of 2-4 tiles in chosen direction
}

// Movement loop
if (currentPath.length === 0 && currentTime >= nextMoveTime) {
  currentPath = findRandomPath(position)
  nextMoveTime = currentTime + random(5000-13000)
}
```

### 2.8 Crew Management System

**Crew Member Specification:**
```typescript
interface CrewMember {
  id: string
  position: Position
  visualPosition: {x, y}
  state: "idle" | "deployed" | "collecting" | "awaitingPickup" | "drifting" | "captured"
  deployedAt: number | null  // Timestamp
  driftStartTime: number | null
  poachingEnemyId: string | null
  poachStartTime: number | null
}

// Initial crew
startingCrew = 4 members (Crew-1, Crew-2, Crew-3, Crew-4)
maxCrewCapacity = 6
```

**Crew Deployment Mechanics:**
1. **Deploy:** Player sends crew to collectible location
2. **Collect:** Crew gathers resources over time
3. **Await Pickup:** Crew waits at location with collected resources
4. **Retrieve:** Player returns to pick up crew and collected materials

**Crew Risk System:**
```typescript
DRIFT_TIME = 45000ms  // 45 seconds before crew drifts away
POACH_MIN_TIME = 5000ms  // 5s minimum before poaching can occur
POACH_PROXIMITY = 3 tiles  // Enemy must be within 3 tiles
POACH_CHANCE = 0.12  // 12% chance per check
POACH_CHECK_INTERVAL = 1000ms  // Check every second

// Drift mechanic
if (crewState === "awaitingPickup" && currentTime - deployedAt > DRIFT_TIME) {
  crewState = "drifting"
  // Crew is lost
}

// Poaching mechanic
if (enemyShip.distance <= POACH_PROXIMITY && timeSinceDeployed > POACH_MIN_TIME) {
  if (random() < POACH_CHANCE) {
    crewState = "captured"
    // Crew is lost to enemy
  }
}
```

**Cove System:**
```typescript
// Coves are special locations with:
interface Cove {
  id: string
  position: Position
  hasCrewMember: boolean  // 50% chance
  crewMemberRecruitCost: 100
  lootTable: Array<{type, quantity}>
  looted: boolean
}

// 4 coves generated at game start
COVE_COUNT = 4
```

### 2.9 Artifact Discovery System

**Artifact Count:** 18 unique artifacts

**Artifact Structure:**
```typescript
interface Artifact {
  id: string
  position: Position
  name: string
  description: string
  lore: string
  category: "technology" | "culture" | "infrastructure" | "personal" | "nature"
  rarity: "common" | "uncommon" | "rare"
  isCollected: boolean
  clueRevealed: boolean  // Archivist can reveal location for fee
}
```

**Complete Artifact List:**

1. **Server Rack Fragment** (Technology, Common)
   - *Description:* "Corroded metal from a data center"
   - *Lore:* "A twisted piece of metal bearing faded corporate logos. Once housed the digital memories of millions, now a corroded monument to lost connectivity."

2. **Subway Token** (Personal, Common)
   - *Description:* "Brass transit token from 2065"
   - *Lore:* "A brass token from the Metro Transit Authority, dated 2065. The inscription reads 'Your journey continues.' It didn't."

3. **Wedding Photo Album** (Personal, Uncommon)
   - *Description:* "Water-damaged celebration photos"
   - *Lore:* "Water-damaged photos of celebrations under blue skies. The final page shows a beachside ceremony—the same beach now 200 feet underwater."

4. **Traffic Light Controller** (Infrastructure, Common)
   - *Description:* "Electronic intersection control box"
   - *Lore:* "An electronic box that once orchestrated vehicle flow through busy intersections. Its last command was eternal red."

5. **Museum Plaque** (Culture, Uncommon)
   - *Description:* "Bronze plaque with scratched graffiti"
   - *Lore:* "Bronze plaque: 'The Age of Oil: 1850-2070.' Someone scratched underneath: 'We knew. We didn't care.'"

6. **Child's Tablet Device** (Technology, Common)
   - *Description:* "Educational device frozen on glaciers lesson"
   - *Lore:* "A learning device frozen on a geography lesson about glaciers. 'These ice sheets will last forever!' the cheerful narrator promised."

7. **Office Coffee Mug** (Personal, Common)
   - *Description:* "Ceramic mug from a submerged high-rise"
   - *Lore:* "'World's Best Dad' printed on ceramic. Found in a submerged high-rise, still sitting on a desk as if waiting for Monday morning."

8. **Weather Station Log** (Technology, Rare)
   - *Description:* "Final readings before evacuation"
   - *Lore:* "Final entry: 'Ocean temp +4.2°C above baseline. Evacuation protocols initiated. May God help us all.'"

9. **Theater Marquee Letter** (Culture, Uncommon)
   - *Description:* "Letter 'E' from Grand Cinema sign"
   - *Lore:* "The letter 'E' from the Grand Cinema's sign. Its last showing: 'An Inconvenient Truth.' Nobody came."

10. **Sports Championship Ring** (Culture, Uncommon)
    - *Description:* "Gold ring from 2068 World Series"
    - *Lore:* "Gold ring celebrating the 2068 World Series. The winning team's stadium is now a reef teeming with fish."

11. **Bridge Cable Sample** (Infrastructure, Common)
    - *Description:* "Steel cable from Harbor Bridge"
    - *Lore:* "Steel cable from the Harbor Bridge, rated to last 200 years. It lasted 73 before the waters claimed it."

12. **Voting Ballot Box** (Culture, Uncommon)
    - *Description:* "Sealed box from 2064 election"
    - *Lore:* "Sealed ballot box from the 2064 election. The winner promised climate action. The box stayed sealed underwater."

13. **Solar Panel Array** (Technology, Common)
    - *Description:* "Rooftop renewable energy system"
    - *Lore:* "A rooftop solar installation meant to save the world. It powered the building's lights as the waters rose past the windows."

14. **Restaurant Menu** (Culture, Common)
    - *Description:* "Laminated menu from seafood restaurant"
    - *Lore:* "Laminated menu from 'Neptune's Bounty Seafood.' Ironic that Neptune took everything back."

15. **Flood Barrier Blueprint** (Infrastructure, Rare)
    - *Description:* "Unbuilt coastal protection plans"
    - *Lore:* "Engineering plans for coastal barriers, approved but never built. Budget cuts, they said. Too expensive, they said."

16. **Smartphone** (Personal, Uncommon)
    - *Description:* "Device with unsent final message"
    - *Lore:* "Its last text, unsent: 'The water's at the door. I love you all.' The message waits eternally in the outbox."

17. **University Diploma** (Personal, Rare)
    - *Description:* "Environmental Science degree, 2066"
    - *Lore:* "Degree in Environmental Science, 2066. The graduate dedicated their life to warning others. The warnings went unheeded."

18. **Power Grid Relay** (Infrastructure, Uncommon)
    - *Description:* "Failed electrical network component"
    - *Lore:* "Component from the city's electrical network. It failed when seawater flooded the substations, plunging millions into darkness."

**The Archivist NPC:**
- Location: Watropolis (home base)
- Function: Sells location clues for undiscovered artifacts
- Clue cost: 25 currency per artifact
- Unlock condition: `archivistUnlocked` flag (set after collecting X artifacts or other milestone)
- Clue effect: Sets `artifact.clueRevealed = true`, making location visible on map

### 2.10 Skills & Progression System

**Skill Types:**
1. **Sailing** ⛵ (Blue) - Movement and travel
2. **Salvaging** 🔧 (Green) - Resource collection
3. **Combat** ⚔️ (Red) - Fighting enemies
4. **Exploration** 🗺️ (Purple) - Discovering new areas

**Experience Table:**
```typescript
// RuneScape-style XP formula
for (level = 1 to 99) {
  if (level === 1) {
    xp[level] = 0
  } else {
    base = floor(level + 300 × 2^(level/7))
    xp[level] = floor(xp[level-1] + base/4)
  }
}

// Example progression:
// Level 1: 0 XP
// Level 2: 83 XP
// Level 5: 388 XP
// Level 10: 1,154 XP
// Level 20: 4,470 XP
// Level 50: 101,333 XP
// Level 99: 13,034,431 XP
```

**Skill Unlocks:**

**Sailing:**
- Level 5: "Swift Currents" (+10% sailing speed)
- Level 15: "Auto-Pilot Basic" (Unlock basic auto-pilot features)
- Level 25: "Storm Navigator" (Navigate dangerous waters safely)
- Level 40: "Master Navigator" (+25% sailing speed)

**Salvaging:**
- Level 5: "Efficient Salvage" (Collect resources 10% faster)
- Level 10: "Resource Detection" (See nearby resources on minimap)
- Level 20: "Advanced Salvage" (Collect resources 25% faster)
- Level 35: "Master Salvager" (Chance for double resources)

**Combat:**
- Level 5: "Combat Basics" (Deal 10% more damage)
- Level 15: "Tactical Advantage" (Reduce combat time by 15%)
- Level 30: "Battle Hardened" (Crew less likely to be poached)
- Level 50: "Master Combatant" (Deal 50% more damage)

**Exploration:**
- Level 5: "Eagle Eye" (Explore 1 tile further per move)
- Level 10: "Treasure Hunter" (Better loot in coves)
- Level 20: "Pathfinder" (Reveal cove locations on map)
- Level 40: "Master Explorer" (Legendary loot in coves)

**XP Award Triggers:**
- Sailing: Tiles traveled
- Salvaging: Resources collected
- Combat: Enemies defeated
- Exploration: New tiles discovered

### 2.11 Island System

**Island Generation:**
```typescript
ISLAND_COUNT = 8

// Each island:
{
  id: string,
  positions: Position[],  // 3-5 width × 3-5 height
  resources: {
    [resourceType]: quantity  // 1-3 resource types per island
  }
}

// Islands block movement (isWalkable = false)
// Islands may contain extractable resources
// Visual size varies (3x3 to 5x5 tiles)
```

---

## 3. Technical Architecture

### 3.1 Technology Stack

**Frontend:**
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Pixi.js** - 2D rendering engine (primary renderer)
- **TailwindCSS** - Utility-first styling
- **Radix UI** - Accessible component primitives
- **Zustand** - State management
- **date-fns** - Date utilities

**Backend:**
- **Express.js** - Node.js web framework
- **TypeScript** - Type-safe server code
- **ESM modules** - Modern JavaScript modules
- **tsx** - TypeScript execution for dev
- **esbuild** - Production bundling

**Database:**
- **PostgreSQL** (via Neon serverless)
- **Drizzle ORM** - Type-safe database queries
- **Drizzle-Kit** - Schema migrations
- **Drizzle-Zod** - Runtime validation

### 3.2 Project Structure

```
watropolis-salvage/
├── client/                    # Frontend application
│   ├── public/                # Static assets
│   │   ├── sounds/
│   │   │   ├── background.mp3
│   │   │   ├── hit.mp3
│   │   │   └── success.mp3
│   │   ├── textures/
│   │   │   ├── ships/         # Ship texture sprites
│   │   │   ├── asphalt.png
│   │   │   ├── grass.png
│   │   │   ├── sand.jpg
│   │   │   ├── sky.png
│   │   │   └── wood.jpg
│   │   └── fonts/
│   │       └── inter.json
│   ├── src/
│   │   ├── components/        # React components
│   │   │   ├── ui/            # Radix UI components (40+ components)
│   │   │   ├── Game.tsx       # Main game orchestrator
│   │   │   ├── HUD.tsx        # Heads-up display
│   │   │   ├── Pixi*.tsx      # Pixi.js rendering components
│   │   │   ├── *Controller.tsx # Game logic controllers
│   │   │   ├── Shop.tsx       # Upgrade shop
│   │   │   ├── Inventory.tsx  # Cargo hold
│   │   │   ├── ArtifactLog.tsx
│   │   │   ├── Archivist.tsx
│   │   │   └── ...
│   │   ├── lib/
│   │   │   ├── stores/
│   │   │   │   ├── useGameStore.tsx    # Main game state
│   │   │   │   ├── useSkillsStore.tsx  # Skills/progression
│   │   │   │   └── useAudio.tsx        # Sound management
│   │   │   ├── utils.ts
│   │   │   └── queryClient.ts
│   │   ├── config/
│   │   │   └── npcConfig.ts   # Enemy ship configurations
│   │   ├── utils/
│   │   │   ├── shipGraphicsGenerator.ts
│   │   │   └── shipSvgGenerator.ts
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── index.html
│   └── ...
├── server/                    # Backend application
│   ├── index.ts               # Express server entry
│   ├── routes.ts              # API route definitions
│   ├── vite.ts                # Vite dev integration
│   └── storage.ts             # Data access layer
├── shared/                    # Shared types/schema
│   └── schema.ts
├── migrations/                # Database migrations
├── vite.config.ts
├── tsconfig.json
├── package.json
└── replit.md                  # Project documentation
```

### 3.3 State Management Architecture

**Primary Store: `useGameStore`**

```typescript
// State shape
interface GameState {
  // Game phase
  phase: "ready" | "playing" | "ended"
  
  // Entities
  player: Player
  collectibles: Collectible[]
  artifacts: Artifact[]
  islands: Island[]
  enemyShips: EnemyShip[]
  crewMembers: CrewMember[]
  coves: Cove[]
  
  // Movement
  currentPath: Position[]
  isMoving: boolean
  playerRotation: number
  targetPosition: Position | null
  travelStartTime: number | null
  travelDuration: number | null
  
  // Map
  tiles: Tile[][]  // 40×40 grid
  gridSize: 40
  visionRadius: 10
  
  // Progression
  shipUpgrades: ShipUpgrade
  currency: number
  collectedItems: CollectedItem[]
  activePowerUps: PowerUp[]
  mapUnlocks: MapUnlock[]
  
  // UI state
  isInventoryOpen: boolean
  isShopOpen: boolean
  isArtifactLogOpen: boolean
  isArchivistOpen: boolean
  hoveredTile: Position | null
  
  // Combat
  combatState: CombatState
  
  // Camera
  isCameraFollowing: boolean
  cameraOffset: {x, z}
  zoomLevel: number
  cameraTransform: {...}
  
  // Actions (50+ methods)
  start: () => void
  collectItem: (id: string) => void
  purchaseShipUpgrade: (type) => boolean
  startCombat: (enemyId: string) => void
  // ... many more
}
```

**Secondary Store: `useSkillsStore`**
- Manages 4 skills with XP tracking
- Unlock system for skill perks
- XP table calculation (RuneScape formula)

**Tertiary Store: `useAudio`**
- Background music reference
- Sound effect references
- Mute state
- Play methods

### 3.4 Rendering Architecture

**Pixi.js Component Structure:**

```typescript
// Main orchestrator: Game.tsx
<Game>
  <PixiApplication canvas={canvasRef}>
    <PixiCamera />
    <PixiTerrain />           // Grid background
    <PixiIslands />           // Island obstacles
    <PixiFogOfWar />          // Exploration overlay
    <PixiCollectibles />      // Resource nodes
    <PixiArtifacts />         // Discoverable lore items
    <PixiEnemyShips />        // Enemy entities
    <PixiCrewMembers />       // Deployed crew
    <PixiPlayer />            // Player vessel
    <PixiLighting />          // Dynamic lighting effects
  </PixiApplication>
  
  {/* UI Overlays */}
  <HUD />
  <Inventory />
  <Shop />
  <ArtifactLog />
  <CombatUI />
  <ContextMenu />
  <MobileControls />
  
  {/* Controllers (logic only, no render) */}
  <MovementController />
  <EnemyAIController />
  <CrewController />
  <GameLoop />
</Game>
```

**Pixi.js Classes:**
Each Pixi component is implemented as a TypeScript class:

```typescript
export class PixiPlayer {
  private container: PIXI.Container
  private shipContainer: PIXI.Container
  private shipGraphics: PIXI.Graphics
  private hexSize: number = 24
  private powerUpEffects: PIXI.Graphics
  
  constructor(parent: PIXI.Container) {
    // Initialize graphics
  }
  
  update(deltaTime: number) {
    // Update animations, position, effects
    // Read from useGameStore.getState()
  }
  
  destroy() {
    // Cleanup
  }
}
```

**Hex Grid Calculations:**
```typescript
hexSize = 24
hexWidth = √3 × hexSize  // ≈ 41.57
hexHeight = 2 × hexSize  // 48

// Grid to world coordinates
worldX = gridX × hexWidth + (gridY % 2 × hexWidth/2)
worldY = gridY × (hexHeight × 0.75)

// Offset grid for staggered hex layout
```

### 3.5 API & Backend Design

**Current API Endpoints:**
```typescript
// server/routes.ts
registerRoutes(app: Express) {
  // Minimal API - game is primarily client-side
  // Future endpoints:
  // - POST /api/auth/register
  // - POST /api/auth/login
  // - GET /api/user/profile
  // - POST /api/game/save
  // - GET /api/game/load
}
```

**Database Schema:**
```typescript
// shared/schema.ts
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").unique().notNull(),
  password: text("password").notNull(),  // Should be hashed
})

// Future tables:
// - game_saves
// - player_stats
// - achievements
```

**Development vs Production:**
- Development: Vite middleware, HMR, live reloading
- Production: Static file serving from `dist/public`
- Port: Always 5000 (bind to 0.0.0.0)

### 3.6 Build Configuration

**Vite Configuration:**
```typescript
// vite.config.ts
export default defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    glsl(),  // Shader support
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client", "src"),
      "@shared": path.resolve(__dirname, "shared"),
    },
  },
  root: path.resolve(__dirname, "client"),
  build: {
    outDir: path.resolve(__dirname, "dist/public"),
    emptyOutDir: true,
  },
  assetsInclude: ["**/*.gltf", "**/*.glb", "**/*.mp3", "**/*.ogg", "**/*.wav"],
})
```

**TypeScript Configuration:**
- Target: ES2020
- Module: ESNext
- JSX: react-jsx
- Strict mode enabled
- Path mapping for @/ and @shared/

---

## 4. User Interface Specification

### 4.1 Game Phases & Screens

**Phase: Ready (Main Menu)**
- Title: "Watropolis Salvage"
- Subtitle: "Captain's Log - Year 60 After The Flood"
- Narrative text explaining backstory
- Mission briefing with controls
- "Launch Vessel" button to start game

**Phase: Playing (Main Gameplay)**
- Full-screen Pixi.js canvas
- HUD overlays
- Dynamic UI panels (inventory, shop, etc.)
- Context menus on right-click
- Mobile touch controls (if on mobile)

**Phase: Ended (Game Over/Victory)**
- Game complete screen
- Final statistics
- "Restart" button

### 4.2 HUD (Heads-Up Display)

**Top Bar (Always Visible):**
- **Cargo Capacity:** `X / Y` (current / max)
- **Currency:** `💰 X`
- **Active Power-Ups:** Icon badges with timers
- **Skills Button:** Opens skill panel
- **Artifact Log Button:** Opens collected artifacts
- **Archivist Button:** (if unlocked)

**Bottom Controls:**
- **Inventory (I):** Opens cargo hold
- **Shop (S):** Opens Watropolis Dockyard
- **Camera Toggle:** Lock/unlock camera follow
- **Audio Toggle:** Mute/unmute

**Activity Panel (When Active):**
- Traveling: Shows destination, ETA, progress bar
- In Combat: Shows enemy info, combat progress
- Collecting: Shows item type, time remaining

**Mini-Map:**
- Zoomed-out view of explored area
- Player position indicator
- Fog of war overlay
- Clickable for quick navigation

### 4.3 Modal Panels

**Inventory (Cargo Hold):**
```
┌──────────────────────────────────┐
│ ⛴️ Cargo Hold                     │
│ Salvaged Materials Storage       │
├──────────────────────────────────┤
│ Cargo: X / Y                     │
│ Currency: 💰 X                    │
├──────────────────────────────────┤
│ [Timber Icon] Timber Salvage: X  │
│ [Alloy Icon] Alloy Scrap: X      │
│ [Circuit Icon] Circuit Relics: X │
│ [Biofiber Icon] Biofibers: X     │
├──────────────────────────────────┤
│ Sell Value: X currency           │
│                                  │
│ [Sell All Cargo]                 │
└──────────────────────────────────┘
```

**Shop (Watropolis Dockyard):**

Three Tabs:
1. **Ship Upgrades**
   - Engine: Level X → Cost: X currency
   - Scanner: Level X → Cost: X currency
   - Salvage Rig: Level X → Cost: X currency
   - Cargo Hold: Level X → Cost: X currency

2. **Power-Ups**
   - Afterburner Rig (25 currency, 30s)
   - Sonar Beacon (30 currency, 60s)
   - Grapple Winch (35 currency, 45s)

3. **Sea Route Unlocks**
   - Sunken Metro Line (50 currency)
   - Coral Expanse (100 currency)
   - Tempest Graveyard (150 currency)
   - Glacier Runoff (200 currency)

**Artifact Log:**
- Grid of discovered artifacts
- Click to view full lore entry
- Category/rarity filtering
- Collection progress (X / 18)

**Archivist:**
- NPC portrait/description
- List of undiscovered artifacts
- Purchase clue buttons (25 currency each)
- Reveals artifact location on map

**Skills Panel:**
- 4 skill bars with level/XP display
- XP progress bars
- Unlock achievements list
- Skill effects descriptions

**Context Menu (Right-Click):**
- Shows on enemy/collectible
- Displays detailed info:
  - Enemy: Type, level, health, loot table
  - Collectible: Type, richness
- Actions (if applicable)

### 4.4 Visual Design

**Color Palette:**
- **Primary:** Blue (#3b82f6) - Watropolis, water themes
- **Success:** Green (#10b981) - Biofibers, collection success
- **Warning:** Yellow (#fbbf24) - Caution, speed power-up
- **Danger:** Red (#ef4444) - Combat, enemies
- **Purple:** (#a855f7) - Exploration, artifacts
- **Dark:** Gray-900 (#0a0a0a) - Background
- **Light:** Gray-100 (#f3f4f6) - Text

**Typography:**
- Font: Inter (via @fontsource/inter)
- Heading: Bold, 24-32px
- Body: Regular, 14-16px
- Small: 12px (labels, hints)

**Icons:**
- Emoji-based for simplicity
- Resource types: 🌲 (timber), ⚙️ (alloy), 💻 (circuit), 🧬 (biofiber)
- Actions: ⚡ (speed), 👁️ (vision), 🧲 (magnet)
- UI: 📦 (cargo), 💰 (currency), 🏪 (shop), 📜 (log)

**Animations:**
- Ship movement: Linear interpolation over 600ms
- Combat progress: Smooth fill animation
- Power-up effects: Pulsing glow (sin wave)
- Fog of war: Fade-in when revealed

### 4.5 Mobile Responsiveness

**Touch Controls:**
- Tap to move (replaces click)
- Long-press for context menu
- On-screen D-pad for fine movement
- Swipe to pan camera (if unlocked)

**UI Adaptations:**
- Smaller panels (max-width: 90vw)
- Stacked layouts for narrow screens
- Larger touch targets (min 44×44px)
- Collapsible panels to save space

**Breakpoints:**
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

---

## 5. Game Balance & Tuning

### 5.1 Economy Balance

**Resource Value:**
```
Collection time investment → Cargo value → Currency gain

Example 30-collectible session:
- 30 collectibles @ 10 currency each = 300 currency
- Can purchase:
  - 6× Level 1 upgrades (50 each)
  - OR 10× power-ups
  - OR 1× Level 5 upgrade (250 currency)
```

**Progression Pacing:**
- Early game (0-5 collectibles): Learn movement, exploration
- Mid game (5-15 collectibles): First upgrades, encounter enemies
- Late game (15+ collectibles): Advanced upgrades, artifact hunting
- End game: Complete artifact collection, max skills

### 5.2 Combat Balance

**Difficulty Curve:**
```
Enemy Type          | Spawn Rate | Difficulty | Reward
--------------------|------------|------------|--------
Raider Skiff       | 40%        | Easy       | Low
Scavenger Barge    | 30%        | Medium     | Medium
Pirate Corsair     | 20%        | Hard       | High
Mutant Leviathan   | 10%        | Very Hard  | Very High
```

**Combat Duration:**
- Base: 5000ms (5 seconds)
- With Combat skill L15: 4250ms (15% reduction)
- Player can't do other actions during combat

**Loot Drop Probability:**
- Common drops: 50-80% chance
- Uncommon drops: 40-60% chance
- Rare drops: 20-40% chance
- Boss drops: 80-100% chance

### 5.3 Upgrade Scaling

**Diminishing Returns:**
```
Upgrade Level | Cost   | Cumulative Cost
--------------|--------|----------------
1 → 2         | 50     | 50
2 → 3         | 100    | 150
3 → 4         | 150    | 300
4 → 5         | 200    | 500
5 → 6         | 250    | 750
10 → 11       | 500    | 2,750
```

**Engine Upgrade Impact:**
```
Level | Speed Multiplier | Travel Time (10 tiles)
------|------------------|----------------------
1     | 1.0×             | 6000ms
2     | 2.0×             | 3000ms
5     | 5.0×             | 1200ms
10    | 10.0×            | 600ms
```

### 5.4 Skill XP Rates

**XP Gains:**
```typescript
// Sailing XP
xpPerTile = 5
longJourneyBonus = distance > 10 ? 20 : 0

// Salvaging XP
xpPerResource = 10
richnessMultiplier = richness × 1.5

// Combat XP
xpPerEnemy = config.experienceReward  // 40-150
levelBonus = enemyLevel × 5

// Exploration XP
xpPerNewTile = 2
artifactDiscovery = 100
```

**Level Progression:**
- Level 1-10: ~2-10 minutes gameplay each
- Level 10-30: ~10-30 minutes each
- Level 30-50: ~1-2 hours each
- Level 50-99: ~5-10 hours each

---

## 6. Assets & Resources

### 6.1 Audio Assets

**Background Music:**
- File: `/sounds/background.mp3`
- Loop: Yes
- Volume: 0.3
- Start: On game start (if not muted)

**Sound Effects:**
- Hit: `/sounds/hit.mp3` (combat, collisions)
- Success: `/sounds/success.mp3` (collection, upgrades)
- Volume: 0.3

**Audio Implementation:**
```typescript
// Preload in App.tsx
useEffect(() => {
  const bg = new Audio("/sounds/background.mp3")
  bg.loop = true
  bg.volume = 0.3
  setBackgroundMusic(bg)
  
  const hit = new Audio("/sounds/hit.mp3")
  const success = new Audio("/sounds/success.mp3")
  setHitSound(hit)
  setSuccessSound(success)
}, [])

// Play on unmute
if (!isMuted && backgroundMusic) {
  backgroundMusic.play()
}
```

### 6.2 Visual Assets

**Textures:**
- `/textures/asphalt.png` - Urban terrain
- `/textures/grass.png` - Land areas
- `/textures/sand.jpg` - Beaches
- `/textures/sky.png` - Background
- `/textures/wood.jpg` - Structures

**Ship Sprites:**
- `/textures/ships/ship1.png` through `ship12.png`
- Used for different ship upgrade levels
- Programmatically generated via SVG

**Fonts:**
- Inter font family
- JSON descriptor: `/fonts/inter.json`
- Loaded via @fontsource/inter

**3D Models:**
- `/geometries/heart.gltf` - (Example model, not actively used)

### 6.3 Procedural Generation

**Ship Graphics:**
```typescript
// Generated dynamically in PixiPlayer/PixiEnemyShips
drawShip(graphics: PIXI.Graphics, level: number, faction: 'player' | 'enemy') {
  // Hull shape
  // Mast/sails
  // Details based on level
  // Color based on faction
}
```

**Fog of War:**
```typescript
// PixiFogOfWar.tsx
- Creates radial gradient textures
- Overlays on unexplored tiles
- Fades based on player vision radius
```

**Lighting Effects:**
```typescript
// PixiLighting.tsx
createRadialGradientTexture(radius: number) {
  // Warm lighting effect around player
  // Color stops: yellow → orange → transparent
}
```

---

## 7. Input & Controls

### 7.1 Mouse/Keyboard Controls

**Mouse:**
- **Left-Click:** Set destination / Select target
- **Right-Click:** Context menu (enemy/collectible info)
- **Scroll Wheel:** Zoom in/out (if camera unlocked)
- **Middle-Click Drag:** Pan camera (if unlocked)

**Keyboard Shortcuts:**
- **I:** Toggle Inventory
- **S:** Toggle Shop
- **A:** Toggle Artifact Log
- **R:** Toggle Archivist (if unlocked)
- **Space:** Toggle camera follow
- **M:** Toggle mute
- **Esc:** Close open panel

**Hover Effects:**
- Tile highlight on mouse-over
- Tooltip for UI elements
- Cursor changes for interactable objects

### 7.2 Mobile Controls

**Touch Gestures:**
- **Tap:** Move to tile
- **Long Press:** Context menu
- **Pinch:** Zoom (if unlocked)
- **Two-finger Drag:** Pan camera (if unlocked)

**On-Screen Controls:**
```typescript
// MobileControls.tsx
<ControlPad>
  <Button direction="up" />
  <Button direction="down" />
  <Button direction="left" />
  <Button direction="right" />
</ControlPad>

<ActionButtons>
  <Button action="inventory" />
  <Button action="shop" />
  <Button action="menu" />
</ActionButtons>
```

**Responsive Detection:**
```typescript
const isMobile = window.innerWidth < 768 || 'ontouchstart' in window
```

---

## 8. Deployment & Environment

### 8.1 Environment Variables

```bash
# Required
DATABASE_URL=postgresql://user:pass@host:port/database
NODE_ENV=development | production

# Optional
PORT=5000  # Default
```

### 8.2 Build Process

**Development:**
```bash
npm install
npm run dev  # Starts Vite dev server + Express backend
```

**Production:**
```bash
npm install
npm run build        # Build client with Vite
npm run build:server # Build server with esbuild
npm start            # Run production server
```

**Scripts:**
```json
{
  "scripts": {
    "dev": "tsx server/index.ts",
    "build": "vite build",
    "build:server": "esbuild server/index.ts --bundle --platform=node --outfile=dist/index.js",
    "start": "NODE_ENV=production node dist/index.js",
    "db:push": "drizzle-kit push",
    "db:studio": "drizzle-kit studio"
  }
}
```

### 8.3 Database Setup

```bash
# Push schema to database
npm run db:push

# Open Drizzle Studio (GUI)
npm run db:studio
```

**Connection:**
```typescript
// Uses Neon serverless driver
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)
```

### 8.4 Hosting Requirements

**Server:**
- Node.js 18+
- Supports WebSocket (for future features)
- Port 5000 accessible
- PostgreSQL database access

**Client:**
- Modern browser with Canvas API
- WebGL support (for Pixi.js)
- ES2020+ JavaScript support
- Local storage for preferences

**CDN/Assets:**
- Serves from /public in development
- Serves from /dist/public in production
- Textures, sounds, fonts bundled with app

---

## 9. Performance Considerations

### 9.1 Rendering Optimization

**Pixi.js Settings:**
```typescript
await app.init({
  width: window.innerWidth,
  height: window.innerHeight,
  backgroundColor: 0x0a0a0a,
  antialias: false,        // Disabled for performance
  resolution: 1,           // No high-DPI scaling
  autoDensity: false,
  preference: 'webgl',
  preferWebGLVersion: 2,
})
```

**Culling:**
- Only render entities within viewport
- Fog of war hides off-screen tiles
- Disable rendering for hidden panels

**Update Frequency:**
```typescript
// MovementController: requestAnimationFrame
// EnemyAI: requestAnimationFrame
// GameLoop: 60 FPS target
// Combat: 600ms intervals
```

### 9.2 Memory Management

**Texture Atlas:**
- Reuse textures for repeated elements
- Share materials between similar objects
- Dispose unused textures on cleanup

**Object Pooling:**
- Reuse PIXI.Graphics objects
- Minimize create/destroy cycles
- Clear and reuse containers

**State Management:**
- Zustand: Minimal re-renders via subscribeWithSelector
- Selective subscriptions in components
- Avoid unnecessary state duplication

### 9.3 Network Optimization

**Asset Loading:**
- Preload critical assets (sounds) in App.tsx
- Lazy load UI components
- Bundle textures with build

**API Calls:**
- Minimal API usage (client-side focused)
- Future: Debounce save requests
- Future: Batch updates

---

## 10. Testing & Quality Assurance

### 10.1 Critical User Flows

**Flow 1: New Player Onboarding**
1. Launch game → See intro screen
2. Read narrative → Understand setting
3. Click "Launch Vessel" → Game starts
4. See HUD, minimap, player ship at center
5. Click adjacent tile → Ship moves
6. Arrive at collectible → Item collected
7. Press I → Inventory opens
8. View collected item → See cargo count

**Flow 2: Resource Collection & Economy**
1. Collect 10+ resources → Fill cargo
2. Navigate to Watropolis (20, 20)
3. Press I → Open inventory
4. Click "Sell All Cargo" → Gain currency
5. Press S → Open shop
6. Purchase ship upgrade → Spend currency
7. Verify upgrade level increased

**Flow 3: Combat Encounter**
1. Move near enemy ship
2. Combat UI appears → See progress bar
3. Wait 5 seconds → Combat completes
4. Enemy defeated → Loot added to cargo
5. Experience gained → Skill increases

**Flow 4: Artifact Discovery**
1. Explore map → Find artifact location
2. Move to artifact → Collection triggered
3. Lore popup appears → Read backstory
4. Press A → Open artifact log
5. View artifact in collection

### 10.2 Edge Cases

**Cargo Management:**
- ✓ Cannot collect when cargo full
- ✓ Notify player of full cargo
- ✓ Selling cargo clears inventory
- ✓ Partial cargo sales not allowed

**Movement:**
- ✓ Cannot move to island tiles
- ✓ Path recalculates if blocked
- ✓ Cancel collection shows confirmation
- ✓ Path highlights clear on arrival

**Combat:**
- ✓ Cannot move during combat
- ✓ Combat completes even if player navigates away
- ✓ Loot added even if cargo full (overflow handling needed)
- ✓ Enemy respawn logic (not implemented)

**Upgrades:**
- ✓ Cannot purchase with insufficient currency
- ✓ Upgrade costs scale correctly
- ✓ Effects apply immediately

### 10.3 Browser Compatibility

**Supported Browsers:**
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

**Required APIs:**
- Canvas 2D / WebGL
- Web Audio API
- Local Storage
- ES2020 features (optional chaining, nullish coalescing)

**Polyfills:**
- Not required (targeting modern browsers)

---

## 11. Future Enhancements

### 11.1 Planned Features (From replit.md)

**Reconstruction Projects:**
- Long-term resource sinks
- Harbor Foundry: Unlocks advanced ship upgrades
- Archive Spire: Bonus artifact storage/lore
- Weather Ward: Protects against storms

**Advanced Combat:**
- Turn-based tactical combat
- Ship abilities
- Crew roles in combat

**Multiplayer:**
- Co-op salvage missions
- Trading between players
- Leaderboards

**Dynamic Events:**
- Storms affecting travel
- Resource surges
- Rare enemy spawns

### 11.2 Known Issues / Tech Debt

**Current Limitations:**
1. No save/load system (all progress lost on refresh)
2. No authentication implemented
3. Collection is instant (time-based system partially built but disabled)
4. Enemy ships don't respawn after defeat
5. LSP errors in useGameStore.tsx (6 diagnostics)
6. No difficulty scaling
7. Limited audio variety

**Optimization Needed:**
- Reduce bundle size
- Implement texture atlases
- Add worker threads for pathfinding
- Optimize fog of war rendering

---

## 12. Implementation Guide for AI

### 12.1 Step-by-Step Recreation

**Phase 1: Project Setup**
1. Initialize Vite + React + TypeScript project
2. Install dependencies (see package.json)
3. Configure TypeScript (target ES2020, strict mode)
4. Set up Vite config with path aliases
5. Create project structure (client/, server/, shared/)

**Phase 2: State Management**
1. Create useGameStore with Zustand + subscribeWithSelector
2. Implement all interfaces (Player, Collectible, Artifact, etc.)
3. Add initialization functions (createInitialTiles, createCollectibles, etc.)
4. Create useSkillsStore with XP system
5. Create useAudio store

**Phase 3: Rendering Engine**
1. Set up Pixi.js application in Game.tsx
2. Create PixiTerrain class (hex grid rendering)
3. Create PixiPlayer class (ship graphics)
4. Implement PixiFogOfWar
5. Add PixiCollectibles, PixiArtifacts, PixiIslands
6. Create PixiEnemyShips with AI
7. Implement PixiLighting

**Phase 4: Game Logic**
1. Implement A* pathfinding in MovementController
2. Add movement animation system
3. Create collection mechanics
4. Implement combat system with CombatUI
5. Add crew deployment system
6. Create skill progression with XP awards

**Phase 5: UI Components**
1. Build HUD with resource displays
2. Create Inventory modal
3. Build Shop with three tabs
4. Implement ArtifactLog
5. Add Archivist interface
6. Create ContextMenu
7. Build SkillsPanel
8. Add MobileControls

**Phase 6: Audio & Assets**
1. Load sound files (background, hit, success)
2. Implement audio controls with mute toggle
3. Add texture loading
4. Generate ship graphics dynamically
5. Create fog of war overlays

**Phase 7: Polish & Testing**
1. Add animations and transitions
2. Implement mobile responsiveness
3. Test all user flows
4. Balance economy and progression
5. Fix edge cases
6. Optimize performance

**Phase 8: Backend (Future)**
1. Set up Express server
2. Implement authentication
3. Create save/load API
4. Add database schema
5. Implement user sessions

### 12.2 Critical Implementation Details

**A* Pathfinding:**
- Must handle 8-directional movement
- Diagonal cost: 1.414, straight cost: 1.0
- Check `isWalkable` before adding to path
- Return path.slice(1) to exclude starting position

**Pixi.js Rendering:**
- Create separate containers for each layer
- Update positions in requestAnimationFrame loop
- Use `getState()` instead of subscriptions in update loops
- Destroy graphics objects on cleanup

**State Updates:**
- Use `set()` for state changes
- Use `get()` for reading current state
- Batch related updates in single `set()` call
- Subscribe with selectors to prevent unnecessary re-renders

**Collision Detection:**
- Check tile.isWalkable before pathfinding
- Check islands array for blocked positions
- Enemy proximity check for combat initiation
- Collectible overlap check for collection

### 12.3 Common Pitfalls to Avoid

1. **Don't subscribe in render loops** - Use getState() instead
2. **Don't mutate state directly** - Always use set()
3. **Don't forget to cleanup Pixi objects** - Memory leaks
4. **Don't block pathfinding with async** - Keep it synchronous
5. **Don't hardcode positions** - Use grid coordinates
6. **Don't forget mobile touch events** - Test on mobile
7. **Don't skip LSP validation** - Fix TypeScript errors
8. **Don't ignore performance** - Monitor FPS

---

## 13. Complete Constants Reference

```typescript
// Grid
GRID_SIZE = 40
HEX_SIZE = 24
HEX_WIDTH = √3 × 24 ≈ 41.57
HEX_HEIGHT = 48

// Spawning
COLLECTIBLE_COUNT = 30
ISLAND_COUNT = 8
ENEMY_COUNT = 5
COVE_COUNT = 4
ARTIFACT_COUNT = 18

// Movement
TILE_TRANSITION_TIME = 600ms
BASE_TIME_PER_TILE = 600ms

// Collection (if time-based)
BASE_COLLECTION_TIME = 3000ms
RICHNESS_MULTIPLIER = 2000ms
SCANNER_BASE_ACCURACY = 0.6  // 60%
SCANNER_ACCURACY_INCREMENT = 0.1  // +10% per level

// Cargo
BASE_CARGO_CAPACITY = 10
CARGO_CAPACITY_INCREMENT = 5  // per level

// Economy
SELL_VALUE_PER_ITEM = 10
UPGRADE_COST_MULTIPLIER = 50  // level × 50
POWERUP_COST_SPEED = 25
POWERUP_COST_VISION = 30
POWERUP_COST_MAGNET = 35
ARTIFACT_CLUE_COST = 25
CREW_RECRUIT_COST = 100

// Power-Ups
POWERUP_DURATION_SPEED = 30000ms
POWERUP_DURATION_VISION = 60000ms
POWERUP_DURATION_MAGNET = 45000ms

// Combat
COMBAT_DURATION = 5000ms
COMBAT_UPDATE_INTERVAL = 600ms

// Crew
DRIFT_TIME = 45000ms
POACH_MIN_TIME = 5000ms
POACH_PROXIMITY = 3
POACH_CHANCE = 0.12
POACH_CHECK_INTERVAL = 1000ms
INITIAL_CREW_COUNT = 4
MAX_CREW_CAPACITY = 6

// Vision
BASE_VISION_RADIUS = 10

// Map Unlocks
MAP_UNLOCK_COSTS = [50, 100, 150, 200]

// Skills
MAX_LEVEL = 99
XP_FORMULA = floor(level + 300 × 2^(level/7)) / 4

// Audio
BACKGROUND_VOLUME = 0.3
SOUND_EFFECT_VOLUME = 0.3
DEFAULT_MUTED = true

// Camera
DEFAULT_ZOOM = 1.0
MIN_ZOOM = 0.5
MAX_ZOOM = 2.0
```

---

## 14. Appendix: Complete Component List

### Game Components
- Game.tsx - Main orchestrator
- HUD.tsx - Heads-up display
- MovementController.tsx - Pathfinding logic
- GameLoop.tsx - Game tick updates
- EnemyAIController.tsx - Enemy behavior
- CrewController.tsx - Crew management logic

### Pixi Rendering Components
- PixiTerrain.tsx - Grid rendering
- PixiPlayer.tsx - Player ship
- PixiCollectibles.tsx - Resource nodes
- PixiArtifacts.tsx - Discoverable items
- PixiIslands.tsx - Obstacles
- PixiEnemyShips.tsx - Enemy entities
- PixiCrewMember.tsx - Deployed crew
- PixiCamera.tsx - Camera controller
- PixiFogOfWar.tsx - Exploration overlay
- PixiLighting.tsx - Visual effects

### UI Panels
- Inventory.tsx - Cargo hold
- Shop.tsx - Watropolis Dockyard
- ArtifactLog.tsx - Collection viewer
- Archivist.tsx - Clue purchasing
- SkillsPanel.tsx - Progression display
- ActivityPanel.tsx - Current action status
- ResourcePanel.tsx - Resource counts
- MiniMap.tsx - Overview map
- NotificationSystem.tsx - Toast messages
- CombatUI.tsx - Combat overlay
- ContextMenu.tsx - Right-click menu
- IslandInteractionPopup.tsx - Island actions
- CancelCollectionDialog.tsx - Confirmation
- TravelIndicator.tsx - ETA display
- CollectionIndicator.tsx - Collection progress

### Input Handling
- KeyboardListener.tsx - Hotkey system
- MobileControls.tsx - Touch interface
- CameraFollowPlayer.tsx - Camera tracking

### Radix UI Components (40+ in /ui/)
- All standard Shadcn UI components
- Button, Dialog, Sheet, Dropdown, etc.

---

## End of Specification

This document provides a complete specification for recreating Watropolis Salvage. An AI following this guide should be able to rebuild the application with identical functionality, game mechanics, and user experience.

**Version:** 1.0
**Date:** November 2, 2025
**Total Word Count:** ~14,500 words
**Total Sections:** 14 major sections + appendix
