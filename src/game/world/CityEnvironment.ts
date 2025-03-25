import * as THREE from 'three';
import { PhysicsEngine } from '../physics/PhysicsEngine';

export enum CityZone {
  DOWNTOWN = 'downtown',
  INDUSTRIAL = 'industrial',
  PARK = 'park',
  UNDERGROUND = 'underground'
}

interface ZoneConfig {
  groundColor: number;
  buildingColors: number[];
  buildingDensity: number;
  maxBuildingHeight: number;
  minBuildingHeight: number;
  decorations: {
    type: string;
    density: number;
    scale: number;
  }[];
}

export class CityEnvironment {
  private scene: THREE.Scene;
  private engine: PhysicsEngine;
  private currentZone: CityZone | null = null;
  private zoneObjects: THREE.Object3D[] = [];
  private zoneConfigs: Map<CityZone, ZoneConfig>;

  constructor(scene: THREE.Scene, engine: PhysicsEngine) {
    this.scene = scene;
    this.engine = engine;
    this.zoneConfigs = this.createZoneConfigs();
  }

  private createZoneConfigs(): Map<CityZone, ZoneConfig> {
    const configs = new Map<CityZone, ZoneConfig>();

    configs.set(CityZone.DOWNTOWN, {
      groundColor: 0x808080,
      buildingColors: [0x808080, 0xa0a0a0, 0xc0c0c0],
      buildingDensity: 0.8,
      maxBuildingHeight: 50,
      minBuildingHeight: 20,
      decorations: [
        {
          type: 'streetlight',
          density: 0.1,
          scale: 1
        },
        {
          type: 'tree',
          density: 0.05,
          scale: 1
        }
      ]
    });

    configs.set(CityZone.INDUSTRIAL, {
      groundColor: 0x606060,
      buildingColors: [0x505050, 0x707070, 0x909090],
      buildingDensity: 0.6,
      maxBuildingHeight: 30,
      minBuildingHeight: 10,
      decorations: [
        {
          type: 'container',
          density: 0.2,
          scale: 1
        },
        {
          type: 'crane',
          density: 0.05,
          scale: 2
        }
      ]
    });

    configs.set(CityZone.PARK, {
      groundColor: 0x408040,
      buildingColors: [0x606060, 0x808080],
      buildingDensity: 0.2,
      maxBuildingHeight: 15,
      minBuildingHeight: 5,
      decorations: [
        {
          type: 'tree',
          density: 0.4,
          scale: 1.5
        },
        {
          type: 'bench',
          density: 0.1,
          scale: 1
        }
      ]
    });

    configs.set(CityZone.UNDERGROUND, {
      groundColor: 0x303030,
      buildingColors: [0x404040, 0x505050],
      buildingDensity: 0.4,
      maxBuildingHeight: 10,
      minBuildingHeight: 5,
      decorations: [
        {
          type: 'pillar',
          density: 0.2,
          scale: 1
        },
        {
          type: 'light',
          density: 0.15,
          scale: 1
        }
      ]
    });

    return configs;
  }

  public loadZone(zone: CityZone): void {
    if (this.currentZone === zone) return;

    // Clear current zone
    this.clearZone();

    // Get zone config
    const config = this.zoneConfigs.get(zone);
    if (!config) {
      console.error(`No configuration found for zone: ${zone}`);
      return;
    }

    // Create ground
    const ground = this.createGround(config);
    this.zoneObjects.push(ground);
    this.scene.add(ground);

    // Create buildings
    const buildings = this.createBuildings(config);
    buildings.forEach(building => {
      this.zoneObjects.push(building);
      this.scene.add(building);
    });

    // Create decorations
    const decorations = this.createDecorations(config);
    decorations.forEach(decoration => {
      this.zoneObjects.push(decoration);
      this.scene.add(decoration);
    });

    this.currentZone = zone;
  }

  private createGround(config: ZoneConfig): THREE.Mesh {
    const geometry = new THREE.PlaneGeometry(100, 100);
    const material = new THREE.MeshPhongMaterial({
      color: config.groundColor,
      side: THREE.DoubleSide
    });
    const ground = new THREE.Mesh(geometry, material);
    ground.rotation.x = -Math.PI / 2;
    return ground;
  }

  private createBuildings(config: ZoneConfig): THREE.Mesh[] {
    const buildings: THREE.Mesh[] = [];
    const gridSize = 10;
    const cellSize = 10;

    for (let x = -gridSize/2; x < gridSize/2; x++) {
      for (let z = -gridSize/2; z < gridSize/2; z++) {
        if (Math.random() < config.buildingDensity) {
          const height = THREE.MathUtils.lerp(
            config.minBuildingHeight,
            config.maxBuildingHeight,
            Math.random()
          );
          const width = 2 + Math.random() * 4;
          const depth = 2 + Math.random() * 4;

          const geometry = new THREE.BoxGeometry(width, height, depth);
          const material = new THREE.MeshPhongMaterial({
            color: config.buildingColors[Math.floor(Math.random() * config.buildingColors.length)]
          });
          const building = new THREE.Mesh(geometry, material);

          building.position.set(
            x * cellSize + (Math.random() - 0.5) * cellSize,
            height / 2,
            z * cellSize + (Math.random() - 0.5) * cellSize
          );

          buildings.push(building);
        }
      }
    }

    return buildings;
  }

  private createDecorations(config: ZoneConfig): THREE.Object3D[] {
    const decorations: THREE.Object3D[] = [];

    config.decorations.forEach(decorationConfig => {
      const count = Math.floor(100 * decorationConfig.density);
      for (let i = 0; i < count; i++) {
        const decoration = this.createDecoration(decorationConfig);
        if (decoration) {
          decorations.push(decoration);
        }
      }
    });

    return decorations;
  }

  private createDecoration(config: { type: string; scale: number }): THREE.Object3D | null {
    let decoration: THREE.Object3D | null = null;

    switch (config.type) {
      case 'streetlight':
        decoration = this.createStreetlight(config.scale);
        break;
      case 'tree':
        decoration = this.createTree(config.scale);
        break;
      case 'container':
        decoration = this.createContainer(config.scale);
        break;
      case 'crane':
        decoration = this.createCrane(config.scale);
        break;
      case 'bench':
        decoration = this.createBench(config.scale);
        break;
      case 'pillar':
        decoration = this.createPillar(config.scale);
        break;
      case 'light':
        decoration = this.createLight(config.scale);
        break;
      default:
        console.warn(`Unknown decoration type: ${config.type}`);
        return null;
    }

    if (decoration) {
      // Position randomly in the zone
      const radius = 45; // Slightly less than ground size / 2
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * radius;

      decoration.position.x = Math.cos(angle) * distance;
      decoration.position.z = Math.sin(angle) * distance;
    }

    return decoration;
  }

  private createStreetlight(scale: number): THREE.Group {
    const group = new THREE.Group();

    // Create pole
    const poleGeometry = new THREE.CylinderGeometry(0.1, 0.1, 4, 8);
    const poleMaterial = new THREE.MeshPhongMaterial({ color: 0x404040 });
    const pole = new THREE.Mesh(poleGeometry, poleMaterial);
    pole.position.y = 2;
    group.add(pole);

    // Create light fixture
    const fixtureGeometry = new THREE.BoxGeometry(0.4, 0.2, 0.8);
    const fixtureMaterial = new THREE.MeshPhongMaterial({ color: 0x404040 });
    const fixture = new THREE.Mesh(fixtureGeometry, fixtureMaterial);
    fixture.position.set(0, 3.9, 0.3);
    group.add(fixture);

    // Add light
    const light = new THREE.PointLight(0xffffcc, 0.5, 10);
    light.position.set(0, 3.9, 0.3);
    group.add(light);

    group.scale.setScalar(scale);
    return group;
  }

  private createTree(scale: number): THREE.Group {
    const group = new THREE.Group();

    // Create trunk
    const trunkGeometry = new THREE.CylinderGeometry(0.2, 0.3, 2, 8);
    const trunkMaterial = new THREE.MeshPhongMaterial({ color: 0x4d2926 });
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
    trunk.position.y = 1;
    group.add(trunk);

    // Create leaves
    const leavesGeometry = new THREE.ConeGeometry(1.5, 3, 8);
    const leavesMaterial = new THREE.MeshPhongMaterial({ color: 0x228B22 });
    const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);
    leaves.position.y = 3;
    group.add(leaves);

    group.scale.setScalar(scale);
    return group;
  }

  private createContainer(scale: number): THREE.Mesh {
    const geometry = new THREE.BoxGeometry(4, 2.5, 8);
    const material = new THREE.MeshPhongMaterial({
      color: Math.random() > 0.5 ? 0x2b4d7e : 0x8b4513
    });
    const container = new THREE.Mesh(geometry, material);
    container.position.y = 1.25;
    container.scale.setScalar(scale);
    return container;
  }

  private createCrane(scale: number): THREE.Group {
    const group = new THREE.Group();

    // Create base
    const baseGeometry = new THREE.CylinderGeometry(1, 1, 1, 8);
    const baseMaterial = new THREE.MeshPhongMaterial({ color: 0x404040 });
    const base = new THREE.Mesh(baseGeometry, baseMaterial);
    base.position.y = 0.5;
    group.add(base);

    // Create tower
    const towerGeometry = new THREE.BoxGeometry(1, 20, 1);
    const towerMaterial = new THREE.MeshPhongMaterial({ color: 0xffff00 });
    const tower = new THREE.Mesh(towerGeometry, towerMaterial);
    tower.position.y = 10.5;
    group.add(tower);

    // Create arm
    const armGeometry = new THREE.BoxGeometry(15, 1, 1);
    const armMaterial = new THREE.MeshPhongMaterial({ color: 0xffff00 });
    const arm = new THREE.Mesh(armGeometry, armMaterial);
    arm.position.set(5, 20, 0);
    group.add(arm);

    group.scale.setScalar(scale);
    return group;
  }

  private createBench(scale: number): THREE.Group {
    const group = new THREE.Group();

    // Create seat
    const seatGeometry = new THREE.BoxGeometry(2, 0.1, 0.8);
    const seatMaterial = new THREE.MeshPhongMaterial({ color: 0x8b4513 });
    const seat = new THREE.Mesh(seatGeometry, seatMaterial);
    seat.position.y = 0.5;
    group.add(seat);

    // Create backrest
    const backrestGeometry = new THREE.BoxGeometry(2, 0.8, 0.1);
    const backrestMaterial = new THREE.MeshPhongMaterial({ color: 0x8b4513 });
    const backrest = new THREE.Mesh(backrestGeometry, backrestMaterial);
    backrest.position.set(0, 0.9, -0.35);
    group.add(backrest);

    // Create legs
    const legGeometry = new THREE.BoxGeometry(0.1, 0.5, 0.1);
    const legMaterial = new THREE.MeshPhongMaterial({ color: 0x404040 });

    const leg1 = new THREE.Mesh(legGeometry, legMaterial);
    leg1.position.set(-0.9, 0.25, 0.3);
    group.add(leg1);

    const leg2 = new THREE.Mesh(legGeometry, legMaterial);
    leg2.position.set(-0.9, 0.25, -0.3);
    group.add(leg2);

    const leg3 = new THREE.Mesh(legGeometry, legMaterial);
    leg3.position.set(0.9, 0.25, 0.3);
    group.add(leg3);

    const leg4 = new THREE.Mesh(legGeometry, legMaterial);
    leg4.position.set(0.9, 0.25, -0.3);
    group.add(leg4);

    group.scale.setScalar(scale);
    return group;
  }

  private createPillar(scale: number): THREE.Mesh {
    const geometry = new THREE.CylinderGeometry(0.5, 0.5, 8, 8);
    const material = new THREE.MeshPhongMaterial({ color: 0x808080 });
    const pillar = new THREE.Mesh(geometry, material);
    pillar.position.y = 4;
    pillar.scale.setScalar(scale);
    return pillar;
  }

  private createLight(scale: number): THREE.Group {
    const group = new THREE.Group();

    // Create fixture
    const fixtureGeometry = new THREE.CylinderGeometry(0.2, 0.3, 0.4, 8);
    const fixtureMaterial = new THREE.MeshPhongMaterial({ color: 0x404040 });
    const fixture = new THREE.Mesh(fixtureGeometry, fixtureMaterial);
    group.add(fixture);

    // Add light
    const light = new THREE.PointLight(0xffffcc, 0.3, 8);
    light.position.y = -0.2;
    group.add(light);

    group.scale.setScalar(scale);
    return group;
  }

  private clearZone(): void {
    this.zoneObjects.forEach(object => {
      this.scene.remove(object);
      if (object instanceof THREE.Mesh) {
        object.geometry.dispose();
        if (Array.isArray(object.material)) {
          object.material.forEach(material => material.dispose());
        } else {
          object.material.dispose();
        }
      }
    });
    this.zoneObjects = [];
  }

  public dispose(): void {
    this.clearZone();
  }
} 