import { useFrame } from "@react-three/fiber";
import { useGameStore } from "@/lib/stores/useGameStore";

export function MagnetEffect() {
  const activePowerUps = useGameStore((state) => state.activePowerUps);
  const player = useGameStore((state) => state.player);
  const collectibles = useGameStore((state) => state.collectibles);
  const collectItem = useGameStore((state) => state.collectItem);
  
  const hasMagnet = activePowerUps.some(p => p.type === "magnet");
  
  useFrame(() => {
    if (!hasMagnet) return;
    
    const magnetRadius = 2;
    collectibles.forEach(collectible => {
      const distance = Math.sqrt(
        Math.pow(collectible.position.x - player.visualPosition.x, 2) +
        Math.pow(collectible.position.y - player.visualPosition.y, 2)
      );
      
      if (distance <= magnetRadius) {
        collectItem(collectible.id);
      }
    });
  });
  
  return null;
}
