import { useGameStore } from "@/lib/stores/useGameStore";
import { X, BookOpen, Zap, Home, Wrench, User, Leaf } from "lucide-react";

const categoryIcons = {
  technology: Zap,
  culture: BookOpen,
  infrastructure: Home,
  personal: User,
  nature: Leaf,
};

const rarityColors = {
  common: "text-green-400 border-green-400",
  uncommon: "text-blue-400 border-blue-400",
  rare: "text-purple-400 border-purple-400",
};

export function ArtifactLog() {
  const isArtifactLogOpen = useGameStore((state) => state.isArtifactLogOpen);
  const toggleArtifactLog = useGameStore((state) => state.toggleArtifactLog);
  const artifacts = useGameStore((state) => state.artifacts);
  
  if (!isArtifactLogOpen) return null;
  
  const collectedArtifacts = artifacts.filter(a => a.isCollected);
  const totalArtifacts = artifacts.length;
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border-2 border-cyan-500 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="bg-cyan-900/30 border-b border-cyan-500 p-4 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-cyan-300">Artifact Archive</h2>
            <p className="text-cyan-400 text-sm">
              {collectedArtifacts.length} of {totalArtifacts} artifacts discovered
            </p>
          </div>
          <button
            onClick={toggleArtifactLog}
            className="text-cyan-300 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>
        
        <div className="overflow-y-auto p-4 flex-1">
          {collectedArtifacts.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <BookOpen size={48} className="mx-auto mb-4 opacity-50" />
              <p>No artifacts discovered yet.</p>
              <p className="text-sm mt-2">Explore the flooded world to find remnants of the Old World.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {collectedArtifacts.map((artifact) => {
                const Icon = categoryIcons[artifact.category];
                const rarityClass = rarityColors[artifact.rarity];
                
                return (
                  <div
                    key={artifact.id}
                    className={`bg-gray-800 border-2 ${rarityClass} rounded-lg p-4`}
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div className={`p-2 rounded ${rarityClass} bg-gray-700/50`}>
                        <Icon size={24} />
                      </div>
                      <div className="flex-1">
                        <h3 className={`text-lg font-bold ${rarityClass}`}>
                          {artifact.name}
                        </h3>
                        <div className="flex gap-2 mt-1">
                          <span className="text-xs px-2 py-1 bg-gray-700 rounded text-gray-300">
                            {artifact.category}
                          </span>
                          <span className={`text-xs px-2 py-1 rounded ${rarityClass} bg-gray-700/50`}>
                            {artifact.rarity}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-900/50 rounded p-3 border border-gray-700">
                      <p className="text-sm text-gray-300 italic mb-2">
                        {artifact.description}
                      </p>
                      <p className="text-sm text-cyan-200">
                        {artifact.lore}
                      </p>
                    </div>
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
