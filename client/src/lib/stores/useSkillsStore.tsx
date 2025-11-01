import { create } from "zustand";

export type SkillType = "sailing" | "salvaging" | "combat" | "exploration";

export interface Skill {
  type: SkillType;
  name: string;
  icon: string;
  level: number;
  xp: number;
  color: string;
}

export interface SkillUnlock {
  skillType: SkillType;
  level: number;
  name: string;
  description: string;
  unlocked: boolean;
}

interface SkillsState {
  skills: Record<SkillType, Skill>;
  unlocks: SkillUnlock[];
  
  getXpForLevel: (level: number) => number;
  getLevelFromXp: (xp: number) => number;
  getXpToNextLevel: (skillType: SkillType) => number;
  addXp: (skillType: SkillType, amount: number) => void;
  getSkillLevel: (skillType: SkillType) => number;
  hasUnlock: (skillType: SkillType, level: number) => boolean;
  checkUnlocks: () => void;
}

const XP_TABLE: number[] = [];
for (let level = 1; level <= 99; level++) {
  if (level === 1) {
    XP_TABLE[level] = 0;
  } else {
    const base = Math.floor(level + 300 * Math.pow(2, level / 7));
    XP_TABLE[level] = Math.floor(XP_TABLE[level - 1] + base / 4);
  }
}

const SKILL_UNLOCKS: SkillUnlock[] = [
  { skillType: "sailing", level: 5, name: "Swift Currents", description: "+10% sailing speed", unlocked: false },
  { skillType: "sailing", level: 15, name: "Auto-Pilot Basic", description: "Unlock basic auto-pilot features", unlocked: false },
  { skillType: "sailing", level: 25, name: "Storm Navigator", description: "Navigate dangerous waters safely", unlocked: false },
  { skillType: "sailing", level: 40, name: "Master Navigator", description: "+25% sailing speed", unlocked: false },
  
  { skillType: "salvaging", level: 5, name: "Efficient Salvage", description: "Collect resources 10% faster", unlocked: false },
  { skillType: "salvaging", level: 10, name: "Resource Detection", description: "See nearby resources on minimap", unlocked: false },
  { skillType: "salvaging", level: 20, name: "Advanced Salvage", description: "Collect resources 25% faster", unlocked: false },
  { skillType: "salvaging", level: 35, name: "Master Salvager", description: "Chance for double resources", unlocked: false },
  
  { skillType: "combat", level: 5, name: "Combat Basics", description: "Deal 10% more damage", unlocked: false },
  { skillType: "combat", level: 15, name: "Tactical Advantage", description: "Reduce combat time by 15%", unlocked: false },
  { skillType: "combat", level: 30, name: "Battle Hardened", description: "Crew less likely to be poached", unlocked: false },
  { skillType: "combat", level: 50, name: "Master Combatant", description: "Deal 50% more damage", unlocked: false },
  
  { skillType: "exploration", level: 5, name: "Eagle Eye", description: "Explore 1 tile further per move", unlocked: false },
  { skillType: "exploration", level: 10, name: "Treasure Hunter", description: "Better loot in coves", unlocked: false },
  { skillType: "exploration", level: 20, name: "Pathfinder", description: "Reveal cove locations on map", unlocked: false },
  { skillType: "exploration", level: 40, name: "Master Explorer", description: "Legendary loot in coves", unlocked: false },
];

export const useSkillsStore = create<SkillsState>((set, get) => ({
  skills: {
    sailing: {
      type: "sailing",
      name: "Sailing",
      icon: "⛵",
      level: 1,
      xp: 0,
      color: "text-blue-400",
    },
    salvaging: {
      type: "salvaging",
      name: "Salvaging",
      icon: "🔧",
      level: 1,
      xp: 0,
      color: "text-green-400",
    },
    combat: {
      type: "combat",
      name: "Combat",
      icon: "⚔️",
      level: 1,
      xp: 0,
      color: "text-red-400",
    },
    exploration: {
      type: "exploration",
      name: "Exploration",
      icon: "🗺️",
      level: 1,
      xp: 0,
      color: "text-purple-400",
    },
  },
  
  unlocks: SKILL_UNLOCKS,
  
  getXpForLevel: (level: number) => {
    if (level < 1) return 0;
    if (level > 99) return XP_TABLE[99];
    return XP_TABLE[level];
  },
  
  getLevelFromXp: (xp: number) => {
    for (let level = 99; level >= 1; level--) {
      if (xp >= XP_TABLE[level]) {
        return level;
      }
    }
    return 1;
  },
  
  getXpToNextLevel: (skillType: SkillType) => {
    const skill = get().skills[skillType];
    const currentLevelXp = get().getXpForLevel(skill.level);
    const nextLevelXp = get().getXpForLevel(skill.level + 1);
    return nextLevelXp - skill.xp;
  },
  
  addXp: (skillType: SkillType, amount: number) => {
    set(state => {
      const skill = state.skills[skillType];
      const newXp = skill.xp + amount;
      const newLevel = state.getLevelFromXp(newXp);
      const leveledUp = newLevel > skill.level;
      
      if (leveledUp) {
        console.log(`${skill.name} leveled up! ${skill.level} → ${newLevel}`);
      }
      
      return {
        skills: {
          ...state.skills,
          [skillType]: {
            ...skill,
            xp: newXp,
            level: newLevel,
          },
        },
      };
    });
    
    get().checkUnlocks();
  },
  
  getSkillLevel: (skillType: SkillType) => {
    return get().skills[skillType].level;
  },
  
  hasUnlock: (skillType: SkillType, level: number) => {
    const skill = get().skills[skillType];
    return skill.level >= level;
  },
  
  checkUnlocks: () => {
    set(state => {
      const updatedUnlocks = state.unlocks.map(unlock => {
        const skillLevel = state.skills[unlock.skillType].level;
        if (!unlock.unlocked && skillLevel >= unlock.level) {
          console.log(`🎉 Unlocked: ${unlock.name} - ${unlock.description}`);
          return { ...unlock, unlocked: true };
        }
        return unlock;
      });
      
      return { unlocks: updatedUnlocks };
    });
  },
}));
