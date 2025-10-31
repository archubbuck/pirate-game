import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGameStore, type Collectible as CollectibleType } from "@/lib/stores/useGameStore";
import * as THREE from "three";

interface CollectibleProps {
  collectible: CollectibleType;
}

const COLLECTIBLE_COLORS: Record<string, string> = {
  timber: "#8b4513",
  alloy: "#9ca3af",
  circuit: "#3b82f6",
  biofiber: "#10b981",
};

export function Collectible({ collectible }: CollectibleProps) {
  const gridSize = useGameStore((state) => state.gridSize);
  const groupRef = useRef<THREE.Group>(null);
  
  const tileSize = 1;
  const tileSpacing = 0.05;
  
  const posX = (collectible.position.x - gridSize / 2) * (tileSize + tileSpacing);
  const posZ = (collectible.position.y - gridSize / 2) * (tileSize + tileSpacing);
  
  const color = COLLECTIBLE_COLORS[collectible.type] || "#ffffff";
  
  useFrame((state) => {
    if (groupRef.current) {
      const time = state.clock.getElapsedTime();
      groupRef.current.position.y = 0.3 + Math.sin(time * 2 + collectible.position.x) * 0.08;
      groupRef.current.rotation.y = time * 0.5;
    }
  });
  
  const renderMaterial = () => {
    switch (collectible.type) {
      case "timber":
        return (
          <group ref={groupRef}>
            <mesh position={[0, 0.2, 0]} castShadow>
              <boxGeometry args={[0.15, 0.5, 0.15]} />
              <meshStandardMaterial color="#6b4423" roughness={0.9} metalness={0.1} />
            </mesh>
            <mesh position={[0.12, 0.15, 0]} rotation={[0, 0, Math.PI / 6]} castShadow>
              <boxGeometry args={[0.12, 0.4, 0.12]} />
              <meshStandardMaterial color="#5a3a1f" roughness={0.9} metalness={0.1} />
            </mesh>
            <mesh position={[-0.1, 0.25, 0.08]} rotation={[0, Math.PI / 4, 0]} castShadow>
              <boxGeometry args={[0.1, 0.3, 0.1]} />
              <meshStandardMaterial color="#8b4513" roughness={0.9} metalness={0.1} />
            </mesh>
          </group>
        );
      case "alloy":
        return (
          <group ref={groupRef}>
            <mesh position={[0, 0.2, 0]} castShadow>
              <boxGeometry args={[0.3, 0.1, 0.3]} />
              <meshStandardMaterial color="#71717a" metalness={0.9} roughness={0.2} />
            </mesh>
            <mesh position={[0.1, 0.15, 0.1]} castShadow>
              <cylinderGeometry args={[0.08, 0.08, 0.2, 6]} />
              <meshStandardMaterial color="#9ca3af" metalness={0.8} roughness={0.3} />
            </mesh>
            <mesh position={[-0.08, 0.25, -0.08]} rotation={[Math.PI / 4, 0, 0]} castShadow>
              <boxGeometry args={[0.15, 0.15, 0.05]} />
              <meshStandardMaterial color="#a8a29e" metalness={0.85} roughness={0.25} />
            </mesh>
          </group>
        );
      case "circuit":
        return (
          <group ref={groupRef}>
            <mesh position={[0, 0.2, 0]} castShadow>
              <boxGeometry args={[0.35, 0.05, 0.25]} />
              <meshStandardMaterial color="#1e3a5f" metalness={0.3} roughness={0.6} />
            </mesh>
            <mesh position={[0.05, 0.23, 0.05]} castShadow>
              <boxGeometry args={[0.08, 0.03, 0.08]} />
              <meshStandardMaterial color="#3b82f6" emissive="#3b82f6" emissiveIntensity={0.5} />
            </mesh>
            <mesh position={[-0.1, 0.23, -0.05]} castShadow>
              <boxGeometry args={[0.06, 0.03, 0.06]} />
              <meshStandardMaterial color="#60a5fa" emissive="#60a5fa" emissiveIntensity={0.5} />
            </mesh>
            <mesh position={[0.12, 0.23, -0.08]} castShadow>
              <cylinderGeometry args={[0.03, 0.03, 0.04, 8]} />
              <meshStandardMaterial color="#93c5fd" emissive="#93c5fd" emissiveIntensity={0.4} />
            </mesh>
          </group>
        );
      case "biofiber":
        return (
          <group ref={groupRef}>
            <mesh position={[0, 0.2, 0]} castShadow>
              <sphereGeometry args={[0.15, 8, 8]} />
              <meshStandardMaterial color="#059669" roughness={0.7} metalness={0.1} />
            </mesh>
            <mesh position={[0.08, 0.25, 0.08]} castShadow>
              <sphereGeometry args={[0.1, 6, 6]} />
              <meshStandardMaterial color="#10b981" roughness={0.7} metalness={0.1} />
            </mesh>
            <mesh position={[-0.1, 0.18, -0.05]} castShadow>
              <sphereGeometry args={[0.12, 6, 6]} />
              <meshStandardMaterial color="#34d399" roughness={0.7} metalness={0.1} />
            </mesh>
            <mesh position={[0.05, 0.15, -0.12]} castShadow>
              <sphereGeometry args={[0.08, 6, 6]} />
              <meshStandardMaterial color="#6ee7b7" roughness={0.7} metalness={0.1} />
            </mesh>
          </group>
        );
      default:
        return null;
    }
  };
  
  return (
    <group position={[posX, 0, posZ]}>
      {renderMaterial()}
      <pointLight
        position={[0, 0.5, 0]}
        color={color}
        intensity={0.5}
        distance={2}
      />
    </group>
  );
}
