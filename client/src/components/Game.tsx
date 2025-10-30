import { Canvas } from "@react-three/fiber";
import { Terrain } from "./Terrain";
import { Player } from "./Player";
import { Collectible } from "./Collectible";
import { MovementController } from "./MovementController";
import { MagnetEffect } from "./MagnetEffect";
import { CameraFollowPlayer } from "./CameraFollowPlayer";
import { DynamicLight } from "./DynamicLight";
import { HUD } from "./HUD";
import { Inventory } from "./Inventory";
import { Shop } from "./Shop";
import { KeyboardListener } from "./KeyboardListener";
import { MobileControls } from "./MobileControls";
import { useGameStore } from "@/lib/stores/useGameStore";

function Scene() {
  const collectibles = useGameStore((state) => state.collectibles);
  const tiles = useGameStore((state) => state.tiles);
  
  const visibleCollectibles = collectibles.filter(collectible => {
    const tile = tiles[collectible.position.y]?.[collectible.position.x];
    return tile && tile.isExplored;
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
      <KeyboardListener />
      <MobileControls />
    </div>
  );
}
