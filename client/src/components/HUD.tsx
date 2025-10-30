import { useFightSimulator } from "@/lib/stores/useFightSimulator";
import { useAudio } from "@/lib/stores/useAudio";

export function HUD() {
  const phase = useFightSimulator((state) => state.phase);
  const player = useFightSimulator((state) => state.player);
  const enemies = useFightSimulator((state) => state.enemies);
  const stats = useFightSimulator((state) => state.stats);
  const currentTurn = useFightSimulator((state) => state.currentTurn);
  const isPlayerTurn = useFightSimulator((state) => state.isPlayerTurn);
  const npcThinkingDelay = useFightSimulator((state) => state.npcThinkingDelay);
  const start = useFightSimulator((state) => state.start);
  const restart = useFightSimulator((state) => state.restart);
  const isMuted = useAudio((state) => state.isMuted);
  const toggleMute = useAudio((state) => state.toggleMute);
  
  const healthPercent = (player.health / player.maxHealth) * 100;
  const energyPercent = (player.energy / player.maxEnergy) * 100;
  
  return (
    <>
      {phase === "ready" && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-10">
          <div className="bg-gray-900 border-2 border-gray-700 rounded-lg p-8 max-w-md text-center">
            <h1 className="text-4xl font-bold text-white mb-4">Fight Simulator</h1>
            <p className="text-gray-300 mb-6">
              Tactical turn-based combat on an octagonal grid. Eliminate all enemies to win!
            </p>
            
            <div className="bg-gray-800 p-4 rounded mb-6 text-left text-sm">
              <h3 className="text-white font-bold mb-2">Controls:</h3>
              <ul className="text-gray-300 space-y-1">
                <li>• Click tiles to move (costs 10 energy)</li>
                <li>• Click enemies to attack (costs 20 energy)</li>
                <li>• Move range: 2 tiles</li>
                <li>• Attack range: 3 tiles</li>
                <li>• Take turns with NPC opponents</li>
              </ul>
            </div>
            
            <button
              onClick={start}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg text-xl transition-colors"
            >
              Start Game
            </button>
          </div>
        </div>
      )}
      
      {phase === "ended" && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-10">
          <div className="bg-gray-900 border-2 border-gray-700 rounded-lg p-8 max-w-md text-center">
            <h1 className="text-4xl font-bold text-white mb-4">
              {player.health > 0 ? "Victory!" : "Defeated"}
            </h1>
            
            <div className="bg-gray-800 p-6 rounded mb-6">
              <h3 className="text-white font-bold mb-4 text-xl">Game Statistics</h3>
              <div className="grid grid-cols-2 gap-4 text-left">
                <div>
                  <p className="text-gray-400 text-sm">Eliminations</p>
                  <p className="text-white text-2xl font-bold">{stats.eliminations}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Turns Survived</p>
                  <p className="text-white text-2xl font-bold">{stats.turnsSurvived}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Damage Dealt</p>
                  <p className="text-white text-2xl font-bold">{stats.damageDealt}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Damage Taken</p>
                  <p className="text-white text-2xl font-bold">{stats.damageTaken}</p>
                </div>
              </div>
            </div>
            
            <button
              onClick={restart}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg text-xl transition-colors"
            >
              Play Again
            </button>
          </div>
        </div>
      )}
      
      {phase === "playing" && (
        <>
          <div className="absolute top-4 left-4 bg-gray-900/90 border border-gray-700 rounded-lg p-4 min-w-64">
            <h2 className="text-white font-bold mb-3 text-lg">Player Status</h2>
            
            <div className="mb-3">
              <div className="flex justify-between text-xs text-gray-300 mb-1">
                <span>Health</span>
                <span>{player.health}/{player.maxHealth}</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                <div
                  className={`h-full transition-all ${
                    healthPercent > 50 ? "bg-green-500" : healthPercent > 25 ? "bg-yellow-500" : "bg-red-500"
                  }`}
                  style={{ width: `${healthPercent}%` }}
                />
              </div>
            </div>
            
            <div className="mb-3">
              <div className="flex justify-between text-xs text-gray-300 mb-1">
                <span>Energy</span>
                <span>{player.energy}/{player.maxEnergy}</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                <div
                  className="h-full bg-blue-500 transition-all"
                  style={{ width: `${energyPercent}%` }}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-gray-800 rounded p-2">
                <p className="text-xs text-gray-400">Move CD</p>
                <p className={`text-lg font-bold ${player.moveCooldown > 0 ? "text-red-400" : "text-green-400"}`}>
                  {player.moveCooldown > 0 ? `${player.moveCooldown}t` : "Ready"}
                </p>
              </div>
              <div className="bg-gray-800 rounded p-2">
                <p className="text-xs text-gray-400">Attack CD</p>
                <p className={`text-lg font-bold ${player.attackCooldown > 0 ? "text-red-400" : "text-green-400"}`}>
                  {player.attackCooldown > 0 ? `${player.attackCooldown}t` : "Ready"}
                </p>
              </div>
            </div>
          </div>
          
          <div className="absolute top-4 right-4 bg-gray-900/90 border border-gray-700 rounded-lg p-4 min-w-64">
            <h2 className="text-white font-bold mb-3 text-lg">Game Stats</h2>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-gray-400 text-xs">Turn</p>
                <p className="text-white text-xl font-bold">{currentTurn}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs">Enemies Left</p>
                <p className="text-white text-xl font-bold">{enemies.length}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs">Eliminations</p>
                <p className="text-white text-xl font-bold">{stats.eliminations}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs">Damage Dealt</p>
                <p className="text-white text-xl font-bold">{stats.damageDealt}</p>
              </div>
            </div>
          </div>
          
          <div className="absolute bottom-4 left-4">
            <button
              onClick={toggleMute}
              className="bg-gray-900/90 hover:bg-gray-800/90 border border-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              {isMuted ? "🔇 Unmute" : "🔊 Mute"}
            </button>
          </div>
          
          <div className={`absolute bottom-4 right-4 border-2 rounded-lg p-4 min-w-48 text-center ${
            isPlayerTurn ? "bg-green-900/90 border-green-500" : "bg-red-900/90 border-red-500"
          }`}>
            <p className="text-white font-bold text-lg">
              {isPlayerTurn ? "Your Turn" : "NPC Turn"}
            </p>
            {!isPlayerTurn && (
              <p className="text-gray-300 text-xs mt-1">
                Thinking... ({Math.round(npcThinkingDelay / 1000)}s)
              </p>
            )}
          </div>
        </>
      )}
    </>
  );
}
