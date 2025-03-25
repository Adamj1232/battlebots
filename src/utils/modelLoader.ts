import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import * as THREE from 'three';

// Cache for loaded models
const modelCache = new Map<string, THREE.Group>();

// Initialize loaders
const gltfLoader = new GLTFLoader();
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('/draco/');
gltfLoader.setDRACOLoader(dracoLoader);

interface LoadModelOptions {
  onProgress?: (progress: number) => void;
  onError?: (error: Error) => void;
}

export async function loadModel(
  path: string,
  options: LoadModelOptions = {}
): Promise<THREE.Group> {
  // Check cache first
  if (modelCache.has(path)) {
    return modelCache.get(path)!.clone();
  }

  try {
    const gltf = await gltfLoader.loadAsync(path, (event) => {
      if (options.onProgress && event.lengthComputable) {
        const progress = (event.loaded / event.total) * 100;
        options.onProgress(progress);
      }
    });

    // Process the model
    const model = gltf.scene;
    model.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        
        // Handle materials
        if (mesh.material) {
          const material = mesh.material as THREE.Material;
          material.needsUpdate = true;
        }
      }
    });

    // Cache the processed model
    modelCache.set(path, model.clone());
    return model;
  } catch (error) {
    if (options.onError) {
      options.onError(error as Error);
    }
    throw error;
  }
}

export function clearModelCache(): void {
  modelCache.clear();
}

export function preloadModels(
  paths: string[],
  onProgress?: (overall: number) => void
): Promise<THREE.Group[]> {
  const total = paths.length;
  let completed = 0;

  const promises = paths.map((path) =>
    loadModel(path, {
      onProgress: () => {
        if (onProgress) {
          completed++;
          onProgress((completed / total) * 100);
        }
      },
    })
  );

  return Promise.all(promises);
}

export function disposeModel(model: THREE.Group): void {
  model.traverse((child) => {
    if ((child as THREE.Mesh).isMesh) {
      const mesh = child as THREE.Mesh;
      mesh.geometry.dispose();
      
      if (Array.isArray(mesh.material)) {
        mesh.material.forEach((material) => material.dispose());
      } else if (mesh.material) {
        mesh.material.dispose();
      }
    }
  });
} 