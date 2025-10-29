import { useEffect, useRef } from "react";
import { useFightSimulator } from "@/lib/stores/useFightSimulator";

export function GameLoop() {
  const phase = useFightSimulator((state) => state.phase);
  const tickDuration = useFightSimulator((state) => state.tickDuration);
  const processTick = useFightSimulator((state) => state.processTick);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    if (phase === "playing") {
      console.log("Starting game loop with tick duration:", tickDuration);
      
      intervalRef.current = setInterval(() => {
        processTick();
      }, tickDuration);
      
      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          console.log("Game loop stopped");
        }
      };
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
  }, [phase, tickDuration, processTick]);
  
  return null;
}
