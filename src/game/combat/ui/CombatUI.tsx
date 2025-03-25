import React, { useEffect, useState } from 'react';
import { CombatStats, AbilityInfo } from '../types';

interface CombatUIProps {
  playerId: string;
  stats: CombatStats;
  abilities: AbilityInfo[];
  onAbilitySelect: (abilityId: string) => void;
  currentForm: 'robot' | 'vehicle';
  isTransforming: boolean;
}

export const CombatUI: React.FC<CombatUIProps> = ({
  playerId,
  stats,
  abilities,
  onAbilitySelect,
  currentForm,
  isTransforming
}) => {
  const [cooldowns, setCooldowns] = useState<Record<string, number>>({});

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const newCooldowns = { ...cooldowns };
      let hasUpdates = false;

      Object.keys(cooldowns).forEach(id => {
        if (cooldowns[id] <= now) {
          delete newCooldowns[id];
          hasUpdates = true;
        }
      });

      if (hasUpdates) {
        setCooldowns(newCooldowns);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [cooldowns]);

  const healthPercentage = (stats.health / stats.maxHealth) * 100;
  const energyPercentage = (stats.energy / stats.maxEnergy) * 100;

  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 pointer-events-none">
      <div className="max-w-4xl mx-auto bg-gray-900/80 rounded-lg p-4 text-white pointer-events-auto">
        {/* Status Bars */}
        <div className="flex gap-4 mb-4">
          {/* Health Bar */}
          <div className="flex-1">
            <div className="h-4 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-red-500 transition-all duration-300"
                style={{ width: `${healthPercentage}%` }}
              />
            </div>
            <div className="text-sm mt-1">
              Health: {Math.ceil(stats.health)}/{stats.maxHealth}
            </div>
          </div>

          {/* Energy Bar */}
          <div className="flex-1">
            <div className="h-4 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 transition-all duration-300"
                style={{ width: `${energyPercentage}%` }}
              />
            </div>
            <div className="text-sm mt-1">
              Energy: {Math.ceil(stats.energy)}/{stats.maxEnergy}
            </div>
          </div>
        </div>

        {/* Form Indicator */}
        <div className="mb-4">
          <span className={`px-3 py-1 rounded ${
            currentForm === 'robot' ? 'bg-purple-600' : 'bg-yellow-600'
          }`}>
            {currentForm.toUpperCase()} FORM
            {isTransforming && ' (Transforming...)'}
          </span>
        </div>

        {/* Abilities */}
        <div className="grid grid-cols-4 gap-2">
          {abilities.map((ability, index) => {
            const isOnCooldown = cooldowns[ability.id] > Date.now();
            const cooldownRemaining = isOnCooldown
              ? Math.ceil((cooldowns[ability.id] - Date.now()) / 1000)
              : 0;

            return (
              <button
                key={ability.id}
                onClick={() => {
                  if (!isOnCooldown && stats.energy >= ability.energyCost) {
                    onAbilitySelect(ability.id);
                    setCooldowns(prev => ({
                      ...prev,
                      [ability.id]: Date.now() + ability.cooldown
                    }));
                  }
                }}
                disabled={isOnCooldown || stats.energy < ability.energyCost}
                className={`
                  relative p-3 rounded text-left
                  ${isOnCooldown || stats.energy < ability.energyCost
                    ? 'bg-gray-700 cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-700 cursor-pointer'}
                `}
              >
                <div className="text-sm font-bold">{ability.name}</div>
                <div className="text-xs opacity-75">
                  Energy: {ability.energyCost}
                </div>
                {isOnCooldown && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    {cooldownRemaining}s
                  </div>
                )}
                <div className="text-xs mt-1">
                  Press {index + 1} to use
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}; 