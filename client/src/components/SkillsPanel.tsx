import { useSkillsStore } from "@/lib/stores/useSkillsStore";
import { useState } from "react";

export function SkillsPanel() {
  const [isExpanded, setIsExpanded] = useState(false);
  const skills = useSkillsStore((state) => state.skills);
  const getXpForLevel = useSkillsStore((state) => state.getXpForLevel);
  const getXpToNextLevel = useSkillsStore((state) => state.getXpToNextLevel);
  const unlocks = useSkillsStore((state) => state.unlocks);

  const skillsArray = Object.values(skills);

  const getSkillProgress = (skillType: "sailing" | "salvaging" | "combat" | "exploration") => {
    const skill = skills[skillType];
    const currentLevelXp = getXpForLevel(skill.level);
    const nextLevelXp = getXpForLevel(skill.level + 1);
    const xpInLevel = skill.xp - currentLevelXp;
    const xpNeeded = nextLevelXp - currentLevelXp;
    return (xpInLevel / xpNeeded) * 100;
  };

  const getRecentUnlocks = (skillType: "sailing" | "salvaging" | "combat" | "exploration") => {
    return unlocks.filter(u => u.skillType === skillType && u.unlocked);
  };

  return (
    <div className="bg-stone-800 border-4 border-stone-950 rounded shadow-2xl" style={{ boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.5), 0 4px 8px rgba(0,0,0,0.8)', minWidth: '240px' }}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-2 py-1.5 flex items-center justify-between hover:bg-stone-700/50 transition-colors border-b-2 border-stone-950 bg-gradient-to-b from-amber-900/20 to-transparent"
      >
        <div className="flex items-center gap-2">
          <span className="text-base">📊</span>
          <span className="text-amber-200 font-bold text-sm tracking-wide" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}>
            Skills
          </span>
        </div>
        <span className="text-xs text-stone-400">{isExpanded ? "▼" : "▶"}</span>
      </button>

      {isExpanded && (
        <div className="px-2 pb-2 pt-2 space-y-2">
          {skillsArray.map((skill) => {
            const progress = getSkillProgress(skill.type);
            const xpToNext = getXpToNextLevel(skill.type);
            const recentUnlocks = getRecentUnlocks(skill.type);
            
            return (
              <div key={skill.type} className="bg-stone-900/50 rounded px-2 py-2 border border-stone-950/50 space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-base">{skill.icon}</span>
                    <span className={`text-xs font-bold ${skill.color}`}>{skill.name}</span>
                  </div>
                  <span className="text-amber-200 font-bold text-xs">Lv {skill.level}</span>
                </div>
                
                <div className="w-full h-2 bg-black/60 rounded border border-stone-950/50 overflow-hidden" style={{ boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.8)' }}>
                  <div
                    className="h-full bg-gradient-to-r from-amber-600 to-yellow-500 transition-all duration-300"
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  />
                </div>
                
                <div className="flex items-center justify-between text-xs">
                  <span className="text-stone-400">{skill.xp.toLocaleString()} XP</span>
                  <span className="text-stone-500">{xpToNext.toLocaleString()} to next</span>
                </div>
                
                {recentUnlocks.length > 0 && (
                  <div className="mt-1 pt-1 border-t border-stone-950/50">
                    <div className="text-xs text-green-400 font-bold mb-0.5">Recent Unlocks:</div>
                    {recentUnlocks.slice(-2).map((unlock, i) => (
                      <div key={i} className="text-xs text-stone-300 truncate">
                        • {unlock.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
