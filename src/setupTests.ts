// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Mock Three.js
jest.mock('three', () => ({
  Scene: jest.fn(),
  PerspectiveCamera: jest.fn(),
  WebGLRenderer: jest.fn(),
  BoxGeometry: jest.fn(),
  MeshStandardMaterial: jest.fn(),
  Mesh: jest.fn(),
  Vector3: jest.fn(),
  Euler: jest.fn(),
  Color: jest.fn(),
  AmbientLight: jest.fn(),
  DirectionalLight: jest.fn(),
  PointLight: jest.fn(),
  SpotLight: jest.fn(),
  FogExp2: jest.fn(),
  GridHelper: jest.fn(),
  ConeGeometry: jest.fn(),
  CylinderGeometry: jest.fn(),
}));

// Mock Cannon.js
jest.mock('cannon-es', () => ({
  World: jest.fn(),
  Body: jest.fn(),
  Plane: jest.fn(),
  Material: jest.fn(),
  Vec3: jest.fn(),
  Quaternion: jest.fn(),
  RaycastResult: jest.fn(),
}));
