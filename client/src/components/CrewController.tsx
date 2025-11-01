import { useEffect, useRef } from "react";
import { useGameStore, type CrewMember } from "@/lib/stores/useGameStore";

const DRIFT_TIME = 45000;
const POACH_CHECK_INTERVAL = 1000;
const POACH_CHANCE = 0.12;
const POACH_MIN_TIME = 5000;
const POACH_PROXIMITY = 3;

export function CrewController() {
  const driftTimersRef = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const poachCheckRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const checkPoaching = () => {
      const { crewMembers, enemyShips, updateCrewMember, removeCrewMember } = useGameStore.getState();
      const now = Date.now();

      crewMembers.forEach(crew => {
        if (crew.state === "collecting" || crew.state === "awaitingPickup") {
          const timeSinceDeployed = crew.deployedAt ? now - crew.deployedAt : 0;

          if (timeSinceDeployed >= POACH_MIN_TIME) {
            enemyShips.forEach(enemy => {
              const distance = Math.sqrt(
                Math.pow(enemy.position.x - crew.position.x, 2) +
                Math.pow(enemy.position.y - crew.position.y, 2)
              );

              if (distance <= POACH_PROXIMITY) {
                if (!crew.poachStartTime) {
                  updateCrewMember({
                    ...crew,
                    poachingEnemyId: enemy.id,
                    poachStartTime: now,
                  });
                } else if (now - crew.poachStartTime >= 1000) {
                  if (Math.random() < POACH_CHANCE) {
                    console.log(`Enemy ${enemy.id} captured crew ${crew.id}!`);
                    removeCrewMember(crew.id);
                  }
                }
              } else if (crew.poachingEnemyId === enemy.id) {
                updateCrewMember({
                  ...crew,
                  poachingEnemyId: null,
                  poachStartTime: null,
                });
              }
            });
          }
        }
      });
    };

    poachCheckRef.current = setInterval(checkPoaching, POACH_CHECK_INTERVAL);

    return () => {
      if (poachCheckRef.current) {
        clearInterval(poachCheckRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const unsubscribe = useGameStore.subscribe(
      state => state.crewMembers,
      (crewMembers) => {
        crewMembers.forEach(crew => {
          if (crew.state === "awaitingPickup" && !driftTimersRef.current.has(crew.id)) {
            const timer = setTimeout(() => {
              const currentCrew = useGameStore.getState().crewMembers.find(c => c.id === crew.id);
              if (currentCrew && currentCrew.state === "awaitingPickup") {
                console.log(`Crew ${crew.id} is drifting away - pick them up quickly!`);
                useGameStore.getState().updateCrewMember({
                  ...currentCrew,
                  state: "drifting",
                  driftStartTime: Date.now(),
                });

                setTimeout(() => {
                  const driftingCrew = useGameStore.getState().crewMembers.find(c => c.id === crew.id);
                  if (driftingCrew && driftingCrew.state === "drifting") {
                    console.log(`Lost crew ${crew.id} to drift!`);
                    useGameStore.getState().removeCrewMember(crew.id);
                  }
                }, 10000);
              }
              driftTimersRef.current.delete(crew.id);
            }, DRIFT_TIME);

            driftTimersRef.current.set(crew.id, timer);
          } else if (crew.state !== "awaitingPickup" && driftTimersRef.current.has(crew.id)) {
            const timer = driftTimersRef.current.get(crew.id);
            if (timer) {
              clearTimeout(timer);
              driftTimersRef.current.delete(crew.id);
            }
          }
        });

        driftTimersRef.current.forEach((timer, crewId) => {
          const exists = crewMembers.find(c => c.id === crewId);
          if (!exists) {
            clearTimeout(timer);
            driftTimersRef.current.delete(crewId);
          }
        });
      }
    );

    return () => {
      unsubscribe();
      driftTimersRef.current.forEach(timer => clearTimeout(timer));
      driftTimersRef.current.clear();
    };
  }, []);

  return null;
}
