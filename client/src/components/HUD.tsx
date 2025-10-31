import { useGameStore } from "@/lib/stores/useGameStore";
import { useAudio } from "@/lib/stores/useAudio";

export function HUD() {
  const phase = useGameStore((state) => state.phase);
  const collectedCount = useGameStore((state) => state.collectedCount);
  const collectibles = useGameStore((state) => state.collectibles);
  const start = useGameStore((state) => state.start);
  const restart = useGameStore((state) => state.restart);
  const activePowerUps = useGameStore((state) => state.activePowerUps);
  const currency = useGameStore((state) => state.currency);
  const getCargoCount = useGameStore((state) => state.getCargoCount);
  const getMaxCargo = useGameStore((state) => state.getMaxCargo);
  const isCollecting = useGameStore((state) => state.isCollecting);
  const collectionStartTime = useGameStore((state) => state.collectionStartTime);
  const collectionDuration = useGameStore((state) => state.collectionDuration);
  const travelStartTime = useGameStore((state) => state.travelStartTime);
  const travelDuration = useGameStore((state) => state.travelDuration);
  const isMoving = useGameStore((state) => state.isMoving);
  const isMuted = useAudio((state) => state.isMuted);
  const toggleMute = useAudio((state) => state.toggleMute);
  
  const totalCollectibles = collectedCount + collectibles.length;
  const cargoCount = getCargoCount();
  const maxCargo = getMaxCargo();
  
  const powerUpIcons: Record<string, string> = {
    speed: "⚡",
    vision: "👁️",
    magnet: "🧲",
  };
  
  const powerUpNames: Record<string, string> = {
    speed: "Afterburner Rig",
    vision: "Sonar Beacon",
    magnet: "Grapple Winch",
  };
  
  const getTravelTimeRemaining = () => {
    if (!isMoving || !travelStartTime || !travelDuration) return null;
    const elapsed = Date.now() - travelStartTime;
    const remaining = Math.max(0, travelDuration - elapsed);
    return (remaining / 1000).toFixed(1);
  };
  
  const getCollectionTimeRemaining = () => {
    if (!isCollecting || !collectionStartTime || !collectionDuration) return null;
    const elapsed = Date.now() - collectionStartTime;
    const remaining = Math.max(0, collectionDuration - elapsed);
    return (remaining / 1000).toFixed(1);
  };
  
  return (
    <>
      {phase === "ready" && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-10">
          <div className="bg-gray-900 border-2 border-blue-700 rounded-lg p-8 max-w-2xl text-center">
            <h1 className="text-4xl font-bold text-blue-400 mb-2">Watropolis Salvage</h1>
            <h2 className="text-xl text-gray-400 mb-4">Captain's Log - Year 60 After The Flood</h2>
            <div className="bg-gray-800 p-4 rounded mb-4 text-left text-sm">
              <p className="text-gray-300 mb-3">
                Sixty years ago, a series of massive underwater volcanic eruptions accelerated ocean warming, 
                triggering rapid polar ice cap melting. The world we knew vanished beneath the waves.
              </p>
              <p className="text-gray-300 mb-3">
                The Survivors built <span className="text-blue-400 font-bold">Watropolis</span>, a great floating city, 
                piece by piece from salvaged materials. But our work is not done.
              </p>
              <p className="text-blue-400 font-bold">
                You are a salvage vessel captain. Sail the flooded world, collect materials from the depths, 
                and help rebuild civilization.
              </p>
            </div>
            
            <div className="bg-gray-800 p-4 rounded mb-6 text-left text-sm">
              <h3 className="text-white font-bold mb-2">Mission Briefing:</h3>
              <ul className="text-gray-300 space-y-1">
                <li>• Click tiles to sail your vessel</li>
                <li>• Salvage materials from resource sites (wait for collection)</li>
                <li>• Return cargo to Watropolis Dockyard to sell for currency</li>
                <li>• Upgrade your ship to explore farther and salvage faster</li>
              </ul>
            </div>
            
            <button
              onClick={start}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg text-xl transition-colors"
            >
              Launch Vessel
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
          <div className="absolute top-2 left-2 bg-gray-900/95 border border-blue-700 rounded-lg p-2 text-xs min-w-48">
            <div className="text-blue-400 font-bold mb-1">⛴️ Vessel Status</div>
            
            <div className="flex items-center justify-between mb-1">
              <span className="text-gray-400">Cargo:</span>
              <span className={`font-bold ${cargoCount >= maxCargo ? 'text-red-400' : 'text-white'}`}>
                {cargoCount}/{maxCargo}
              </span>
            </div>
            
            <div className="flex items-center justify-between mb-1">
              <span className="text-gray-400">Currency:</span>
              <span className="text-yellow-400 font-bold">⚙️ {currency}</span>
            </div>
            
            {(isMoving || isCollecting) && (
              <div className="mt-2 pt-2 border-t border-gray-700">
                {isMoving && getTravelTimeRemaining() && (
                  <div className="text-blue-300">
                    ⛵ Sailing... {getTravelTimeRemaining()}s
                  </div>
                )}
                {isCollecting && getCollectionTimeRemaining() && (
                  <div className="text-green-300">
                    🔧 Collecting... {getCollectionTimeRemaining()}s
                  </div>
                )}
              </div>
            )}
            
            {activePowerUps.length > 0 && (
              <div className="flex gap-1 flex-wrap mt-2 pt-2 border-t border-gray-700">
                {activePowerUps.map((powerUp) => (
                  <span
                    key={powerUp.type}
                    className="bg-green-900/40 border border-green-500/50 rounded px-1.5 py-0.5 text-xs"
                    title={powerUpNames[powerUp.type]}
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
