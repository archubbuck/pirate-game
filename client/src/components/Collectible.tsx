import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGameStore, type Collectible as CollectibleType } from "@/lib/stores/useGameStore";
import * as THREE from "three";

interface CollectibleProps {
  collectible: CollectibleType;
}

const COLLECTIBLE_COLORS: Record<string, string> = {
  gem: "#a855f7",
  coin: "#fbbf24",
  star: "#60a5fa",
  crystal: "#34d399",
};

export function Collectible({ collectible }: CollectibleProps) {
  const gridSize = useGameStore((state) => state.gridSize);
  const meshRef = useRef<THREE.Mesh>(null);
  
  const tileSize = 1;
  const tileSpacing = 0.05;
  
  const posX = (collectible.position.x - gridSize / 2) * (tileSize + tileSpacing);
  const posZ = (collectible.position.y - gridSize / 2) * (tileSize + tileSpacing);
  
  const color = COLLECTIBLE_COLORS[collectible.type] || "#ffffff";
  
  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.getElapsedTime();
      meshRef.current.position.y = 0.3 + Math.sin(time * 3 + collectible.position.x) * 0.1;
      meshRef.current.rotation.y = time * 2;
    }
  });
  
  return (
    <group position={[posX, 0, posZ]}>
      <mesh ref={meshRef} position={[0, 0.5, 0]} castShadow>
        <octahedronGeometry args={[0.5, 0]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.5}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
      
      <pointLight
        position={[0, 0.8, 0]}
        color={color}
        intensity={0.8}
        distance={3}
      />
    </group>
  );
}
