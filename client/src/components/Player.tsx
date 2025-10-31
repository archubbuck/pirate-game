import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGameStore } from "@/lib/stores/useGameStore";
import * as THREE from "three";
import { Text } from "@react-three/drei";

export function Player() {
  const player = useGameStore((state) => state.player);
  const gridSize = useGameStore((state) => state.gridSize);
  const bobRef = useRef<THREE.Group>(null);
  
  const tileSize = 1;
  const tileSpacing = 0.05;
  
  const posX = (player.visualPosition.x - gridSize / 2) * (tileSize + tileSpacing);
  const posZ = (player.visualPosition.y - gridSize / 2) * (tileSize + tileSpacing);
  
  useFrame((state) => {
    if (bobRef.current) {
      const time = state.clock.getElapsedTime();
      bobRef.current.position.y = Math.sin(time * 2) * 0.03;
    }
  });
  
  return (
    <group position={[posX, 0.3, posZ]}>
      <group ref={bobRef}>
        <mesh position={[0, 0.1, 0]} castShadow>
          <boxGeometry args={[0.7, 0.2, 1.0]} />
          <meshStandardMaterial
            color="#8b4513"
            metalness={0.2}
            roughness={0.8}
          />
        </mesh>
        
        <mesh position={[0, 0.35, 0.1]} castShadow>
          <boxGeometry args={[0.5, 0.3, 0.6]} />
          <meshStandardMaterial
            color="#d4a574"
            metalness={0.1}
            roughness={0.7}
          />
        </mesh>
        
        <mesh position={[0, 0.6, 0.15]} castShadow>
          <cylinderGeometry args={[0.08, 0.08, 0.3, 8]} />
          <meshStandardMaterial
            color="#4a4a4a"
            metalness={0.6}
            roughness={0.4}
          />
        </mesh>
        
        <mesh position={[-0.35, 0.05, 0]} castShadow>
          <boxGeometry args={[0.1, 0.05, 0.3]} />
          <meshStandardMaterial color="#6b4423" />
        </mesh>
        <mesh position={[0.35, 0.05, 0]} castShadow>
          <boxGeometry args={[0.1, 0.05, 0.3]} />
          <meshStandardMaterial color="#6b4423" />
        </mesh>
        
        <pointLight position={[0, 0.7, 0.15]} color="#ffa500" intensity={0.5} distance={2} />
      </group>
      
      <Text
        position={[0, 0.9, 0]}
        fontSize={0.12}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        SALVAGER
      </Text>
    </group>
  );
}
