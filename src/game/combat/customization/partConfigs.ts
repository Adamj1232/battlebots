import { AbilityInfo } from '../types';
import { RobotPart, PartCombination } from './RobotCustomization';

export const ROBOT_PARTS: RobotPart[] = [
  // Autobot Parts
  {
    id: 'autobot_head_1',
    name: 'Optimus Prime Helmet',
    type: 'head',
    faction: 'autobot',
    stats: {
      health: 20,
      defense: 5,
      specialDefense: 3
    },
    abilities: ['matrixVision'],
    visualEffects: {
      damage: ['head_damage_1', 'head_damage_2'],
      abilities: ['matrix_glow']
    }
  },
  {
    id: 'autobot_torso_1',
    name: 'Matrix Core',
    type: 'torso',
    faction: 'autobot',
    stats: {
      health: 40,
      defense: 8,
      energy: 30
    },
    abilities: ['matrixCharge'],
    visualEffects: {
      damage: ['torso_damage_1', 'torso_damage_2'],
      abilities: ['matrix_pulse']
    }
  },
  {
    id: 'autobot_arms_1',
    name: 'Ion Cannon Arms',
    type: 'arms',
    faction: 'autobot',
    stats: {
      attack: 15,
      specialAttack: 10,
      energy: 20
    },
    abilities: ['ionBlast'],
    visualEffects: {
      damage: ['arms_damage_1', 'arms_damage_2'],
      abilities: ['ion_glow']
    }
  },
  {
    id: 'autobot_legs_1',
    name: 'Speed Boosters',
    type: 'legs',
    faction: 'autobot',
    stats: {
      speed: 8,
      energy: 15
    },
    abilities: ['speedBoost'],
    visualEffects: {
      damage: ['legs_damage_1', 'legs_damage_2'],
      abilities: ['speed_trail']
    }
  },
  // Decepticon Parts
  {
    id: 'decepticon_head_1',
    name: 'Megatron Helmet',
    type: 'head',
    faction: 'decepticon',
    stats: {
      health: 25,
      defense: 6,
      specialDefense: 4
    },
    abilities: ['darkVision'],
    visualEffects: {
      damage: ['head_damage_1', 'head_damage_2'],
      abilities: ['dark_glow']
    }
  },
  {
    id: 'decepticon_torso_1',
    name: 'Dark Energon Core',
    type: 'torso',
    faction: 'decepticon',
    stats: {
      health: 45,
      defense: 10,
      energy: 35
    },
    abilities: ['darkCharge'],
    visualEffects: {
      damage: ['torso_damage_1', 'torso_damage_2'],
      abilities: ['dark_pulse']
    }
  }
];

export const PART_COMBINATIONS: PartCombination[] = [
  // Autobot Combinations
  {
    parts: ['autobot_head_1', 'autobot_torso_1'],
    specialAbility: {
      id: 'matrixMastery',
      name: 'Matrix Mastery',
      description: 'Channel the power of the Matrix for a devastating attack',
      damage: 50,
      damageType: 'special',
      energyCost: 40,
      cooldown: 15000,
      range: 10,
      type: 'attack',
      effects: [],
      visualEffect: 'matrix_burst',
      soundEffect: 'matrix_sound',
      targetType: 'enemy',
      isChildFriendly: true,
      warningDuration: 1000
    },
    visualEffect: 'matrix_combination'
  },
  {
    parts: ['autobot_arms_1', 'autobot_legs_1'],
    specialAbility: {
      id: 'ionRush',
      name: 'Ion Rush',
      description: 'Charge at high speed while firing ion blasts',
      damage: 30,
      damageType: 'physical',
      energyCost: 35,
      cooldown: 12000,
      range: 8,
      type: 'attack',
      effects: [
        {
          type: 'stun',
          duration: 2,
          intensity: 0.5,
          source: 'ionRush'
        }
      ],
      visualEffect: 'ion_rush',
      soundEffect: 'ion_sound',
      targetType: 'enemy',
      isChildFriendly: true,
      warningDuration: 1000
    },
    visualEffect: 'ion_combination'
  },
  // Decepticon Combinations
  {
    parts: ['decepticon_head_1', 'decepticon_torso_1'],
    specialAbility: {
      id: 'darkMastery',
      name: 'Dark Mastery',
      description: 'Unleash the power of Dark Energon',
      damage: 55,
      damageType: 'special',
      energyCost: 45,
      cooldown: 18000,
      range: 12,
      type: 'attack',
      effects: [
        {
          type: 'burn',
          duration: 3,
          intensity: 0.7,
          source: 'darkMastery'
        }
      ],
      visualEffect: 'dark_burst',
      soundEffect: 'dark_sound',
      targetType: 'enemy',
      isChildFriendly: true,
      warningDuration: 1000
    },
    visualEffect: 'dark_combination'
  }
];

// Strategic advantages for different part combinations
export const STRATEGIC_ADVANTAGES = {
  // Autobot Advantages
  matrixMastery: {
    name: 'Matrix Mastery',
    description: 'Combining the Matrix Core with Optimus Prime\'s Helmet grants enhanced special attack capabilities',
    benefits: [
      'Increased special attack damage',
      'Better energy efficiency',
      'Unique visual effects'
    ]
  },
  ionRush: {
    name: 'Ion Rush',
    description: 'The combination of Ion Cannon Arms and Speed Boosters creates a devastating rush attack',
    benefits: [
      'High mobility',
      'Area damage potential',
      'Stun effect on hit'
    ]
  },
  // Decepticon Advantages
  darkMastery: {
    name: 'Dark Mastery',
    description: 'The Dark Energon Core combined with Megatron\'s Helmet unleashes powerful dark energy attacks',
    benefits: [
      'High damage output',
      'Burn effect on targets',
      'Increased range'
    ]
  }
}; 