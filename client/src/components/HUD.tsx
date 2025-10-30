import { useGameStore } from "@/lib/stores/useGameStore";
import { useAudio } from "@/lib/stores/useAudio";

export function HUD() {
  const phase = useGameStore((state) => state.phase);
  const collectedCount = useGameStore((state) => state.collectedCount);
  const collectibles = useGameStore((state) => state.collectibles);
  const start = useGameStore((state) => state.start);
  const restart = useGameStore((state) => state.restart);
  const activePowerUps = useGameStore((state) => state.activePowerUps);
  const getCurrency = useGameStore((state) => state.getCurrency);
  const isMuted = useAudio((state) => state.isMuted);
  const toggleMute = useAudio((state) => state.toggleMute);
  
  const totalCollectibles = collectedCount + collectibles.length;
  const currency = getCurrency();
  const totalCurrency = Object.values(currency).reduce((sum, count) => sum + count, 0);
  
  const powerUpIcons: Record<string, string> = {
    speed: "⚡",
    vision: "👁️",
    magnet: "🧲",
  };
  
  const powerUpNames: Record<string, string> = {
    speed: "Speed Boost",
    vision: "Enhanced Vision",
    magnet: "Item Magnet",
  };
  
  return (
    <>
      {phase === "ready" && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-10">
          <div className="bg-gray-900 border-2 border-gray-700 rounded-lg p-8 max-w-md text-center">
            <h1 className="text-4xl font-bold text-white mb-4">Explorer's Quest</h1>
            <p className="text-gray-300 mb-6">
              Explore the mysterious grid and collect all the treasures hidden across the map!
            </p>
            
            <div className="bg-gray-800 p-4 rounded mb-6 text-left text-sm">
              <h3 className="text-white font-bold mb-2">How to Play:</h3>
              <ul className="text-gray-300 space-y-1">
                <li>• Click any tile to move there</li>
                <li>• Explore the map to reveal hidden areas</li>
                <li>• Collect glowing treasures as currency</li>
                <li>• Press <span className="text-blue-400 font-bold">I</span> to view inventory</li>
                <li>• Press <span className="text-yellow-400 font-bold">U</span> to buy power-ups & unlocks</li>
              </ul>
            </div>
            
            <button
              onClick={start}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg text-xl transition-colors"
            >
              Start Exploring
            </button>
          </div>
        </div>
      )}
      
      {phase === "ended" && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-10">
          <div className="bg-gray-900 border-2 border-gray-700 rounded-lg p-8 max-w-md text-center">
            <h1 className="text-4xl font-bold text-white mb-4">
              Quest Complete!
            </h1>
            
            <div className="bg-gray-800 p-6 rounded mb-6">
              <h3 className="text-white font-bold mb-4 text-xl">Final Score</h3>
              <div className="text-center">
                <p className="text-gray-400 text-sm mb-2">Items Collected</p>
                <p className="text-white text-5xl font-bold text-green-400">{collectedCount}</p>
                <p className="text-gray-400 text-xs mt-2">out of {totalCollectibles}</p>
              </div>
            </div>
            
            <button
              onClick={restart}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg text-xl transition-colors"
            >
              Explore Again
            </button>
          </div>
        </div>
      )}
      
      {phase === "playing" && (
        <>
          <div className="absolute top-2 left-2 bg-gray-900/90 border border-gray-700 rounded-lg p-2 text-xs">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-gray-400">Items:</span>
              <span className="text-white font-bold">{collectedCount}/{totalCollectibles}</span>
              {totalCurrency > 0 && (
                <>
                  <span className="text-gray-600">|</span>
                  <span className="text-yellow-400 font-bold">💰 {totalCurrency}</span>
                </>
              )}
            </div>
            
            {activePowerUps.length > 0 && (
              <div className="flex gap-1 flex-wrap">
                {activePowerUps.map((powerUp) => (
                  <span
                    key={powerUp.type}
                    className="bg-green-900/40 border border-green-500/50 rounded px-1.5 py-0.5 text-xs"
                  >
                    {powerUpIcons[powerUp.type]}
                  </span>
                ))}
              </div>
            )}
          </div>
          
          <div className="absolute bottom-2 left-2 flex gap-1">
            <button
              onClick={toggleMute}
              className="bg-gray-900/90 hover:bg-gray-800/90 border border-gray-700 text-white px-2 py-1 rounded text-sm transition-colors"
            >
              {isMuted ? "🔇" : "🔊"}
            </button>
            <button
              onClick={restart}
              className="bg-gray-900/90 hover:bg-gray-800/90 border border-gray-700 text-white px-2 py-1 rounded text-sm transition-colors"
            >
              ↻
            </button>
          </div>
        </>
      )}
    </>
  );
}
