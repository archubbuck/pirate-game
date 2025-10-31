import { useGameStore } from "@/lib/stores/useGameStore";

export function CancelCollectionDialog() {
  const showCancelConfirmation = useGameStore((state) => state.showCancelConfirmation);
  const confirmCancelCollection = useGameStore((state) => state.confirmCancelCollection);
  const dismissCancelConfirmation = useGameStore((state) => state.dismissCancelConfirmation);

  if (!showCancelConfirmation) return null;

  return (
    <>
      <div
        onClick={dismissCancelConfirmation}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.7)",
          zIndex: 1100,
        }}
      />
      <div
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "400px",
          maxWidth: "90vw",
          backgroundColor: "rgba(20, 20, 30, 0.98)",
          border: "2px solid #ef4444",
          borderRadius: "12px",
          padding: "24px",
          zIndex: 1101,
          color: "#ffffff",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <div style={{ fontSize: "48px", marginBottom: "12px" }}>⚠️</div>
          <h2 style={{ margin: 0, fontSize: "20px", fontWeight: "bold", color: "#ef4444", marginBottom: "8px" }}>
            Cancel Collection?
          </h2>
          <p style={{ margin: 0, fontSize: "14px", color: "#9ca3af", lineHeight: "1.5" }}>
            You are currently collecting salvage materials. If you leave now, you will forfeit the resources
            and waste the time already spent.
          </p>
        </div>

        <div style={{ display: "flex", gap: "12px" }}>
          <button
            onClick={dismissCancelConfirmation}
            style={{
              flex: 1,
              padding: "12px",
              backgroundColor: "#3b82f6",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            Continue Collecting
          </button>
          <button
            onClick={confirmCancelCollection}
            style={{
              flex: 1,
              padding: "12px",
              backgroundColor: "#ef4444",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            Forfeit & Move
          </button>
        </div>
      </div>
    </>
  );
}
