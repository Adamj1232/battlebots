import React, { useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Box, Sphere, Cylinder } from '@react-three/drei';
import { PhysicsEngine } from './PhysicsEngine';
import { PhysicsBody } from './PhysicsBody';
import { Vector3, Mesh } from 'three';

const PhysicsTest: React.FC = () => {
  const physicsEngine = useRef<PhysicsEngine>();
  const groundRef = useRef<Mesh>();
  const boxRef = useRef<Mesh>();
  const sphereRef = useRef<Mesh>();
  const cylinderRef = useRef<Mesh>();

  useEffect(() => {
    // Initialize physics engine
    physicsEngine.current = new PhysicsEngine({
      gravity: new Vector3(0, -9.81, 0),
      allowSleep: true
    });
    physicsEngine.current.initialize();

    // Add physics bodies
    if (groundRef.current) {
      const groundBody = new PhysicsBody(groundRef.current, {
        mass: 0,
        shape: 'box',
        dimensions: new Vector3(20, 1, 20),
        position: new Vector3(0, -0.5, 0)
      });
      physicsEngine.current.addBody('ground', groundBody);
    }

    if (boxRef.current) {
      const boxBody = new PhysicsBody(boxRef.current, {
        mass: 1,
        shape: 'box',
        dimensions: new Vector3(1, 1, 1),
        position: new Vector3(0, 5, 0)
      });
      physicsEngine.current.addBody('box', boxBody);
    }

    if (sphereRef.current) {
      const sphereBody = new PhysicsBody(sphereRef.current, {
        mass: 1,
        shape: 'sphere',
        radius: 0.5,
        position: new Vector3(2, 5, 0)
      });
      physicsEngine.current.addBody('sphere', sphereBody);
    }

    if (cylinderRef.current) {
      const cylinderBody = new PhysicsBody(cylinderRef.current, {
        mass: 1,
        shape: 'cylinder',
        radius: 0.5,
        height: 2,
        position: new Vector3(-2, 5, 0)
      });
      physicsEngine.current.addBody('cylinder', cylinderBody);
    }

    // Animation loop
    let lastTime = performance.now();
    const animate = () => {
      const currentTime = performance.now();
      const deltaTime = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      if (physicsEngine.current) {
        physicsEngine.current.update(deltaTime);
      }

      requestAnimationFrame(animate);
    };

    animate();

    // Cleanup
    return () => {
      if (physicsEngine.current) {
        physicsEngine.current.dispose();
      }
    };
  }, []);

  return (
    <Canvas camera={{ position: [0, 10, 10], fov: 75 }}>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      
      {/* Ground */}
      <mesh ref={groundRef} position={[0, -0.5, 0]}>
        <boxGeometry args={[20, 1, 20]} />
      </mesh>

      {/* Test objects */}
      <mesh ref={boxRef} position={[0, 5, 0]}>
        <boxGeometry args={[1, 1, 1]} />
      </mesh>

      <mesh ref={sphereRef} position={[2, 5, 0]}>
        <sphereGeometry args={[0.5, 32, 32]} />
      </mesh>

      <mesh ref={cylinderRef} position={[-2, 5, 0]}>
        <cylinderGeometry args={[0.5, 0.5, 2, 32]} />
      </mesh>

      <OrbitControls />
    </Canvas>
  );
};

export default PhysicsTest; 