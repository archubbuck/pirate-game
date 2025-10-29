import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useFightSimulator } from "@/lib/stores/useFightSimulator";
import * as THREE from "three";
import { Text } from "@react-three/drei";

export function Player() {
  const player = useFightSimulator((state) => state.player);
  const gridSize = useFightSimulator((state) => state.gridSize);
  const meshRef = useRef<THREE.Mesh>(null);
  
  const tileSize = 1;
  const tileSpacing = 0.05;
  
  const posX = (player.position.x - gridSize / 2) * (tileSize + tileSpacing);
  const posZ = (player.position.y - gridSize / 2) * (tileSize + tileSpacing);
  
  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.getElapsedTime();
      meshRef.current.position.y = 0.5 + Math.sin(time * 2) * 0.05;
    }
  });
  
  const healthPercent = (player.health / player.maxHealth) * 100;
  
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
      
      <mesh position={[0, 1.2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.6, 0.1]} />
        <meshBasicMaterial color="#1f1f1f" />
      </mesh>
      
      <mesh position={[0, 1.21, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.58 * (healthPercent / 100), 0.08]} />
        <meshBasicMaterial color={healthPercent > 50 ? "#4ade80" : healthPercent > 25 ? "#facc15" : "#ef4444"} />
      </mesh>
      
      <Text
        position={[0, 1.4, 0]}
        fontSize={0.15}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        PLAYER
      </Text>
    </group>
  );
}
