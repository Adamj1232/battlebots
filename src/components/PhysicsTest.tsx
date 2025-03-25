import React, { useEffect, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { PhysicsEngine } from '../game/physics/PhysicsEngine';
import { PhysicsBody } from '../game/physics/PhysicsBody';
import { Mesh, Vector3 } from 'three';

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

    // Initialize physics engine
    physicsEngine.current = new PhysicsEngine();
    physicsEngine.current.initialize();

    // Add ground plane
    const groundBody = new PhysicsBody(groundRef.current, {
      shape: 'box',
      dimensions: new Vector3(20, 1, 20),
      mass: 0
    });
    physicsEngine.current.addBody('ground', groundBody);

    // Add falling objects
    const boxBody = new PhysicsBody(boxRef.current, {
      shape: 'box',
      dimensions: new Vector3(1, 1, 1),
      mass: 1,
      position: new Vector3(0, 5, 0)
    });
    physicsEngine.current.addBody('box', boxBody);

    const sphereBody = new PhysicsBody(sphereRef.current, {
      shape: 'sphere',
      radius: 0.5,
      mass: 1,
      position: new Vector3(2, 5, 0)
    });
    physicsEngine.current.addBody('sphere', sphereBody);

    const cylinderBody = new PhysicsBody(cylinderRef.current, {
      shape: 'cylinder',
      radius: 0.5,
      height: 2,
      mass: 1,
      position: new Vector3(-2, 5, 0)
    });
    physicsEngine.current.addBody('cylinder', cylinderBody);

    return () => {
      if (physicsEngine.current) {
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
        <boxGeometry args={[20, 1, 20]} />
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

const PhysicsTest: React.FC = () => {
  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <Canvas camera={{ position: [0, 5, 10], fov: 75 }}>
        <Scene />
      </Canvas>
    </div>
  );
};

export default PhysicsTest; 