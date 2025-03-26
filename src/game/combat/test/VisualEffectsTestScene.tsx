import React, { useEffect, useRef, useState } from 'react';
import { Scene, PerspectiveCamera, WebGLRenderer, AmbientLight, DirectionalLight, Vector3, PlaneGeometry, MeshStandardMaterial, Mesh, GridHelper } from 'three';
import { CombatEffectManager } from '../effects/CombatEffectManager';
import { EffectType } from '../effects/types';

export const VisualEffectsTestScene: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<Scene>(new Scene());
  const cameraRef = useRef<PerspectiveCamera>();
  const rendererRef = useRef<WebGLRenderer>();
  const effectManagerRef = useRef<CombatEffectManager>();
  const [activeEffects, setActiveEffects] = useState<number>(0);

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
    renderer.setClearColor(0x000000); // Black background
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

    // Ground plane
    const groundGeometry = new PlaneGeometry(50, 50);
    const groundMaterial = new MeshStandardMaterial({ 
      color: 0x333333,
      roughness: 0.8,
      metalness: 0.2
    });
    const ground = new Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    sceneRef.current.add(ground);

    // Grid helper
    const grid = new GridHelper(50, 50, 0x444444, 0x222222);
    sceneRef.current.add(grid);

    // Initialize effect manager
    const effectManager = CombatEffectManager.getInstance(sceneRef.current);
    effectManagerRef.current = effectManager;

    // Animation loop
    let lastTime = 0;
    const animate = (time: number) => {
      const deltaTime = (time - lastTime) / 1000;
      lastTime = time;

      // Update effects
      effectManager.update(deltaTime);
      setActiveEffects(effectManager.getActiveEffectCount());

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

  const spawnEffect = (type: EffectType) => {
    if (!effectManagerRef.current) return;

    const position = new Vector3(
      (Math.random() - 0.5) * 10, // X between -5 and 5
      2 + Math.random() * 3,      // Y between 2 and 5
      (Math.random() - 0.5) * 10  // Z between -5 and 5
    );

    effectManagerRef.current.spawnEffect(type, position);
  };

  return (
    <div className="relative w-full h-full">
      <div ref={containerRef} className="absolute inset-0" />
      
      {/* Test Controls */}
      <div className="absolute top-4 left-4 bg-gray-900/80 rounded-lg p-4 text-white">
        <h2 className="text-xl font-bold mb-4">Visual Effects Test</h2>
        <div className="mb-4">
          Active Effects: {activeEffects}
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => spawnEffect(EffectType.IMPACT)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded"
          >
            Impact Effect
          </button>
          <button
            onClick={() => spawnEffect(EffectType.WEAPON_TRAIL)}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded"
          >
            Weapon Trail
          </button>
          <button
            onClick={() => spawnEffect(EffectType.STATUS)}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded"
          >
            Status Effect
          </button>
          <button
            onClick={() => spawnEffect(EffectType.ENVIRONMENTAL)}
            className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 rounded"
          >
            Environmental
          </button>
          <button
            onClick={() => spawnEffect(EffectType.TRANSFORM)}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded"
          >
            Transform
          </button>
          <button
            onClick={() => spawnEffect(EffectType.ENERGY)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded"
          >
            Energy Effect
          </button>
        </div>
      </div>
    </div>
  );
}; 