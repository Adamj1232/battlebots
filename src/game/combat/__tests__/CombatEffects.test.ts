import * as THREE from 'three';
import { CombatEffects } from '../CombatEffects';

jest.mock('three', () => {
  const mockVector3 = jest.fn().mockImplementation((x = 0, y = 0, z = 0) => ({
    x,
    y,
    z,
    copy: jest.fn().mockReturnThis(),
    add: jest.fn().mockReturnThis(),
    sub: jest.fn().mockReturnThis(),
    multiplyScalar: jest.fn().mockReturnThis(),
    normalize: jest.fn().mockReturnThis(),
    applyQuaternion: jest.fn().mockReturnThis(),
    clone: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis(),
    setFromScalar: jest.fn().mockReturnThis(),
    random: jest.fn().mockReturnThis(),
    randomDirection: jest.fn().mockReturnThis()
  }));

  const mockObject3D = {
    position: new mockVector3(),
    rotation: { x: 0, y: 0, z: 0 },
    scale: { x: 1, y: 1, z: 1 },
    quaternion: { x: 0, y: 0, z: 0, w: 1 },
    matrix: { elements: new Float32Array(16) },
    matrixWorld: { elements: new Float32Array(16) },
    modelViewMatrix: { elements: new Float32Array(16) },
    normalMatrix: { elements: new Float32Array(9) },
    matrixWorldAutoUpdate: true,
    add: jest.fn(),
    remove: jest.fn(),
    removeFromParent: jest.fn(),
    clear: jest.fn(),
    dispose: jest.fn(),
    updateMorphTargets: jest.fn(),
    applyQuaternion: jest.fn(),
    rotateOnAxis: jest.fn(),
    rotateOnWorldAxis: jest.fn(),
    rotateX: jest.fn(),
    rotateY: jest.fn(),
    rotateZ: jest.fn(),
    translateOnAxis: jest.fn(),
    translateX: jest.fn(),
    translateY: jest.fn(),
    translateZ: jest.fn()
  };

  const mockBufferGeometry = jest.fn().mockImplementation(() => ({
    ...mockObject3D,
    attributes: {
      position: {
        array: new Float32Array([1, 2, 3]),
        itemSize: 3,
        count: 1
      }
    },
    setAttribute: jest.fn(),
    getAttribute: jest.fn().mockReturnValue({
      array: new Float32Array([1, 2, 3]),
      itemSize: 3,
      count: 1
    }),
    setFromPoints: jest.fn().mockReturnThis(),
    dispose: jest.fn()
  }));

  const mockPointsMaterial = jest.fn().mockImplementation(() => ({
    color: { r: 1, g: 0, b: 0 },
    size: 1,
    transparent: true,
    opacity: 1,
    dispose: jest.fn()
  }));

  const mockLineBasicMaterial = jest.fn().mockImplementation(() => ({
    color: { r: 1, g: 0, b: 0 },
    transparent: true,
    opacity: 1,
    dispose: jest.fn()
  }));

  const mockPoints = jest.fn().mockImplementation((geometry, material) => ({
    ...mockObject3D,
    isPoints: true,
    geometry,
    material,
    dispose: jest.fn()
  }));

  const mockLine = jest.fn().mockImplementation((geometry, material) => ({
    ...mockObject3D,
    isLine: true,
    geometry,
    material,
    dispose: jest.fn()
  }));

  const mockScene = jest.fn().mockImplementation(() => ({
    ...mockObject3D,
    children: [],
    add: jest.fn(child => {
      mockScene.mock.instances[0].children.push(child);
    }),
    remove: jest.fn(child => {
      const index = mockScene.mock.instances[0].children.indexOf(child);
      if (index > -1) {
        mockScene.mock.instances[0].children.splice(index, 1);
      }
    })
  }));

  return {
    Vector3: mockVector3,
    Scene: mockScene,
    BufferGeometry: mockBufferGeometry,
    PointsMaterial: mockPointsMaterial,
    LineBasicMaterial: mockLineBasicMaterial,
    Points: mockPoints,
    Line: mockLine,
    Color: jest.fn().mockImplementation(() => ({ r: 1, g: 0, b: 0 }))
  };
});

describe('CombatEffects', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create impact effects with correct initial positions', () => {
    const scene = new THREE.Scene();
    const effects = new CombatEffects(scene);
    const position = new THREE.Vector3(1, 2, 3);

    effects.handleCombatEvent({
      type: 'damage',
      source: 'test-bot',
      position,
      timestamp: Date.now()
    });

    expect(scene.children.length).toBe(1);
    const points = scene.children[0];
    expect(points.position.x).toBe(1);
    expect(points.position.y).toBe(2);
    expect(points.position.z).toBe(3);
  });

  it('should create energy effects with correct initial positions', () => {
    const scene = new THREE.Scene();
    const effects = new CombatEffects(scene);
    const position = new THREE.Vector3(1, 2, 3);

    effects.handleCombatEvent({
      type: 'ability',
      source: 'test-bot',
      position,
      timestamp: Date.now()
    });

    expect(scene.children.length).toBe(1);
    const points = scene.children[0];
    expect(points.position.x).toBe(1);
    expect(points.position.y).toBe(2);
    expect(points.position.z).toBe(3);
  });

  it('should create status effects with correct initial positions', () => {
    const scene = new THREE.Scene();
    const effects = new CombatEffects(scene);
    const position = new THREE.Vector3(1, 2, 3);

    effects.handleCombatEvent({
      type: 'effect',
      source: 'test-bot',
      position,
      effect: {
        type: 'burn',
        duration: 1000,
        strength: 1,
        source: 'test-bot'
      },
      timestamp: Date.now()
    });

    expect(scene.children.length).toBe(1);
    const points = scene.children[0];
    expect(points.position.x).toBe(1);
    expect(points.position.y).toBe(2);
    expect(points.position.z).toBe(3);
  });

  it('should create transform effects with correct initial positions', () => {
    const scene = new THREE.Scene();
    const effects = new CombatEffects(scene);
    const position = new THREE.Vector3(1, 2, 3);

    effects.handleCombatEvent({
      type: 'transform',
      source: 'test-bot',
      position,
      timestamp: Date.now()
    });

    expect(scene.children.length).toBe(1);
    const line = scene.children[0];
    expect(line.position.x).toBe(1);
    expect(line.position.y).toBe(2);
    expect(line.position.z).toBe(3);
  });

  it('should clean up effects after their lifetime', done => {
    const scene = new THREE.Scene();
    const effects = new CombatEffects(scene);
    const position = new THREE.Vector3(1, 2, 3);

    effects.handleCombatEvent({
      type: 'damage',
      source: 'test-bot',
      position,
      timestamp: Date.now()
    });

    expect(scene.children.length).toBe(1);

    setTimeout(() => {
      expect(scene.children.length).toBe(0);
      done();
    }, 1100); // Slightly longer than the default lifetime
  });

  it('should dispose of all effects when the instance is disposed', () => {
    const scene = new THREE.Scene();
    const effects = new CombatEffects(scene);
    const position = new THREE.Vector3(1, 2, 3);

    effects.handleCombatEvent({
      type: 'damage',
      source: 'test-bot',
      position,
      timestamp: Date.now()
    });

    effects.dispose();
    expect(scene.children.length).toBe(0);
  });
}); 