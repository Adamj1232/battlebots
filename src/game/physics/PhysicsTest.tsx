import React, { useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { PhysicsEngine } from './PhysicsEngine';
import { PhysicsBody } from './PhysicsBody';
import { Vector3, Mesh } from 'three';
import * as THREE from 'three';

export const PhysicsTest: React.FC = () => {
  const physicsEngine = useRef<PhysicsEngine | null>(null);
  const groundRef = useRef<Mesh>();
  const boxRef = useRef<Mesh>();
  const sphereRef = useRef<Mesh>();
  const cylinderRef = useRef<Mesh>();

  useEffect(() => {
    // Create physics configuration
    const config = {
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
    };

    // Initialize physics engine
    physicsEngine.current = new PhysicsEngine(config);
    physicsEngine.current.initialize();

    // Add ground plane
    const groundGeometry = new THREE.PlaneGeometry(100, 100);
    const groundMaterial = new THREE.MeshPhongMaterial({ color: 0x808080 });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;

    // Add physics bodies
    if (groundRef.current) {
      const groundBody = new PhysicsBody(groundRef.current, physicsEngine.current, {
        mass: 0,
        shape: 'box',
        dimensions: new Vector3(20, 1, 20),
        friction: 0.5,
        restitution: 0.2
      });
      physicsEngine.current.addBody(groundBody.getBody());
    }

    if (boxRef.current) {
      const boxBody = new PhysicsBody(boxRef.current, physicsEngine.current, {
        mass: 1,
        shape: 'box',
        dimensions: new Vector3(1, 1, 1),
        friction: 0.5,
        restitution: 0.2
      });
      physicsEngine.current.addBody(boxBody.getBody());
    }

    if (sphereRef.current) {
      const sphereBody = new PhysicsBody(sphereRef.current, physicsEngine.current, {
        mass: 1,
        shape: 'sphere',
        dimensions: new Vector3(0.5, 0.5, 0.5),
        friction: 0.5,
        restitution: 0.2
      });
      physicsEngine.current.addBody(sphereBody.getBody());
    }

    if (cylinderRef.current) {
      const cylinderBody = new PhysicsBody(cylinderRef.current, physicsEngine.current, {
        mass: 1,
        shape: 'cylinder',
        dimensions: new Vector3(0.5, 2, 0.5),
        friction: 0.5,
        restitution: 0.2
      });
      physicsEngine.current.addBody(cylinderBody.getBody());
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
    <div className="w-full h-full">
      <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white p-4 rounded">
        <h2 className="text-xl font-bold mb-2">Physics Test</h2>
        <p>Testing physics engine functionality</p>
      </div>
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
    </div>
  );
};

export default PhysicsTest; 