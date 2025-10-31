# Watropolis Salvage - Replit Project

## Overview

This is a post-apocalyptic salvage exploration game built with React Three Fiber (3D graphics), Express backend, and PostgreSQL database. Players captain a salvage vessel operating from Watropolis, a floating city built by survivors 60 years after massive volcanic eruptions triggered catastrophic sea level rise. The game features strategic resource gathering, ship upgrades, fog of war exploration on a 40x40 grid, and time-based collection mechanics.

## Recent Changes (October 31, 2025)

### Watropolis Theme Implementation
- Complete rebranding from generic explorer game to post-apocalyptic salvage vessel theme
- Opening narrative explaining volcanic eruptions, ice cap melting, and Watropolis founding
- Resource system renamed: Timber Salvage, Alloy Scrap, Circuit Relics, Biofibers
- All UI components updated with salvage/maritime theming

### Travel & Collection Mechanics
- Travel time calculation based on distance and engine upgrade level
- Real-time ETA indicator displayed above ship during travel
- Collection time varies by tile richness (richer tiles = longer collection)
- Collection progress bar with time remaining displayed above ship
- Collection interruption system with confirmation dialog to prevent accidental resource forfeiture

### Ship Upgrade System
- **Engine Upgrade**: Increases travel speed between tiles
- **Scanner Upgrade**: Improves collection time estimate accuracy (60% at level 1, 100% at level 5)
- **Salvage Rig Upgrade**: Faster material collection
- **Cargo Hold Upgrade**: Increases cargo capacity (+5 per level, base 10)

### Economy & Progression
- Currency system separate from collected materials
- Cargo capacity limits enforced during collection
- "Sell All Cargo" functionality at Watropolis Dockyard
- Ship upgrades cost scales with current level (level × 50 currency)
- Sea route unlocks to explore new regions of the map

### UI Components
- **HUD**: Shows cargo capacity, currency, travel/collection status, power-ups
- **Cargo Hold** (Inventory): Displays collected materials with sell functionality
- **Watropolis Dockyard** (Shop): Three sections - Ship Upgrades, Power-Ups, Sea Route Unlocks
- **Cancel Collection Dialog**: Warns players about forfeiting resources mid-collection
- **Travel/Collection Indicators**: Real-time overlays above ship showing ETA and progress

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Technology Stack:**
- **React 18** with TypeScript for UI components
- **React Three Fiber** (@react-three/fiber) for 3D scene rendering
- **Three.js** as the underlying 3D engine
- **Vite** as the build tool and dev server
- **TailwindCSS** for styling with custom design tokens
- **Radix UI** component library for accessible UI primitives

**State Management:**
- **Zustand** with subscribeWithSelector middleware for global state
- Main store: `useGameStore` - Comprehensive game logic including:
  - Player movement and pathfinding (A* algorithm)
  - Resource collection with time-based mechanics
  - Ship upgrades and progression
  - Cargo capacity and currency management
  - Fog of war exploration system
  - Power-up activation and timing
- Audio store: `useAudio` - Sound effects and music management

**Key Design Patterns:**
- Component-based 3D scene composition (Scene, Terrain, Player, Collectible components)
- Real-time 3D indicators using HTML overlays (TravelIndicator, CollectionIndicator)
- Confirmation dialogs for destructive actions (CancelCollectionDialog)
- Separation of game logic from rendering
- HUD overlay for game UI while 3D canvas runs fullscreen

**3D Rendering:**
- Octagonal grid-based terrain system (40x40)
- A* pathfinding with diagonal movement
- Real-time animations using `useFrame` hook
- Fog of war with gradual exploration
- Dynamic lighting system
- HTML overlays for in-world UI elements (@react-three/drei)

**Game Mechanics:**
- **Movement**: Click-to-move with A* pathfinding, path highlighting
- **Travel Time**: Distance-based with engine upgrade scaling
- **Collection**: Time-based with richness variation (3-9 seconds base)
- **Scanner Accuracy**: Collection time estimates improve with upgrades (60-100%)
- **Cargo Management**: Capacity limits, sell-all functionality at Watropolis
- **Ship Upgrades**: Permanent improvements to speed, accuracy, collection rate, capacity
- **Power-Ups**: Temporary boosts (Afterburner Rig, Sonar Beacon, Grapple Winch)

### Backend Architecture

**Technology Stack:**
- **Express.js** server with TypeScript
- **ESM modules** (type: "module" in package.json)
- **tsx** for development server
- **esbuild** for production bundling

**Server Structure:**
- `server/index.ts`: Main Express app with request logging middleware
- `server/routes.ts`: API route registration (currently minimal)
- `server/vite.ts`: Vite dev server integration for HMR
- `server/storage.ts`: Data access layer with interface pattern

**API Design:**
- RESTful API with `/api` prefix for all endpoints
- JSON request/response format
- Error handling middleware
- Request logging with duration tracking

**Storage Pattern:**
- `IStorage` interface defines CRUD operations
- `MemStorage` class implements in-memory storage for development
- Easily swappable with database-backed implementation
- Type-safe operations using shared schema types

### Data Storage Solutions

**Database:**
- **PostgreSQL** via Neon serverless driver (@neondatabase/serverless)
- **Drizzle ORM** for type-safe database queries
- Schema defined in `shared/schema.ts`
- Migrations stored in `./migrations` directory

**Schema Design:**
- Users table with id, username, password fields
- Drizzle-Zod integration for runtime validation
- Shared types between client and server via `@shared` path alias

**Why Drizzle:**
- Type-safety with TypeScript inference
- Lightweight compared to TypeORM/Prisma
- SQL-like query builder
- Good integration with serverless environments

**Connection Strategy:**
- Environment variable `DATABASE_URL` for connection string
- Connection pooling handled by Neon serverless driver
- Push-based schema deployment with `drizzle-kit push`

### Authentication and Authorization

**Current State:**
- User schema exists but authentication not yet implemented
- Password field present in schema (should be hashed in production)
- Session management dependencies included (connect-pg-simple)

**Planned Approach:**
- Session-based authentication (evident from connect-pg-simple dependency)
- Cookie-based sessions with PostgreSQL store
- User registration and login endpoints needed in routes

### External Dependencies

**Third-Party Services:**
- **Neon Database**: Serverless PostgreSQL hosting
  - Connection via `DATABASE_URL` environment variable
  - Serverless-optimized driver for edge deployments

**Major Libraries:**
- **@tanstack/react-query**: Server state management and caching
- **Radix UI**: Complete suite of accessible UI primitives (accordion, dialog, dropdown, etc.)
- **Three.js ecosystem**: 3D rendering and scene management
- **@react-three/drei**: Helper components for R3F (Html, OrbitControls, etc.)
- **Drizzle**: ORM and query builder
- **Zod**: Runtime type validation
- **date-fns**: Date manipulation utilities

**Development Tools:**
- **TypeScript**: Type safety across entire stack
- **Vite**: Fast HMR and optimized production builds
- **PostCSS/Autoprefixer**: CSS processing
- **esbuild**: Fast JavaScript bundler for server code

**Asset Support:**
- GLSL shaders via vite-plugin-glsl
- 3D models (.gltf, .glb)
- Audio files (.mp3, .ogg, .wav)
- Custom fonts (Inter via @fontsource)

**Path Aliases:**
- `@/*`: Client source files (`./client/src/*`)
- `@shared/*`: Shared types and schemas (`./shared/*`)
- Configured in both tsconfig.json and vite.config.ts

## Future Planned Features

### Artifact System
- 15-20 rare artifacts with unique pre-flood lore
- Scattered across the map, separate from resource tiles
- Collection triggers story snippets about the Old World

### The Archivist NPC
- NPC system in Watropolis
- Dialogue interface for purchasing artifact location clues
- Unlocked after milestone achievements (e.g., collecting X resources, upgrading ship)

### Reconstruction Projects
- Long-term goals: Harbor Foundry, Archive Spire, Weather Ward
- Require large resource investments
- Unlock new abilities or story elements when completed
