import { useGameStore, type Island } from "@/lib/stores/useGameStore";
import { X } from "lucide-react";
import { useState, useEffect } from "react";

export function IslandInteractionPopup() {
  const selectedIsland = useGameStore((state) => state.selectedIsland);
  const setSelectedIsland = useGameStore((state) => state.setSelectedIsland);
  const [collectionProgress, setCollectionProgress] = useState<{ [key: string]: number }>({});
  const [isCollecting, setIsCollecting] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    if (!selectedIsland) {
      setCollectionProgress({});
      setIsCollecting({});
    }
  }, [selectedIsland]);

  if (!selectedIsland) return null;

  const handleCollect = (resourceType: string) => {
    if (isCollecting[resourceType]) return;
    
    const amount = selectedIsland.resources[resourceType];
    if (amount === 0) return;
    
    setIsCollecting({ ...isCollecting, [resourceType]: true });
    setCollectionProgress({ ...collectionProgress, [resourceType]: 0 });
    
    const collectionTime = 3000;
    const updateInterval = 600;
    const startTime = Date.now();
    
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min((elapsed / collectionTime) * 100, 100);
      
      setCollectionProgress(prev => ({ ...prev, [resourceType]: progress }));
      
      if (progress >= 100) {
        clearInterval(interval);
        
        console.log(`Collected ${amount} ${resourceType} from island ${selectedIsland.id}`);
        
        const updatedIsland = { ...selectedIsland };
        updatedIsland.resources[resourceType] = 0;
        useGameStore.getState().updateIsland(updatedIsland);
        
        setIsCollecting(prev => ({ ...prev, [resourceType]: false }));
        setCollectionProgress(prev => ({ ...prev, [resourceType]: 0 }));
      }
    }, updateInterval);
  };

  const handleClose = () => {
    const hasActiveCollection = Object.values(isCollecting).some(v => v);
    if (!hasActiveCollection) {
      setSelectedIsland(null);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        backgroundColor: "#1a1a1a",
        color: "#ffffff",
        padding: "24px",
        borderRadius: "8px",
        border: "2px solid #4a7a2a",
        minWidth: "300px",
        maxWidth: "400px",
        zIndex: 1000,
        boxShadow: "0 4px 16px rgba(0, 0, 0, 0.5)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <h2 style={{ margin: 0, fontSize: "20px", fontWeight: "bold" }}>Island Resources</h2>
        <button
          onClick={handleClose}
          style={{
            background: "transparent",
            border: "none",
            color: "#ffffff",
            cursor: "pointer",
            padding: "4px",
          }}
        >
          <X size={24} />
        </button>
      </div>

      <div style={{ marginBottom: "16px" }}>
        <p style={{ margin: "0 0 8px 0", fontSize: "14px", color: "#aaaaaa" }}>
          Island #{selectedIsland.id}
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {Object.entries(selectedIsland.resources).map(([type, amount]) => {
          const progress = collectionProgress[type] || 0;
          const collecting = isCollecting[type] || false;
          const hasResources = amount > 0;

          return (
            <div
              key={type}
              style={{
                padding: "12px",
                backgroundColor: "#2a2a2a",
                borderRadius: "4px",
                border: "1px solid #3a3a3a",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <span style={{ fontSize: "16px", fontWeight: "500", textTransform: "capitalize" }}>
                  {type}
                </span>
                <span style={{ fontSize: "14px", color: hasResources ? "#4a7a2a" : "#666" }}>
                  {amount} units
                </span>
              </div>

              {collecting && (
                <div style={{ marginBottom: "8px" }}>
                  <div
                    style={{
                      width: "100%",
                      height: "8px",
                      backgroundColor: "#3a3a3a",
                      borderRadius: "4px",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: `${progress}%`,
                        height: "100%",
                        backgroundColor: "#4a7a2a",
                        transition: "width 0.3s ease",
                      }}
                    />
                  </div>
                  <p style={{ margin: "4px 0 0 0", fontSize: "12px", color: "#aaaaaa" }}>
                    Collecting... {Math.floor(progress)}%
                  </p>
                </div>
              )}

              <button
                onClick={() => handleCollect(type)}
                disabled={!hasResources || collecting}
                style={{
                  width: "100%",
                  padding: "8px 16px",
                  backgroundColor: hasResources && !collecting ? "#4a7a2a" : "#3a3a3a",
                  color: hasResources && !collecting ? "#ffffff" : "#666",
                  border: "none",
                  borderRadius: "4px",
                  cursor: hasResources && !collecting ? "pointer" : "not-allowed",
                  fontSize: "14px",
                  fontWeight: "500",
                }}
              >
                {collecting ? "Collecting..." : hasResources ? "Collect" : "Depleted"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
