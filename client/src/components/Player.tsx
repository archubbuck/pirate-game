import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGameStore } from "@/lib/stores/useGameStore";
import * as THREE from "three";
import { Text } from "@react-three/drei";

export function Player() {
  const player = useGameStore((state) => state.player);
  const gridSize = useGameStore((state) => state.gridSize);
  const meshRef = useRef<THREE.Mesh>(null);
  
  const tileSize = 1;
  const tileSpacing = 0.05;
  
  const posX = (player.visualPosition.x - gridSize / 2) * (tileSize + tileSpacing);
  const posZ = (player.visualPosition.y - gridSize / 2) * (tileSize + tileSpacing);
  
  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.getElapsedTime();
      meshRef.current.position.y = 0.5 + Math.sin(time * 2) * 0.05;
    }
  });
  
  return (
    <group position={[posX, 0, posZ]}>
      <mesh ref={meshRef} position={[0, 0.5, 0]} castShadow>
        <boxGeometry args={[0.5, 0.8, 0.5]} />
        <meshStandardMaterial
          color="#4ade80"
          emissive="#22c55e"
          emissiveIntensity={0.3}
          metalness={0.3}
          roughness={0.7}
        />
      </mesh>
      
      <Text
        position={[0, 1.2, 0]}
        fontSize={0.15}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        EXPLORER
      </Text>
    </group>
  );
}
