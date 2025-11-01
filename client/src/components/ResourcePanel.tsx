import { useGameStore } from "@/lib/stores/useGameStore";
import { useState } from "react";

export function ResourcePanel() {
  const [isExpanded, setIsExpanded] = useState(true);
  const collectedItems = useGameStore((state) => state.collectedItems);
  const currency = useGameStore((state) => state.currency);
  const getCargoCount = useGameStore((state) => state.getCargoCount);
  const getMaxCargo = useGameStore((state) => state.getMaxCargo);

  const cargoCount = getCargoCount();
  const maxCargo = getMaxCargo();
  const cargoPercentage = (cargoCount / maxCargo) * 100;

  const inventory = {
    alloy: collectedItems.filter(item => item.type === "alloy").length,
    circuit: collectedItems.filter(item => item.type === "circuit").length,
    timber: collectedItems.filter(item => item.type === "timber").length,
    biofiber: collectedItems.filter(item => item.type === "biofiber").length,
  };

  const resources = [
    { name: "Alloy", key: "alloy" as const, icon: "🔩", color: "text-gray-300" },
    { name: "Circuit", key: "circuit" as const, icon: "⚡", color: "text-yellow-300" },
    { name: "Timber", key: "timber" as const, icon: "🪵", color: "text-amber-600" },
    { name: "Biofiber", key: "biofiber" as const, icon: "🌿", color: "text-green-400" },
  ];

  return (
    <div className="bg-stone-800 border-4 border-stone-950 rounded shadow-2xl" style={{ boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.5), 0 4px 8px rgba(0,0,0,0.8)', minWidth: '220px' }}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-2 py-1.5 flex items-center justify-between hover:bg-stone-700/50 transition-colors border-b-2 border-stone-950 bg-gradient-to-b from-amber-900/20 to-transparent"
      >
        <div className="flex items-center gap-2">
          <span className="text-base">📦</span>
          <span className="text-amber-200 font-bold text-sm tracking-wide" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}>
            Cargo Bay
          </span>
        </div>
        <span className="text-xs text-stone-400">{isExpanded ? "▼" : "▶"}</span>
      </button>

      {isExpanded && (
        <div className="px-2 pb-2 pt-2 space-y-2">
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-stone-300">Capacity</span>
              <span className={`font-bold ${cargoCount >= maxCargo ? 'text-red-400' : 'text-amber-200'}`}>
                {cargoCount}/{maxCargo}
              </span>
            </div>
            <div className="w-full h-2 bg-black/60 rounded border border-stone-950/50 overflow-hidden" style={{ boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.8)' }}>
              <div
                className={`h-full transition-all duration-300 ${
                  cargoPercentage >= 100 ? 'bg-red-600' : 
                  cargoPercentage >= 80 ? 'bg-yellow-600' : 
                  'bg-blue-600'
                }`}
                style={{ width: `${Math.min(cargoPercentage, 100)}%` }}
              />
            </div>
          </div>

          <div className="space-y-1">
            {resources.map((resource) => {
              const count = inventory[resource.key] || 0;
              return (
                <div
                  key={resource.key}
                  className="flex items-center justify-between text-xs bg-stone-900/50 rounded px-2 py-1 border border-stone-950/50"
                >
                  <div className="flex items-center gap-1.5">
                    <span className={resource.color}>{resource.icon}</span>
                    <span className="text-stone-300">{resource.name}</span>
                  </div>
                  <span className="font-mono text-amber-200 font-bold">{count}</span>
                </div>
              );
            })}
          </div>

          <div className="pt-1 border-t-2 border-stone-950">
            <div className="flex items-center justify-between text-xs bg-stone-900/50 rounded px-2 py-1 border border-stone-950/50">
              <span className="text-stone-300">Currency</span>
              <span className="text-yellow-400 font-bold">⚙️ {currency}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
