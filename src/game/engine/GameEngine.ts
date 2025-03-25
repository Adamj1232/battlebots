import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import Stats from 'three/examples/jsm/libs/stats.module';
import { InputManager } from './InputManager';
import { PhysicsEngine } from '../physics/PhysicsEngine';
import { PhysicsBody } from '../physics/PhysicsBody';
import { AccessibilitySettings } from '../types';
import { CityEnvironment, CityZone } from '../world/CityEnvironment';
import { CameraController } from '../camera/CameraController';
import { RobotController } from '../entities/RobotController';
import { PhysicsConfig } from '../physics/types';
import * as CANNON from 'cannon-es';

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
  private cityEnvironment: CityEnvironment | null = null;
  private cameraController: CameraController | null = null;
  private robotController: RobotController | null = null;
  private canvas: HTMLCanvasElement;
  private isInitialized: boolean;
  private lastTime: number;
  private isRunning: boolean = false;
  private world: CANNON.World;

  constructor(canvas: HTMLCanvasElement, config?: PhysicsConfig) {
    this.errorCallback = null;
    this.inputManager = new InputManager();
    const physicsConfig = config || new PhysicsConfig({
      gravity: new THREE.Vector3(0, -9.81, 0),
      solver: { iterations: 10, tolerance: 0.1 },
      constraints: { iterations: 10, tolerance: 0.1 },
      allowSleep: true
    });
    this.physicsEngine = new PhysicsEngine(physicsConfig);
    this.canvas = canvas;
    this.isInitialized = false;
    this.lastTime = 0;
    this.world = new CANNON.World();
    this.world.gravity.set(0, -9.81, 0);

    // Configure solver
    (this.world.solver as any).iterations = 10;
    (this.world.solver as any).tolerance = 0.1;

    // Create ground plane
    const groundBody = new CANNON.Body({
      mass: 0,
      shape: new CANNON.Plane(),
      material: new CANNON.Material()
    });
    groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
    this.world.addBody(groundBody);

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

      // Initialize physics engine
      this.physicsEngine.initialize();

      // Initialize city environment
      this.cityEnvironment = new CityEnvironment(this.scene, this.physicsEngine);
      this.cityEnvironment.loadZone(CityZone.DOWNTOWN);

      // Initialize camera controller
      this.cameraController = new CameraController(
        this.camera,
        this.controls,
        this.gameObjects[0] // Will be updated when player object is added
      );

      // Start animation loop
      this.animate();
    } catch (error) {
      this.handleError(error as Error);
    }
  }

  public async initialize(): Promise<void> {
    if (this.isInitialized) return;

    // Initialize input manager
    this.inputManager.initialize();

    // Set up canvas
    this.canvas.style.display = 'block';
    this.canvas.style.position = 'fixed';
    this.canvas.style.top = '0';
    this.canvas.style.left = '0';
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';
    this.canvas.style.zIndex = '0';

    this.isInitialized = true;
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

  public animate(): void {
    if (this.isRunning) return;
    this.isRunning = true;

    const animate = () => {
      if (!this.isRunning) return;

      this.stats.begin();

      const currentTime = performance.now();
      const deltaTime = Math.min((currentTime - this.frameTime) / 1000, 0.1);

      // Update controls with delta time
      this.controls.update();

      // Update camera controller
      if (this.cameraController) {
        this.cameraController.update(deltaTime);
      }

      // Update robot controller
      if (this.robotController) {
        const inputState = this.inputManager.getInputState();
        this.robotController.update(deltaTime, inputState);
      }

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
      this.animationFrameId = requestAnimationFrame(animate);
    };

    animate();
  }

  private update(deltaTime: number): void {
    // Update all game objects with proper delta time
    for (const object of this.gameObjects) {
      if (object.update) {
        object.update(deltaTime);
      }
    }

    // Update physics
    this.world.step(deltaTime);
    this.physicsEngine.update(deltaTime);
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

  public show(): void {
    if (!this.isInitialized) return;
    this.canvas.style.display = 'block';
    this.resume();
  }

  public hide(): void {
    if (!this.isInitialized) return;
    this.canvas.style.display = 'none';
    this.pause();
  }

  public dispose(): void {
    if (!this.isInitialized) return;

    this.inputManager.dispose();
    if (this.cameraController) {
      this.cameraController.dispose();
    }
    if (this.robotController) {
      this.robotController.dispose();
    }
    this.canvas.style.display = 'none';
    this.isInitialized = false;
    this.isRunning = false;
    this.scene.clear();
    this.renderer.dispose();
    this.physicsEngine.dispose();
    this.cityEnvironment?.dispose();
    this.controls.dispose();

    // Remove all bodies
    while (this.world.bodies.length > 0) {
      this.world.removeBody(this.world.bodies[0]);
    }
  }

  public updateAccessibilitySettings(settings: AccessibilitySettings): void {
    if (!this.isInitialized) return;

    // Update input manager settings
    if (settings.motionReduced) {
      this.inputManager.dispose();
    } else {
      this.inputManager.initialize();
    }

    // Update canvas accessibility attributes
    if (settings.screenReaderEnabled) {
      this.canvas.setAttribute('role', 'application');
      this.canvas.setAttribute('aria-label', 'Game viewport');
    } else {
      this.canvas.removeAttribute('role');
      this.canvas.removeAttribute('aria-label');
    }
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
  public addObject(object: UpdatableObject): void {
    if (this.isDisposed) return;
    
    this.scene.add(object);
    this.gameObjects.push(object);
    
    // If the object has a physics body, add it to the physics engine
    if (object.physicsBody) {
      this.physicsEngine.addBody(object.physicsBody.getBody());
    }

    // If this is the first object and we have a camera controller, set it as the target
    if (this.cameraController && this.gameObjects.length === 1) {
      this.cameraController.setTarget(object);
    }
  }

  public removeObject(object: UpdatableObject): void {
    if (this.isDisposed) return;
    
    const index = this.gameObjects.indexOf(object);
    if (index !== -1) {
      this.gameObjects.splice(index, 1);
    }
    
    this.scene.remove(object);
    
    // If the object has a physics body, remove it from the physics engine
    if (object.physicsBody) {
      this.physicsEngine.removeBody(object.physicsBody.getBody());
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

  public setRobotController(robot: UpdatableObject, physicsBody: PhysicsBody): void {
    if (!this.isInitialized) return;

    this.robotController = new RobotController(robot, physicsBody, this.inputManager);
  }

  public getCityEnvironment(): CityEnvironment | null {
    return this.cityEnvironment;
  }

  public addBody(body: CANNON.Body): void {
    this.world.addBody(body);
  }

  public removeBody(body: CANNON.Body): void {
    this.world.removeBody(body);
  }

  public rayTest(from: CANNON.Vec3, to: CANNON.Vec3, result: CANNON.RaycastResult): void {
    this.world.rayTest(from, to, result);
  }
}

export default GameEngine; 