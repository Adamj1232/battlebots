import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import Stats from 'three/examples/jsm/libs/stats.module';
import InputManager from './InputManager';
import { PhysicsEngine } from '../physics/PhysicsEngine';
import { PhysicsBody } from '../physics/PhysicsBody';
import { AccessibilitySettings } from '../types';

export interface UpdatableObject extends THREE.Object3D {
  update?: (deltaTime: number) => void;
  physicsBody?: PhysicsBody;
}

export class GameEngine {
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private controls!: OrbitControls;
  private animationFrameId: number | null = null;
  private stats!: Stats;
  private clock!: THREE.Clock;
  private frameTime: number = 0;
  private readonly targetFrameRate: number = 60;
  private readonly frameInterval: number = 1000 / this.targetFrameRate;
  private errorCallback: ((error: Error) => void) | null = null;
  private inputManager: InputManager;
  private isDisposed: boolean = false;
  private isPaused: boolean = false;
  private gameObjects: UpdatableObject[] = [];
  private physicsEngine: PhysicsEngine;

  constructor(canvas: HTMLCanvasElement, onError?: (error: Error) => void) {
    this.errorCallback = onError || null;
    this.inputManager = new InputManager();
    this.physicsEngine = new PhysicsEngine({
      gravity: new THREE.Vector3(0, -9.81, 0),
      allowSleep: true
    });
    this.setupEngine(canvas);
  }

  private setupEngine(canvas: HTMLCanvasElement): void {
    try {
      // Initialize clock
      this.clock = new THREE.Clock();
      
      // Initialize stats
      this.stats = new Stats();

      // Initialize scene
      this.scene = new THREE.Scene();
      this.scene.background = new THREE.Color(0x1a1a1a);

      // Initialize camera with child-friendly FOV
      this.camera = new THREE.PerspectiveCamera(
        60, // Reduced FOV for less motion sickness
        window.innerWidth / window.innerHeight,
        0.1,
        1000
      );
      this.camera.position.z = 5;

      // Initialize renderer with antialiasing and shadow support
      this.renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        powerPreference: 'high-performance',
      });
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

      // Initialize controls with child-friendly settings
      this.controls = new OrbitControls(this.camera, canvas);
      this.controls.enableDamping = true;
      this.controls.dampingFactor = 0.05;
      this.controls.maxDistance = 20;
      this.controls.minDistance = 2;
      this.controls.maxPolarAngle = Math.PI * 0.6; // Limit vertical rotation

      // Add ambient light
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
      this.scene.add(ambientLight);

      // Add directional light with shadows
      const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
      directionalLight.position.set(5, 5, 5);
      directionalLight.castShadow = true;
      directionalLight.shadow.mapSize.width = 2048;
      directionalLight.shadow.mapSize.height = 2048;
      this.scene.add(directionalLight);

      // Handle window resize
      window.addEventListener('resize', this.handleResize);
      window.addEventListener('visibilitychange', this.handleVisibilityChange);

      // Append stats to document if in development
      if (process.env.NODE_ENV === 'development') {
        document.body.appendChild(this.stats.dom);
      }
    } catch (error) {
      this.handleError(error as Error);
      throw error;
    }
  }

  public async initialize(): Promise<void> {
    try {
      // Initialize physics engine
      this.physicsEngine.initialize();
      
      // Start animation loop
      this.animate();
      
      // Any additional initialization (loading assets, etc.)
      return Promise.resolve();
    } catch (error) {
      this.handleError(error as Error);
      return Promise.reject(error);
    }
  }

  private handleError = (error: Error) => {
    console.error('GameEngine Error:', error);
    if (this.errorCallback) {
      this.errorCallback(error);
    }
  };

  private handleVisibilityChange = () => {
    if (document.hidden) {
      this.pause();
    } else {
      this.resume();
    }
  };

  private handleResize = () => {
    try {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();
      
      this.renderer.setSize(width, height);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    } catch (error) {
      this.handleError(error as Error);
    }
  };

  private animate = () => {
    try {
      this.stats.begin();

      const currentTime = performance.now();
      const deltaTime = Math.min((currentTime - this.frameTime) / 1000, 0.1); // Cap at 100ms to prevent huge jumps

      // Update controls with delta time
      this.controls.update();

      // Update physics
      if (!this.isPaused) {
        this.physicsEngine.update(deltaTime);
      }

      // Update game objects with proper delta time
      this.update(deltaTime);

      // Render scene
      this.renderer.render(this.scene, this.camera);

      this.frameTime = currentTime;

      // Track FPS in both dev and prod
      if (this.frameTime % 1000 < 16) {
        const fps = Math.round(1 / deltaTime);
        if (fps < 30) {
          console.warn(`Low FPS detected: ${fps}`);
        }
      }

      this.stats.end();
      this.animationFrameId = requestAnimationFrame(this.animate);
    } catch (error) {
      this.handleError(error as Error);
    }
  };

  private update(deltaTime: number) {
    // Update all game objects with proper delta time
    for (const object of this.gameObjects) {
      if (object.update) {
        object.update(deltaTime);
      }
    }
  }

  public pause() {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
      this.clock.stop();
    }
    this.isPaused = true;
  }

  public resume() {
    if (this.animationFrameId === null) {
      this.clock.start();
      this.animate();
    }
    this.isPaused = false;
  }

  public dispose() {
    try {
      if (this.animationFrameId !== null) {
        cancelAnimationFrame(this.animationFrameId);
      }
      
      window.removeEventListener('resize', this.handleResize);
      window.removeEventListener('visibilitychange', this.handleVisibilityChange);
      
      this.controls.dispose();
      
      // Dispose of all materials and geometries
      this.scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          if (Array.isArray(object.material)) {
            object.material.forEach(material => material.dispose());
          } else {
            object.material.dispose();
          }
        }
      });
      
      this.renderer.dispose();
      
      // Dispose physics engine
      this.physicsEngine.dispose();
      
      // Remove stats if in development
      if (process.env.NODE_ENV === 'development' && this.stats.dom.parentNode) {
        this.stats.dom.parentNode.removeChild(this.stats.dom);
      }
      
      // Clear the scene
      while(this.scene.children.length > 0) {
        this.scene.remove(this.scene.children[0]);
      }

      this.inputManager.dispose();
    } catch (error) {
      this.handleError(error as Error);
    }
    this.isDisposed = true;
  }

  public updateAccessibilitySettings(settings: AccessibilitySettings): void {
    this.inputManager.updateConfig({
      accessibility: {
        enableColorblindMode: settings.colorblindMode,
        enableScreenReader: settings.screenReader,
        enableMotionReduction: settings.motionReduced,
      }
    });
  }

  public handleScreenTransition(screen: string): void {
    // Handle transitions between different game screens
    switch (screen) {
      case 'robot-customization':
        // Setup robot customization scene
        break;
      case 'battle':
        // Setup battle scene
        break;
      case 'city':
        // Setup city scene
        break;
    }
  }

  // Public methods for scene management
  public addObject(object: UpdatableObject) {
    if (this.isDisposed) return;
    
    this.scene.add(object);
    this.gameObjects.push(object);
    
    // If the object has a physics body, add it to the physics engine
    if (object.physicsBody) {
      this.physicsEngine.addBody(object.uuid, object.physicsBody);
    }
  }

  public removeObject(object: UpdatableObject) {
    if (this.isDisposed) return;
    
    const index = this.gameObjects.indexOf(object);
    if (index !== -1) {
      this.gameObjects.splice(index, 1);
    }
    
    this.scene.remove(object);
    
    // If the object has a physics body, remove it from the physics engine
    if (object.physicsBody) {
      this.physicsEngine.removeBody(object.uuid);
    }
  }

  public getScene() {
    return this.scene;
  }

  public getCamera() {
    return this.camera;
  }

  public getRenderer() {
    return this.renderer;
  }

  public getControls() {
    return this.controls;
  }

  public getPhysicsEngine() {
    return this.physicsEngine;
  }
}

export default GameEngine; 