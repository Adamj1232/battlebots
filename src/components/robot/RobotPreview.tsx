import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import '../../styles/RobotPreview.css';

interface RobotPreviewProps {
  scene: THREE.Scene;
  onRotate?: (x: number, y: number) => void;
}

export const RobotPreview: React.FC<RobotPreviewProps> = ({ scene, onRotate }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera>();
  const rendererRef = useRef<THREE.WebGLRenderer>();
  const controlsRef = useRef<OrbitControls>();

  useEffect(() => {
    if (!containerRef.current) return;

    // Set scene background
    scene.background = new THREE.Color(0x0f1123);

    // Initialize camera
    const aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
    cameraRef.current = new THREE.PerspectiveCamera(50, aspect, 0.1, 1000);
    cameraRef.current.position.set(0, 2, 5);
    cameraRef.current.lookAt(0, 0, 0);

    // Initialize renderer
    rendererRef.current = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true
    });
    rendererRef.current.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    rendererRef.current.setPixelRatio(window.devicePixelRatio);
    rendererRef.current.shadowMap.enabled = true;
    rendererRef.current.shadowMap.type = THREE.PCFSoftShadowMap;
    containerRef.current.appendChild(rendererRef.current.domElement);

    // Initialize orbit controls
    if (cameraRef.current && rendererRef.current) {
      controlsRef.current = new OrbitControls(cameraRef.current, rendererRef.current.domElement);
      controlsRef.current.enableDamping = true;
      controlsRef.current.dampingFactor = 0.05;
      controlsRef.current.minDistance = 3;
      controlsRef.current.maxDistance = 10;
      controlsRef.current.minPolarAngle = Math.PI / 4; // Limit vertical rotation
      controlsRef.current.maxPolarAngle = Math.PI / 1.5;
      
      if (onRotate) {
        controlsRef.current.addEventListener('change', () => {
          const rotation = new THREE.Euler().setFromQuaternion(cameraRef.current!.quaternion);
          onRotate(rotation.x, rotation.y);
        });
      }
    }

    // Add lights
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    // Main directional light
    const mainLight = new THREE.DirectionalLight(0xffffff, 0.8);
    mainLight.position.set(5, 5, 5);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 2048;
    mainLight.shadow.mapSize.height = 2048;
    scene.add(mainLight);

    // Fill light
    const fillLight = new THREE.DirectionalLight(0x7ec5ff, 0.3);
    fillLight.position.set(-5, 3, -5);
    scene.add(fillLight);

    // Rim light
    const rimLight = new THREE.DirectionalLight(0x4c70ff, 0.2);
    rimLight.position.set(0, -5, 0);
    scene.add(rimLight);

    // Ground plane for shadow and reference
    const groundGeometry = new THREE.PlaneGeometry(10, 10);
    const groundMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x0a0a14,
      roughness: 0.8,
      metalness: 0.2,
      transparent: true,
      opacity: 0.5
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Grid helper
    const gridHelper = new THREE.GridHelper(10, 20, 0x1a1a2e, 0x1a1a2e);
    gridHelper.position.y = -1.99;
    scene.add(gridHelper);

    // Animation loop
    const animate = () => {
      if (!cameraRef.current || !rendererRef.current) return;

      requestAnimationFrame(animate);
      controlsRef.current?.update();
      rendererRef.current.render(scene, cameraRef.current);
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