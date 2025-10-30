import { Canvas } from "@react-three/fiber";
import { Terrain } from "./Terrain";
import { Player } from "./Player";
import { Collectible } from "./Collectible";
import { MovementController } from "./MovementController";
import { CameraFollowPlayer } from "./CameraFollowPlayer";
import { DynamicLight } from "./DynamicLight";
import { HUD } from "./HUD";
import { useGameStore } from "@/lib/stores/useGameStore";

function Scene() {
  const collectibles = useGameStore((state) => state.collectibles);
  
  return (
    <>
      <ambientLight intensity={0.5} />
      <DynamicLight />
      <directionalLight position={[-20, 20, -20]} intensity={0.3} />
      
      <Terrain />
      <Player />
      {collectibles.map((collectible) => (
        <Collectible key={collectible.id} collectible={collectible} />
      ))}
      
      <MovementController />
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
    </div>
  );
}
