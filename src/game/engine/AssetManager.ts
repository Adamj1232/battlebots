import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';

interface LoadingCallbacks {
  onProgress?: (progress: number) => void;
  onComplete?: () => void;
  onError?: (error: Error) => void;
}

interface AssetManifest {
  models: { [key: string]: string };
  textures: { [key: string]: string };
  sounds: { [key: string]: string };
}

interface LoadingStats {
  totalAssets: number;
  loadedAssets: number;
  failedAssets: number;
  retryAttempts: { [key: string]: number };
  errors: { [key: string]: string };
}

const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY = 1000; // 1 second

export class AssetManager {
  private models: { [key: string]: THREE.Group } = {};
  private textures: { [key: string]: THREE.Texture } = {};
  private sounds: { [key: string]: AudioBuffer } = {};
  private loadingManager!: THREE.LoadingManager;
  private textureLoader!: THREE.TextureLoader;
  private gltfLoader!: GLTFLoader;
  private audioContext!: AudioContext;
  private loadingStats: LoadingStats = {
    totalAssets: 0,
    loadedAssets: 0,
    failedAssets: 0,
    retryAttempts: {},
    errors: {}
  };
  private callbacks: LoadingCallbacks;
  private assetCache: Map<string, any> = new Map();
  private loadingPromises: Map<string, Promise<any>> = new Map();

  constructor(callbacks?: LoadingCallbacks) {
    this.callbacks = callbacks || {};
    this.initializeLoaders();
  }

  private initializeLoaders(): void {
    // Initialize loading manager with progress tracking
    this.loadingManager = new THREE.LoadingManager();
    this.setupLoadingManager();

    // Initialize loaders
    this.textureLoader = new THREE.TextureLoader(this.loadingManager);
    this.gltfLoader = new GLTFLoader(this.loadingManager);

    // Set up DRACO decoder for compressed models
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('/draco/');
    this.gltfLoader.setDRACOLoader(dracoLoader);

    // Initialize audio context
    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }

  private setupLoadingManager(): void {
    this.loadingManager.onProgress = (url, loaded, total) => {
      this.loadingStats.loadedAssets = loaded;
      this.loadingStats.totalAssets = total;
      const progress = total > 0 ? loaded / total : 0;
      this.callbacks.onProgress?.(progress);
    };

    this.loadingManager.onLoad = () => {
      if (this.loadingStats.failedAssets === 0) {
        this.callbacks.onComplete?.();
      }
    };

    this.loadingManager.onError = (url) => {
      console.error(`Failed to load asset: ${url}`);
      this.loadingStats.failedAssets++;
      this.loadingStats.errors[url] = `Failed to load asset`;
      this.callbacks.onError?.(new Error(`Failed to load asset: ${url}`));
    };
  }

  private async loadWithRetry<T>(
    key: string,
    loadFn: () => Promise<T>,
    attempt: number = 1
  ): Promise<T> {
    try {
      // Check if already loading
      const existingPromise = this.loadingPromises.get(key);
      if (existingPromise) {
        return existingPromise;
      }

      // Check cache first
      const cached = this.assetCache.get(key);
      if (cached) {
        return cached;
      }

      const loadPromise = loadFn();
      this.loadingPromises.set(key, loadPromise);

      const result = await loadPromise;
      this.assetCache.set(key, result);
      this.loadingPromises.delete(key);
      return result;
    } catch (error: unknown) {
      this.loadingPromises.delete(key);
      
      if (attempt < MAX_RETRY_ATTEMPTS) {
        console.warn(`Retry attempt ${attempt} for ${key}`);
        this.loadingStats.retryAttempts[key] = (this.loadingStats.retryAttempts[key] || 0) + 1;
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * attempt));
        return this.loadWithRetry(key, loadFn, attempt + 1);
      }

      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.loadingStats.errors[key] = errorMessage;
      throw error;
    }
  }

  private async loadTexture(key: string, url: string): Promise<void> {
    try {
      const texture = await this.loadWithRetry(
        `texture:${url}`,
        () => new Promise<THREE.Texture>((resolve, reject) => {
          this.textureLoader.load(url, resolve, undefined, reject);
        })
      );
      this.textures[key] = texture;
      texture.needsUpdate = true;
    } catch (error) {
      console.error(`Error loading texture ${url}:`, error);
      this.callbacks.onError?.(error as Error);
    }
  }

  private async loadModel(key: string, url: string): Promise<void> {
    try {
      const gltf = await this.loadWithRetry(
        `model:${url}`,
        () => new Promise<THREE.Group>((resolve, reject) => {
          this.gltfLoader.load(
            url,
            (gltf) => resolve(gltf.scene),
            undefined,
            reject
          );
        })
      );
      this.models[key] = gltf;
    } catch (error) {
      console.error(`Error loading model ${url}:`, error);
      this.callbacks.onError?.(error as Error);
    }
  }

  private async loadSound(key: string, url: string): Promise<void> {
    try {
      const audioBuffer = await this.loadWithRetry(
        `sound:${url}`,
        async () => {
          const response = await fetch(url);
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const arrayBuffer = await response.arrayBuffer();
          return await this.audioContext.decodeAudioData(arrayBuffer);
        }
      );
      this.sounds[key] = audioBuffer;
    } catch (error) {
      console.error(`Error loading sound ${url}:`, error);
      this.callbacks.onError?.(error as Error);
    }
  }

  public async preloadAssets(manifest: AssetManifest): Promise<void> {
    const promises: Promise<void>[] = [];

    // Reset loading stats
    this.loadingStats = {
      totalAssets: 0,
      loadedAssets: 0,
      failedAssets: 0,
      retryAttempts: {},
      errors: {}
    };

    // Load all assets in parallel with proper error handling
    for (const [key, url] of Object.entries(manifest.textures)) {
      promises.push(this.loadTexture(key, url).catch(error => {
        console.error(`Failed to load texture ${key}:`, error);
        this.loadingStats.errors[`texture:${key}`] = error.message;
      }));
    }

    for (const [key, url] of Object.entries(manifest.models)) {
      promises.push(this.loadModel(key, url).catch(error => {
        console.error(`Failed to load model ${key}:`, error);
        this.loadingStats.errors[`model:${key}`] = error.message;
      }));
    }

    for (const [key, url] of Object.entries(manifest.sounds)) {
      promises.push(this.loadSound(key, url).catch(error => {
        console.error(`Failed to load sound ${key}:`, error);
        this.loadingStats.errors[`sound:${key}`] = error.message;
      }));
    }

    await Promise.allSettled(promises);

    // If any assets failed to load, throw an error with details
    if (Object.keys(this.loadingStats.errors).length > 0) {
      throw new Error(`Failed to load some assets: ${JSON.stringify(this.loadingStats.errors)}`);
    }
  }

  public getModel(key: string): THREE.Group | undefined {
    return this.models[key];
  }

  public getTexture(key: string): THREE.Texture | undefined {
    return this.textures[key];
  }

  public async playSound(key: string, options: { loop?: boolean; volume?: number } = {}): Promise<void> {
    const buffer = this.sounds[key];
    if (!buffer) return;

    const source = this.audioContext.createBufferSource();
    const gainNode = this.audioContext.createGain();

    source.buffer = buffer;
    source.loop = options.loop || false;

    gainNode.gain.value = options.volume || 1;

    source.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    source.start(0);
  }

  public getLoadingProgress(): number {
    const { totalAssets, loadedAssets, failedAssets } = this.loadingStats;
    return totalAssets > 0 ? (loadedAssets + failedAssets) / totalAssets : 0;
  }

  public getLoadingStats(): LoadingStats {
    return { ...this.loadingStats };
  }

  public clearCache(): void {
    this.assetCache.clear();
  }

  public dispose(): void {
    // Dispose textures
    Object.values(this.textures).forEach(texture => {
      texture.dispose();
    });
    this.textures = {};

    // Clear models (Three.js will handle disposal of geometries and materials)
    this.models = {};

    // Clear sounds
    this.sounds = {};

    // Clear cache and loading promises
    this.assetCache.clear();
    this.loadingPromises.clear();

    // Close audio context
    this.audioContext.close();

    // Dispose DRACO loader
    this.gltfLoader.dracoLoader?.dispose();
  }
}

export default AssetManager; 