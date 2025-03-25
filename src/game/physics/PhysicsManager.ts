import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { optimizeModel } from '../../utils/modelOptimizer';

interface PhysicsBody {
  mesh: THREE.Object3D;
  body: CANNON.Body;
  mass: number;
  friction: number;
  restitution: number;
}

export class PhysicsManager {
  private world: CANNON.World;
  private bodies: PhysicsBody[];
  private ground: CANNON.Body | null;
  private debugRenderer: THREE.Mesh | null;

  constructor() {
    this.world = new CANNON.World({
      gravity: new CANNON.Vec3(0, -9.82, 0)
    });
    this.bodies = [];
    this.ground = null;
    this.debugRenderer = null;
  }

  public addBody(
    mesh: THREE.Object3D,
    mass: number = 1,
    friction: number = 0.3,
    restitution: number = 0.3
  ): void {
    const shape = this.createShapeFromMesh(mesh);
    const body = new CANNON.Body({
      mass,
      shape,
      material: new CANNON.Material({
        friction,
        restitution
      })
    });

    body.position.copy(mesh.position as unknown as CANNON.Vec3);
    body.quaternion.copy(mesh.quaternion as unknown as CANNON.Quaternion);

    this.world.addBody(body);
    this.bodies.push({
      mesh,
      body,
      mass,
      friction,
      restitution
    });
  }

  public removeBody(mesh: THREE.Object3D): void {
    const index = this.bodies.findIndex(body => body.mesh === mesh);
    if (index !== -1) {
      const { body } = this.bodies[index];
      this.world.removeBody(body);
      this.bodies.splice(index, 1);
    }
  }

  public setGround(
    width: number,
    height: number,
    friction: number = 0.3,
    restitution: number = 0.3
  ): void {
    if (this.ground) {
      this.world.removeBody(this.ground);
    }

    const groundShape = new CANNON.Plane();
    this.ground = new CANNON.Body({
      mass: 0,
      shape: groundShape,
      material: new CANNON.Material({
        friction,
        restitution
      })
    });

    this.ground.quaternion.setFromAxisAngle(
      new CANNON.Vec3(1, 0, 0),
      -Math.PI / 2
    );

    this.world.addBody(this.ground);
  }

  public update(deltaTime: number): void {
    this.world.step(deltaTime);

    // Update mesh positions based on physics
    this.bodies.forEach(({ mesh, body }) => {
      mesh.position.copy(body.position as unknown as THREE.Vector3);
      mesh.quaternion.copy(body.quaternion as unknown as THREE.Quaternion);
    });
  }

  private createShapeFromMesh(mesh: THREE.Object3D): CANNON.Shape {
    // Get the geometry from the mesh
    const geometry = (mesh as THREE.Mesh).geometry;
    if (!geometry) {
      throw new Error('Mesh must have geometry to create physics shape');
    }

    // Create shape based on geometry type
    if ('isBoxGeometry' in geometry) {
      const size = new THREE.Vector3();
      geometry.computeBoundingBox();
      geometry.boundingBox!.getSize(size);
      return new CANNON.Box(new CANNON.Vec3(size.x / 2, size.y / 2, size.z / 2));
    } else if ('isSphereGeometry' in geometry && 'parameters' in geometry) {
      const sphereGeometry = geometry as THREE.SphereGeometry;
      return new CANNON.Sphere(sphereGeometry.parameters.radius);
    } else {
      // For complex geometries, create a convex hull
      const positions = geometry.attributes.position.array;
      const vertices: CANNON.Vec3[] = [];
      for (let i = 0; i < positions.length; i += 3) {
        vertices.push(new CANNON.Vec3(
          positions[i],
          positions[i + 1],
          positions[i + 2]
        ));
      }
      const faces = this.createFaces(vertices.length);
      return new CANNON.ConvexPolyhedron({ vertices, faces });
    }
  }

  private createFaces(vertexCount: number): number[][] {
    const faces: number[][] = [];
    for (let i = 0; i < vertexCount - 2; i++) {
      faces.push([0, i + 1, i + 2]);
    }
    return faces;
  }

  public enableDebugRenderer(scene: THREE.Scene): void {
    if (!this.debugRenderer) {
      const geometry = new THREE.BoxGeometry(1, 1, 1);
      const material = new THREE.MeshBasicMaterial({
        wireframe: true,
        color: 0x00ff00
      });
      this.debugRenderer = new THREE.Mesh(geometry, material);
      scene.add(this.debugRenderer);
    }
  }

  public disableDebugRenderer(scene: THREE.Scene): void {
    if (this.debugRenderer) {
      scene.remove(this.debugRenderer);
      this.debugRenderer = null;
    }
  }

  public dispose(): void {
    this.bodies.forEach(({ body }) => {
      this.world.removeBody(body);
    });
    this.bodies = [];

    if (this.ground) {
      this.world.removeBody(this.ground);
      this.ground = null;
    }
  }
} 