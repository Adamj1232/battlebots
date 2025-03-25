import * as THREE from 'three';

export const optimizeMaterial = (material: THREE.Material): void => {
  if (material instanceof THREE.MeshStandardMaterial) {
    material.roughness = 0.7;
    material.metalness = 0.3;
    material.envMapIntensity = 1;

    // Optimize texture settings
    if (material.map) {
      material.map.anisotropy = 16;
      material.map.generateMipmaps = true;
    }

    if (material.normalMap) {
      material.normalMap.anisotropy = 16;
      material.normalMap.generateMipmaps = true;
    }

    if (material.roughnessMap) {
      material.roughnessMap.anisotropy = 16;
      material.roughnessMap.generateMipmaps = true;
    }

    if (material.metalnessMap) {
      material.metalnessMap.anisotropy = 16;
      material.metalnessMap.generateMipmaps = true;
    }
  }

  // Optimize material settings
  material.side = THREE.FrontSide;
  material.transparent = false;
  material.depthWrite = true;
  material.depthTest = true;
};

export const optimizeModel = (model: THREE.Object3D): void => {
  model.traverse((object) => {
    if (object instanceof THREE.Mesh) {
      // Optimize geometry
      object.geometry.computeVertexNormals();
      object.geometry.computeBoundingSphere();
      object.geometry.computeBoundingBox();
      
      // Optimize materials
      if (Array.isArray(object.material)) {
        object.material.forEach(optimizeMaterial);
      } else {
        optimizeMaterial(object.material);
      }

      // Enable frustum culling
      object.frustumCulled = true;
    }
  });
};

export const createLODModel = (
  model: THREE.Object3D,
  distances: number[] = [0, 50, 100, 200]
): THREE.LOD => {
  const lod = new THREE.LOD();
  
  // Add original model as highest detail
  lod.addLevel(model, 0);

  // Create simplified versions for different distances
  distances.forEach((distance, index) => {
    if (index === 0) return; // Skip first distance as it's the original model

    const simplified = model.clone();
    simplified.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        // Reduce geometry detail
        const geometry = object.geometry;
        if (geometry instanceof THREE.BufferGeometry) {
          const attributes = geometry.attributes;
          if (attributes.position) {
            const positions = attributes.position.array;
            // Reduce vertex count by 50% for each level
            const stride = Math.pow(2, index);
            const newPositions = new Float32Array(positions.length / stride);
            for (let i = 0; i < positions.length; i += stride * 3) {
              newPositions[i / stride] = positions[i];
              newPositions[i / stride + 1] = positions[i + 1];
              newPositions[i / stride + 2] = positions[i + 2];
            }
            geometry.setAttribute('position', new THREE.BufferAttribute(newPositions, 3));
          }
        }
      }
    });

    lod.addLevel(simplified, distance);
  });

  return lod;
}; 