import { useEffect } from "react";
import { useGameStore } from "@/lib/stores/useGameStore";

export function KeyboardListener() {
  const toggleInventory = useGameStore((state) => state.toggleInventory);
  const toggleShop = useGameStore((state) => state.toggleShop);
  const phase = useGameStore((state) => state.phase);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (phase !== "playing") return;
      
      if (e.key === "i" || e.key === "I") {
        e.preventDefault();
        toggleInventory();
      } else if (e.key === "u" || e.key === "U") {
        e.preventDefault();
        toggleShop();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [phase, toggleInventory, toggleShop]);

  return null;
}
