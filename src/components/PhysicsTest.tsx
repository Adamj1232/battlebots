import React, { useEffect, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { PhysicsEngine } from '../game/physics/PhysicsEngine';
import { PhysicsBody } from '../game/physics/PhysicsBody';
import { Mesh, Vector3 } from 'three';
import { PhysicsConfig } from '../game/physics/types';
import * as THREE from 'three';

const Scene: React.FC = () => {
  const physicsEngine = useRef<PhysicsEngine | null>(null);
  const groundRef = useRef<Mesh>(null);
  const boxRef = useRef<Mesh>(null);
  const sphereRef = useRef<Mesh>(null);
  const cylinderRef = useRef<Mesh>(null);

  useEffect(() => {
    if (!groundRef.current || !boxRef.current || !sphereRef.current || !cylinderRef.current) {
      return;
    }

    // Create physics configuration
    const config = new PhysicsConfig({
      gravity: new THREE.Vector3(0, -9.81, 0),
      solver: {
        iterations: 10,
        tolerance: 0.1
      },
      constraints: {
        iterations: 10,
        tolerance: 0.1
      },
      allowSleep: true
    });

    // Initialize physics engine
    physicsEngine.current = new PhysicsEngine(config);
    physicsEngine.current.initialize();

    // Add ground plane
    const groundBody = new PhysicsBody(groundRef.current, physicsEngine.current, {
      mass: 0,
      shape: 'box',
      dimensions: new THREE.Vector3(100, 1, 100),
      friction: 0.5,
      restitution: 0.2
    });

    // Add falling objects
    const boxBody = new PhysicsBody(boxRef.current, physicsEngine.current, {
      mass: 1,
      shape: 'box',
      dimensions: new THREE.Vector3(1, 1, 1),
      friction: 0.5,
      restitution: 0.2
    });

    const sphereBody = new PhysicsBody(sphereRef.current, physicsEngine.current, {
      mass: 1,
      shape: 'sphere',
      dimensions: new THREE.Vector3(0.5, 0.5, 0.5),
      friction: 0.5,
      restitution: 0.2
    });

    const cylinderBody = new PhysicsBody(cylinderRef.current, physicsEngine.current, {
      mass: 1,
      shape: 'cylinder',
      dimensions: new THREE.Vector3(0.5, 2, 0.5),
      friction: 0.5,
      restitution: 0.2
    });

    return () => {
      if (physicsEngine.current) {
        groundBody.dispose();
        boxBody.dispose();
        sphereBody.dispose();
        cylinderBody.dispose();
        physicsEngine.current.dispose();
      }
    };
  }, []);

  useFrame((_, delta) => {
    if (physicsEngine.current) {
      physicsEngine.current.update(delta);
    }
  });

  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      
      {/* Ground */}
      <mesh 
        ref={groundRef}
        position={[0, -0.5, 0]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[100, 1, 100]} />
        <meshStandardMaterial color="#808080" />
      </mesh>

      {/* Box */}
      <mesh 
        ref={boxRef}
        position={[0, 5, 0]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#ff0000" />
      </mesh>

      {/* Sphere */}
      <mesh 
        ref={sphereRef}
        position={[2, 5, 0]}
        castShadow
        receiveShadow
      >
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshStandardMaterial color="#00ff00" />
      </mesh>

      {/* Cylinder */}
      <mesh 
        ref={cylinderRef}
        position={[-2, 5, 0]}
        castShadow
        receiveShadow
      >
        <cylinderGeometry args={[0.5, 0.5, 2, 32]} />
        <meshStandardMaterial color="#0000ff" />
      </mesh>

      <OrbitControls />
    </>
  );
};

export const PhysicsTest: React.FC = () => {
  return (
    <div className="w-full h-full">
      <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white p-4 rounded">
        <h2 className="text-xl font-bold mb-2">Physics Test</h2>
        <p>Testing physics engine functionality</p>
      </div>
      <Canvas camera={{ position: [0, 5, 10], fov: 75 }}>
        <Scene />
      </Canvas>
    </div>
  );
};

export default PhysicsTest; 