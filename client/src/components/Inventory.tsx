import { useGameStore } from "@/lib/stores/useGameStore";

const COLLECTIBLE_COLORS: Record<string, string> = {
  gem: "#a855f7",
  coin: "#fbbf24",
  star: "#60a5fa",
  crystal: "#34d399",
};

const COLLECTIBLE_NAMES: Record<string, string> = {
  gem: "Gems",
  coin: "Coins",
  star: "Stars",
  crystal: "Crystals",
};

export function Inventory() {
  const isOpen = useGameStore((state) => state.isInventoryOpen);
  const toggleInventory = useGameStore((state) => state.toggleInventory);
  const getCurrency = useGameStore((state) => state.getCurrency);

  if (!isOpen) return null;

  const currency = getCurrency();
  const totalItems = Object.values(currency).reduce((sum, count) => sum + count, 0);
  
  return (
    <div
      style={{
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: "500px",
        maxWidth: "90vw",
        backgroundColor: "rgba(20, 20, 30, 0.95)",
        border: "2px solid #4a9eff",
        borderRadius: "12px",
        padding: "24px",
        zIndex: 1000,
        color: "#ffffff",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h2 style={{ margin: 0, fontSize: "24px", fontWeight: "bold" }}>Inventory</h2>
        <button
          onClick={toggleInventory}
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

      <div style={{ marginBottom: "16px", fontSize: "16px", color: "#aaa" }}>
        Total Items: <span style={{ color: "#4a9eff", fontWeight: "bold" }}>{totalItems}</span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "16px" }}>
        {Object.entries(currency).map(([type, count]) => (
          <div
            key={type}
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.05)",
              border: `2px solid ${COLLECTIBLE_COLORS[type] || "#666"}`,
              borderRadius: "8px",
              padding: "16px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <div
              style={{
                width: "40px",
                height: "40px",
                backgroundColor: COLLECTIBLE_COLORS[type] || "#666",
                borderRadius: "8px",
                boxShadow: `0 0 12px ${COLLECTIBLE_COLORS[type] || "#666"}`,
              }}
            />
            <div style={{ fontSize: "18px", fontWeight: "bold" }}>{COLLECTIBLE_NAMES[type] || type}</div>
            <div style={{ fontSize: "24px", fontWeight: "bold", color: COLLECTIBLE_COLORS[type] || "#666" }}>
              {count}
            </div>
          </div>
        ))}
      </div>

      {Object.keys(currency).length === 0 && (
        <div style={{ textAlign: "center", color: "#666", padding: "40px", fontSize: "16px" }}>
          No items collected yet. Explore the map to find collectibles!
        </div>
      )}

      <div style={{ marginTop: "20px", paddingTop: "20px", borderTop: "1px solid #444", textAlign: "center", color: "#888", fontSize: "14px" }}>
        Press <span style={{ color: "#4a9eff", fontWeight: "bold" }}>I</span> to close
      </div>
    </div>
  );
}
