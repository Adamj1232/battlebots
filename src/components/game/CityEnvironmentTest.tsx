import React, { useEffect, useRef, useState } from 'react';
import { GameEngine } from '../../game/engine/GameEngine';
import { CityEnvironment, CityZone } from '../../game/world/CityEnvironment';
import { RobotController } from '../../game/entities/RobotController';
import * as THREE from 'three';
import { PhysicsBody } from '../../game/physics/PhysicsBody';
import { InputManager } from '../../game/engine/InputManager';

interface Props {
  currentZone: CityZone;
  onZoneChange?: (zone: CityZone) => void;
}

export const CityEnvironmentTest: React.FC<Props> = ({ currentZone, onZoneChange }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameEngine, setGameEngine] = useState<GameEngine | null>(null);
  const [cityEnvironment, setCityEnvironment] = useState<CityEnvironment | null>(null);
  const [robotController, setRobotController] = useState<RobotController | null>(null);
  const [inputManager, setInputManager] = useState<InputManager | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Initialize game engine
    const engine = new GameEngine(canvasRef.current);
    setGameEngine(engine);

    // Create city environment
    const environment = new CityEnvironment(engine.getScene(), engine.getPhysicsEngine());
    setCityEnvironment(environment);

    // Create robot
    const robot = new THREE.Group();
    const bodyGeometry = new THREE.BoxGeometry(1, 2, 1);
    const bodyMaterial = new THREE.MeshPhongMaterial({ color: 0x00ff00 });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    robot.add(body);

    // Create physics body for robot
    const physicsBody = new PhysicsBody(robot, engine.getPhysicsEngine(), {
      mass: 1,
      shape: 'box',
      dimensions: new THREE.Vector3(1, 2, 1),
      friction: 0.5,
      restitution: 0.2,
      linearDamping: 0.1,
      angularDamping: 0.1
    });

    // Create input manager
    const input = new InputManager();
    input.initialize();
    setInputManager(input);

    // Create robot controller
    const controller = new RobotController(robot, physicsBody, input);
    setRobotController(controller);

    // Position robot and camera
    robot.position.set(0, 5, 20);
    engine.getCamera().position.set(0, 10, 30);
    engine.getCamera().lookAt(0, 0, 0);

    // Start animation
    engine.resume();

    return () => {
      if (environment) environment.dispose();
      if (controller) controller.dispose();
      if (input) input.dispose();
      if (engine) engine.dispose();
    };
  }, []);

  useEffect(() => {
    if (cityEnvironment && currentZone) {
      cityEnvironment.loadZone(currentZone);
    }
  }, [cityEnvironment, currentZone]);

  return (
    <div className="relative w-full h-full">
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ touchAction: 'none' }}
      />
      <div className="absolute bottom-4 left-4 bg-black/50 text-white p-4 rounded-lg">
        <h3 className="text-lg font-bold mb-2">Controls</h3>
        <ul className="space-y-1 text-sm">
          <li>WASD - Move</li>
          <li>Space - Jump</li>
          <li>Shift - Sprint</li>
          <li>E - Transform</li>
          <li>Mouse - Look around</li>
        </ul>
      </div>
    </div>
  );
}; 