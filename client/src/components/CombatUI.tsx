import { useEffect, useState } from "react";
import { useGameStore } from "@/lib/stores/useGameStore";

export function CombatUI() {
  const combatState = useGameStore((state) => state.combatState);
  const updateCombatProgress = useGameStore((state) => state.updateCombatProgress);
  const completeCombat = useGameStore((state) => state.completeCombat);
  const enemyShips = useGameStore((state) => state.enemyShips);
  
  const [progress, setProgress] = useState(0);
  
  useEffect(() => {
    if (!combatState.isInCombat || !combatState.combatStartTime) {
      setProgress(0);
      return;
    }
    
    const updateInterval = setInterval(() => {
      const elapsed = Date.now() - combatState.combatStartTime!;
      const newProgress = Math.min((elapsed / combatState.combatDuration) * 100, 100);
      
      setProgress(newProgress);
      updateCombatProgress(newProgress);
      
      if (newProgress >= 100) {
        completeCombat();
        clearInterval(updateInterval);
      }
    }, 600);
    
    return () => clearInterval(updateInterval);
  }, [combatState.isInCombat, combatState.combatStartTime, combatState.combatDuration, updateCombatProgress, completeCombat]);
  
  if (!combatState.isInCombat || !combatState.enemyId) return null;
  
  const enemy = enemyShips.find(s => s.id === combatState.enemyId);
  
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
        border: "2px solid #aa3333",
        minWidth: "300px",
        zIndex: 1000,
        boxShadow: "0 4px 16px rgba(0, 0, 0, 0.5)",
      }}
    >
      <h2 style={{ margin: "0 0 16px 0", fontSize: "20px", fontWeight: "bold", textAlign: "center" }}>
        COMBAT IN PROGRESS
      </h2>

      {enemy && (
        <div style={{ marginBottom: "16px" }}>
          <p style={{ margin: "0 0 8px 0", fontSize: "14px", textAlign: "center" }}>
            Engaging Enemy Ship
          </p>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#aaa" }}>
            <span>Health:</span>
            <span>{enemy.health}/{enemy.maxHealth}</span>
          </div>
        </div>
      )}

      <div style={{ marginBottom: "12px" }}>
        <div
          style={{
            width: "100%",
            height: "24px",
            backgroundColor: "#3a3a3a",
            borderRadius: "4px",
            overflow: "hidden",
            border: "1px solid #555",
          }}
        >
          <div
            style={{
              width: `${progress}%`,
              height: "100%",
              backgroundColor: progress < 50 ? "#aa3333" : progress < 80 ? "#aa7733" : "#44aa44",
              transition: "width 0.3s ease, background-color 0.3s ease",
            }}
          />
        </div>
        <p style={{ margin: "8px 0 0 0", fontSize: "14px", textAlign: "center", color: "#ccc" }}>
          {Math.floor(progress)}%
        </p>
      </div>

      <p style={{ margin: 0, fontSize: "12px", textAlign: "center", color: "#888" }}>
        Combat will complete in {Math.max(0, Math.ceil((combatState.combatDuration - (Date.now() - (combatState.combatStartTime || 0))) / 1000))}s
      </p>
    </div>
  );
}
