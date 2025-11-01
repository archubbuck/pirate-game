import { useEffect } from "react";
import { useGameStore } from "@/lib/stores/useGameStore";

const GAME_CYCLE_DURATION = 600; // ms

export function GameLoop() {
  useEffect(() => {
    const interval = setInterval(() => {
      const state = useGameStore.getState();
      
      if (state.phase !== "playing") return;
      
      state.checkAutoAttack();
      state.checkAutoCollect();
    }, GAME_CYCLE_DURATION);
    
    return () => clearInterval(interval);
  }, []);
  
  return null;
}
