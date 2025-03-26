import { AbilityInfo, DamageType, StatusEffectType } from '../types';

// Base ability templates
const createDamageAbility = (
  id: string,
  name: string,
  damage: number,
  damageType: DamageType,
  energyCost: number,
  cooldown: number,
  range: number,
  description: string
): AbilityInfo => ({
  id,
  name,
  description,
  damage,
  damageType,
  energyCost,
  cooldown,
  range
});

const createStatusAbility = (
  id: string,
  name: string,
  effectType: StatusEffectType,
  strength: number,
  duration: number,
  energyCost: number,
  cooldown: number,
  range: number,
  description: string
): AbilityInfo => ({
  id,
  name,
  description,
  damage: 0,
  damageType: 'status',
  energyCost,
  cooldown,
  range,
  duration,
  effects: [{
    type: effectType,
    duration,
    strength,
    source: id
  }]
});

// Autobot Abilities
export const AutobotAbilities: Record<string, AbilityInfo> = {
  // Offensive Abilities
  energonBlast: createDamageAbility(
    'energonBlast',
    'Energon Blast',
    30,
    'energy',
    25,
    3000,
    10,
    'Fire a concentrated blast of energon at the target'
  ),

  matrixCharge: createDamageAbility(
    'matrixCharge',
    'Matrix Charge',
    45,
    'special',
    40,
    8000,
    5,
    'Channel the power of the Matrix for a powerful melee attack'
  ),

  // Support Abilities
  repairProtocol: {
    id: 'repairProtocol',
    name: 'Repair Protocol',
    description: 'Activate self-repair systems',
    energyCost: 30,
    cooldown: 15000,
    range: 0,
    damage: 0,
    damageType: 'status',
    effects: [{
      type: 'heal',
      duration: 5000,
      strength: 10,
      source: 'repairProtocol'
    }]
  },

  speedBoost: createStatusAbility(
    'speedBoost',
    'Turbo Boost',
    'speed_boost',
    1.5,
    5000,
    20,
    12000,
    0,
    'Temporarily increase movement speed'
  )
};

// Decepticon Abilities
export const DecepticonAbilities: Record<string, AbilityInfo> = {
  // Offensive Abilities
  darkEnergonStrike: createDamageAbility(
    'darkEnergonStrike',
    'Dark Energon Strike',
    35,
    'special',
    30,
    4000,
    8,
    'Strike with corrupted energon energy'
  ),

  nullRay: createDamageAbility(
    'nullRay',
    'Null Ray',
    25,
    'energy',
    20,
    5000,
    12,
    'Fire a beam that disrupts enemy systems'
  ),

  // Status Effect Abilities
  systemCorruption: createStatusAbility(
    'systemCorruption',
    'System Corruption',
    'slow',
    0.5,
    4000,
    35,
    10000,
    8,
    'Corrupt enemy systems to slow them down'
  ),

  terrorField: {
    id: 'terrorField',
    name: 'Terror Field',
    description: 'Create an area that weakens enemies',
    energyCost: 45,
    cooldown: 15000,
    range: 8,
    duration: 6000,
    damage: 0,
    damageType: 'status',
    effects: [
      {
        type: 'defense_boost',
        duration: 6000,
        strength: -0.3,
        source: 'terrorField'
      },
      {
        type: 'attack_boost',
        duration: 6000,
        strength: -0.2,
        source: 'terrorField'
      }
    ]
  }
};

// Vehicle Form Abilities
export const VehicleAbilities: Record<string, AbilityInfo> = {
  ramAttack: createDamageAbility(
    'ramAttack',
    'Ram Attack',
    40,
    'physical',
    30,
    6000,
    5,
    'Charge forward and ram into enemies'
  ),

  boostEngine: createStatusAbility(
    'boostEngine',
    'Boost Engine',
    'speed_boost',
    2.0,
    3000,
    25,
    8000,
    0,
    'Temporarily increase vehicle speed significantly'
  )
};

// Get abilities for a specific faction and form
export const getAbilities = (
  faction: 'autobot' | 'decepticon',
  form: 'robot' | 'vehicle'
): AbilityInfo[] => {
  const factionAbilities = faction === 'autobot' ? AutobotAbilities : DecepticonAbilities;
  
  // Base abilities from faction
  const abilities = [
    factionAbilities[Object.keys(factionAbilities)[0]],
    factionAbilities[Object.keys(factionAbilities)[1]]
  ];

  // Add form-specific ability
  if (form === 'vehicle') {
    abilities.push(VehicleAbilities.ramAttack);
  } else {
    // Add additional robot form ability
    abilities.push(
      faction === 'autobot'
        ? AutobotAbilities.repairProtocol
        : DecepticonAbilities.systemCorruption
    );
  }

  return abilities;
}; 