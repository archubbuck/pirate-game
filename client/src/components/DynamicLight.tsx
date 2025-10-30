import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGameStore } from "@/lib/stores/useGameStore";
import * as THREE from "three";

export function DynamicLight() {
  const lightRef = useRef<THREE.DirectionalLight>(null);
  const player = useGameStore((state) => state.player);
  const gridSize = useGameStore((state) => state.gridSize);
  
  const tileSize = 1;
  const tileSpacing = 0.02;
  
  useFrame(() => {
    if (lightRef.current) {
      const targetX = (player.visualPosition.x - gridSize / 2) * (tileSize + tileSpacing);
      const targetZ = (player.visualPosition.y - gridSize / 2) * (tileSize + tileSpacing);
      
      lightRef.current.position.set(targetX + 20, 40, targetZ + 20);
      lightRef.current.target.position.set(targetX, 0, targetZ);
      lightRef.current.target.updateMatrixWorld();
    }
  });
  
  return (
    <directionalLight
      ref={lightRef}
      position={[20, 40, 20]}
      intensity={1}
      castShadow
      shadow-mapSize-width={2048}
      shadow-mapSize-height={2048}
      shadow-camera-far={100}
      shadow-camera-left={-15}
      shadow-camera-right={15}
      shadow-camera-top={15}
      shadow-camera-bottom={-15}
    />
  );
}
