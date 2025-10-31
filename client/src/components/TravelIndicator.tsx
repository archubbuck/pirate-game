import { Html } from "@react-three/drei";
import { useGameStore } from "@/lib/stores/useGameStore";

export function TravelIndicator() {
  const isMoving = useGameStore((state) => state.isMoving);
  const travelStartTime = useGameStore((state) => state.travelStartTime);
  const travelDuration = useGameStore((state) => state.travelDuration);
  const visualPosition = useGameStore((state) => state.player.visualPosition);
  
  if (!isMoving || !travelStartTime || !travelDuration) return null;
  
  const elapsed = Date.now() - travelStartTime;
  const remaining = Math.max(0, travelDuration - elapsed);
  const remainingSeconds = (remaining / 1000).toFixed(1);
  
  return (
    <group position={[visualPosition.x, 0.5, visualPosition.y]}>
      <Html
        center
        distanceFactor={8}
        position={[0, 2, 0]}
        style={{
          pointerEvents: "none",
          userSelect: "none",
        }}
      >
        <div
          style={{
            backgroundColor: "rgba(59, 130, 246, 0.9)",
            color: "white",
            padding: "4px 8px",
            borderRadius: "6px",
            fontSize: "12px",
            fontWeight: "bold",
            whiteSpace: "nowrap",
            border: "2px solid rgba(59, 130, 246, 1)",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.3)",
          }}
        >
          ⛵ ETA: {remainingSeconds}s
        </div>
      </Html>
    </group>
  );
}
