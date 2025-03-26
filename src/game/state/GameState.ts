import { CityZone, ZoneType } from '../environment/CityZone';
import { PhysicsEngine } from '../physics/PhysicsEngine';
import { PhysicsConfig } from '../physics/PhysicsConfig';
import * as THREE from 'three';

export interface RobotState {
  id: string;
  position: THREE.Vector3;
  rotation: THREE.Euler;
  health: number;
  energy: number;
  faction: 'autobot' | 'decepticon';
}

export interface GameStateOptions {
  initialZone: ZoneType;
  physicsConfig: PhysicsConfig;
}

export class GameState {
  private currentZone: CityZone | null = null;
  private physicsEngine: PhysicsEngine;
  private robots: Map<string, RobotState> = new Map();
  private activeZone: ZoneType;
  private isPaused: boolean = false;
  private score: number = 0;
  private timeElapsed: number = 0;

  constructor(options: GameStateOptions) {
    this.activeZone = options.initialZone;
    this.physicsEngine = new PhysicsEngine(options.physicsConfig);
  }

  public async initialize(scene: THREE.Scene): Promise<void> {
    // Initialize physics engine
    this.physicsEngine.initialize();

    // Load initial zone
    await this.loadZone(this.activeZone, scene);
  }

  public async loadZone(zoneType: ZoneType, scene: THREE.Scene): Promise<void> {
    // Clean up current zone if exists
    if (this.currentZone) {
      this.currentZone.dispose();
    }

    // Create and load new zone
    this.currentZone = new CityZone(zoneType, scene, this.physicsEngine);
    await this.currentZone.load();
    this.activeZone = zoneType;
  }

  public update(deltaTime: number): void {
    if (this.isPaused) return;

    // Update physics
    this.physicsEngine.update(deltaTime);

    // Update current zone
    if (this.currentZone) {
      this.currentZone.update(deltaTime);
    }

    // Update robots
    this.updateRobots(deltaTime);

    // Update game time
    this.timeElapsed += deltaTime;
  }

  private updateRobots(deltaTime: number): void {
    this.robots.forEach((robot, id) => {
      // Update robot energy
      robot.energy = Math.min(100, robot.energy + deltaTime * 5);

      // Update robot state based on physics
      const body = this.physicsEngine.getBody(id);
      if (body) {
        robot.position.copy(body.position);
        robot.rotation.setFromQuaternion(new THREE.Quaternion(
          body.quaternion.x,
          body.quaternion.y,
          body.quaternion.z,
          body.quaternion.w
        ));
      }
    });
  }

  public addRobot(robot: RobotState): void {
    this.robots.set(robot.id, robot);
  }

  public removeRobot(robotId: string): void {
    this.robots.delete(robotId);
  }

  public getRobot(robotId: string): RobotState | undefined {
    return this.robots.get(robotId);
  }

  public getAllRobots(): RobotState[] {
    return Array.from(this.robots.values());
  }

  public getCurrentZone(): ZoneType {
    return this.activeZone;
  }

  public getScore(): number {
    return this.score;
  }

  public addScore(points: number): void {
    this.score += points;
  }

  public getTimeElapsed(): number {
    return this.timeElapsed;
  }

  public pause(): void {
    this.isPaused = true;
  }

  public resume(): void {
    this.isPaused = false;
  }

  public isGamePaused(): boolean {
    return this.isPaused;
  }

  public dispose(): void {
    // Clean up current zone
    if (this.currentZone) {
      this.currentZone.dispose();
      this.currentZone = null;
    }

    // Clean up physics engine
    this.physicsEngine.dispose();

    // Clear robot states
    this.robots.clear();
  }
} 