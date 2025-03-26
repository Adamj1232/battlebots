import React, { useEffect, useRef } from 'react';
import { Scene, PerspectiveCamera, WebGLRenderer, AmbientLight, DirectionalLight } from 'three';
import { CombatManager } from '../CombatManager';
import { CombatEffects } from '../CombatEffects';
import { CombatControls } from '../CombatControls';
import { EnemyAI } from '../EnemyAI';
import { TransformationManager } from '../TransformationManager';
import { CombatUI } from '../ui/CombatUI';
import { FloatingTextManager } from '../ui/FloatingText';
import { getAbilities } from '../abilities';
import { PhysicsEngine } from '../../physics/PhysicsEngine';
import * as THREE from 'three';

export const CombatTestScene: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<Scene>(new Scene());
  const cameraRef = useRef<PerspectiveCamera>();
  const rendererRef = useRef<WebGLRenderer>();

  // Combat system references
  const combatManagerRef = useRef<CombatManager>();
  const combatEffectsRef = useRef<CombatEffects>();
  const combatControlsRef = useRef<CombatControls>();
  const enemyAIRef = useRef<EnemyAI>();
  const transformationManagerRef = useRef<TransformationManager>();

  // Test data
  const playerStats = {
    health: 100,
    maxHealth: 100,
    attack: 20,
    defense: 10,
    speed: 5,
    energy: 100,
    maxEnergy: 100
  };

  const enemyStats = {
    health: 80,
    maxHealth: 80,
    attack: 15,
    defense: 8,
    speed: 4,
    energy: 80,
    maxEnergy: 80
  };

  useEffect(() => {
    if (!containerRef.current) return;

    // Initialize Three.js scene
    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    // Camera
    const camera = new PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.set(0, 5, 10);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Renderer
    const renderer = new WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setClearColor(0x87ceeb); // Sky blue
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lights
    const ambientLight = new AmbientLight(0x404040);
    sceneRef.current.add(ambientLight);

    const directionalLight = new DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 5);
    sceneRef.current.add(directionalLight);

    // Initialize combat systems
    const physicsEngine = new PhysicsEngine({
      gravity: new THREE.Vector3(0, -9.81, 0),
      solver: {
        iterations: 10,
        tolerance: 0.001
      },
      constraints: {
        iterations: 10,
        tolerance: 0.001
      },
      allowSleep: true
    });
    const combatOptions = {
      isRealTime: true,
      criticalChance: 0.1,
      criticalMultiplier: 1.5,
      maxEnergy: 100,
      energyRegenRate: 20,
      turnDuration: 5 // 5 seconds per turn
    };
    const combatManager = new CombatManager(physicsEngine, combatOptions);
    const combatEffects = new CombatEffects(sceneRef.current);
    const transformationManager = new TransformationManager(
      sceneRef.current,
      combatManager,
      combatEffects
    );

    // Initialize player
    combatManager.initializeCombatant(
      'player',
      playerStats,
      getAbilities('autobot', 'robot')
    );
    transformationManager.registerTransformable('player', 'robot');

    // Initialize enemy
    combatManager.initializeCombatant(
      'enemy',
      enemyStats,
      getAbilities('decepticon', 'robot')
    );
    transformationManager.registerTransformable('enemy', 'robot');

    // Initialize controls and AI
    const combatControls = new CombatControls(
      camera,
      sceneRef.current,
      combatManager,
      'player'
    );

    const enemyAI = new EnemyAI(
      sceneRef.current,
      combatManager,
      0.5 // Medium difficulty
    );
    enemyAI.registerEnemy('enemy');

    // Store refs
    combatManagerRef.current = combatManager;
    combatEffectsRef.current = combatEffects;
    combatControlsRef.current = combatControls;
    enemyAIRef.current = enemyAI;
    transformationManagerRef.current = transformationManager;

    // Animation loop
    let lastTime = 0;
    const animate = (time: number) => {
      const deltaTime = (time - lastTime) / 1000;
      lastTime = time;

      // Update all systems
      combatManager.update(deltaTime);
      combatControls.update();
      enemyAI.update(deltaTime);
      transformationManager.update(deltaTime);

      renderer.render(sceneRef.current, camera);
      requestAnimationFrame(animate);
    };

    animate(0);

    // Cleanup
    return () => {
      renderer.dispose();
      containerRef.current?.removeChild(renderer.domElement);
    };
  }, []);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (!containerRef.current || !cameraRef.current || !rendererRef.current) return;

      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;

      cameraRef.current.aspect = width / height;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="relative w-full h-full">
      <div ref={containerRef} className="absolute inset-0" />
      
      {/* Combat UI */}
      {combatManagerRef.current && (
        <CombatUI
          playerId="player"
          stats={playerStats}
          abilities={getAbilities('autobot', 'robot')}
          onAbilitySelect={(abilityId) => {
            // Handle ability selection
          }}
          currentForm="robot"
          isTransforming={false}
        />
      )}

      {/* Floating Combat Text */}
      <FloatingTextManager />
    </div>
  );
}; 