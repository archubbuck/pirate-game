import { Canvas } from "@react-three/fiber";
import { Terrain } from "./Terrain";
import { Player } from "./Player";
import { Collectible } from "./Collectible";
import { Artifact } from "./Artifact";
import { MovementController } from "./MovementController";
import { MagnetEffect } from "./MagnetEffect";
import { CameraFollowPlayer } from "./CameraFollowPlayer";
import { DynamicLight } from "./DynamicLight";
import { TravelIndicator } from "./TravelIndicator";
import { CollectionIndicator } from "./CollectionIndicator";
import { HUD } from "./HUD";
import { Inventory } from "./Inventory";
import { Shop } from "./Shop";
import { ArtifactLog } from "./ArtifactLog";
import { Archivist } from "./Archivist";
import { CancelCollectionDialog } from "./CancelCollectionDialog";
import { KeyboardListener } from "./KeyboardListener";
import { MobileControls } from "./MobileControls";
import { useGameStore } from "@/lib/stores/useGameStore";

function Scene() {
  const collectibles = useGameStore((state) => state.collectibles);
  const artifacts = useGameStore((state) => state.artifacts);
  const tiles = useGameStore((state) => state.tiles);
  
  const visibleCollectibles = collectibles.filter(collectible => {
    const tile = tiles[collectible.position.y]?.[collectible.position.x];
    return tile && tile.isExplored;
  });
  
  const visibleArtifacts = artifacts.filter(artifact => {
    if (artifact.isCollected) return false;
    const tile = tiles[artifact.position.y]?.[artifact.position.x];
    return tile && (tile.isExplored || artifact.clueRevealed);
  });
  
  return (
    <>
      <ambientLight intensity={0.5} />
      <DynamicLight />
      <directionalLight position={[-20, 20, -20]} intensity={0.3} />
      
      <Terrain />
      <Player />
      {visibleCollectibles.map((collectible) => (
        <Collectible key={collectible.id} collectible={collectible} />
      ))}
      {visibleArtifacts.map((artifact) => (
        <Artifact key={artifact.id} artifact={artifact} />
      ))}
      
      <TravelIndicator />
      <CollectionIndicator />
      <MovementController />
      <MagnetEffect />
      <CameraFollowPlayer />
    </>
  );
}

export function Game() {
  return (
    <div style={{ width: "100vw", height: "100vh", position: "relative" }}>
      <Canvas
        shadows
        camera={{
          position: [0, 35, 25],
          fov: 60,
          near: 0.1,
          far: 1000,
        }}
        gl={{
          antialias: true,
          powerPreference: "default",
        }}
      >
        <color attach="background" args={["#0a0a0a"]} />
        <Scene />
      </Canvas>
      
      <HUD />
      <Inventory />
      <Shop />
      <ArtifactLog />
      <Archivist />
      <CancelCollectionDialog />
      <KeyboardListener />
      <MobileControls />
    </div>
  );
}
