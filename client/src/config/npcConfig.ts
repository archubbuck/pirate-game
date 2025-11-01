export interface NPCDropTable {
  type: "timber" | "alloy" | "circuit" | "biofiber";
  minQuantity: number;
  maxQuantity: number;
  dropChance: number; // 0-1
}

export interface NPCStats {
  baseHealth: number;
  healthPerLevel: number;
  baseDamage?: number;
  damagePerLevel?: number;
  moveSpeed: number;
  aggroRange?: number;
  experienceReward: number;
}

export interface NPCConfig {
  id: string;
  name: string;
  label: string;
  description: string;
  stats: NPCStats;
  dropTable: NPCDropTable[];
  minLevel: number;
  maxLevel: number;
}

export const NPC_CONFIGS: Record<string, NPCConfig> = {
  raider_skiff: {
    id: "raider_skiff",
    name: "Raider Skiff",
    label: "Raider",
    description: "A small, fast raider vessel scavenging the flooded world. Hostile and aggressive.",
    stats: {
      baseHealth: 60,
      healthPerLevel: 15,
      baseDamage: 10,
      damagePerLevel: 3,
      moveSpeed: 0.6,
      aggroRange: 5,
      experienceReward: 40,
    },
    dropTable: [
      { type: "timber", minQuantity: 1, maxQuantity: 2, dropChance: 0.7 },
      { type: "alloy", minQuantity: 1, maxQuantity: 2, dropChance: 0.5 },
    ],
    minLevel: 1,
    maxLevel: 3,
  },
  
  scavenger_barge: {
    id: "scavenger_barge",
    name: "Scavenger Barge",
    label: "Scavenger",
    description: "A heavily-loaded salvage barge. Slow but carries valuable cargo.",
    stats: {
      baseHealth: 100,
      healthPerLevel: 25,
      baseDamage: 5,
      damagePerLevel: 2,
      moveSpeed: 0.3,
      aggroRange: 3,
      experienceReward: 60,
    },
    dropTable: [
      { type: "timber", minQuantity: 2, maxQuantity: 4, dropChance: 0.8 },
      { type: "alloy", minQuantity: 1, maxQuantity: 3, dropChance: 0.6 },
      { type: "circuit", minQuantity: 1, maxQuantity: 2, dropChance: 0.4 },
    ],
    minLevel: 2,
    maxLevel: 5,
  },
  
  pirate_corsair: {
    id: "pirate_corsair",
    name: "Pirate Corsair",
    label: "Pirate",
    description: "An armed pirate vessel hunting for easy prey. Dangerous and well-equipped.",
    stats: {
      baseHealth: 120,
      healthPerLevel: 30,
      baseDamage: 15,
      damagePerLevel: 5,
      moveSpeed: 0.5,
      aggroRange: 6,
      experienceReward: 80,
    },
    dropTable: [
      { type: "alloy", minQuantity: 2, maxQuantity: 4, dropChance: 0.9 },
      { type: "circuit", minQuantity: 1, maxQuantity: 3, dropChance: 0.7 },
      { type: "biofiber", minQuantity: 1, maxQuantity: 2, dropChance: 0.5 },
    ],
    minLevel: 3,
    maxLevel: 7,
  },
  
  mutant_leviathan: {
    id: "mutant_leviathan",
    name: "Mutant Leviathan",
    label: "Leviathan",
    description: "A massive mutated sea creature, twisted by the post-flood radiation. Extremely dangerous.",
    stats: {
      baseHealth: 200,
      healthPerLevel: 50,
      baseDamage: 25,
      damagePerLevel: 8,
      moveSpeed: 0.4,
      aggroRange: 8,
      experienceReward: 150,
    },
    dropTable: [
      { type: "biofiber", minQuantity: 3, maxQuantity: 6, dropChance: 1.0 },
      { type: "circuit", minQuantity: 2, maxQuantity: 4, dropChance: 0.8 },
      { type: "alloy", minQuantity: 2, maxQuantity: 3, dropChance: 0.6 },
    ],
    minLevel: 5,
    maxLevel: 10,
  },
};

export function calculateNPCHealth(npcId: string, level: number): number {
  const config = NPC_CONFIGS[npcId];
  if (!config) return 100;
  
  const clampedLevel = Math.max(config.minLevel, Math.min(level, config.maxLevel));
  return config.stats.baseHealth + (config.stats.healthPerLevel * (clampedLevel - 1));
}

export function calculateNPCDamage(npcId: string, level: number): number {
  const config = NPC_CONFIGS[npcId];
  if (!config || !config.stats.baseDamage || !config.stats.damagePerLevel) return 0;
  
  const clampedLevel = Math.max(config.minLevel, Math.min(level, config.maxLevel));
  return config.stats.baseDamage + (config.stats.damagePerLevel * (clampedLevel - 1));
}

export function generateLoot(npcId: string): { [key: string]: number } {
  const config = NPC_CONFIGS[npcId];
  if (!config) return {};
  
  const loot: { [key: string]: number } = {};
  
  config.dropTable.forEach(drop => {
    if (Math.random() < drop.dropChance) {
      const quantity = Math.floor(
        Math.random() * (drop.maxQuantity - drop.minQuantity + 1)
      ) + drop.minQuantity;
      loot[drop.type] = (loot[drop.type] || 0) + quantity;
    }
  });
  
  return loot;
}

export function getRandomNPCType(): string {
  const types = Object.keys(NPC_CONFIGS);
  return types[Math.floor(Math.random() * types.length)];
}

export function getRandomNPCLevel(npcId: string): number {
  const config = NPC_CONFIGS[npcId];
  if (!config) return 1;
  
  return Math.floor(
    Math.random() * (config.maxLevel - config.minLevel + 1)
  ) + config.minLevel;
}
