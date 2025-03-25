import * as THREE from 'three';

export interface LightingSetup {
  ambientLight: THREE.AmbientLight;
  directionalLight: THREE.DirectionalLight;
  pointLights: (THREE.PointLight | THREE.SpotLight)[];
}

export const createStandardLighting = (scene: THREE.Scene): LightingSetup => {
  // Ambient light for general illumination
  const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
  scene.add(ambientLight);

  // Directional light (sun)
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.position.set(5, 5, 5);
  directionalLight.castShadow = true;
  directionalLight.shadow.mapSize.width = 2048;
  directionalLight.shadow.mapSize.height = 2048;
  directionalLight.shadow.camera.near = 0.5;
  directionalLight.shadow.camera.far = 50;
  directionalLight.shadow.camera.left = -25;
  directionalLight.shadow.camera.right = 25;
  directionalLight.shadow.camera.top = 25;
  directionalLight.shadow.camera.bottom = -25;
  scene.add(directionalLight);

  // Point lights for additional atmosphere
  const pointLights = [
    new THREE.PointLight(0x4CAF50, 1, 50),
    new THREE.PointLight(0x2196F3, 1, 50)
  ];

  pointLights[0].position.set(-10, 15, -10);
  pointLights[1].position.set(10, 15, 10);

  pointLights.forEach(light => scene.add(light));

  return { ambientLight, directionalLight, pointLights };
};

export const createSciFiLighting = (scene: THREE.Scene): LightingSetup => {
  // Ambient light with blue tint
  const ambientLight = new THREE.AmbientLight(0x0a0b1e, 0.5);
  scene.add(ambientLight);

  // Key light with dramatic angle
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.position.set(-10, 20, 10);
  directionalLight.castShadow = true;
  directionalLight.shadow.mapSize.width = 2048;
  directionalLight.shadow.mapSize.height = 2048;
  directionalLight.shadow.camera.near = 0.5;
  directionalLight.shadow.camera.far = 50;
  directionalLight.shadow.camera.left = -25;
  directionalLight.shadow.camera.right = 25;
  directionalLight.shadow.camera.top = 25;
  directionalLight.shadow.camera.bottom = -25;
  scene.add(directionalLight);

  // Rim lights for dramatic effect
  const pointLights = [
    new THREE.SpotLight(0x00f2ff, 2),
    new THREE.SpotLight(0xff3d00, 2)
  ];

  pointLights[0].position.set(-15, 10, -15);
  pointLights[0].angle = Math.PI / 4;
  pointLights[0].penumbra = 0.5;

  pointLights[1].position.set(15, 10, -15);
  pointLights[1].angle = Math.PI / 4;
  pointLights[1].penumbra = 0.5;

  pointLights.forEach(light => scene.add(light));

  return { ambientLight, directionalLight, pointLights };
}; 