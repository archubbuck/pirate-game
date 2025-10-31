import { useGameStore } from "@/lib/stores/useGameStore";

export function Shop() {
  const isOpen = useGameStore((state) => state.isShopOpen);
  const toggleShop = useGameStore((state) => state.toggleShop);
  const currency = useGameStore((state) => state.currency);
  const shipUpgrades = useGameStore((state) => state.shipUpgrades);
  const purchasePowerUp = useGameStore((state) => state.purchasePowerUp);
  const purchaseShipUpgrade = useGameStore((state) => state.purchaseShipUpgrade);
  const purchaseMapUnlock = useGameStore((state) => state.purchaseMapUnlock);
  const mapUnlocks = useGameStore((state) => state.mapUnlocks);
  const activePowerUps = useGameStore((state) => state.activePowerUps);

  if (!isOpen) return null;

  const shipUpgradesList = [
    { 
      type: "engine" as const, 
      name: "Engine Upgrade", 
      description: "Increase travel speed between tiles", 
      icon: "⚡",
      currentLevel: shipUpgrades.engine,
      cost: shipUpgrades.engine * 50,
    },
    { 
      type: "scanner" as const, 
      name: "Scanner Upgrade", 
      description: "Improve accuracy of collection time estimates", 
      icon: "📡",
      currentLevel: shipUpgrades.scanner,
      cost: shipUpgrades.scanner * 50,
    },
    { 
      type: "salvageRig" as const, 
      name: "Salvage Rig Upgrade", 
      description: "Collect materials faster", 
      icon: "🔧",
      currentLevel: shipUpgrades.salvageRig,
      cost: shipUpgrades.salvageRig * 50,
    },
    { 
      type: "cargoHold" as const, 
      name: "Cargo Hold Upgrade", 
      description: "Increase cargo capacity by 5", 
      icon: "📦",
      currentLevel: shipUpgrades.cargoHold,
      cost: shipUpgrades.cargoHold * 50,
    },
  ];

  const powerUps = [
    { type: "speed" as const, name: "Afterburner Rig", cost: 25, description: "Temporary speed boost for 30 seconds", icon: "⚡" },
    { type: "vision" as const, name: "Sonar Beacon", cost: 30, description: "Extended vision range for 60 seconds", icon: "👁️" },
    { type: "magnet" as const, name: "Grapple Winch", cost: 35, description: "Auto-collect nearby materials for 45 seconds", icon: "🧲" },
  ];

  const handlePurchaseShipUpgrade = (type: "engine" | "scanner" | "salvageRig" | "cargoHold") => {
    if (purchaseShipUpgrade(type)) {
      console.log(`Upgraded ${type}`);
    }
  };

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
    <>
      <div
        onClick={toggleShop}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          zIndex: 999,
        }}
      />
      <div
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "700px",
          maxWidth: "90vw",
          maxHeight: "85vh",
          backgroundColor: "rgba(20, 20, 30, 0.98)",
          border: "2px solid #fbbf24",
          borderRadius: "12px",
          padding: "24px",
          zIndex: 1000,
          color: "#ffffff",
          overflowY: "auto",
        }}
      >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <div>
          <h2 style={{ margin: 0, fontSize: "24px", fontWeight: "bold", color: "#fbbf24" }}>⚓ Watropolis Dockyard</h2>
          <p style={{ margin: "4px 0 0 0", fontSize: "12px", color: "#9ca3af" }}>Ship Upgrades & Equipment</p>
        </div>
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

      <div style={{ marginBottom: "24px", padding: "12px", backgroundColor: "rgba(251, 191, 36, 0.1)", borderRadius: "8px", border: "1px solid rgba(251, 191, 36, 0.3)" }}>
        <div style={{ fontSize: "14px", color: "#9ca3af" }}>Available Currency:</div>
        <div style={{ fontSize: "24px", fontWeight: "bold", color: "#fbbf24" }}>⚙️ {currency}</div>
      </div>

      <div style={{ marginBottom: "32px" }}>
        <h3 style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "16px", color: "#3b82f6" }}>
          🔧 Permanent Ship Upgrades
        </h3>
        <div style={{ display: "grid", gap: "12px" }}>
          {shipUpgradesList.map((upgrade) => {
            const canAfford = currency >= upgrade.cost;
            
            return (
              <div
                key={upgrade.type}
                style={{
                  backgroundColor: "rgba(59, 130, 246, 0.05)",
                  border: "2px solid rgba(59, 130, 246, 0.3)",
                  borderRadius: "8px",
                  padding: "16px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px", flex: 1 }}>
                  <div style={{ fontSize: "32px" }}>{upgrade.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "16px", fontWeight: "bold" }}>{upgrade.name}</div>
                    <div style={{ fontSize: "14px", color: "#888", marginBottom: "4px" }}>{upgrade.description}</div>
                    <div style={{ fontSize: "12px", color: "#3b82f6" }}>
                      Current Level: {upgrade.currentLevel}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handlePurchaseShipUpgrade(upgrade.type)}
                  disabled={!canAfford}
                  style={{
                    padding: "8px 16px",
                    backgroundColor: canAfford ? "#3b82f6" : "#333",
                    color: canAfford ? "#fff" : "#666",
                    border: "none",
                    borderRadius: "6px",
                    fontSize: "14px",
                    fontWeight: "bold",
                    cursor: canAfford ? "pointer" : "not-allowed",
                    whiteSpace: "nowrap",
                  }}
                >
                  ⚙️ {upgrade.cost}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ marginBottom: "32px" }}>
        <h3 style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "16px", color: "#10b981" }}>
          ⚡ Temporary Power-Ups
        </h3>
        <div style={{ display: "grid", gap: "12px" }}>
          {powerUps.map((powerUp) => {
            const isActive = isPowerUpActive(powerUp.type);
            const canAfford = currency >= powerUp.cost;
            
            return (
              <div
                key={powerUp.type}
                style={{
                  backgroundColor: "rgba(16, 185, 129, 0.05)",
                  border: isActive ? "2px solid #10b981" : "2px solid rgba(16, 185, 129, 0.3)",
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
                    {isActive && <div style={{ fontSize: "12px", color: "#10b981", marginTop: "4px" }}>● Active</div>}
                  </div>
                </div>
                <button
                  onClick={() => handlePurchasePowerUp(powerUp.type, powerUp.cost)}
                  disabled={!canAfford || isActive}
                  style={{
                    padding: "8px 16px",
                    backgroundColor: canAfford && !isActive ? "#10b981" : "#333",
                    color: canAfford && !isActive ? "#fff" : "#666",
                    border: "none",
                    borderRadius: "6px",
                    fontSize: "14px",
                    fontWeight: "bold",
                    cursor: canAfford && !isActive ? "pointer" : "not-allowed",
                    whiteSpace: "nowrap",
                  }}
                >
                  ⚙️ {powerUp.cost}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <h3 style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "16px", color: "#f59e0b" }}>
          🗺️ Sea Route Unlocks
        </h3>
        <div style={{ display: "grid", gap: "12px" }}>
          {mapUnlocks.map((unlock) => {
            const canAfford = currency >= unlock.cost;
            
            return (
              <div
                key={unlock.id}
                style={{
                  backgroundColor: unlock.unlocked ? "rgba(16, 185, 129, 0.1)" : "rgba(245, 158, 11, 0.05)",
                  border: unlock.unlocked ? "2px solid #10b981" : "2px solid rgba(245, 158, 11, 0.3)",
                  borderRadius: "8px",
                  padding: "16px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <div style={{ fontSize: "16px", fontWeight: "bold" }}>{unlock.name}</div>
                  <div style={{ fontSize: "14px", color: "#888" }}>Explore new salvage regions</div>
                  {unlock.unlocked && <div style={{ fontSize: "12px", color: "#10b981", marginTop: "4px" }}>✓ Unlocked</div>}
                </div>
                {!unlock.unlocked && (
                  <button
                    onClick={() => handlePurchaseMapUnlock(unlock.id)}
                    disabled={!canAfford}
                    style={{
                      padding: "8px 16px",
                      backgroundColor: canAfford ? "#f59e0b" : "#333",
                      color: canAfford ? "#fff" : "#666",
                      border: "none",
                      borderRadius: "6px",
                      fontSize: "14px",
                      fontWeight: "bold",
                      cursor: canAfford ? "pointer" : "not-allowed",
                      whiteSpace: "nowrap",
                    }}
                  >
                    ⚙️ {unlock.cost}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ marginTop: "20px", paddingTop: "20px", borderTop: "1px solid #444", textAlign: "center", color: "#888", fontSize: "14px" }}>
        Press <span style={{ color: "#fbbf24", fontWeight: "bold" }}>U</span> or tap outside to close
      </div>
    </div>
    </>
  );
}
