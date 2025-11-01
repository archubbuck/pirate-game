import { useEffect, useRef } from "react";
import * as PIXI from "pixi.js";
import { MovementController } from "./MovementController";
import { HUD } from "./HUD";
import { Inventory } from "./Inventory";
import { Shop } from "./Shop";
import { ArtifactLog } from "./ArtifactLog";
import { Archivist } from "./Archivist";
import { CancelCollectionDialog } from "./CancelCollectionDialog";
import { IslandInteractionPopup } from "./IslandInteractionPopup";
import { KeyboardListener } from "./KeyboardListener";
import { MobileControls } from "./MobileControls";
import { useGameStore } from "@/lib/stores/useGameStore";
import { PixiTerrain } from "./PixiTerrain";
import { PixiPlayer } from "./PixiPlayer";
import { PixiCollectibles } from "./PixiCollectibles";
import { PixiArtifacts } from "./PixiArtifacts";
import { PixiIslands } from "./PixiIslands";
import { PixiEnemyShips } from "./PixiEnemyShips";
import { PixiCrewMembers } from "./PixiCrewMember";
import { PixiCamera } from "./PixiCamera";
import { EnemyAIController } from "./EnemyAIController";
import { CrewController } from "./CrewController";
import { CombatUI } from "./CombatUI";

export function Game() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const appRef = useRef<PIXI.Application | null>(null);
  const containerRef = useRef<PIXI.Container | null>(null);
  const cameraRef = useRef<PixiCamera | null>(null);
  const terrainRef = useRef<any>(null);
  const islandsRef = useRef<any>(null);
  const playerRef = useRef<any>(null);
  const collectiblesRef = useRef<any>(null);
  const artifactsRef = useRef<any>(null);
  const enemyShipsRef = useRef<any>(null);
  const crewMembersRef = useRef<any>(null);
  const resizeHandlerRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const app = new PIXI.Application();
    
    const initializePixi = async () => {
      try {
        await app.init({
          canvas: canvasRef.current!,
          width: window.innerWidth,
          height: window.innerHeight,
          backgroundColor: 0x0a0a0a,
          antialias: false,
          resolution: 1,
          autoDensity: false,
          preference: 'webgl',
          preferWebGLVersion: 2,
          hello: false,
          failIfMajorPerformanceCaveat: false,
        });
        appRef.current = app;
        console.log('Pixi.js initialized successfully with renderer:', app.renderer.type);
      
        const gameContainer = new PIXI.Container();
        app.stage.addChild(gameContainer);
        containerRef.current = gameContainer;

        const camera = new PixiCamera(app, gameContainer);
        cameraRef.current = camera;

        const terrain = new PixiTerrain(gameContainer);
        terrainRef.current = terrain;
        
        const islands = new PixiIslands(gameContainer);
        islandsRef.current = islands;
        
        const player = new PixiPlayer(gameContainer);
        playerRef.current = player;
        
        const collectibles = new PixiCollectibles(gameContainer);
        collectiblesRef.current = collectibles;
        
        const artifacts = new PixiArtifacts(gameContainer);
        artifactsRef.current = artifacts;
        
        const enemyShips = new PixiEnemyShips(gameContainer);
        enemyShipsRef.current = enemyShips;
        
        const crewMembers = new PixiCrewMembers(gameContainer);
        crewMembersRef.current = crewMembers;

        app.ticker.add(() => {
          camera.update();
          terrain.update();
          islands.update(camera);
          player.update();
          collectibles.update(camera);
          artifacts.update(camera);
          enemyShips.update(camera);
          crewMembers.update(camera);
        });

        const handleResize = () => {
          app.renderer.resize(window.innerWidth, window.innerHeight);
          camera.onResize();
        };
        
        resizeHandlerRef.current = handleResize;
        window.addEventListener('resize', handleResize);
      } catch (error) {
        if (error instanceof Error && !error.message.includes('CanvasRenderer')) {
          console.error('Failed to initialize Pixi.js:', error);
        }
      }
    };
    
    initializePixi();

    return () => {
      if (resizeHandlerRef.current) {
        window.removeEventListener('resize', resizeHandlerRef.current);
        resizeHandlerRef.current = null;
      }
      
      if (cameraRef.current) {
        cameraRef.current.destroy();
        cameraRef.current = null;
      }
      
      if (terrainRef.current) {
        terrainRef.current.destroy();
        terrainRef.current = null;
      }
      
      if (islandsRef.current) {
        islandsRef.current.destroy();
        islandsRef.current = null;
      }
      
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
      
      if (collectiblesRef.current) {
        collectiblesRef.current.destroy();
        collectiblesRef.current = null;
      }
      
      if (artifactsRef.current) {
        artifactsRef.current.destroy();
        artifactsRef.current = null;
      }
      
      if (enemyShipsRef.current) {
        enemyShipsRef.current.destroy();
        enemyShipsRef.current = null;
      }
      
      if (crewMembersRef.current) {
        crewMembersRef.current.destroy();
        crewMembersRef.current = null;
      }
      
      if (appRef.current) {
        appRef.current.destroy(true);
        appRef.current = null;
      }
      
      containerRef.current = null;
    };
  }, []);

  return (
    <div style={{ width: "100vw", height: "100vh", position: "relative", overflow: "hidden" }}>
      <canvas ref={canvasRef} style={{ display: "block" }} />
      
      <MovementController />
      <EnemyAIController />
      <CrewController />
      <HUD />
      <CombatUI />
      <Inventory />
      <Shop />
      <ArtifactLog />
      <Archivist />
      <CancelCollectionDialog />
      <IslandInteractionPopup />
      <KeyboardListener />
      <MobileControls />
    </div>
  );
}
