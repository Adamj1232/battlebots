import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GameEngine } from '../../game/engine/GameEngine';
import { PhysicsBody } from '../../game/physics/PhysicsBody';
import { PhysicsConfig } from '../../game/physics/types';

export const PhysicsTest: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameEngineRef = useRef<GameEngine | null>(null);
  const robotRef = useRef<THREE.Group | null>(null);
  const physicsBodyRef = useRef<PhysicsBody | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

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

    // Initialize game engine
    const gameEngine = new GameEngine(canvasRef.current, config);
    gameEngineRef.current = gameEngine;

    // Setup engine
    gameEngine.initialize();

    // Create robot
    const robot = new THREE.Group();
    robotRef.current = robot;

    // Create robot body
    const bodyGeometry = new THREE.BoxGeometry(1, 2, 1);
    const bodyMaterial = new THREE.MeshPhongMaterial({ color: 0x00ff00 });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    robot.add(body);

    // Create robot head
    const headGeometry = new THREE.SphereGeometry(0.5, 16, 16);
    const headMaterial = new THREE.MeshPhongMaterial({ color: 0x00ff00 });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = 1.5;
    robot.add(head);

    // Create robot arms
    const armGeometry = new THREE.CylinderGeometry(0.1, 0.1, 1, 8);
    const armMaterial = new THREE.MeshPhongMaterial({ color: 0x00ff00 });
    const leftArm = new THREE.Mesh(armGeometry, armMaterial);
    leftArm.position.set(-0.5, 1, 0);
    leftArm.rotation.z = Math.PI / 4;
    robot.add(leftArm);

    const rightArm = new THREE.Mesh(armGeometry, armMaterial);
    rightArm.position.set(0.5, 1, 0);
    rightArm.rotation.z = -Math.PI / 4;
    robot.add(rightArm);

    // Create robot legs
    const legGeometry = new THREE.CylinderGeometry(0.1, 0.1, 1, 8);
    const legMaterial = new THREE.MeshPhongMaterial({ color: 0x00ff00 });
    const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
    leftLeg.position.set(-0.3, -1.5, 0);
    robot.add(leftLeg);

    const rightLeg = new THREE.Mesh(legGeometry, legMaterial);
    rightLeg.position.set(0.3, -1.5, 0);
    robot.add(rightLeg);

    // Add robot to scene
    gameEngine.addObject(robot);

    // Create physics body for robot
    const physicsBody = new PhysicsBody(robot, gameEngine.getPhysicsEngine(), {
      mass: 1,
      shape: 'box',
      dimensions: new THREE.Vector3(1, 2, 1),
      friction: 0.5,
      restitution: 0.2,
      linearDamping: 0.1,
      angularDamping: 0.1
    });
    physicsBodyRef.current = physicsBody;

    // Set robot controller
    gameEngine.setRobotController(robot, physicsBody);

    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    gameEngine.getScene().add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(5, 5, 5);
    directionalLight.castShadow = true;
    gameEngine.getScene().add(directionalLight);

    // Start animation loop
    gameEngine.animate();

    // Cleanup
    return () => {
      if (physicsBodyRef.current) {
        physicsBodyRef.current.dispose();
      }
      if (gameEngineRef.current) {
        gameEngineRef.current.dispose();
      }
    };
  }, []);

  return (
    <div className="w-full h-full">
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ touchAction: 'none' }}
      />
      <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white p-4 rounded">
        <h2 className="text-xl font-bold mb-2">Physics Test</h2>
        <p className="mb-2">Controls:</p>
        <ul className="list-disc list-inside">
          <li>WASD / Arrow Keys - Move</li>
          <li>Space - Jump</li>
          <li>T - Transform</li>
          <li>Mouse - Look around</li>
        </ul>
      </div>
    </div>
  );
}; 