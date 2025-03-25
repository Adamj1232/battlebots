# 3D Models for Transformers Battle Arena

This directory contains the 3D models used in the game. All models should be in glTF/GLB format for optimal performance and compatibility.

## Directory Structure

```
models/
├── parts/
│   ├── heads/      # Robot head models
│   ├── torsos/     # Robot torso models
│   ├── arms/       # Robot arm models
│   ├── legs/       # Robot leg models
│   └── weapons/    # Robot weapon models
```

## Model Requirements

### General Requirements
- Format: glTF 2.0 (.glb)
- Scale: 1 unit = 1 meter
- Origin: Centered at attachment point
- Triangulated geometry
- Optimized mesh topology
- PBR materials
- Maximum texture size: 2048x2048

### Part-Specific Requirements

#### Heads
- Attachment point at bottom center
- Forward direction along positive Z-axis
- Maximum dimensions: 1x1x1 units

#### Torsos
- Attachment points:
  - Head: Top center
  - Arms: Left/right sides
  - Legs: Bottom center
- Maximum dimensions: 2x3x1 units

#### Arms
- Attachment point at shoulder
- Symmetrical left/right versions
- Maximum dimensions: 0.5x2x0.5 units

#### Legs
- Attachment point at hip
- Symmetrical left/right versions
- Maximum dimensions: 0.5x2x0.5 units

#### Weapons
- Attachment point at handle
- Maximum dimensions: 1x3x1 units

### Material Setup
- Base Color Map (albedo)
- Metallic-Roughness Map
- Normal Map
- Emissive Map (optional)
- Material names should include:
  - "primary" for primary color areas
  - "secondary" for secondary color areas
  - "accent" for accent color areas

### Performance Guidelines
- Maximum 2000 triangles per part
- Maximum 3 materials per part
- LOD support recommended
- Compressed textures preferred
- Efficient UV mapping

### Animation Requirements
- All parts should support basic transformation animations
- Smooth vertex weights
- Maximum 4 influences per vertex
- Named animation clips for:
  - Idle
  - Transform
  - Attack
  - Damage
  - Special

## Preview Images
Each model should have a corresponding preview image in the `/images/parts/` directory:
- Format: PNG
- Resolution: 512x512
- Transparent background
- Consistent lighting and angle
- Clear silhouette 