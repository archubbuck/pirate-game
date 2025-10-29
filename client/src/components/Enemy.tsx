import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useFightSimulator, type Entity } from "@/lib/stores/useFightSimulator";
import * as THREE from "three";
import { Text } from "@react-three/drei";

interface EnemyProps {
  enemy: Entity;
}

export function Enemy({ enemy }: EnemyProps) {
  const gridSize = useFightSimulator((state) => state.gridSize);
  const attackEntity = useFightSimulator((state) => state.attackEntity);
  const player = useFightSimulator((state) => state.player);
  const isInAttackRange = useFightSimulator((state) => state.isInAttackRange);
  const highlightTiles = useFightSimulator((state) => state.highlightTiles);
  const clearHighlights = useFightSimulator((state) => state.clearHighlights);
  const phase = useFightSimulator((state) => state.phase);
  
  const meshRef = useRef<THREE.Mesh>(null);
  
  const tileSize = 1;
  const tileSpacing = 0.05;
  
  const posX = (enemy.position.x - gridSize / 2) * (tileSize + tileSpacing);
  const posZ = (enemy.position.y - gridSize / 2) * (tileSize + tileSpacing);
  
  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.getElapsedTime();
      meshRef.current.position.y = 0.5 + Math.sin(time * 2 + enemy.position.x) * 0.05;
    }
  });
  
  const handleClick = () => {
    if (phase !== "playing") return;
    
    if (isInAttackRange(player.position, enemy.position)) {
      if (player.attackCooldown === 0) {
        attackEntity("player", enemy.id);
      } else {
        console.log("Attack on cooldown");
      }
    } else {
      console.log("Enemy out of attack range");
      highlightTiles("attack", [enemy.position]);
      setTimeout(() => clearHighlights(), 1000);
    }
  };
  
  const healthPercent = (enemy.health / enemy.maxHealth) * 100;
  
  return (
    <group position={[posX, 0, posZ]}>
      <mesh
        ref={meshRef}
        position={[0, 0.5, 0]}
        onClick={handleClick}
        castShadow
      >
        <boxGeometry args={[0.5, 0.8, 0.5]} />
        <meshStandardMaterial
          color="#ef4444"
          emissive="#dc2626"
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
        fontSize={0.12}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        ENEMY
      </Text>
    </group>
  );
}
