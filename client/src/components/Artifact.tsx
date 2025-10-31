import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Mesh, MeshBasicMaterial } from "three";
import { Artifact as ArtifactType } from "../lib/stores/useGameStore";

interface ArtifactProps {
  artifact: ArtifactType;
}

export function Artifact({ artifact }: ArtifactProps) {
  const meshRef = useRef<Mesh>(null);
  const glowRef = useRef<Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.1 + 0.5;
    }
    if (glowRef.current && glowRef.current.material instanceof MeshBasicMaterial) {
      const pulse = Math.sin(state.clock.elapsedTime * 3) * 0.5 + 0.5;
      glowRef.current.scale.setScalar(1 + pulse * 0.2);
      glowRef.current.material.opacity = 0.3 + pulse * 0.2;
    }
  });
  
  const rarityColors = {
    common: "#4ade80",
    uncommon: "#60a5fa",
    rare: "#a855f7",
  };
  
  const color = rarityColors[artifact.rarity];
  
  return (
    <group position={[artifact.position.x, 0, artifact.position.y]}>
      <mesh ref={glowRef}>
        <sphereGeometry args={[0.5, 16, 16]} />
        <meshBasicMaterial color={color} transparent opacity={0.3} />
      </mesh>
      
      <mesh ref={meshRef} castShadow>
        <octahedronGeometry args={[0.3, 0]} />
        <meshStandardMaterial 
          color={color} 
          emissive={color}
          emissiveIntensity={0.5}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
      
      <pointLight 
        position={[0, 0.5, 0]} 
        color={color} 
        intensity={1} 
        distance={3} 
      />
    </group>
  );
}
