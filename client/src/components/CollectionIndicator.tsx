import { Html } from "@react-three/drei";
import { useGameStore } from "@/lib/stores/useGameStore";

export function CollectionIndicator() {
  const isCollecting = useGameStore((state) => state.isCollecting);
  const collectionStartTime = useGameStore((state) => state.collectionStartTime);
  const collectionDuration = useGameStore((state) => state.collectionDuration);
  const visualPosition = useGameStore((state) => state.player.visualPosition);
  const collectingItemId = useGameStore((state) => state.collectingItemId);
  const collectibles = useGameStore((state) => state.collectibles);
  const shipUpgrades = useGameStore((state) => state.shipUpgrades);
  
  if (!isCollecting || !collectionStartTime || !collectionDuration || !collectingItemId) return null;
  
  const collectible = collectibles.find(c => c.id === collectingItemId);
  if (!collectible) return null;
  
  const elapsed = Date.now() - collectionStartTime;
  const remaining = Math.max(0, collectionDuration - elapsed);
  const progress = Math.min(100, (elapsed / collectionDuration) * 100);
  const remainingSeconds = (remaining / 1000).toFixed(1);
  
  const resourceIcons: Record<string, string> = {
    timber: "🪵",
    alloy: "⚙️",
    circuit: "⚡",
    biofiber: "🌿",
  };
  
  const resourceNames: Record<string, string> = {
    timber: "Timber Salvage",
    alloy: "Alloy Scrap",
    circuit: "Circuit Relics",
    biofiber: "Biofibers",
  };
  
  const richnessStars = "★".repeat(collectible.richness);
  
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
            backgroundColor: "rgba(16, 185, 129, 0.9)",
            color: "white",
            padding: "8px 12px",
            borderRadius: "8px",
            fontSize: "12px",
            fontWeight: "bold",
            whiteSpace: "nowrap",
            border: "2px solid rgba(16, 185, 129, 1)",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.3)",
            minWidth: "140px",
          }}
        >
          <div style={{ marginBottom: "4px", textAlign: "center", fontSize: "11px" }}>
            {resourceIcons[collectible.type]} {resourceNames[collectible.type]}
          </div>
          <div style={{ marginBottom: "4px", textAlign: "center", fontSize: "10px", opacity: 0.9 }}>
            Richness: {richnessStars} | Rig ×{shipUpgrades.salvageRig}
          </div>
          <div style={{ marginBottom: "4px", textAlign: "center" }}>
            🔧 {remainingSeconds}s
          </div>
          <div
            style={{
              width: "100%",
              height: "4px",
              backgroundColor: "rgba(0, 0, 0, 0.3)",
              borderRadius: "2px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${progress}%`,
                height: "100%",
                backgroundColor: "rgba(255, 255, 255, 0.9)",
                transition: "width 0.1s linear",
              }}
            />
          </div>
        </div>
      </Html>
    </group>
  );
}
