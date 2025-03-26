import React, { useEffect, useRef, useState } from 'react';
import { Scene, PerspectiveCamera, WebGLRenderer, AmbientLight, DirectionalLight, Vector3 } from 'three';
import { CombatManager } from '../CombatManager';
import { CombatEffects } from '../CombatEffects';
import { CombatControls } from '../CombatControls';
import { EnemyAI } from '../EnemyAI';
import { TransformationManager } from '../TransformationManager';
import { TargetingSystem } from '../targeting/TargetingSystem';
import { CombatUI } from '../ui/CombatUI';
import { FloatingTextManager } from '../ui/FloatingText';
import { getAbilities } from '../abilities';
import { PhysicsEngine } from '../../physics/PhysicsEngine';
import * as THREE from 'three';
import { EnemySpawnService } from '../services/EnemySpawnService';
import { CombatStats, Combatant } from '../types';

export const CombatTestScene: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<Scene>(new Scene());
  const cameraRef = useRef<PerspectiveCamera>();
  const rendererRef = useRef<WebGLRenderer>();

  // Combat system references
  const combatManagerRef = useRef<CombatManager>();
  const combatEffectsRef = useRef<CombatEffects>();
  const targetingSystem = useRef<TargetingSystem | null>(null);
  const controls = useRef<CombatControls | null>(null);
  const enemyAIRef = useRef<EnemyAI>();
  const transformationManagerRef = useRef<TransformationManager>();

  // Test data
  const playerStats: CombatStats = {
    health: 100,
    maxHealth: 100,
    attack: 20,
    defense: 10,
    speed: 5,
    energy: 100,
    maxEnergy: 100,
    battlesWon: 0,
    battlesLost: 0,
    totalDamageDealt: 0,
    totalDamageTaken: 0,
    criticalHits: 0,
    abilitiesUsed: 0,
    transformations: 0,
    longestCombo: 0
  };

  const enemyStats: CombatStats = {
    health: 80,
    maxHealth: 80,
    attack: 15,
    defense: 8,
    speed: 4,
    energy: 80,
    maxEnergy: 80,
    battlesWon: 0,
    battlesLost: 0,
    totalDamageDealt: 0,
    totalDamageTaken: 0,
    criticalHits: 0,
    abilitiesUsed: 0,
    transformations: 0,
    longestCombo: 0
  };

  useEffect(() => {
    if (!containerRef.current) return;

    // Initialize Three.js scene
    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    // Camera
    const camera = new PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.set(0, 10, 20);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Renderer
    const renderer = new WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000);
    renderer.shadowMap.enabled = true;
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lights
    const ambientLight = new AmbientLight(0x404040);
    sceneRef.current.add(ambientLight);

    const directionalLight = new DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 10, 5);
    directionalLight.castShadow = true;
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
      criticalMultiplier: 1.5,
      childFriendlyMode: true,
      maxSimultaneousEffects: 10,
      difficulty: 0.5,
      tutorialMode: true,
      turnDuration: 5,
      maxEnergy: 100,
      energyRegenRate: 20,
      criticalChance: 0.1
    };

    const combatManager = new CombatManager(physicsEngine, combatOptions);
    targetingSystem.current = new TargetingSystem(sceneRef.current, combatManager);
    controls.current = new CombatControls(
      camera,
      sceneRef.current,
      combatManager,
      targetingSystem.current,
      'player'
    );
    const combatEffects = new CombatEffects(sceneRef.current);
    const transformationManager = new TransformationManager(
      sceneRef.current,
      combatManager,
      combatEffects
    );

    // Initialize player
    const newPlayer: Combatant = {
      id: 'player',
      name: 'Player',
      stats: playerStats,
      position: { x: 0, y: 0, z: 0 },
      abilities: [],
      statusEffects: []
    };

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

    // Initialize enemy AI
    const enemyAI = new EnemyAI(
      sceneRef.current,
      combatManager,
      0.5 // Medium difficulty
    );
    enemyAI.registerEnemy('enemy');

    // Store refs
    combatManagerRef.current = combatManager;
    combatEffectsRef.current = combatEffects;
    enemyAIRef.current = enemyAI;
    transformationManagerRef.current = transformationManager;

    // Animation loop
    let lastTime = 0;
    const animate = (time: number) => {
      const deltaTime = (time - lastTime) / 1000;
      lastTime = time;

      // Update all systems
      combatManager.update(deltaTime);
      controls.current?.update();
      targetingSystem.current?.update(deltaTime);
      enemyAI.update(deltaTime);
      transformationManager.update(deltaTime);

      renderer.render(sceneRef.current, camera);
      requestAnimationFrame(animate);
    };

    animate(0);

    // Cleanup
    return () => {
      renderer.dispose();
      if (targetingSystem.current) {
        targetingSystem.current.dispose();
      }
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