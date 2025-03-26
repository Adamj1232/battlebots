import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import '../../styles/RobotPreview.css';

interface RobotPreviewProps {
  scene?: THREE.Scene;
  onRotate?: (x: number, y: number) => void;
}

export const RobotPreview: React.FC<RobotPreviewProps> = ({ scene, onRotate }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera>();
  const rendererRef = useRef<THREE.WebGLRenderer>();
  const controlsRef = useRef<OrbitControls>();
  const localSceneRef = useRef<THREE.Scene>();

  useEffect(() => {
    if (!containerRef.current) return;

    // Initialize scene if not provided
    if (!scene) {
      localSceneRef.current = new THREE.Scene();
      localSceneRef.current.background = new THREE.Color(0x1a1a1a);
    }

    const activeScene = scene || localSceneRef.current;
    if (!activeScene) return;

    // Initialize camera
    const aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
    cameraRef.current = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
    cameraRef.current.position.z = 10;

    // Initialize renderer
    rendererRef.current = new THREE.WebGLRenderer({ antialias: true });
    rendererRef.current.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    rendererRef.current.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(rendererRef.current.domElement);

    // Initialize orbit controls
    if (cameraRef.current && rendererRef.current) {
      controlsRef.current = new OrbitControls(cameraRef.current, rendererRef.current.domElement);
      controlsRef.current.enableDamping = true;
      controlsRef.current.dampingFactor = 0.05;
      controlsRef.current.minDistance = 5;
      controlsRef.current.maxDistance = 15;
      
      if (onRotate) {
        controlsRef.current.addEventListener('change', () => {
          const rotation = new THREE.Euler().setFromQuaternion(cameraRef.current!.quaternion);
          onRotate(rotation.x, rotation.y);
        });
      }
    }

    // Add lights if using local scene
    if (!scene && localSceneRef.current) {
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
      localSceneRef.current.add(ambientLight);

      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
      directionalLight.position.set(5, 5, 5);
      localSceneRef.current.add(directionalLight);
    }

    // Animation loop
    const animate = () => {
      if (!activeScene || !cameraRef.current || !rendererRef.current) return;

      requestAnimationFrame(animate);
      controlsRef.current?.update();
      rendererRef.current.render(activeScene, cameraRef.current);
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
      if (rendererRef.current && containerRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement);
        rendererRef.current.dispose();
      }
      controlsRef.current?.dispose();
      window.removeEventListener('resize', handleResize);
    };
  }, [scene, onRotate]);

  return <div ref={containerRef} className="robot-preview" />;
}; 