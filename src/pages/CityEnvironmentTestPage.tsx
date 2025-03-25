import React, { useState } from 'react';
import { CityEnvironmentTest } from '../components/game/CityEnvironmentTest';
import { CityZone } from '../game/world/CityEnvironment';

export const CityEnvironmentTestPage: React.FC = () => {
  const [currentZone, setCurrentZone] = useState<CityZone>(CityZone.DOWNTOWN);

  const handleZoneChange = (zone: CityZone) => {
    setCurrentZone(zone);
  };

  return (
    <div className="w-full h-screen bg-gray-900">
      <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white p-4 rounded">
        <h2 className="text-xl font-bold mb-4">City Environment Test</h2>
        <div className="grid grid-cols-2 gap-2 mb-4">
          {Object.values(CityZone).map((zone) => (
            <button
              key={zone}
              onClick={() => handleZoneChange(zone)}
              className={`px-4 py-2 rounded ${
                currentZone === zone
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {zone}
            </button>
          ))}
        </div>
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2">Controls:</h3>
          <ul className="list-disc list-inside">
            <li>WASD / Arrow Keys - Move</li>
            <li>Space - Jump</li>
            <li>T - Transform</li>
            <li>Mouse - Look around</li>
          </ul>
        </div>
      </div>
      <div className="w-full h-full">
        <CityEnvironmentTest currentZone={currentZone} />
      </div>
    </div>
  );
}; 