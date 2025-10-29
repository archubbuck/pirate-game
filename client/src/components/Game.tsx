import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Terrain } from "./Terrain";
import { Player } from "./Player";
import { Enemy } from "./Enemy";
import { GameLoop } from "./GameLoop";
import { HUD } from "./HUD";
import { useFightSimulator } from "@/lib/stores/useFightSimulator";

function Scene() {
  const enemies = useFightSimulator((state) => state.enemies);
  
  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[10, 20, 10]}
        intensity={1}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
      />
      <directionalLight position={[-10, 10, -10]} intensity={0.3} />
      
      <Terrain />
      <Player />
      {enemies.map((enemy) => (
        <Enemy key={enemy.id} enemy={enemy} />
      ))}
      
      <OrbitControls
        enablePan={false}
        enableRotate={true}
        enableZoom={true}
        minDistance={10}
        maxDistance={30}
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
          position: [0, 15, 12],
          fov: 50,
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
      <GameLoop />
    </div>
  );
}
