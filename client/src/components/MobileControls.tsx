import { useGameStore } from "@/lib/stores/useGameStore";

export function MobileControls() {
  const phase = useGameStore((state) => state.phase);
  const toggleInventory = useGameStore((state) => state.toggleInventory);
  const toggleShop = useGameStore((state) => state.toggleShop);
  const getCurrency = useGameStore((state) => state.getCurrency);

  if (phase !== "playing") return null;

  const currency = getCurrency();
  const totalCurrency = Object.values(currency).reduce((sum, count) => sum + count, 0);

  return (
    <div className="absolute top-2 right-2 flex gap-1 z-20">
      <button
        onClick={toggleInventory}
        className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold py-2 px-3 rounded shadow-lg transition-colors text-sm"
        title="Cargo Hold"
      >
        ⛴️
      </button>
      
      <button
        onClick={toggleShop}
        className="bg-yellow-600 hover:bg-yellow-700 active:bg-yellow-800 text-white font-bold py-2 px-3 rounded shadow-lg transition-colors flex items-center gap-1 text-sm"
        title="Watropolis Dockyard"
      >
        <span>⚓</span>
        {totalCurrency > 0 && (
          <span className="text-xs">⚙️{totalCurrency}</span>
        )}
      </button>
    </div>
  );
}
