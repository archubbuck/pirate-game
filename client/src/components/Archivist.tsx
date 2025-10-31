import { useGameStore } from "@/lib/stores/useGameStore";
import { X, MapPin, Lock, Unlock } from "lucide-react";

export function Archivist() {
  const isArchivistOpen = useGameStore((state) => state.isArchivistOpen);
  const toggleArchivist = useGameStore((state) => state.toggleArchivist);
  const artifacts = useGameStore((state) => state.artifacts);
  const currency = useGameStore((state) => state.currency);
  const purchaseArtifactClue = useGameStore((state) => state.purchaseArtifactClue);
  
  if (!isArchivistOpen) return null;
  
  const undiscoveredArtifacts = artifacts.filter(a => !a.isCollected);
  const clueCost = 25;
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border-2 border-cyan-500 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="bg-cyan-900/30 border-b border-cyan-500 p-4 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-cyan-300">The Archivist</h2>
            <p className="text-cyan-400 text-sm">Keeper of Lost Knowledge</p>
          </div>
          <button
            onClick={toggleArchivist}
            className="text-cyan-300 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>
        
        <div className="overflow-y-auto p-4 flex-1">
          <div className="bg-gray-800 border border-cyan-600 rounded-lg p-4 mb-4">
            <p className="text-cyan-200 text-sm italic">
              "I preserve what remains of the Old World. These artifacts hold stories of what came before the floods. 
              For a modest fee, I can share what I know about their locations..."
            </p>
          </div>
          
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 mb-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Your Currency:</span>
              <span className="text-cyan-300 font-bold text-lg">{currency}</span>
            </div>
          </div>
          
          {undiscoveredArtifacts.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Lock size={48} className="mx-auto mb-4 opacity-50" />
              <p>You've discovered all the artifacts!</p>
              <p className="text-sm mt-2">The secrets of the Old World are yours.</p>
            </div>
          ) : (
            <div className="space-y-3">
              <h3 className="text-cyan-300 font-bold mb-2">Artifact Locations ({clueCost} currency each)</h3>
              {undiscoveredArtifacts.map((artifact) => {
                const canAfford = currency >= clueCost;
                const hasClue = artifact.clueRevealed;
                
                return (
                  <div
                    key={artifact.id}
                    className="bg-gray-800 border border-gray-700 rounded-lg p-4"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h4 className="text-cyan-200 font-bold">{artifact.name}</h4>
                        <p className="text-sm text-gray-400 mt-1">{artifact.description}</p>
                        <div className="flex gap-2 mt-2">
                          <span className="text-xs px-2 py-1 bg-gray-700 rounded text-gray-300">
                            {artifact.category}
                          </span>
                          <span className={`text-xs px-2 py-1 rounded ${
                            artifact.rarity === "common" ? "bg-green-900 text-green-300" :
                            artifact.rarity === "uncommon" ? "bg-blue-900 text-blue-300" :
                            "bg-purple-900 text-purple-300"
                          }`}>
                            {artifact.rarity}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {hasClue ? (
                      <div className="flex items-center gap-2 text-green-400 mt-3">
                        <Unlock size={16} />
                        <span className="text-sm">Location revealed on map</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => purchaseArtifactClue(artifact.id)}
                        disabled={!canAfford}
                        className={`w-full mt-3 px-4 py-2 rounded flex items-center justify-center gap-2 transition-colors ${
                          canAfford
                            ? "bg-cyan-600 hover:bg-cyan-500 text-white"
                            : "bg-gray-700 text-gray-500 cursor-not-allowed"
                        }`}
                      >
                        <MapPin size={16} />
                        <span>Purchase Location Clue ({clueCost})</span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
