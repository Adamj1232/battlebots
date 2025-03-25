import * as THREE from 'three';

export default class TestEnvironment {
  private scene: THREE.Scene;
  private ground: THREE.Mesh = new THREE.Mesh();
  private lights: THREE.Light[];

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.lights = [];
    this.setupEnvironment();
  }

  private setupEnvironment(): void {
    // Create ground plane
    const groundGeometry = new THREE.PlaneGeometry(100, 100);
    const groundMaterial = new THREE.MeshStandardMaterial({
      color: 0x808080,
      roughness: 0.8,
      metalness: 0.2
    });
    this.ground = new THREE.Mesh(groundGeometry, groundMaterial);
    this.ground.rotation.x = -Math.PI / 2;
    this.ground.receiveShadow = true;
    this.scene.add(this.ground);

    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
    this.lights.push(ambientLight);
    this.scene.add(ambientLight);

    // Add directional light (sun)
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(10, 20, 10);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 50;
    directionalLight.shadow.camera.left = -25;
    directionalLight.shadow.camera.right = 25;
    directionalLight.shadow.camera.top = 25;
    directionalLight.shadow.camera.bottom = -25;
    this.lights.push(directionalLight);
    this.scene.add(directionalLight);

    // Add point lights for additional atmosphere
    const pointLight1 = new THREE.PointLight(0x4CAF50, 1, 50);
    pointLight1.position.set(-10, 15, -10);
    this.lights.push(pointLight1);
    this.scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x2196F3, 1, 50);
    pointLight2.position.set(10, 15, 10);
    this.lights.push(pointLight2);
    this.scene.add(pointLight2);

    // Add grid helper
    const gridHelper = new THREE.GridHelper(100, 20, 0x000000, 0x808080);
    this.scene.add(gridHelper);

    // Add background
    const backgroundColor = new THREE.Color(0x1a1a1a);
    this.scene.background = backgroundColor;

    // Add fog for depth
    this.scene.fog = new THREE.Fog(backgroundColor, 60, 100);
  }

  public update(deltaTime: number): void {
    // Update point lights for dynamic atmosphere
    const time = Date.now() * 0.001;
    this.lights[2].position.y = Math.sin(time) * 2 + 15;
    this.lights[3].position.y = Math.cos(time) * 2 + 15;
  }

  public dispose(): void {
    // Dispose of geometries and materials
    this.ground.geometry.dispose();
    (this.ground.material as THREE.Material).dispose();
    this.scene.remove(this.ground);

    // Remove and dispose of lights
    this.lights.forEach(light => {
      this.scene.remove(light);
    });
    this.lights = [];
  }
} 