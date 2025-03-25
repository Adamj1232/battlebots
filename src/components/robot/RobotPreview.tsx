import React, { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { RootState } from '../../state/store';
import { RobotAssembly } from '../../game/entities/RobotAssembly';
import * as THREE from 'three';

const RobotModel: React.FC = () => {
  const { robot } = useSelector((state: RootState) => state.player);
  const robotAssemblyRef = useRef<RobotAssembly | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);

  useEffect(() => {
    if (!sceneRef.current) return;

    // Initialize robot assembly
    robotAssemblyRef.current = new RobotAssembly(sceneRef.current, robot);
    robotAssemblyRef.current.loadParts();

    return () => {
      if (robotAssemblyRef.current) {
        robotAssemblyRef.current.dispose();
      }
    };
  }, [robot]);

  useEffect(() => {
    if (!robotAssemblyRef.current) return;

    // Update colors when they change
    robotAssemblyRef.current.updateColors(
      robot.primaryColor,
      robot.secondaryColor,
      robot.accentColor
    );
  }, [robot.primaryColor, robot.secondaryColor, robot.accentColor]);

  return (
    <scene ref={sceneRef}>
      {/* Environment lighting */}
      <ambientLight intensity={0.5} />
      <directionalLight
        position={[5, 5, 5]}
        intensity={1}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <pointLight position={[-5, 5, -5]} intensity={0.5} />

      {/* Ground plane */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -1, 0]}
        receiveShadow
      >
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial
          color="#1a1a1a"
          metalness={0.8}
          roughness={0.4}
        />
      </mesh>
    </scene>
  );
};

export const RobotPreview: React.FC = () => {
  return (
    <div className="robot-preview">
      <Canvas shadows>
        <PerspectiveCamera makeDefault position={[0, 2, 5]} />
        <OrbitControls
          enablePan={false}
          minDistance={3}
          maxDistance={10}
          minPolarAngle={Math.PI / 4}
          maxPolarAngle={Math.PI / 2}
        />
        <RobotModel />
      </Canvas>
    </div>
  );
}; 