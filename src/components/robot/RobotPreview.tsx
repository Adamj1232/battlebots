import React, { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../state/store';
import * as THREE from 'three';
import { RobotAssembly } from '../../game/entities/RobotAssembly';
import { Robot } from '../../types/Robot';
import '../../styles/RobotPreview.css';

export const RobotPreview: React.FC = () => {
  const robot = useSelector((state: RootState) => state.player.robot);
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene>();
  const cameraRef = useRef<THREE.PerspectiveCamera>();
  const rendererRef = useRef<THREE.WebGLRenderer>();
  const robotAssemblyRef = useRef<RobotAssembly>();

  useEffect(() => {
    if (!containerRef.current || !robot) return;

    // Initialize scene
    sceneRef.current = new THREE.Scene();
    sceneRef.current.background = new THREE.Color(0x1a1a1a);

    // Initialize camera
    const aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
    cameraRef.current = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
    cameraRef.current.position.z = 10;

    // Initialize renderer
    rendererRef.current = new THREE.WebGLRenderer({ antialias: true });
    rendererRef.current.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    rendererRef.current.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(rendererRef.current.domElement);

    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    sceneRef.current.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5);
    sceneRef.current.add(directionalLight);

    // Initialize robot assembly
    robotAssemblyRef.current = new RobotAssembly(sceneRef.current, robot);

    // Animation loop
    const animate = () => {
      if (!sceneRef.current || !cameraRef.current || !rendererRef.current) return;

      requestAnimationFrame(animate);
      rendererRef.current.render(sceneRef.current, cameraRef.current);
    };
    animate();

    // Handle window resize
    const handleResize = () => {
      if (!containerRef.current || !cameraRef.current || !rendererRef.current) return;

      const newAspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
      cameraRef.current.aspect = newAspect;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      if (robotAssemblyRef.current) {
        robotAssemblyRef.current.dispose();
      }
      if (rendererRef.current && containerRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement);
        rendererRef.current.dispose();
      }
      window.removeEventListener('resize', handleResize);
    };
  }, [robot]);

  // Update colors when they change
  useEffect(() => {
    if (robotAssemblyRef.current && robot) {
      robotAssemblyRef.current.updateColors();
    }
  }, [robot?.colors]);

  return <div ref={containerRef} className="robot-preview" />;
}; 