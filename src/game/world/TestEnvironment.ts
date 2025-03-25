import * as THREE from 'three';

class TestEnvironment {
  private scene: THREE.Scene;
  private objects: THREE.Object3D[];

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.objects = [];
    this.setup();
  }

  private setup(): void {
    // Create ground plane
    const groundGeometry = new THREE.PlaneGeometry(100, 100);
    const groundMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x808080,
      roughness: 0.8,
      metalness: 0.2
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.scene.add(ground);
    this.objects.push(ground);

    // Add some test objects
    // Cube
    const cubeGeometry = new THREE.BoxGeometry(2, 2, 2);
    const cubeMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
    const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
    cube.position.set(-5, 1, 0);
    cube.castShadow = true;
    cube.receiveShadow = true;
    this.scene.add(cube);
    this.objects.push(cube);

    // Sphere
    const sphereGeometry = new THREE.SphereGeometry(1, 32, 32);
    const sphereMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    sphere.position.set(5, 1, 0);
    sphere.castShadow = true;
    sphere.receiveShadow = true;
    this.scene.add(sphere);
    this.objects.push(sphere);

    // Cylinder
    const cylinderGeometry = new THREE.CylinderGeometry(0.5, 0.5, 2, 32);
    const cylinderMaterial = new THREE.MeshStandardMaterial({ color: 0x0000ff });
    const cylinder = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
    cylinder.position.set(0, 1, 5);
    cylinder.castShadow = true;
    cylinder.receiveShadow = true;
    this.scene.add(cylinder);
    this.objects.push(cylinder);
  }

  public update(deltaTime: number): void {
    // Add some simple animations
    const time = Date.now() * 0.001;

    // Rotate cube
    if (this.objects[1]) {
      this.objects[1].rotation.x += deltaTime;
      this.objects[1].rotation.y += deltaTime;
    }

    // Bob sphere up and down
    if (this.objects[2]) {
      this.objects[2].position.y = 1 + Math.sin(time) * 0.5;
    }

    // Rotate cylinder
    if (this.objects[3]) {
      this.objects[3].rotation.y += deltaTime * 2;
    }
  }

  public dispose(): void {
    // Clean up geometries and materials
    this.objects.forEach(object => {
      if (object instanceof THREE.Mesh) {
        object.geometry.dispose();
        if (Array.isArray(object.material)) {
          object.material.forEach(material => material.dispose());
        } else {
          object.material.dispose();
        }
      }
    });

    // Remove objects from scene
    this.objects.forEach(object => {
      this.scene.remove(object);
    });

    this.objects = [];
  }
}

export default TestEnvironment; 