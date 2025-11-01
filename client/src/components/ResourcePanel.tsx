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
    <div className="bg-gray-900/95 backdrop-blur-md border border-blue-700/50 rounded-lg overflow-hidden shadow-xl">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-3 py-2 flex items-center justify-between hover:bg-gray-800/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">📦</span>
          <span className="text-blue-400 font-bold text-sm">Cargo Bay</span>
        </div>
        <span className="text-xs text-gray-400">{isExpanded ? "▼" : "▶"}</span>
      </button>

      {isExpanded && (
        <div className="px-3 pb-3 space-y-2 animate-in slide-in-from-top duration-200">
          <div className="pt-2">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-gray-400">Capacity</span>
              <span className={`font-bold ${cargoCount >= maxCargo ? 'text-red-400' : 'text-white'}`}>
                {cargoCount}/{maxCargo}
              </span>
            </div>
            <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  cargoPercentage >= 100 ? 'bg-red-500' : 
                  cargoPercentage >= 80 ? 'bg-yellow-500' : 
                  'bg-blue-500'
                }`}
                style={{ width: `${Math.min(cargoPercentage, 100)}%` }}
              />
            </div>
          </div>

          <div className="pt-1 space-y-1">
            {resources.map((resource) => {
              const count = inventory[resource.key] || 0;
              return (
                <div
                  key={resource.key}
                  className="flex items-center justify-between text-xs bg-gray-800/50 rounded px-2 py-1"
                >
                  <div className="flex items-center gap-1.5">
                    <span className={resource.color}>{resource.icon}</span>
                    <span className="text-gray-300">{resource.name}</span>
                  </div>
                  <span className="font-mono text-white font-bold">{count}</span>
                </div>
              );
            })}
          </div>

          <div className="pt-2 border-t border-gray-700">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-400">Currency</span>
              <span className="text-yellow-400 font-bold">⚙️ {currency}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
