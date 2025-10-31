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
  const toggleArtifactLog = useGameStore((state) => state.toggleArtifactLog);
  const toggleArchivist = useGameStore((state) => state.toggleArchivist);
  const archivistUnlocked = useGameStore((state) => state.archivistUnlocked);
  const artifacts = useGameStore((state) => state.artifacts);
  const isCameraFollowing = useGameStore((state) => state.isCameraFollowing);
  const toggleCameraFollow = useGameStore((state) => state.toggleCameraFollow);
  const zoomLevel = useGameStore((state) => state.zoomLevel);
  const setZoomLevel = useGameStore((state) => state.setZoomLevel);
  const isMuted = useAudio((state) => state.isMuted);
  const toggleMute = useAudio((state) => state.toggleMute);
  
  const totalCollectibles = collectedCount + collectibles.length;
  const cargoCount = getCargoCount();
  const maxCargo = getMaxCargo();
  const collectedArtifacts = artifacts.filter(a => a.isCollected).length;
  
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
              onClick={toggleCameraFollow}
              className={`px-3 py-1 rounded text-sm transition-colors ${
                isCameraFollowing
                  ? "bg-cyan-900/90 hover:bg-cyan-800/90 border border-cyan-600 text-cyan-200"
                  : "bg-gray-900/90 hover:bg-gray-800/90 border border-gray-700 text-white"
              }`}
              title={isCameraFollowing ? "Camera following ship" : "Free camera (right-click drag to pan)"}
            >
              {isCameraFollowing ? "📍 Follow" : "🗺️ Free"}
            </button>
            <button
              onClick={restart}
              className="bg-gray-900/90 hover:bg-gray-800/90 border border-gray-700 text-white px-2 py-1 rounded text-sm transition-colors"
            >
              ↻
            </button>
          </div>
          
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col items-center gap-2">
            <div className="text-xs text-gray-400 font-mono bg-gray-900/70 px-2 py-1 rounded">
              {zoomLevel}%
            </div>
            <div className="relative">
              <input
                type="range"
                min="50"
                max="600"
                step="5"
                value={zoomLevel}
                onChange={(e) => setZoomLevel(Number(e.target.value))}
                className="h-48 w-3 appearance-none bg-gray-800/50 rounded-full cursor-pointer
                  [writing-mode:vertical-lr] direction-rtl
                  [&::-webkit-slider-thumb]:appearance-none
                  [&::-webkit-slider-thumb]:w-6
                  [&::-webkit-slider-thumb]:h-6
                  [&::-webkit-slider-thumb]:rounded-full
                  [&::-webkit-slider-thumb]:bg-cyan-500
                  [&::-webkit-slider-thumb]:border-2
                  [&::-webkit-slider-thumb]:border-cyan-300
                  [&::-webkit-slider-thumb]:cursor-pointer
                  [&::-webkit-slider-thumb]:shadow-lg
                  [&::-webkit-slider-thumb]:hover:bg-cyan-400
                  [&::-moz-range-thumb]:w-6
                  [&::-moz-range-thumb]:h-6
                  [&::-moz-range-thumb]:rounded-full
                  [&::-moz-range-thumb]:bg-cyan-500
                  [&::-moz-range-thumb]:border-2
                  [&::-moz-range-thumb]:border-cyan-300
                  [&::-moz-range-thumb]:cursor-pointer
                  [&::-moz-range-thumb]:shadow-lg
                  [&::-moz-range-thumb]:hover:bg-cyan-400"
                title="Zoom Level"
              />
              <div className="absolute left-1/2 -translate-x-1/2 top-0 h-full pointer-events-none">
                {Array.from({ length: Math.floor((600 - 50) / 25) + 1 }, (_, i) => 50 + i * 25).map((mark) => {
                  const percentage = ((mark - 50) / (600 - 50)) * 100;
                  return (
                    <div
                      key={mark}
                      className="absolute w-2 h-0.5 bg-gray-400/60 -left-1"
                      style={{ bottom: `${percentage}%` }}
                    />
                  );
                })}
              </div>
            </div>
            <div className="text-xs text-gray-500 font-mono">ZOOM</div>
          </div>
          
          <div className="absolute bottom-2 right-2 flex gap-1">
            <button
              onClick={toggleArtifactLog}
              className="bg-cyan-900/90 hover:bg-cyan-800/90 border border-cyan-600 text-cyan-200 px-3 py-1 rounded text-sm transition-colors flex items-center gap-1"
            >
              📖 Artifacts ({collectedArtifacts})
            </button>
            {archivistUnlocked && (
              <button
                onClick={toggleArchivist}
                className="bg-purple-900/90 hover:bg-purple-800/90 border border-purple-600 text-purple-200 px-3 py-1 rounded text-sm transition-colors"
              >
                🔮 Archivist
              </button>
            )}
          </div>
        </>
      )}
    </>
  );
}
