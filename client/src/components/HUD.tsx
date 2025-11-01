import { useGameStore } from "@/lib/stores/useGameStore";
import { useAudio } from "@/lib/stores/useAudio";
import { ResourcePanel } from "./ResourcePanel";
import { ActivityPanel } from "./ActivityPanel";
import { NotificationSystem } from "./NotificationSystem";
import { MiniMap } from "./MiniMap";
import { SkillsPanel } from "./SkillsPanel";

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
  const isMuted = useAudio((state) => state.isMuted);
  const toggleMute = useAudio ((state) => state.toggleMute);
  
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
          <NotificationSystem />
          
          <div className="absolute top-2 left-2 flex gap-2">
            <div className="flex flex-col gap-2 max-w-xs">
              <ActivityPanel />
              
              {activePowerUps.length > 0 && (
                <div className="bg-stone-800 border-4 border-stone-950 rounded p-2 shadow-2xl" style={{ boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.5), 0 4px 8px rgba(0,0,0,0.8)' }}>
                  <div className="text-green-400 font-bold text-xs mb-2">💪 Active Upgrades</div>
                  <div className="flex gap-1 flex-wrap">
                    {activePowerUps.map((powerUp) => (
                      <span
                        key={powerUp.type}
                        className="bg-green-900/40 border-2 border-green-700/50 rounded px-2 py-1 text-xs flex items-center gap-1"
                        title={powerUpNames[powerUp.type]}
                      >
                        <span>{powerUpIcons[powerUp.type]}</span>
                        <span className="text-green-200">{powerUpNames[powerUp.type]}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex flex-col gap-2">
              <SkillsPanel />
            </div>
          </div>
          
          <div className="absolute top-2 right-2">
            <MiniMap />
          </div>
          
          <div className="absolute bottom-2 right-2">
            <ResourcePanel />
          </div>
          
          <div className="absolute bottom-2 left-2 flex gap-1.5">
            <button
              onClick={toggleMute}
              className="bg-gray-900/95 backdrop-blur-md hover:bg-gray-800/95 border border-gray-700/50 text-white px-3 py-2 rounded-lg text-sm transition-all shadow-lg hover:shadow-xl"
              title={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? "🔇" : "🔊"}
            </button>
            <button
              onClick={toggleCameraFollow}
              className={`px-3 py-2 rounded-lg text-sm transition-all shadow-lg hover:shadow-xl backdrop-blur-md ${
                isCameraFollowing
                  ? "bg-cyan-900/95 hover:bg-cyan-800/95 border border-cyan-600/50 text-cyan-200"
                  : "bg-gray-900/95 hover:bg-gray-800/95 border border-gray-700/50 text-white"
              }`}
              title={isCameraFollowing ? "Camera following ship" : "Free camera (right-click drag to pan)"}
            >
              {isCameraFollowing ? "📍 Follow" : "🗺️ Free"}
            </button>
            <button
              onClick={restart}
              className="bg-gray-900/95 backdrop-blur-md hover:bg-gray-800/95 border border-gray-700/50 text-white px-3 py-2 rounded-lg text-sm transition-all shadow-lg hover:shadow-xl"
              title="Restart Game"
            >
              ↻
            </button>
          </div>
          
          <div className="absolute bottom-2 right-2 flex gap-1.5">
            <button
              onClick={toggleArtifactLog}
              className="bg-cyan-900/95 backdrop-blur-md hover:bg-cyan-800/95 border border-cyan-600/50 text-cyan-200 px-3 py-2 rounded-lg text-sm transition-all shadow-lg hover:shadow-xl flex items-center gap-1.5"
            >
              <span>📖</span>
              <span>Artifacts</span>
              <span className="bg-cyan-800/50 px-1.5 py-0.5 rounded text-xs">{collectedArtifacts}</span>
            </button>
            {archivistUnlocked && (
              <button
                onClick={toggleArchivist}
                className="bg-purple-900/95 backdrop-blur-md hover:bg-purple-800/95 border border-purple-600/50 text-purple-200 px-3 py-2 rounded-lg text-sm transition-all shadow-lg hover:shadow-xl"
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
