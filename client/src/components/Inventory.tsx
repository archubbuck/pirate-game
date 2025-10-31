import { useGameStore } from "@/lib/stores/useGameStore";

const RESOURCE_COLORS: Record<string, string> = {
  timber: "#8b4513",
  alloy: "#9ca3af",
  circuit: "#3b82f6",
  biofiber: "#10b981",
};

const RESOURCE_NAMES: Record<string, string> = {
  timber: "Timber Salvage",
  alloy: "Alloy Scrap",
  circuit: "Circuit Relics",
  biofiber: "Biofibers",
};

const RESOURCE_DESCRIPTIONS: Record<string, string> = {
  timber: "Salvaged wood from pre-flood structures",
  alloy: "Metal frameworks and structural components",
  circuit: "Pre-flood technology and electronic parts",
  biofiber: "Organic composites used as sealants",
};

export function Inventory() {
  const isOpen = useGameStore((state) => state.isInventoryOpen);
  const toggleInventory = useGameStore((state) => state.toggleInventory);
  const getCurrency = useGameStore((state) => state.getCurrency);
  const currency = useGameStore((state) => state.currency);
  const sellAllCargo = useGameStore((state) => state.sellAllCargo);
  const getCargoCount = useGameStore((state) => state.getCargoCount);
  const getMaxCargo = useGameStore((state) => state.getMaxCargo);

  if (!isOpen) return null;

  const cargoItems = getCurrency();
  const cargoCount = getCargoCount();
  const maxCargo = getMaxCargo();
  const sellValue = cargoCount * 10;
  
  return (
    <>
      <div
        onClick={toggleInventory}
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
          width: "500px",
          maxWidth: "90vw",
          maxHeight: "85vh",
          overflowY: "auto",
          backgroundColor: "rgba(20, 20, 30, 0.98)",
          border: "2px solid #3b82f6",
          borderRadius: "12px",
          padding: "24px",
          zIndex: 1000,
          color: "#ffffff",
        }}
      >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <div>
          <h2 style={{ margin: 0, fontSize: "24px", fontWeight: "bold", color: "#3b82f6" }}>⛴️ Cargo Hold</h2>
          <p style={{ margin: "4px 0 0 0", fontSize: "12px", color: "#9ca3af" }}>Salvaged Materials Storage</p>
        </div>
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

      <div style={{ 
        marginBottom: "16px", 
        padding: "12px", 
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        borderRadius: "8px",
        border: "1px solid rgba(59, 130, 246, 0.3)"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
          <span style={{ color: "#9ca3af" }}>Cargo Capacity:</span>
          <span style={{ 
            color: cargoCount >= maxCargo ? "#ef4444" : "#10b981",
            fontWeight: "bold" 
          }}>
            {cargoCount} / {maxCargo}
          </span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ color: "#9ca3af" }}>Current Value:</span>
          <span style={{ color: "#fbbf24", fontWeight: "bold" }}>⚙️ {sellValue} currency</span>
        </div>
      </div>

      {cargoCount > 0 && (
        <button
          onClick={() => {
            sellAllCargo();
            toggleInventory();
          }}
          style={{
            width: "100%",
            padding: "12px",
            marginBottom: "16px",
            backgroundColor: "#10b981",
            color: "white",
            border: "none",
            borderRadius: "8px",
            fontSize: "16px",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          Sell All Cargo at Watropolis (+{sellValue} ⚙️)
        </button>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "16px" }}>
        {Object.entries(cargoItems).map(([type, count]) => (
          <div
            key={type}
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.05)",
              border: `2px solid ${RESOURCE_COLORS[type] || "#666"}`,
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
                backgroundColor: RESOURCE_COLORS[type] || "#666",
                borderRadius: "8px",
                boxShadow: `0 0 12px ${RESOURCE_COLORS[type] || "#666"}`,
              }}
            />
            <div style={{ fontSize: "14px", fontWeight: "bold", textAlign: "center" }}>
              {RESOURCE_NAMES[type] || type}
            </div>
            <div style={{ fontSize: "10px", color: "#9ca3af", textAlign: "center" }}>
              {RESOURCE_DESCRIPTIONS[type] || ""}
            </div>
            <div style={{ fontSize: "24px", fontWeight: "bold", color: RESOURCE_COLORS[type] || "#666" }}>
              {count}
            </div>
          </div>
        ))}
      </div>

      {Object.keys(cargoItems).length === 0 && (
        <div style={{ textAlign: "center", color: "#666", padding: "40px", fontSize: "16px" }}>
          No cargo aboard. Sail to resource sites to collect salvage materials!
        </div>
      )}

      <div style={{ marginTop: "20px", paddingTop: "20px", borderTop: "1px solid #444", textAlign: "center", color: "#888", fontSize: "14px" }}>
        Press <span style={{ color: "#3b82f6", fontWeight: "bold" }}>I</span> or tap outside to close
      </div>
    </div>
    </>
  );
}
