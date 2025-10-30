import { useGameStore } from "@/lib/stores/useGameStore";

export function Shop() {
  const isOpen = useGameStore((state) => state.isShopOpen);
  const toggleShop = useGameStore((state) => state.toggleShop);
  const getCurrency = useGameStore((state) => state.getCurrency);
  const purchasePowerUp = useGameStore((state) => state.purchasePowerUp);
  const purchaseMapUnlock = useGameStore((state) => state.purchaseMapUnlock);
  const mapUnlocks = useGameStore((state) => state.mapUnlocks);
  const activePowerUps = useGameStore((state) => state.activePowerUps);

  if (!isOpen) return null;

  const currency = getCurrency();
  const totalItems = Object.values(currency).reduce((sum, count) => sum + count, 0);

  const powerUps = [
    { type: "speed" as const, name: "Speed Boost", cost: 3, description: "Move faster for 30 seconds", icon: "⚡" },
    { type: "vision" as const, name: "Enhanced Vision", cost: 4, description: "See 8 tiles instead of 5 for 60 seconds", icon: "👁️" },
    { type: "magnet" as const, name: "Item Magnet", cost: 5, description: "Auto-collect nearby items for 45 seconds", icon: "🧲" },
  ];

  const handlePurchasePowerUp = (type: "speed" | "vision" | "magnet", cost: number) => {
    if (purchasePowerUp(type, cost)) {
      console.log(`Purchased ${type} power-up`);
    }
  };

  const handlePurchaseMapUnlock = (unlockId: string) => {
    if (purchaseMapUnlock(unlockId)) {
      console.log(`Unlocked map area ${unlockId}`);
    }
  };

  const isPowerUpActive = (type: string) => {
    return activePowerUps.some(p => p.type === type);
  };

  return (
    <div
      style={{
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: "600px",
        maxWidth: "90vw",
        maxHeight: "80vh",
        backgroundColor: "rgba(20, 20, 30, 0.95)",
        border: "2px solid #fbbf24",
        borderRadius: "12px",
        padding: "24px",
        zIndex: 1000,
        color: "#ffffff",
        overflowY: "auto",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h2 style={{ margin: 0, fontSize: "24px", fontWeight: "bold" }}>Shop & Upgrades</h2>
        <button
          onClick={toggleShop}
          style={{
            background: "transparent",
            border: "none",
            color: "#ffffff",
            fontSize: "24px",
            cursor: "pointer",
            padding: "0",
          }}
        >
          ×
        </button>
      </div>

      <div style={{ marginBottom: "24px", fontSize: "16px", color: "#aaa" }}>
        Available Currency: <span style={{ color: "#fbbf24", fontWeight: "bold" }}>{totalItems} items</span>
      </div>

      <div style={{ marginBottom: "32px" }}>
        <h3 style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "16px", color: "#4a9eff" }}>Power-Ups</h3>
        <div style={{ display: "grid", gap: "12px" }}>
          {powerUps.map((powerUp) => {
            const isActive = isPowerUpActive(powerUp.type);
            const canAfford = totalItems >= powerUp.cost;
            
            return (
              <div
                key={powerUp.type}
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.05)",
                  border: isActive ? "2px solid #34d399" : "2px solid #444",
                  borderRadius: "8px",
                  padding: "16px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  opacity: isActive ? 0.7 : 1,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px", flex: 1 }}>
                  <div style={{ fontSize: "32px" }}>{powerUp.icon}</div>
                  <div>
                    <div style={{ fontSize: "16px", fontWeight: "bold" }}>{powerUp.name}</div>
                    <div style={{ fontSize: "14px", color: "#888" }}>{powerUp.description}</div>
                  </div>
                </div>
                <button
                  onClick={() => handlePurchasePowerUp(powerUp.type, powerUp.cost)}
                  disabled={!canAfford || isActive}
                  style={{
                    padding: "8px 16px",
                    backgroundColor: canAfford && !isActive ? "#4a9eff" : "#333",
                    color: canAfford && !isActive ? "#ffffff" : "#666",
                    border: "none",
                    borderRadius: "6px",
                    cursor: canAfford && !isActive ? "pointer" : "not-allowed",
                    fontWeight: "bold",
                    fontSize: "14px",
                  }}
                >
                  {isActive ? "Active" : `${powerUp.cost} items`}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <h3 style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "16px", color: "#a855f7" }}>Map Unlocks</h3>
        <div style={{ display: "grid", gap: "12px" }}>
          {mapUnlocks.map((unlock) => {
            const canAfford = totalItems >= unlock.cost;
            
            return (
              <div
                key={unlock.id}
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.05)",
                  border: unlock.unlocked ? "2px solid #34d399" : "2px solid #444",
                  borderRadius: "8px",
                  padding: "16px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  opacity: unlock.unlocked ? 0.7 : 1,
                }}
              >
                <div>
                  <div style={{ fontSize: "16px", fontWeight: "bold" }}>{unlock.name}</div>
                  <div style={{ fontSize: "14px", color: "#888" }}>
                    Reveals a new area of the map
                  </div>
                </div>
                <button
                  onClick={() => handlePurchaseMapUnlock(unlock.id)}
                  disabled={!canAfford || unlock.unlocked}
                  style={{
                    padding: "8px 16px",
                    backgroundColor: canAfford && !unlock.unlocked ? "#a855f7" : "#333",
                    color: canAfford && !unlock.unlocked ? "#ffffff" : "#666",
                    border: "none",
                    borderRadius: "6px",
                    cursor: canAfford && !unlock.unlocked ? "pointer" : "not-allowed",
                    fontWeight: "bold",
                    fontSize: "14px",
                  }}
                >
                  {unlock.unlocked ? "Unlocked" : `${unlock.cost} items`}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ marginTop: "20px", paddingTop: "20px", borderTop: "1px solid #444", textAlign: "center", color: "#888", fontSize: "14px" }}>
        Press <span style={{ color: "#fbbf24", fontWeight: "bold" }}>U</span> to close
      </div>
    </div>
  );
}
