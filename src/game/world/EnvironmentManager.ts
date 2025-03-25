import * as THREE from 'three';
import gsap from 'gsap';

interface EnvironmentConfig {
  skybox: {
    texturePath: string;
  };
  ground: {
    color: string;
    size: number;
  };
  ambientLight: {
    color: string;
    intensity: number;
  };
  directionalLight: {
    color: string;
    intensity: number;
    position: THREE.Vector3;
  };
  fog: {
    color: string;
    near: number;
    far: number;
  };
}

export class EnvironmentManager {
  private scene: THREE.Scene;
  private currentConfig: EnvironmentConfig | null;
  private skybox: THREE.Mesh | null;
  private ground: THREE.Mesh | null;
  private ambientLight: THREE.AmbientLight | null;
  private directionalLight: THREE.DirectionalLight | null;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.currentConfig = null;
    this.skybox = null;
    this.ground = null;
    this.ambientLight = null;
    this.directionalLight = null;
  }

  public async loadEnvironment(config: EnvironmentConfig): Promise<void> {
    // Fade out current environment
    if (this.currentConfig) {
      await this.fadeOut();
      this.dispose();
    }

    // Create skybox
    const textureLoader = new THREE.TextureLoader();
    const skyboxTexture = await textureLoader.loadAsync(config.skybox.texturePath);
    const skyboxGeometry = new THREE.SphereGeometry(1000, 32, 32);
    const skyboxMaterial = new THREE.MeshBasicMaterial({
      map: skyboxTexture,
      side: THREE.BackSide
    });
    this.skybox = new THREE.Mesh(skyboxGeometry, skyboxMaterial);
    this.scene.add(this.skybox);

    // Create ground
    const groundGeometry = new THREE.PlaneGeometry(
      config.ground.size,
      config.ground.size
    );
    const groundMaterial = new THREE.MeshStandardMaterial({
      color: config.ground.color,
      roughness: 0.8,
      metalness: 0.2
    });
    this.ground = new THREE.Mesh(groundGeometry, groundMaterial);
    this.ground.rotation.x = -Math.PI / 2;
    this.ground.receiveShadow = true;
    this.scene.add(this.ground);

    // Create lights
    this.ambientLight = new THREE.AmbientLight(
      config.ambientLight.color,
      config.ambientLight.intensity
    );
    this.scene.add(this.ambientLight);

    this.directionalLight = new THREE.DirectionalLight(
      config.directionalLight.color,
      config.directionalLight.intensity
    );
    this.directionalLight.position.copy(config.directionalLight.position);
    this.directionalLight.castShadow = true;
    this.scene.add(this.directionalLight);

    // Set fog
    this.scene.fog = new THREE.Fog(
      config.fog.color,
      config.fog.near,
      config.fog.far
    );

    // Animate transition
    await this.fadeIn();

    this.currentConfig = config;
  }

  private async fadeOut(): Promise<void> {
    if (!this.currentConfig) return;

    return new Promise<void>((resolve) => {
      gsap.to(this.scene.fog as THREE.Fog, {
        duration: 1,
        density: 1,
        onComplete: resolve
      });
    });
  }

  private async fadeIn(): Promise<void> {
    return new Promise<void>((resolve) => {
      gsap.from(this.scene.fog as THREE.Fog, {
        duration: 1,
        density: 1,
        onComplete: resolve
      });
    });
  }

  public dispose(): void {
    if (this.skybox) {
      this.scene.remove(this.skybox);
      this.skybox.geometry.dispose();
      (this.skybox.material as THREE.Material).dispose();
      this.skybox = null;
    }

    if (this.ground) {
      this.scene.remove(this.ground);
      this.ground.geometry.dispose();
      (this.ground.material as THREE.Material).dispose();
      this.ground = null;
    }

    if (this.ambientLight) {
      this.scene.remove(this.ambientLight);
      this.ambientLight = null;
    }

    if (this.directionalLight) {
      this.scene.remove(this.directionalLight);
      this.directionalLight = null;
    }

    this.scene.fog = null;
    this.currentConfig = null;
  }
} 