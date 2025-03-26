import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GameEngine } from '../../game/engine/GameEngine';
import { PhysicsBody } from '../../game/physics/PhysicsBody';

export const PhysicsTest: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameEngineRef = useRef<GameEngine | null>(null);

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const initPhysicsTest = async () => {
      // Set canvas size to match container
      const updateCanvasSize = () => {
        if (!containerRef.current || !canvasRef.current) return;
        canvasRef.current.style.width = '100%';
        canvasRef.current.style.height = '100%';
        canvasRef.current.width = containerRef.current.clientWidth;
        canvasRef.current.height = containerRef.current.clientHeight;
      };

      updateCanvasSize();

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

      // Initialize game engine with type assertion since we checked canvasRef.current above
      const gameEngine = new GameEngine(canvasRef.current as HTMLCanvasElement, config);
      gameEngineRef.current = gameEngine;

      // Initialize the engine
      await gameEngine.initialize();

      // Create ground plane
      const groundGeometry = new THREE.PlaneGeometry(20, 20);
      const groundMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x808080,
        side: THREE.DoubleSide
      });
      const ground = new THREE.Mesh(groundGeometry, groundMaterial);
      ground.rotation.x = -Math.PI / 2;
      ground.position.y = -2;
      ground.receiveShadow = true;
      gameEngine.getScene().add(ground);

      // Create physics body for ground
      new PhysicsBody(ground, gameEngine.getPhysicsEngine(), {
        mass: 0,
        shape: 'box',
        dimensions: new THREE.Vector3(20, 0.1, 20),
        friction: 0.5,
        restitution: 0.3
      });

      // Create test objects
      const createTestObject = (
        geometry: THREE.BufferGeometry,
        position: THREE.Vector3,
        color: number,
        physicsShape: 'box' | 'sphere' | 'cylinder',
        dimensions: THREE.Vector3
      ) => {
        const material = new THREE.MeshPhongMaterial({ color });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.copy(position);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        gameEngine.getScene().add(mesh);

        return new PhysicsBody(mesh, gameEngine.getPhysicsEngine(), {
          mass: 1,
          shape: physicsShape,
          dimensions,
          friction: 0.5,
          restitution: 0.5,
          linearDamping: 0.1,
          angularDamping: 0.1
        });
      };

      // Add various test objects
      // Box
      createTestObject(
        new THREE.BoxGeometry(1, 1, 1),
        new THREE.Vector3(-2, 5, 0),
        0xff0000,
        'box',
        new THREE.Vector3(1, 1, 1)
      );

      // Sphere
      createTestObject(
        new THREE.SphereGeometry(0.5, 32, 32),
        new THREE.Vector3(0, 5, 0),
        0x00ff00,
        'sphere',
        new THREE.Vector3(1, 1, 1)
      );

      // Cylinder
      createTestObject(
        new THREE.CylinderGeometry(0.5, 0.5, 1, 32),
        new THREE.Vector3(2, 5, 0),
        0x0000ff,
        'cylinder',
        new THREE.Vector3(1, 1, 1)
      );

      // Add lights
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
      gameEngine.getScene().add(ambientLight);

      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
      directionalLight.position.set(5, 5, 5);
      directionalLight.castShadow = true;
      directionalLight.shadow.mapSize.set(2048, 2048);
      gameEngine.getScene().add(directionalLight);

      // Position camera
      const camera = gameEngine.getCamera();
      camera.position.set(0, 5, 10);
      camera.lookAt(0, 0, 0);

      // Start the animation
      gameEngine.resume();
    };

    initPhysicsTest();

    // Handle window resize
    const handleResize = () => {
      if (!containerRef.current || !canvasRef.current || !gameEngineRef.current) return;
      
      canvasRef.current.width = containerRef.current.clientWidth;
      canvasRef.current.height = containerRef.current.clientHeight;
      
      const camera = gameEngineRef.current.getCamera();
      camera.aspect = canvasRef.current.width / canvasRef.current.height;
      camera.updateProjectionMatrix();
      
      gameEngineRef.current.getRenderer().setSize(
        canvasRef.current.width,
        canvasRef.current.height
      );
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (gameEngineRef.current) {
        gameEngineRef.current.dispose();
      }
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="w-full h-full bg-gray-900"
      style={{ position: 'relative', width: '100%', height: '100vh' }}
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ display: 'block', touchAction: 'none' }}
      />
      <div className="absolute top-4 left-4 bg-black/50 text-white p-4 rounded-lg">
        <h2 className="text-xl font-bold mb-2">Physics Test</h2>
        <p className="text-sm">Objects will fall under gravity and interact with each other.</p>
        <ul className="mt-2 text-sm">
          <li>Red: Box</li>
          <li>Green: Sphere</li>
          <li>Blue: Cylinder</li>
        </ul>
      </div>
    </div>
  );
}; 