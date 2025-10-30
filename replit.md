# Fight Simulator - Replit Project

## Overview

This is a tactical turn-based combat game built with React Three Fiber (3D graphics), Express backend, and PostgreSQL database. Players engage in strategic combat on an octagonal grid against AI opponents. The game features a 3D-rendered battlefield, turn-based mechanics with energy management, and audio feedback.

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
- Separate stores for different concerns:
  - `useFightSimulator`: Core game logic, entities, tiles, turn management
  - `useGame`: High-level game phase control (ready/playing/ended)
  - `useAudio`: Sound effects and music management

**Key Design Patterns:**
- Component-based 3D scene composition (Scene, Terrain, Player, Enemy components)
- Custom hooks for responsive design (`useIsMobile`)
- Separation of game logic from rendering
- HUD overlay for game UI while 3D canvas runs fullscreen

**3D Rendering:**
- Octagonal grid-based terrain system
- Real-time animations using `useFrame` hook
- Post-processing effects via @react-three/postprocessing
- GLSL shader support for custom visual effects
- OrbitControls for camera manipulation

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