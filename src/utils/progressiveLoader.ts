import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { optimizeModel } from './modelOptimizer';

interface LoadingProgress {
  progress: number;
  loaded: number;
  total: number;
}

interface LoadingOptions {
  onProgress?: (progress: LoadingProgress) => void;
  onComplete?: (model: THREE.Object3D) => void;
  onError?: (error: Error) => void;
  quality?: 'low' | 'medium' | 'high';
}

export class ProgressiveLoader {
  private loader: GLTFLoader;
  private cache: Map<string, THREE.Object3D>;

  constructor() {
    this.loader = new GLTFLoader();
    this.cache = new Map();
  }

  private getQualitySettings(quality: 'low' | 'medium' | 'high' = 'medium') {
    switch (quality) {
      case 'low':
        return { maxTextureSize: 512, geometryQuality: 0.5 };
      case 'medium':
        return { maxTextureSize: 1024, geometryQuality: 0.75 };
      case 'high':
        return { maxTextureSize: 2048, geometryQuality: 1 };
    }
  }

  async loadModel(
    url: string,
    options: LoadingOptions = {}
  ): Promise<THREE.Object3D> {
    const {
      onProgress,
      onComplete,
      onError,
      quality = 'medium'
    } = options;

    // Check cache first
    const cachedModel = this.cache.get(url);
    if (cachedModel) {
      onComplete?.(cachedModel);
      return cachedModel;
    }

    try {
      // Load low quality version first
      const lowQualityUrl = url.replace('.glb', '_low.glb');
      const lowQualityModel = await this.loadModelFile(lowQualityUrl, {
        onProgress,
        quality: 'low'
      });

      // Start loading high quality version in background
      const highQualityPromise = this.loadModelFile(url, {
        onProgress,
        quality
      });

      // Return low quality model immediately
      onComplete?.(lowQualityModel);
      this.cache.set(url, lowQualityModel);

      // Update with high quality when ready
      highQualityPromise.then((highQualityModel) => {
        this.cache.set(url, highQualityModel);
        onComplete?.(highQualityModel);
      });

      return lowQualityModel;
    } catch (error) {
      onError?.(error as Error);
      throw error;
    }
  }

  private async loadModelFile(
    url: string,
    options: LoadingOptions
  ): Promise<THREE.Object3D> {
    const { onProgress, quality = 'medium' } = options;
    const settings = this.getQualitySettings(quality);

    return new Promise((resolve, reject) => {
      this.loader.load(
        url,
        (gltf) => {
          const model = gltf.scene;
          optimizeModel(model);
          resolve(model);
        },
        (progress) => {
          onProgress?.({
            progress: progress.loaded / progress.total,
            loaded: progress.loaded,
            total: progress.total
          });
        },
        reject
      );
    });
  }

  clearCache(): void {
    this.cache.clear();
  }
} 