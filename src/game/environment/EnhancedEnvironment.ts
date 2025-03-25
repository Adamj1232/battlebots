import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader';

export default class EnhancedEnvironment {
  private scene: THREE.Scene;
  private renderer: THREE.WebGLRenderer;
  private camera: THREE.Camera;
  private composer: EffectComposer;
  private ground: THREE.Mesh;
  private lights: THREE.Light[] = [];
  private volumetricLights: THREE.Mesh[] = [];

  constructor(scene: THREE.Scene, renderer: THREE.WebGLRenderer, camera: THREE.Camera) {
    this.scene = scene;
    this.renderer = renderer;
    this.camera = camera;
    this.ground = new THREE.Mesh();
    this.composer = new EffectComposer(this.renderer);
    
    this.setupEnvironment();
    this.setupPostProcessing();
  }

  private setupEnvironment(): void {
    // Create enhanced ground with glowing grid
    const groundGeometry = new THREE.PlaneGeometry(200, 200, 40, 40);
    const groundMaterial = new THREE.MeshStandardMaterial({
      color: 0x0a0b1e,
      metalness: 0.8,
      roughness: 0.2,
      emissive: 0x00f2ff,
      emissiveIntensity: 0.2
    });

    this.ground = new THREE.Mesh(groundGeometry, groundMaterial);
    this.ground.rotation.x = -Math.PI / 2;
    this.ground.receiveShadow = true;
    this.scene.add(this.ground);

    // Add grid helper with glowing effect
    const gridHelper = new THREE.GridHelper(200, 40, 0x00f2ff, 0x00f2ff);
    (gridHelper.material as THREE.Material).opacity = 0.15;
    (gridHelper.material as THREE.Material).transparent = true;
    this.scene.add(gridHelper);

    // Main lighting setup
    const ambientLight = new THREE.AmbientLight(0x111111);
    this.lights.push(ambientLight);
    this.scene.add(ambientLight);

    // Dramatic key light
    const keyLight = new THREE.DirectionalLight(0xffffff, 1);
    keyLight.position.set(-10, 20, 10);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 50;
    keyLight.shadow.camera.left = -25;
    keyLight.shadow.camera.right = 25;
    keyLight.shadow.camera.top = 25;
    keyLight.shadow.camera.bottom = -25;
    this.lights.push(keyLight);
    this.scene.add(keyLight);

    // Rim lights for dramatic effect
    const rimLight1 = new THREE.SpotLight(0x00f2ff, 2);
    rimLight1.position.set(-15, 10, -15);
    rimLight1.angle = Math.PI / 4;
    rimLight1.penumbra = 0.5;
    this.lights.push(rimLight1);
    this.scene.add(rimLight1);

    const rimLight2 = new THREE.SpotLight(0xff3d00, 2);
    rimLight2.position.set(15, 10, -15);
    rimLight2.angle = Math.PI / 4;
    rimLight2.penumbra = 0.5;
    this.lights.push(rimLight2);
    this.scene.add(rimLight2);

    // Add volumetric light beams
    this.createVolumetricLight(0x00f2ff, new THREE.Vector3(-15, 0, -15));
    this.createVolumetricLight(0xff3d00, new THREE.Vector3(15, 0, -15));

    // Add fog for atmosphere
    this.scene.fog = new THREE.FogExp2(0x0a0b1e, 0.015);

    // Set scene background
    const backgroundColor = new THREE.Color(0x0a0b1e);
    this.scene.background = backgroundColor;
  }

  private createVolumetricLight(color: number, position: THREE.Vector3): void {
    const geometry = new THREE.CylinderGeometry(0.1, 5, 20, 32, 1, true);
    const material = new THREE.ShaderMaterial({
      uniforms: {
        color: { value: new THREE.Color(color) },
        fogColor: { value: new THREE.Color(0x0a0b1e) },
        fogDensity: { value: 0.015 }
      },
      vertexShader: `
        varying vec3 vWorldPosition;
        void main() {
          vec4 worldPosition = modelMatrix * vec4(position, 1.0);
          vWorldPosition = worldPosition.xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 color;
        uniform vec3 fogColor;
        uniform float fogDensity;
        varying vec3 vWorldPosition;
        void main() {
          float height = vWorldPosition.y;
          float fogFactor = 1.0 - exp(-fogDensity * height * height);
          gl_FragColor = vec4(color, 0.1 * (1.0 - height / 20.0));
          gl_FragColor.rgb = mix(gl_FragColor.rgb, fogColor, fogFactor);
        }
      `,
      transparent: true,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending
    });

    const volumetricLight = new THREE.Mesh(geometry, material);
    volumetricLight.position.copy(position);
    volumetricLight.position.y += 10;
    this.volumetricLights.push(volumetricLight);
    this.scene.add(volumetricLight);
  }

  private setupPostProcessing(): void {
    // Regular scene render pass
    const renderPass = new RenderPass(this.scene, this.camera);
    this.composer.addPass(renderPass);

    // Bloom effect for glow
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      1.5, // strength
      0.4, // radius
      0.85 // threshold
    );
    this.composer.addPass(bloomPass);

    // Anti-aliasing
    const fxaaPass = new ShaderPass(FXAAShader);
    const pixelRatio = this.renderer.getPixelRatio();
    fxaaPass.material.uniforms['resolution'].value.x = 1 / (window.innerWidth * pixelRatio);
    fxaaPass.material.uniforms['resolution'].value.y = 1 / (window.innerHeight * pixelRatio);
    this.composer.addPass(fxaaPass);
  }

  public update(deltaTime: number): void {
    // Animate volumetric lights
    this.volumetricLights.forEach((light, index) => {
      const time = Date.now() * 0.001;
      const offset = index * Math.PI;
      light.position.y = 10 + Math.sin(time + offset) * 2;
      light.rotation.y = time * 0.5;
    });

    // Update post-processing
    this.composer.render();
  }

  public onWindowResize(): void {
    const pixelRatio = this.renderer.getPixelRatio();
    const width = window.innerWidth;
    const height = window.innerHeight;

    this.composer.setSize(width, height);
    const fxaaPass = this.composer.passes.find(pass => pass instanceof ShaderPass) as ShaderPass;
    if (fxaaPass) {
      fxaaPass.material.uniforms['resolution'].value.x = 1 / (width * pixelRatio);
      fxaaPass.material.uniforms['resolution'].value.y = 1 / (height * pixelRatio);
    }
  }

  public dispose(): void {
    // Dispose of geometries and materials
    this.ground.geometry.dispose();
    (this.ground.material as THREE.Material).dispose();
    this.scene.remove(this.ground);

    // Remove and dispose of lights
    this.lights.forEach(light => {
      this.scene.remove(light);
    });
    this.lights = [];

    // Remove and dispose of volumetric lights
    this.volumetricLights.forEach(light => {
      light.geometry.dispose();
      (light.material as THREE.Material).dispose();
      this.scene.remove(light);
    });
    this.volumetricLights = [];

    // Dispose of post-processing
    this.composer.dispose();
  }
} 