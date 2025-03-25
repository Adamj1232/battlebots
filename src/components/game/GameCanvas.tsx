import React, { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../state/store';
import '../../styles/GameCanvas.css';

const GameCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const {
    currentScreen,
    error
  } = useSelector((state: RootState) => state.game);

  const shouldShowCanvas = ['robot-customization', 'battle'].includes(currentScreen);

  useEffect(() => {
    if (!canvasRef.current || !shouldShowCanvas) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    const updateCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);

    return () => {
      window.removeEventListener('resize', updateCanvasSize);
    };
  }, [shouldShowCanvas]);

  if (!shouldShowCanvas) return null;

  return (
    <canvas
      ref={canvasRef}
      className={`game-canvas ${error ? 'error' : ''}`}
    />
  );
};

export default GameCanvas; 