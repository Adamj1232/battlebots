import React, { useEffect, useRef } from "react";
import {
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
  BoxGeometry,
  MeshStandardMaterial,
  Mesh,
  Euler,
  Raycaster,
  Vector2,
} from "three";
import * as THREE from "three";
import { PhysicsEngine } from "../PhysicsEngine";
import { EnvironmentDestruction } from "../EnvironmentDestruction";
import { RagdollSystem } from "../RagdollSystem";
import { GrapplingSystem } from "../GrapplingSystem";
import { EnvironmentalHazards } from "../EnvironmentalHazards";

export const PhysicsTestScene: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<Scene | null>(null);
  const cameraRef = useRef<PerspectiveCamera | null>(null);
  const rendererRef = useRef<WebGLRenderer | null>(null);
  const physicsEngineRef = useRef<PhysicsEngine | null>(null);
  const environmentDestructionRef = useRef<EnvironmentDestruction | null>(null);
  const ragdollSystemRef = useRef<RagdollSystem | null>(null);
  const grapplingSystemRef = useRef<GrapplingSystem | null>(null);
  const environmentalHazardsRef = useRef<EnvironmentalHazards | null>(null);
  const raycasterRef = useRef<Raycaster | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Initialize scene
    const scene = new Scene();
    sceneRef.current = scene;

    // Initialize camera
    const camera = new PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 5, 10);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Initialize renderer
    const renderer = new WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Initialize physics engine
    const physicsEngine = new PhysicsEngine();
    physicsEngineRef.current = physicsEngine;

    // Initialize physics systems
    const environmentDestruction = new EnvironmentDestruction(
      scene,
      physicsEngine
    );
    environmentDestructionRef.current = environmentDestruction;

    const ragdollSystem = new RagdollSystem(scene, physicsEngine);
    ragdollSystemRef.current = ragdollSystem;

    const grapplingSystem = new GrapplingSystem(scene, physicsEngine);
    grapplingSystemRef.current = grapplingSystem;

    const environmentalHazards = new EnvironmentalHazards(scene, physicsEngine);
    environmentalHazardsRef.current = environmentalHazards;

    // Initialize raycaster
    const raycaster = new Raycaster();
    raycasterRef.current = raycaster;

    // Create test objects
    const groundGeometry = new BoxGeometry(20, 1, 20);
    const groundMaterial = new MeshStandardMaterial({ color: 0x808080 });
    const ground = new Mesh(groundGeometry, groundMaterial);
    ground.position.y = -0.5;
    scene.add(ground);

    // Create destructible wall
    const wallGeometry = new BoxGeometry(1, 5, 10);
    const wallMaterial = new MeshStandardMaterial({ color: 0x8b4513 });
    const wall = new Mesh(wallGeometry, wallMaterial);
    wall.position.set(5, 2, 0);
    scene.add(wall);
    environmentDestruction.registerDestructible("wall1", wall);

    // Create environmental hazards
    const trapGeometry = new BoxGeometry(2, 0.1, 2);
    const trapMaterial = new MeshStandardMaterial({ color: 0xff0000 });
    const trap = new Mesh(trapGeometry, trapMaterial);
    trap.position.set(0, 0.1, 5);
    scene.add(trap);
    environmentalHazards.createHazard(
      "trap1",
      trap,
      "trap",
      trap.position,
      new Euler()
    );

    // Add lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    // Animation loop
    let lastTime = 0;
    const animate = (currentTime: number) => {
      requestAnimationFrame(animate);

      const deltaTime = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      // Update physics
      physicsEngine.update(deltaTime);
      ragdollSystem.update(deltaTime);
      grapplingSystem.update(deltaTime);
      environmentalHazards.update(deltaTime);

      renderer.render(scene, camera);
    };

    // Handle window resize
    const handleResize = () => {
      if (!cameraRef.current || !rendererRef.current) return;

      cameraRef.current.aspect = window.innerWidth / window.innerHeight;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener("resize", handleResize);

    // Handle mouse click for testing
    const handleClick = (event: MouseEvent) => {
      if (
        !cameraRef.current ||
        !raycasterRef.current ||
        !environmentDestructionRef.current
      )
        return;

      const mouse = new Vector2(
        (event.clientX / window.innerWidth) * 2 - 1,
        -(event.clientY / window.innerHeight) * 2 + 1
      );

      raycasterRef.current.setFromCamera(mouse, cameraRef.current);
      const intersects = raycasterRef.current.intersectObjects(scene.children);

      if (intersects.length > 0) {
        const object = intersects[0].object;
        if (object === wall) {
          environmentDestructionRef.current.applyDamage(
            "wall1",
            50,
            intersects[0].point
          );
        }
      }
    };

    window.addEventListener("click", handleClick);

    // Start animation
    animate(0);

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("click", handleClick);
      containerRef.current?.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={containerRef} style={{ width: "100%", height: "100%" }} />;
};
