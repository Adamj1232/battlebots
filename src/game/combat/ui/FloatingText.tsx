import React, { useEffect, useState } from 'react';
import { Vector3 } from 'three';

interface FloatingTextProps {
  text: string;
  worldPosition: Vector3;
  type: 'damage' | 'heal' | 'status' | 'energy';
  duration?: number;
  onComplete?: () => void;
}

interface FloatingTextState {
  id: number;
  text: string;
  screenPosition: { x: number; y: number };
  type: 'damage' | 'heal' | 'status' | 'energy';
  startTime: number;
  duration: number;
}

export const FloatingTextManager: React.FC = () => {
  const [texts, setTexts] = useState<FloatingTextState[]>([]);
  let nextId = 0;

  const addFloatingText = (props: FloatingTextProps) => {
    const { text, worldPosition, type, duration = 1000, onComplete } = props;

    // Convert world position to screen position
    // This would need to be updated based on the camera's current view
    const screenPosition = worldToScreen(worldPosition);

    setTexts(prev => [...prev, {
      id: nextId++,
      text,
      screenPosition,
      type,
      startTime: Date.now(),
      duration
    }]);

    setTimeout(() => {
      setTexts(prev => prev.filter(t => t.id !== nextId - 1));
      onComplete?.();
    }, duration);
  };

  const worldToScreen = (worldPosition: Vector3) => {
    // TODO: Implement proper world to screen conversion using camera
    return {
      x: window.innerWidth / 2,
      y: window.innerHeight / 2
    };
  };

  return (
    <div className="fixed inset-0 pointer-events-none">
      {texts.map(({ id, text, screenPosition, type, startTime, duration }) => {
        const progress = (Date.now() - startTime) / duration;
        const opacity = 1 - progress;
        const yOffset = -50 * progress; // Float upward

        return (
          <div
            key={id}
            className={`absolute transform -translate-x-1/2 -translate-y-1/2 font-bold text-lg
              ${type === 'damage' ? 'text-red-500' :
                type === 'heal' ? 'text-green-500' :
                type === 'energy' ? 'text-blue-500' :
                'text-yellow-500'}`}
            style={{
              left: screenPosition.x,
              top: screenPosition.y + yOffset,
              opacity,
              textShadow: '0 0 3px rgba(0,0,0,0.5)'
            }}
          >
            {text}
          </div>
        );
      })}
    </div>
  );
}; 