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
    <div className="absolute top-4 right-4 flex flex-col gap-2 z-20">
      <button
        onClick={toggleInventory}
        className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold py-3 px-4 rounded-lg shadow-lg transition-colors flex items-center gap-2 min-w-[120px]"
      >
        <span className="text-xl">🎒</span>
        <span>Inventory</span>
      </button>
      
      <button
        onClick={toggleShop}
        className="bg-yellow-600 hover:bg-yellow-700 active:bg-yellow-800 text-white font-bold py-3 px-4 rounded-lg shadow-lg transition-colors flex items-center gap-2 min-w-[120px]"
      >
        <span className="text-xl">🛒</span>
        <div className="flex flex-col items-start">
          <span>Shop</span>
          {totalCurrency > 0 && (
            <span className="text-xs opacity-90">{totalCurrency} items</span>
          )}
        </div>
      </button>
    </div>
  );
}
