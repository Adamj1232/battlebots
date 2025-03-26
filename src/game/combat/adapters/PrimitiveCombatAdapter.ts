import { Color, Mesh, Object3D, Raycaster, Vector3 } from 'three';
import { PrimitiveRobot } from '../../robots/PrimitiveRobot';
import { PartCategory } from '../../robots/types';
import { CombatTarget, DamageInfo, HitInfo, TargetType } from '../types';

export class PrimitiveCombatAdapter {
  private robot: PrimitiveRobot;
  private highlightedParts: Set<string> = new Set();
  private originalMaterials: Map<Mesh, { color: Color }> = new Map();
  private readonly HIGHLIGHT_COLOR = new Color(0x00ff00);
  private readonly DAMAGE_COLOR = new Color(0xff0000);

  constructor(robot: PrimitiveRobot) {
    this.robot = robot;
  }

  public checkHit(raycaster: Raycaster): HitInfo | null {
    // Get all meshes from the robot's parts
    const meshes = this.getAllMeshes();
    const intersects = raycaster.intersectObjects(meshes, true);

    if (intersects.length === 0) return null;

    const hit = intersects[0];
    const partName = this.findPartNameFromMesh(hit.object as Mesh);

    if (!partName) return null;

    return {
      point: hit.point,
      normal: hit.face?.normal ?? new Vector3(),
      distance: hit.distance,
      partName,
      targetType: TargetType.Robot
    };
  }

  public highlightPart(partName: string): void {
    const mesh = this.getMeshForPart(partName);
    if (!mesh || this.highlightedParts.has(partName)) return;

    // Store original material
    this.storeOriginalMaterial(mesh);
    
    // Apply highlight
    if (mesh.material) {
      (mesh.material as any).color = this.HIGHLIGHT_COLOR;
      this.highlightedParts.add(partName);
    }
  }

  public clearHighlight(partName: string): void {
    const mesh = this.getMeshForPart(partName);
    if (!mesh || !this.highlightedParts.has(partName)) return;

    this.restoreOriginalMaterial(mesh);
    this.highlightedParts.delete(partName);
  }

  public applyDamage(info: DamageInfo): void {
    const { partName, amount } = info;
    
    // Apply visual damage effect
    this.robot.setDamage(partName, amount);

    // Flash damage color
    const mesh = this.getMeshForPart(partName);
    if (mesh?.material) {
      const originalColor = new Color();
      originalColor.copy((mesh.material as any).color);

      (mesh.material as any).color = this.DAMAGE_COLOR;
      
      setTimeout(() => {
        if (mesh.material) {
          (mesh.material as any).color = originalColor;
        }
      }, 200);
    }
  }

  public getTargetInfo(partName: string): CombatTarget {
    const mesh = this.getMeshForPart(partName);
    if (!mesh) throw new Error(`Part not found: ${partName}`);

    const worldPosition = new Vector3();
    mesh.getWorldPosition(worldPosition);

    return {
      type: TargetType.Robot,
      position: worldPosition,
      part: partName,
      object: mesh
    };
  }

  public playAnimation(type: string, partName?: string): void {
    if (partName) {
      // Animate specific part
      this.robot.animate(type, 0);
    } else {
      // Animate entire robot
      this.robot.animate(type, 0);
    }
  }

  private getAllMeshes(): Object3D[] {
    const meshes: Object3D[] = [];
    this.robot.traverse((obj) => {
      if (obj instanceof Mesh) {
        meshes.push(obj);
      }
    });
    return meshes;
  }

  private getMeshForPart(partName: string): Mesh | null {
    const part = this.robot.getPart(partName);
    if (!part) return null;

    let mainMesh: Mesh | null = null;
    part.mesh.traverse((obj) => {
      if (obj instanceof Mesh && !mainMesh) {
        mainMesh = obj;
      }
    });

    return mainMesh;
  }

  private findPartNameFromMesh(mesh: Mesh): string | null {
    // Traverse up the hierarchy to find the part group
    let current: Object3D | null = mesh;
    while (current && !current.userData.partName) {
      current = current.parent;
    }
    return current?.userData.partName ?? null;
  }

  private storeOriginalMaterial(mesh: Mesh): void {
    if (!this.originalMaterials.has(mesh) && mesh.material) {
      this.originalMaterials.set(mesh, {
        color: (mesh.material as any).color.clone()
      });
    }
  }

  private restoreOriginalMaterial(mesh: Mesh): void {
    const original = this.originalMaterials.get(mesh);
    if (original && mesh.material) {
      (mesh.material as any).color.copy(original.color);
      this.originalMaterials.delete(mesh);
    }
  }
} 