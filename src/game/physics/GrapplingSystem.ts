import {
  Vector3,
  Object3D,
  Line,
  BufferGeometry,
  LineBasicMaterial,
  Float32BufferAttribute,
} from "three";
import { PhysicsEngine } from "./PhysicsEngine";

interface GrapplePoint {
  position: Vector3;
  normal: Vector3;
  distance: number;
}

interface GrappleConstraint {
  source: Object3D;
  target: Object3D;
  point: GrapplePoint;
  line: Line;
  constraint: any; // Physics constraint
  isActive: boolean;
}

export class GrapplingSystem {
  private scene: Object3D;
  private physicsEngine: PhysicsEngine;
  private activeGrapples: Map<string, GrappleConstraint> = new Map();
  private readonly GRAPPLE_CONFIG = {
    maxDistance: 20,
    minDistance: 2,
    pullForce: 1000,
    damping: 0.5,
    stiffness: 0.8,
  };

  constructor(scene: Object3D, physicsEngine: PhysicsEngine) {
    this.scene = scene;
    this.physicsEngine = physicsEngine;
  }

  public startGrapple(
    id: string,
    source: Object3D,
    target: Object3D,
    grapplePoint: GrapplePoint
  ): boolean {
    if (this.activeGrapples.has(id)) return false;

    // Create visual line for grapple
    const line = this.createGrappleLine(source, target);
    this.scene.add(line);

    // Create physics constraint
    const constraint = this.physicsEngine.addConstraint(source, target, {
      pivotA: source.position,
      pivotB: grapplePoint.position,
      maxDistance: grapplePoint.distance,
      stiffness: this.GRAPPLE_CONFIG.stiffness,
      damping: this.GRAPPLE_CONFIG.damping,
    });

    if (!constraint) {
      this.scene.remove(line);
      return false;
    }

    const grapple: GrappleConstraint = {
      source,
      target,
      point: grapplePoint,
      line,
      constraint,
      isActive: true,
    };

    this.activeGrapples.set(id, grapple);
    return true;
  }

  public releaseGrapple(id: string): void {
    const grapple = this.activeGrapples.get(id);
    if (!grapple) return;

    // Remove visual line
    this.scene.remove(grapple.line);

    // Remove physics constraint
    this.physicsEngine.removeConstraint(grapple.constraint);

    this.activeGrapples.delete(id);
  }

  public update(deltaTime: number): void {
    this.activeGrapples.forEach((grapple) => {
      if (!grapple.isActive) return;

      // Update line positions
      const sourcePos = new Vector3();
      const targetPos = new Vector3();

      grapple.source.getWorldPosition(sourcePos);
      grapple.target.getWorldPosition(targetPos);

      // Update line geometry
      const lineGeometry = grapple.line.geometry as BufferGeometry;
      lineGeometry.setAttribute(
        "position",
        new Float32BufferAttribute(
          [
            sourcePos.x,
            sourcePos.y,
            sourcePos.z,
            targetPos.x,
            targetPos.y,
            targetPos.z,
          ],
          3
        )
      );
      lineGeometry.computeBoundingSphere();

      // Apply pull force if distance exceeds max
      const distance = sourcePos.distanceTo(targetPos);
      if (distance > this.GRAPPLE_CONFIG.maxDistance) {
        const direction = targetPos.clone().sub(sourcePos).normalize();
        const force = direction.multiplyScalar(this.GRAPPLE_CONFIG.pullForce);
        this.physicsEngine.applyForce(grapple.source, force);
      }
    });
  }

  private createGrappleLine(source: Object3D, target: Object3D): Line {
    const sourcePos = new Vector3();
    const targetPos = new Vector3();

    source.getWorldPosition(sourcePos);
    target.getWorldPosition(targetPos);

    const geometry = new BufferGeometry();
    geometry.setAttribute(
      "position",
      new Float32BufferAttribute(
        [
          sourcePos.x,
          sourcePos.y,
          sourcePos.z,
          targetPos.x,
          targetPos.y,
          targetPos.z,
        ],
        3
      )
    );
    geometry.computeBoundingSphere();

    const material = new LineBasicMaterial({ color: 0x00ff00 });
    return new Line(geometry, material);
  }

  public findGrapplePoint(
    source: Object3D,
    target: Object3D,
    raycast: THREE.Raycaster
  ): GrapplePoint | null {
    const sourcePos = new Vector3();
    const targetPos = new Vector3();

    source.getWorldPosition(sourcePos);
    target.getWorldPosition(targetPos);

    // Check if target is within range
    const distance = sourcePos.distanceTo(targetPos);
    if (distance > this.GRAPPLE_CONFIG.maxDistance) return null;

    // Raycast to find surface point
    const direction = targetPos.clone().sub(sourcePos).normalize();
    raycast.set(sourcePos, direction);

    const intersects = raycast.intersectObject(target);
    if (intersects.length === 0) return null;

    const intersect = intersects[0];
    return {
      position: intersect.point,
      normal: intersect.face?.normal || new Vector3(),
      distance: intersect.distance,
    };
  }
}
