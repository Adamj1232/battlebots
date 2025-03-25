import React from 'react';
import { PhysicsTest } from '../components/game/PhysicsTest';

export const PhysicsTestPage: React.FC = () => {
  return (
    <div className="w-full h-screen bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-white mb-4">Physics Test</h1>
        <p className="text-gray-300 mb-8">
          This is a test scene to verify our physics implementation. You should see:
          <ul className="list-disc list-inside mt-2">
            <li>A ground plane</li>
            <li>A falling box</li>
            <li>A falling sphere</li>
            <li>A falling cylinder</li>
          </ul>
          All objects should fall due to gravity and interact with the ground.
        </p>
        <div className="w-full h-[600px] bg-gray-800 rounded-lg overflow-hidden">
          <PhysicsTest />
        </div>
      </div>
    </div>
  );
}; 