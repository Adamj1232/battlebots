import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  isUnlocked: boolean;
  progress?: number;
  maxProgress?: number;
}

interface CombatStats {
  battlesWon: number;
  battlesLost: number;
  totalDamageDealt: number;
  totalDamageTaken: number;
  criticalHits: number;
  abilitiesUsed: number;
  transformations: number;
  longestCombo: number;
}

interface AchievementsUIProps {
  achievements: Achievement[];
  stats: CombatStats;
  isVisible: boolean;
  onClose: () => void;
}

export const AchievementsUI: React.FC<AchievementsUIProps> = ({
  achievements,
  stats,
  isVisible,
  onClose
}) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.9 }}
            className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Achievements & Statistics</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Statistics Section */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-white mb-4">Combat Statistics</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-700 p-4 rounded-lg">
                  <p className="text-gray-400">Battles Won</p>
                  <p className="text-2xl font-bold text-green-400">{stats.battlesWon}</p>
                </div>
                <div className="bg-gray-700 p-4 rounded-lg">
                  <p className="text-gray-400">Battles Lost</p>
                  <p className="text-2xl font-bold text-red-400">{stats.battlesLost}</p>
                </div>
                <div className="bg-gray-700 p-4 rounded-lg">
                  <p className="text-gray-400">Damage Dealt</p>
                  <p className="text-2xl font-bold text-blue-400">{stats.totalDamageDealt}</p>
                </div>
                <div className="bg-gray-700 p-4 rounded-lg">
                  <p className="text-gray-400">Damage Taken</p>
                  <p className="text-2xl font-bold text-yellow-400">{stats.totalDamageTaken}</p>
                </div>
                <div className="bg-gray-700 p-4 rounded-lg">
                  <p className="text-gray-400">Critical Hits</p>
                  <p className="text-2xl font-bold text-purple-400">{stats.criticalHits}</p>
                </div>
                <div className="bg-gray-700 p-4 rounded-lg">
                  <p className="text-gray-400">Abilities Used</p>
                  <p className="text-2xl font-bold text-pink-400">{stats.abilitiesUsed}</p>
                </div>
              </div>
            </div>

            {/* Achievements Section */}
            <div>
              <h3 className="text-xl font-semibold text-white mb-4">Achievements</h3>
              <div className="space-y-4">
                {achievements.map(achievement => (
                  <motion.div
                    key={achievement.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`bg-gray-700 p-4 rounded-lg flex items-center space-x-4 ${
                      achievement.isUnlocked ? 'border-2 border-green-500' : 'opacity-50'
                    }`}
                  >
                    <div className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center">
                      <span className="text-2xl">{achievement.icon}</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-white">{achievement.title}</h4>
                      <p className="text-gray-400">{achievement.description}</p>
                      {achievement.progress !== undefined && achievement.maxProgress !== undefined && (
                        <div className="mt-2">
                          <div className="h-2 bg-gray-600 rounded-full">
                            <div
                              className="h-full bg-green-500 rounded-full transition-all duration-300"
                              style={{
                                width: `${(achievement.progress / achievement.maxProgress) * 100}%`
                              }}
                            />
                          </div>
                          <p className="text-sm text-gray-400 mt-1">
                            {achievement.progress} / {achievement.maxProgress}
                          </p>
                        </div>
                      )}
                    </div>
                    {achievement.isUnlocked && (
                      <div className="text-green-500">✓</div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}; 