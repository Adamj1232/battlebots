import { Vector3, Box3 } from 'three';
import { ArenaZone, ArenaHazard, DestructibleObject, SpectatorNPC, ArenaAdvantage } from './BattleArenaManager';

// Example arena configurations
export const ARENA_CONFIGS: Record<string, ArenaZone> = {
  // Urban Arena - City Square
  citySquare: {
    id: 'city_square',
    name: 'City Square Arena',
    type: 'urban',
    bounds: new Box3(
      new Vector3(-50, 0, -50),
      new Vector3(50, 20, 50)
    ),
    hazards: [
      {
        id: 'hazard_1',
        type: 'electricity',
        position: new Vector3(0, 0, 0),
        radius: 8,
        damage: 5,
        duration: 10,
        isActive: true
      }
    ],
    destructibles: [
      {
        id: 'dest_1',
        type: 'barrier',
        position: new Vector3(10, 0, 0),
        health: 100,
        maxHealth: 100,
        isDestroyed: false,
        debris: ['barrier_debris_1', 'barrier_debris_2']
      },
      {
        id: 'dest_2',
        type: 'cover',
        position: new Vector3(-10, 0, 0),
        health: 80,
        maxHealth: 80,
        isDestroyed: false,
        debris: ['cover_debris_1', 'cover_debris_2']
      }
    ],
    spectators: [
      {
        id: 'spectator_1',
        position: new Vector3(30, 5, 0),
        type: 'civilian',
        reactions: {
          onBattleStart: 'excited_cheer',
          onBattleEnd: 'applause',
          onSpecialMove: 'amazed_reaction'
        }
      },
      {
        id: 'spectator_2',
        position: new Vector3(-30, 5, 0),
        type: 'security',
        reactions: {
          onBattleStart: 'alert_standby',
          onBattleEnd: 'relief',
          onSpecialMove: 'caution'
        }
      }
    ],
    advantages: [
      {
        id: 'advantage_1',
        type: 'healing',
        position: new Vector3(0, 0, 10),
        radius: 5,
        effect: {
          type: 'heal',
          value: 20,
          duration: 5
        },
        isActive: true,
        respawnTime: 30
      },
      {
        id: 'advantage_2',
        type: 'energy',
        position: new Vector3(0, 0, -10),
        radius: 5,
        effect: {
          type: 'energy_boost',
          value: 30,
          duration: 5
        },
        isActive: true,
        respawnTime: 30
      }
    ]
  },

  // Industrial Arena - Factory
  factory: {
    id: 'factory',
    name: 'Factory Arena',
    type: 'industrial',
    bounds: new Box3(
      new Vector3(-40, 0, -40),
      new Vector3(40, 30, 40)
    ),
    hazards: [
      {
        id: 'hazard_1',
        type: 'fire',
        position: new Vector3(15, 0, 0),
        radius: 6,
        damage: 8,
        duration: 15,
        isActive: true
      },
      {
        id: 'hazard_2',
        type: 'acid',
        position: new Vector3(-15, 0, 0),
        radius: 5,
        damage: 10,
        duration: 12,
        isActive: true
      }
    ],
    destructibles: [
      {
        id: 'dest_1',
        type: 'wall',
        position: new Vector3(0, 0, 15),
        health: 150,
        maxHealth: 150,
        isDestroyed: false,
        debris: ['wall_debris_1', 'wall_debris_2']
      },
      {
        id: 'dest_2',
        type: 'platform',
        position: new Vector3(0, 5, 0),
        health: 120,
        maxHealth: 120,
        isDestroyed: false,
        debris: ['platform_debris_1', 'platform_debris_2']
      }
    ],
    spectators: [
      {
        id: 'spectator_1',
        position: new Vector3(25, 10, 0),
        type: 'reporter',
        reactions: {
          onBattleStart: 'start_recording',
          onBattleEnd: 'stop_recording',
          onSpecialMove: 'excited_commentary'
        }
      }
    ],
    advantages: [
      {
        id: 'advantage_1',
        type: 'speed',
        position: new Vector3(10, 0, 10),
        radius: 4,
        effect: {
          type: 'speed_boost',
          value: 1.5,
          duration: 8
        },
        isActive: true,
        respawnTime: 30
      },
      {
        id: 'advantage_2',
        type: 'defense',
        position: new Vector3(-10, 0, -10),
        radius: 4,
        effect: {
          type: 'defense_boost',
          value: 1.3,
          duration: 8
        },
        isActive: true,
        respawnTime: 30
      }
    ]
  },

  // Underground Arena - Subway Station
  subwayStation: {
    id: 'subway_station',
    name: 'Subway Station Arena',
    type: 'underground',
    bounds: new Box3(
      new Vector3(-30, -10, -30),
      new Vector3(30, 10, 30)
    ),
    hazards: [
      {
        id: 'hazard_1',
        type: 'radiation',
        position: new Vector3(0, -5, 0),
        radius: 7,
        damage: 7,
        duration: 12,
        isActive: true
      }
    ],
    destructibles: [
      {
        id: 'dest_1',
        type: 'barrier',
        position: new Vector3(8, 0, 0),
        health: 90,
        maxHealth: 90,
        isDestroyed: false,
        debris: ['barrier_debris_1', 'barrier_debris_2']
      },
      {
        id: 'dest_2',
        type: 'cover',
        position: new Vector3(-8, 0, 0),
        health: 70,
        maxHealth: 70,
        isDestroyed: false,
        debris: ['cover_debris_1', 'cover_debris_2']
      }
    ],
    spectators: [
      {
        id: 'spectator_1',
        position: new Vector3(20, 5, 0),
        type: 'civilian',
        reactions: {
          onBattleStart: 'nervous_watch',
          onBattleEnd: 'relief',
          onSpecialMove: 'surprise'
        }
      }
    ],
    advantages: [
      {
        id: 'advantage_1',
        type: 'energy',
        position: new Vector3(0, 0, 8),
        radius: 4,
        effect: {
          type: 'energy_boost',
          value: 25,
          duration: 6
        },
        isActive: true,
        respawnTime: 30
      }
    ]
  },

  // Space Station Arena
  spaceStation: {
    id: 'space_station',
    name: 'Space Station Arena',
    type: 'space',
    bounds: new Box3(
      new Vector3(-40, -40, -40),
      new Vector3(40, 40, 40)
    ),
    hazards: [
      {
        id: 'hazard_1',
        type: 'radiation',
        position: new Vector3(20, 0, 0),
        radius: 10,
        damage: 8,
        duration: 15,
        isActive: true
      },
      {
        id: 'hazard_2',
        type: 'electricity',
        position: new Vector3(-20, 0, 0),
        radius: 8,
        damage: 6,
        duration: 12,
        isActive: true
      }
    ],
    destructibles: [
      {
        id: 'dest_1',
        type: 'platform',
        position: new Vector3(0, 10, 0),
        health: 120,
        maxHealth: 120,
        isDestroyed: false,
        debris: ['platform_debris_1', 'platform_debris_2']
      },
      {
        id: 'dest_2',
        type: 'wall',
        position: new Vector3(0, 0, 15),
        health: 150,
        maxHealth: 150,
        isDestroyed: false,
        debris: ['wall_debris_1', 'wall_debris_2']
      }
    ],
    spectators: [
      {
        id: 'spectator_1',
        position: new Vector3(30, 20, 0),
        type: 'reporter',
        reactions: {
          onBattleStart: 'start_broadcast',
          onBattleEnd: 'end_broadcast',
          onSpecialMove: 'excited_commentary'
        }
      }
    ],
    advantages: [
      {
        id: 'advantage_1',
        type: 'energy',
        position: new Vector3(0, 15, 0),
        radius: 6,
        effect: {
          type: 'energy_boost',
          value: 40,
          duration: 8
        },
        isActive: true,
        respawnTime: 30
      }
    ]
  },

  // Ancient Temple Arena
  ancientTemple: {
    id: 'ancient_temple',
    name: 'Ancient Temple Arena',
    type: 'mystical',
    bounds: new Box3(
      new Vector3(-35, 0, -35),
      new Vector3(35, 30, 35)
    ),
    hazards: [
      {
        id: 'hazard_1',
        type: 'fire',
        position: new Vector3(0, 0, 15),
        radius: 7,
        damage: 7,
        duration: 10,
        isActive: true
      }
    ],
    destructibles: [
      {
        id: 'dest_1',
        type: 'pillar',
        position: new Vector3(10, 0, 10),
        health: 130,
        maxHealth: 130,
        isDestroyed: false,
        debris: ['pillar_debris_1', 'pillar_debris_2']
      },
      {
        id: 'dest_2',
        type: 'statue',
        position: new Vector3(-10, 0, -10),
        health: 100,
        maxHealth: 100,
        isDestroyed: false,
        debris: ['statue_debris_1', 'statue_debris_2']
      }
    ],
    spectators: [
      {
        id: 'spectator_1',
        position: new Vector3(25, 10, 0),
        type: 'civilian',
        reactions: {
          onBattleStart: 'awe',
          onBattleEnd: 'reverence',
          onSpecialMove: 'amazement'
        }
      }
    ],
    advantages: [
      {
        id: 'advantage_1',
        type: 'healing',
        position: new Vector3(0, 0, 0),
        radius: 5,
        effect: {
          type: 'heal',
          value: 25,
          duration: 6
        },
        isActive: true,
        respawnTime: 30
      }
    ]
  },

  // Cyberpunk City Arena
  cyberpunkCity: {
    id: 'cyberpunk_city',
    name: 'Cyberpunk City Arena',
    type: 'futuristic',
    bounds: new Box3(
      new Vector3(-45, 0, -45),
      new Vector3(45, 40, 45)
    ),
    hazards: [
      {
        id: 'hazard_1',
        type: 'electricity',
        position: new Vector3(20, 5, 0),
        radius: 8,
        damage: 6,
        duration: 12,
        isActive: true
      },
      {
        id: 'hazard_2',
        type: 'acid',
        position: new Vector3(-20, 0, 0),
        radius: 6,
        damage: 9,
        duration: 10,
        isActive: true
      }
    ],
    destructibles: [
      {
        id: 'dest_1',
        type: 'platform',
        position: new Vector3(0, 10, 0),
        health: 110,
        maxHealth: 110,
        isDestroyed: false,
        debris: ['platform_debris_1', 'platform_debris_2']
      },
      {
        id: 'dest_2',
        type: 'barrier',
        position: new Vector3(0, 0, 15),
        health: 90,
        maxHealth: 90,
        isDestroyed: false,
        debris: ['barrier_debris_1', 'barrier_debris_2']
      }
    ],
    spectators: [
      {
        id: 'spectator_1',
        position: new Vector3(35, 15, 0),
        type: 'civilian',
        reactions: {
          onBattleStart: 'excited_cheer',
          onBattleEnd: 'applause',
          onSpecialMove: 'amazed_reaction'
        }
      }
    ],
    advantages: [
      {
        id: 'advantage_1',
        type: 'speed',
        position: new Vector3(10, 5, 10),
        radius: 5,
        effect: {
          type: 'speed_boost',
          value: 1.8,
          duration: 7
        },
        isActive: true,
        respawnTime: 30
      }
    ]
  }
}; 