import { useFrame, useThree } from "@react-three/fiber";
import { useGameStore } from "@/lib/stores/useGameStore";
import * as THREE from "three";

export function CameraFollowPlayer() {
  const { camera } = useThree();
  const player = useGameStore((state) => state.player);
  const gridSize = useGameStore((state) => state.gridSize);
  
  const tileSize = 1;
  const tileSpacing = 0.02;
  
  useFrame(() => {
    const targetX = (player.visualPosition.x - gridSize / 2) * (tileSize + tileSpacing);
    const targetZ = (player.visualPosition.y - gridSize / 2) * (tileSize + tileSpacing);
    
    const cameraOffset = new THREE.Vector3(0, 15, 10);
    const targetPosition = new THREE.Vector3(targetX, 0, targetZ).add(cameraOffset);
    
    camera.position.lerp(targetPosition, 0.1);
    
    const lookAtTarget = new THREE.Vector3(targetX, 0, targetZ);
    camera.lookAt(lookAtTarget);
  });
  
  return null;
}
