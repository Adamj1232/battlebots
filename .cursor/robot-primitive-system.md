# Battle System Implementation for Primitive Robots

This guide updates our battle system implementation to work effectively with primitive-based robot representations.

## Core Combat Requirements

- Design attacks with clear cause and effect on primitive parts
- Implement hit detection for geometric primitive components
- Create visual feedback suitable for primitive-based robots
- Ensure combat animations work with direct geometry manipulation
- Implement damage visualization on primitives (color changes, deformation)
- Design effects that complement the primitive aesthetic

## Technical Implementation Updates

### Hit Detection

Update the hit detection system to work with primitive geometries:

```javascript
function createHitDetector(robot) {
  // Create simple bounding boxes for each major part
  const hitBoxes = {};
  
  Object.entries(robot.parts).forEach(([partName, part]) => {
    // Create a bounding box for this part
    const boundingBox = new THREE.Box3().setFromObject(part);
    hitBoxes[partName] = boundingBox;
  });
  
  return {
    // Check if a ray intersects any part
    checkHit: function(raycaster) {
      const intersections = [];
      
      // Check each part for intersection
      Object.entries(robot.parts).forEach(([partName, part]) => {
        // Use direct ray casting on actual geometries for better precision
        const partIntersections = raycaster.intersectObject(part, true);
        
        if (partIntersections.length > 0) {
          intersections.push({
            part: partName,
            distance: partIntersections[0].distance,
            point: partIntersections[0].point,
            object: partIntersections[0].object
          });
        }
      });
      
      // Sort by distance
      intersections.sort((a, b) => a.distance - b.distance);
      return intersections.length > 0 ? intersections[0] : null;
    },
    
    // Check if a point is within any part's bounding box
    checkPointHit: function(point) {
      for (const [partName, boundingBox] of Object.entries(hitBoxes)) {
        if (boundingBox.containsPoint(point)) {
          return { part: partName };
        }
      }
      return null;
    }
  };
}
```

### Damage Visualization

Create visual effects for damage on primitive parts:

```javascript
function visualizeDamage(part, damageAmount) {
  // Get all meshes in this part
  const meshes = [];
  part.traverse(child => {
    if (child.isMesh) {
      meshes.push(child);
    }
  });
  
  // Apply visual damage effects
  meshes.forEach(mesh => {
    // Store original material if not already saved
    if (!mesh.userData.originalMaterial) {
      mesh.userData.originalMaterial = mesh.material.clone();
      mesh.userData.damageLevel = 0;
    }
    
    // Update damage level
    mesh.userData.damageLevel += damageAmount / 100;
    
    // Clamp damage level
    mesh.userData.damageLevel = Math.min(Math.max(mesh.userData.damageLevel, 0), 1);
    
    // Create damaged version of material
    const damagedMaterial = mesh.material.clone();
    
    // Add scorch marks (darker patches)
    damagedMaterial.roughness = mesh.userData.originalMaterial.roughness + (0.3 * mesh.userData.damageLevel);
    damagedMaterial.metalness = Math.max(0, mesh.userData.originalMaterial.metalness - (0.2 * mesh.userData.damageLevel));
    
    // Darken the color
    damagedMaterial.color.copy(mesh.userData.originalMaterial.color);
    damagedMaterial.color.multiplyScalar(1 - (0.3 * mesh.userData.damageLevel));
    
    // Apply the damaged material
    mesh.material = damagedMaterial;
    
    // Add deformation effect for severe damage
    if (mesh.userData.damageLevel > 0.5 && mesh.geometry.isBufferGeometry) {
      const positions = mesh.geometry.attributes.position.array;
      const normals = mesh.geometry.attributes.normal.array;
      
      // Apply random deformation along normals
      for (let i = 0; i < positions.length; i += 3) {
        const deformAmount = (Math.random() * 0.05) * mesh.userData.damageLevel;
        positions[i] += normals[i] * deformAmount;
        positions[i+1] += normals[i+1] * deformAmount;
        positions[i+2] += normals[i+2] * deformAmount;
      }
      
      mesh.geometry.attributes.position.needsUpdate = true;
    }
  });
}
```

### Attack Animations

Update attack animations to work with primitive geometries:

```javascript
function animateAttack(robot, attackType) {
  const animations = {
    punch: {
      duration: 0.5,
      keyframes: [
        { time: 0, pose: { rightArm: { rotation: { x: 0, y: 0, z: 0 } } } },
        { time: 0.25, pose: { rightArm: { rotation: { x: -Math.PI/2, y: 0, z: 0 } } } },
        { time: 0.5, pose: { rightArm: { rotation: { x: 0, y: 0, z: 0 } } } }
      ]
    },
    shoot: {
      duration: 0.6,
      keyframes: [
        { time: 0, pose: { rightArm: { rotation: { x: 0, y: 0, z: 0 } } } },
        { time: 0.2, pose: { rightArm: { rotation: { x: 0, y: 0, z: Math.PI/8 } } } },
        { time: 0.4, pose: { rightArm: { rotation: { x: 0, y: 0, z: -Math.PI/8 } } } },
        { time: 0.6, pose: { rightArm: { rotation: { x: 0, y: 0, z: 0 } } } }
      ]
    },
    // More attack types...
  };
  
  const animation = animations[attackType];
  if (!animation) return;
  
  // Create animation timeline
  const startTime = performance.now() / 1000;
  const animatePart = (partName, initialTransform) => {
    const part = robot.parts[partName];
    if (!part) return;
    
    // Store initial transform
    const initialRotation = initialTransform || {
      x: part.rotation.x,
      y: part.rotation.y,
      z: part.rotation.z
    };
    
    // Animation function
    const animate = () => {
      const currentTime = performance.now() / 1000 - startTime;
      
      // Animation complete
      if (currentTime >= animation.duration) {
        part.rotation.set(initialRotation.x, initialRotation.y, initialRotation.z);
        return;
      }
      
      // Find current keyframe
      let currentFrame = animation.keyframes[0];
      let nextFrame = animation.keyframes[0];
      
      for (let i = 0; i < animation.keyframes.length - 1; i++) {
        if (currentTime >= animation.keyframes[i].time && 
            currentTime < animation.keyframes[i+1].time) {
          currentFrame = animation.keyframes[i];
          nextFrame = animation.keyframes[i+1];
          break;
        }
      }
      
      // Interpolate between keyframes
      const frameProgress = (currentTime - currentFrame.time) / 
        (nextFrame.time - currentFrame.time);
      
      // Apply interpolated rotation
      const pose = currentFrame.pose[partName];
      const nextPose = nextFrame.pose[partName];
      
      if (pose && nextPose) {
        if (pose.rotation && nextPose.rotation) {
          initial.rotation.x + (target.rotation.x !== undefined ? (target.rotation.x - initial.rotation.x) * easedProgress : 0);
        // Additional transformation logic...
      }
    });
    
    // Continue animation if not complete
    if (progress < 1.0) {
      requestAnimationFrame(animate);
    }
  };
  
  // Start animation
  animate();
}

// Easing function for smoother animation
function easeInOutQuad(t) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}
```

## Integration with Battle Mechanics

When integrating primitive-based robots with the battle system:

1. **Target identification**: Update targeting to identify specific primitive-composed parts
2. **Damage application**: Apply damage visually to the affected primitive parts
3. **Effects positioning**: Anchor effects to the correct positions on primitive geometries
4. **Animation triggers**: Ensure battle events trigger appropriate primitive animations

## Child-Friendly Considerations

- Create clear visual language with primitive shapes that are easy to understand
- Use vibrant colors and glow effects to highlight important battle elements
- Design distinctive silhouettes for different robot types using primitive combinations
- Implement forgiving hit detection appropriate for the targeting skills of 7-10 year olds
- Create impactful but not overly complex visual effects using primitives

## Performance Benefits

- Lower polygon count improves frame rates during complex battles
- Fewer draw calls with shared materials across primitives
- Simplified physics calculations with primitive collision shapes
- Reduced memory usage without complex model data
- Faster loading times without external model files initialRotation.x + lerpValue(pose.rotation.x, nextPose.rotation.x, frameProgress);
          part.rotation.y = initialRotation.y + lerpValue(pose.rotation.y, nextPose.rotation.y, frameProgress);
          part.rotation.z = initialRotation.z + lerpValue(pose.rotation.z, nextPose.rotation.z, frameProgress);
        }
        
        // Apply other transformations like position, scale if needed
      }
      
      requestAnimationFrame(animate);
    };
    
    animate();
  };
  
  // Start animation for affected parts
  Object.keys(animation.keyframes[0].pose).forEach(partName => {
    animatePart(partName);
  });
}

// Helper function for linear interpolation
function lerpValue(start, end, progress) {
  return start + (end - start) * progress;
}
```

## Special Abilities and Effects

Update special abilities to work with primitive-based robots:

### Energy Weapons

```javascript
function createEnergyWeapon(robot, config) {
  const { color, size, type } = config;
  
  // Create energy weapon effect
  const weaponGroup = new THREE.Group();
  
  // Base geometry depends on weapon type
  let weaponGeometry;
  switch(type) {
    case 'blaster':
      weaponGeometry = new THREE.CylinderGeometry(0.1, 0.2, 1.5, 8);
      break;
    case 'sword':
      weaponGeometry = new THREE.BoxGeometry(0.1, 2.0, 0.4);
      break;
    case 'cannon':
      weaponGeometry = new THREE.CylinderGeometry(0.3, 0.4, 2.0, 12);
      break;
    // More weapon types...
  }
  
  // Create glowing material
  const weaponMaterial = new THREE.MeshStandardMaterial({
    color: color || 0x00ffff,
    emissive: color || 0x00ffff,
    emissiveIntensity: 0.8,
    transparent: true,
    opacity: 0.9
  });
  
  const weaponMesh = new THREE.Mesh(weaponGeometry, weaponMaterial);
  weaponGroup.add(weaponMesh);
  
  // Add energy particles
  const particleGeometry = new THREE.BufferGeometry();
  const particleCount = 50;
  const particlePositions = new Float32Array(particleCount * 3);
  
  for (let i = 0; i < particleCount; i++) {
    const i3 = i * 3;
    particlePositions[i3] = (Math.random() - 0.5) * 0.3;
    particlePositions[i3 + 1] = (Math.random() - 0.5) * 2.0;
    particlePositions[i3 + 2] = (Math.random() - 0.5) * 0.3;
  }
  
  particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
  
  const particleMaterial = new THREE.PointsMaterial({
    color: color || 0x00ffff,
    size: 0.05,
    transparent: true,
    opacity: 0.7
  });
  
  const particles = new THREE.Points(particleGeometry, particleMaterial);
  weaponGroup.add(particles);
  
  // Add animation
  const animate = () => {
    const positions = particleGeometry.attributes.position.array;
    
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      positions[i3 + 1] = (positions[i3 + 1] + 0.02) % 2.0 - 1.0;
    }
    
    particleGeometry.attributes.position.needsUpdate = true;
    
    // Pulse the weapon
    weaponMesh.material.emissiveIntensity = 0.6 + Math.sin(Date.now() * 0.005) * 0.4;
    weaponMesh.material.opacity = 0.7 + Math.sin(Date.now() * 0.003) * 0.3;
  };
  
  return {
    mesh: weaponGroup,
    update: animate,
    dispose: () => {
      weaponGeometry.dispose();
      weaponMaterial.dispose();
      particleGeometry.dispose();
      particleMaterial.dispose();
    }
  };
}
```

### Transformation Effects

```javascript
function animateTransformation(robot, targetForm) {
  // Store initial state of all parts
  const initialState = {};
  Object.entries(robot.parts).forEach(([partName, part]) => {
    initialState[partName] = {
      position: { x: part.position.x, y: part.position.y, z: part.position.z },
      rotation: { x: part.rotation.x, y: part.rotation.y, z: part.rotation.z },
      scale: { x: part.scale.x, y: part.scale.y, z: part.scale.z }
    };
  });
  
  // Define target state based on form
  const targetState = targetForm === 'vehicle' ? {
    // Collapsed/vehicle form positions
    head: { position: { y: 0.5 }, rotation: { x: Math.PI/2 } },
    torso: { scale: { y: 0.5 } },
    leftArm: { position: { x: -0.2, y: 0.3 }, rotation: { z: Math.PI/2 } },
    rightArm: { position: { x: 0.2, y: 0.3 }, rotation: { z: -Math.PI/2 } },
    legs: { rotation: { x: Math.PI/2 }, position: { y: -0.5 } }
  } : {
    // Standard robot form - use initial state as default
  };
  
  // Animation duration
  const duration = 1.0; // seconds
  const startTime = performance.now() / 1000;
  
  // Animation function
  const animate = () => {
    const currentTime = performance.now() / 1000 - startTime;
    const progress = Math.min(currentTime / duration, 1.0);
    
    // Easing function for smoother animation
    const easedProgress = easeInOutQuad(progress);
    
    // Update each part
    Object.entries(robot.parts).forEach(([partName, part]) => {
      const initial = initialState[partName];
      const target = targetState[partName] || initial;
      
      // Interpolate position
      if (target.position) {
        part.position.x = initial.position.x + (target.position.x !== undefined ? (target.position.x - initial.position.x) * easedProgress : 0);
        part.position.y = initial.position.y + (target.position.y !== undefined ? (target.position.y - initial.position.y) * easedProgress : 0);
        part.position.z = initial.position.z + (target.position.z !== undefined ? (target.position.z - initial.position.z) * easedProgress : 0);
      }
      
      // Interpolate rotation
      if (target.rotation) {
        part.rotation.x =