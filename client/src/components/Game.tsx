import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Terrain } from "./Terrain";
import { Player } from "./Player";
import { Collectible } from "./Collectible";
import { MovementController } from "./MovementController";
import { HUD } from "./HUD";
import { useGameStore } from "@/lib/stores/useGameStore";

function Scene() {
  const collectibles = useGameStore((state) => state.collectibles);
  
  return (
    <>
      <ambientLight intensity={0.3} />
      <directionalLight
        position={[20, 40, 20]}
        intensity={1}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={100}
        shadow-camera-left={-30}
        shadow-camera-right={30}
        shadow-camera-top={30}
        shadow-camera-bottom={-30}
      />
      <directionalLight position={[-20, 20, -20]} intensity={0.3} />
      
      <Terrain />
      <Player />
      {collectibles.map((collectible) => (
        <Collectible key={collectible.id} collectible={collectible} />
      ))}
      
      <MovementController />
      
      <OrbitControls
        enablePan={false}
        enableRotate={true}
        enableZoom={true}
        minDistance={20}
        maxDistance={60}
        maxPolarAngle={Math.PI / 2.5}
        minPolarAngle={Math.PI / 6}
      />
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
