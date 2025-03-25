# Transformers Battle Arena Development Prompt

## Project Overview

Create a browser-based game called "Transformers Battle Arena" where players (children 7-10 years old) can:
1. Choose their faction (Autobots or Decepticons)
2. Customize their robot with different parts (head, torso, arms, legs, weapons)
3. Explore a 3D city environment
4. Battle enemy robots
5. Solve age-appropriate puzzles and challenges

## Development Phases

### Phase 1: Project Setup and Basic Structure
1. Initialize project with React
2. Set up Three.js integration
3. Create basic scene rendering
4. Implement camera controls
5. Set up asset loading pipeline

### Phase 2: Robot Customization System
1. Design component-based robot structure
2. Create 3D models for robot parts
3. Implement part selection UI
4. Build robot assembly visualization
5. Add color/texture customization

### Phase 3: Game World and Physics
1. Design city environment
2. Implement physics engine integration
3. Set up collision detection
4. Create robot movement controls
5. Add environment interaction points

### Phase 4: Battle System
1. Design battle mechanics
2. Implement robot stats and abilities
3. Create special attacks and transformations
4. Add visual effects for battles
5. Implement AI for enemy robots

### Phase 5: Challenges and Progression
1. Design age-appropriate puzzles
2. Implement quest/mission system
3. Create reward mechanism
4. Add difficulty progression
5. Implement save/load functionality

### Phase 6: Polish and Optimization
1. Optimize for performance
2. Add sound effects and music
3. Fine-tune controls and camera
4. Implement tutorials for young players
5. Add accessibility features

## PHASE 1 IMPLEMENTATION DETAILS

Focus on implementing Phase 1 completely before moving on. Create a solid foundation with the following:

### 1. Project Setup (React + Three.js)

Create a new React project with Three.js integration:

```bash
# Create React app
npx create-react-app transformers-battle-arena
cd transformers-battle-arena

# Install Three.js and related libraries
npm install three @react-three/fiber @react-three/drei
npm install @react-three/cannon # For physics later

# Install UI libraries
npm install @mui/material @emotion/react @emotion/styled

# State management
npm install @reduxjs/toolkit react-redux

# Asset loading and utilities
npm install three-stdlib gsap lodash
```

Set up the project structure following this directory layout:

```
src/
├── assets/
│   ├── models/ (placeholder for 3D models)
│   ├── textures/ (placeholder for textures)
│   └── sounds/ (placeholder for audio)
├── components/
│   ├── ui/ (for 2D interface components)
│   ├── game/ (for 3D game components)
│   └── screens/ (for major game screens)
├── game/
│   ├── engine/ (core game mechanics)
│   ├── entities/ (robot and object classes)
│   ├── physics/ (physics integration)
│   └── world/ (environment elements)
├── state/
│   ├── slices/ (Redux slices)
│   └── store.js (Redux store)
├── utils/ (helper functions)
├── App.js
└── index.js
```

### 2. Three.js Core Implementation

Create a core game engine class that initializes Three.js:

1. Create `src/game/engine/GameEngine.js` that:
   - Sets up the Three.js scene, camera, and renderer
   - Implements a game loop using requestAnimationFrame
   - Handles window resizing
   - Provides methods for adding/removing objects
   - Implements basic lighting setup

2. Create `src/game/engine/InputManager.js` that:
   - Handles keyboard/mouse/touch input
   - Abstracts input for cross-platform support
   - Implements child-friendly controls

3. Create `src/game/engine/AssetManager.js` that:
   - Provides a loading system for 3D models, textures, and sounds
   - Shows loading progress suitable for children
   - Implements asset caching

### 3. Basic Game UI

Create the main game UI screens:

1. `src/components/screens/StartScreen.js` - The opening screen with:
   - Big, colorful "Start Game" button
   - Options button
   - Credits button
   - Age-appropriate design

2. `src/components/screens/FactionSelectScreen.js` - Faction selection with:
   - Visual representation of Autobots and Decepticons
   - Simple descriptions suitable for 7-10 year olds
   - Back button to return to start screen

3. `src/components/ui/LoadingScreen.js` - Animated loading screen with:
   - Visually engaging loading indicator
   - Progress percentage
   - Fun facts about Transformers while loading

### 4. First 3D Scene Implementation

Create a basic 3D scene as a test environment:

1. `src/game/world/TestEnvironment.js` - Simple test environment with:
   - Basic ground plane
   - Simple lighting setup
   - A few primitive objects to test physics later
   - Camera controls appropriate for children

2. `src/game/entities/BasicRobot.js` - Simple robot placeholder:
   - Basic geometric shapes representing a robot
   - Placeholder for the full customizable robot
   - Basic transformation animation
   - Simple movement controls

### 5. Game State Setup

Create the Redux store with initial slices:

1. `src/state/store.js` - Main Redux store
2. `src/state/slices/gameSlice.js` - Game state slice with:
   - Game status (menu, playing, paused)
   - Current screen/level
   - Player progression
3. `src/state/slices/playerSlice.js` - Player state slice with:
   - Selected faction
   - Player name
   - Player progress
   - Unlocked parts/achievements

### 6. Integration Code

Create the main App component integrating all the pieces:

1. Update `src/App.js` to:
   - Use React Router for navigation between screens
   - Integrate Redux store
   - Handle screen transitions
   - Load initial assets

2. Create `src/components/game/GameCanvas.js` to:
   - Set up the Three.js canvas using react-three-fiber
   - Integrate with the game engine
   - Handle canvas resizing
   - Connect input managers

## Implementation Specifics

### Game Engine Implementation

The `GameEngine.js` should implement:

```javascript
class GameEngine {
  constructor(canvasElement) {
    // Initialize Three.js components
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.renderer = new THREE.WebGLRenderer({ antialias: true, canvas: canvasElement });
    
    // Set up camera position
    this.camera.position.set(0, 5, 10);
    this.camera.lookAt(0, 0, 0);
    
    // Set up basic lighting
    this.setupLighting();
    
    // Set up resize handler
    this.handleResize();
    window.addEventListener('resize', () => this.handleResize());
    
    // Game clock for animations
    this.clock = new THREE.Clock();
    
    // Game objects collections
    this.gameObjects = [];
    
    // Start the game loop
    this.animate();
  }
  
  setupLighting() {
    // Ambient light for general illumination
    const ambientLight = new THREE.AmbientLight(0x404040, 1);
    this.scene.add(ambientLight);
    
    // Directional light for shadows
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 20, 15);
    this.scene.add(directionalLight);
  }
  
  handleResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }
  
  addObject(object) {
    this.gameObjects.push(object);
    this.scene.add(object.mesh);
  }
  
  removeObject(object) {
    const index = this.gameObjects.indexOf(object);
    if (index !== -1) {
      this.gameObjects.splice(index, 1);
      this.scene.remove(object.mesh);
    }
  }
  
  update() {
    const deltaTime = this.clock.getDelta();
    
    // Update all game objects
    for (const object of this.gameObjects) {
      if (object.update) {
        object.update(deltaTime);
      }
    }
  }
  
  animate() {
    requestAnimationFrame(() => this.animate());
    
    this.update();
    this.renderer.render(this.scene, this.camera);
  }
  
  dispose() {
    // Clean up event listeners
    window.removeEventListener('resize', this.handleResize);
    
    // Dispose of Three.js resources
    this.renderer.dispose();
    
    // Clean up game objects
    for (const object of this.gameObjects) {
      if (object.dispose) {
        object.dispose();
      }
    }
  }
}

export default GameEngine;
```

### Input Manager Implementation

Create an `InputManager.js` that handles user input in a child-friendly way:

```javascript
class InputManager {
  constructor() {
    this.keys = {};
    this.mousePosition = { x: 0, y: 0 };
    this.mouseButtons = { left: false, right: false, middle: false };
    this.touchActive = false;
    this.touchPosition = { x: 0, y: 0 };
    
    // Input configurations for children (simpler controls)
    this.movementKeys = {
      forward: ['w', 'ArrowUp'],
      backward: ['s', 'ArrowDown'],
      left: ['a', 'ArrowLeft'],
      right: ['d', 'ArrowRight'],
      jump: [' ', 'Spacebar'],
      action: ['e', 'Enter']
    };
    
    // Setup event listeners
    this.setupEventListeners();
  }
  
  setupEventListeners() {
    // Keyboard events
    window.addEventListener('keydown', (e) => {
      this.keys[e.key.toLowerCase()] = true;
    });
    
    window.addEventListener('keyup', (e) => {
      this.keys[e.key.toLowerCase()] = false;
    });
    
    // Mouse events
    window.addEventListener('mousemove', (e) => {
      this.mousePosition.x = (e.clientX / window.innerWidth) * 2 - 1;
      this.mousePosition.y = -(e.clientY / window.innerHeight) * 2 + 1;
    });
    
    window.addEventListener('mousedown', (e) => {
      if (e.button === 0) this.mouseButtons.left = true;
      if (e.button === 1) this.mouseButtons.middle = true;
      if (e.button === 2) this.mouseButtons.right = true;
    });
    
    window.addEventListener('mouseup', (e) => {
      if (e.button === 0) this.mouseButtons.left = false;
      if (e.button === 1) this.mouseButtons.middle = false;
      if (e.button === 2) this.mouseButtons.right = false;
    });
    
    // Touch events for mobile/tablet
    window.addEventListener('touchstart', (e) => {
      this.touchActive = true;
      this.updateTouchPosition(e.touches[0]);
    });
    
    window.addEventListener('touchmove', (e) => {
      this.updateTouchPosition(e.touches[0]);
    });
    
    window.addEventListener('touchend', () => {
      this.touchActive = false;
    });
  }
  
  updateTouchPosition(touch) {
    this.touchPosition.x = (touch.clientX / window.innerWidth) * 2 - 1;
    this.touchPosition.y = -(touch.clientY / window.innerHeight) * 2 + 1;
  }
  
  isMoving(direction) {
    const keys = this.movementKeys[direction];
    return keys.some(key => this.keys[key.toLowerCase()]);
  }
  
  isActionPressed() {
    return this.movementKeys.action.some(key => this.keys[key.toLowerCase()]) || this.mouseButtons.left;
  }
  
  getMovementDirection() {
    const direction = { x: 0, z: 0 };
    
    if (this.isMoving('forward')) direction.z = -1;
    if (this.isMoving('backward')) direction.z = 1;
    if (this.isMoving('left')) direction.x = -1;
    if (this.isMoving('right')) direction.x = 1;
    
    return direction;
  }
  
  dispose() {
    // Clean up event listeners when done
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
    window.removeEventListener('mousemove', this.handleMouseMove);
    window.removeEventListener('mousedown', this.handleMouseDown);
    window.removeEventListener('mouseup', this.handleMouseUp);
    window.removeEventListener('touchstart', this.handleTouchStart);
    window.removeEventListener('touchmove', this.handleTouchMove);
    window.removeEventListener('touchend', this.handleTouchEnd);
  }
}

export default InputManager;
```

### Asset Manager Implementation

Create an `AssetManager.js` that handles loading 3D models and textures:

```javascript
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';

class AssetManager {
  constructor() {
    this.models = {};
    this.textures = {};
    this.sounds = {};
    this.totalAssets = 0;
    this.loadedAssets = 0;
    
    // Initialize loaders
    this.textureLoader = new THREE.TextureLoader();
    this.gltfLoader = new GLTFLoader();
    
    // Set up DRACO loader for compressed models
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.5/');
    this.gltfLoader.setDRACOLoader(dracoLoader);
    
    // Loading callbacks
    this.onProgress = null;
    this.onComplete = null;
  }
  
  setCallbacks(onProgress, onComplete) {
    this.onProgress = onProgress;
    this.onComplete = onComplete;
  }
  
  updateProgress() {
    this.loadedAssets++;
    const progress = this.loadedAssets / this.totalAssets;
    
    if (this.onProgress) {
      this.onProgress(progress);
    }
    
    if (this.loadedAssets === this.totalAssets && this.onComplete) {
      this.onComplete();
    }
  }
  
  loadTexture(name, path) {
    this.totalAssets++;
    
    return new Promise((resolve) => {
      this.textureLoader.load(
        path,
        (texture) => {
          this.textures[name] = texture;
          this.updateProgress();
          resolve(texture);
        },
        undefined,
        (error) => {
          console.error(`Error loading texture ${path}:`, error);
          this.updateProgress();
          resolve(null);
        }
      );
    });
  }
  
  loadModel(name, path) {
    this.totalAssets++;
    
    return new Promise((resolve) => {
      this.gltfLoader.load(
        path,
        (gltf) => {
          this.models[name] = gltf;
          this.updateProgress();
          resolve(gltf);
        },
        undefined,
        (error) => {
          console.error(`Error loading model ${path}:`, error);
          this.updateProgress();
          resolve(null);
        }
      );
    });
  }
  
  getTexture(name) {
    return this.textures[name];
  }
  
  getModel(name) {
    return this.models[name];
  }
  
  async loadInitialAssets() {
    // Reset counters
    this.totalAssets = 0;
    this.loadedAssets = 0;
    
    // Define assets to load
    const texturesToLoad = [
      { name: 'ground', path: '/assets/textures/ground.jpg' },
      { name: 'sky', path: '/assets/textures/sky.jpg' }
    ];
    
    const modelsToLoad = [
      { name: 'basicRobot', path: '/assets/models/basic_robot.glb' }
    ];
    
    // Load all assets in parallel
    const texturePromises = texturesToLoad.map(({ name, path }) => 
      this.loadTexture(name, path)
    );
    
    const modelPromises = modelsToLoad.map(({ name, path }) => 
      this.loadModel(name, path)
    );
    
    // Wait for all assets to load
    await Promise.all([...texturePromises, ...modelPromises]);
    
    return {
      textures: this.textures,
      models: this.models
    };
  }
}

export default AssetManager;
```

### React Component: GameCanvas

Create a `GameCanvas.js` component that integrates Three.js with React:

```jsx
import React, { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import GameEngine from '../../game/engine/GameEngine';
import InputManager from '../../game/engine/InputManager';
import { setGameState } from '../../state/slices/gameSlice';

const GameCanvas = () => {
  const canvasRef = useRef(null);
  const gameEngineRef = useRef(null);
  const inputManagerRef = useRef(null);
  const dispatch = useDispatch();
  const gameState = useSelector(state => state.game);
  
  useEffect(() => {
    // Initialize the game engine with the canvas
    if (canvasRef.current) {
      gameEngineRef.current = new GameEngine(canvasRef.current);
      inputManagerRef.current = new InputManager();
      
      // Signal that the game engine is ready
      dispatch(setGameState({ engineInitialized: true }));
    }
    
    // Cleanup function
    return () => {
      if (gameEngineRef.current) {
        gameEngineRef.current.dispose();
      }
      
      if (inputManagerRef.current) {
        inputManagerRef.current.dispose();
      }
    };
  }, [dispatch]);
  
  return (
    <canvas 
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        display: gameState.showCanvas ? 'block' : 'none'
      }}
    />
  );
};

export default GameCanvas;
```

### Redux State Setup

Create the basic Redux store and slices:

1. `src/state/store.js`:

```javascript
import { configureStore } from '@reduxjs/toolkit';
import gameReducer from './slices/gameSlice';
import playerReducer from './slices/playerSlice';

export const store = configureStore({
  reducer: {
    game: gameReducer,
    player: playerReducer
  }
});

export default store;
```

2. `src/state/slices/gameSlice.js`:

```javascript
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  currentScreen: 'start', // start, faction-select, robot-customization, city, battle
  engineInitialized: false,
  showCanvas: false,
  isLoading: false,
  loadingProgress: 0,
  gameStarted: false,
  gamePaused: false,
  currentLevel: 1,
  enableSound: true,
  enableMusic: true
};

const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    setGameState: (state, action) => {
      return { ...state, ...action.payload };
    },
    setCurrentScreen: (state, action) => {
      state.currentScreen = action.payload;
      // Show canvas for 3D screens only
      state.showCanvas = ['robot-customization', 'city', 'battle'].includes(action.payload);
    },
    setLoadingProgress: (state, action) => {
      state.loadingProgress = action.payload;
    },
    startGame: (state) => {
      state.gameStarted = true;
      state.gamePaused = false;
    },
    pauseGame: (state) => {
      state.gamePaused = true;
    },
    resumeGame: (state) => {
      state.gamePaused = false;
    }
  }
});

export const { 
  setGameState, 
  setCurrentScreen, 
  setLoadingProgress,
  startGame,
  pauseGame,
  resumeGame
} = gameSlice.actions;

export default gameSlice.reducer;
```

3. `src/state/slices/playerSlice.js`:

```javascript
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  name: '',
  faction: '', // 'autobot' or 'decepticon'
  level: 1,
  experience: 0,
  robot: {
    head: 'default',
    torso: 'default',
    leftArm: 'default',
    rightArm: 'default',
    legs: 'default',
    color: '#ff0000',
    stats: {
      health: 100,
      speed: 5,
      strength: 5,
      defense: 5
    }
  },
  unlockedParts: {
    heads: ['default'],
    torsos: ['default'],
    arms: ['default'],
    legs: ['default']
  },
  achievements: []
};

const playerSlice = createSlice({
  name: 'player',
  initialState,
  reducers: {
    setPlayerName: (state, action) => {
      state.name = action.payload;
    },
    setFaction: (state, action) => {
      state.faction = action.payload;
    },
    updateRobotPart: (state, action) => {
      const { part, value } = action.payload;
      state.robot[part] = value;
      
      // Update stats based on parts (simplified)
      // In a real implementation, you'd have more complex stat calculations
      const calcStats = () => {
        let health = 100;
        let speed = 5;
        let strength = 5;
        let defense = 5;
        
        // Example: different torsos affect health
        if (state.robot.torso === 'heavy') {
          health += 50;
          speed -= 1;
          defense += 2;
        } else if (state.robot.torso === 'agile') {
          health -= 20;
          speed += 3;
        }
        
        // Similar calculations for other parts would go here
        
        return { health, speed, strength, defense };
      };
      
      state.robot.stats = calcStats();
    },
    setRobotColor: (state, action) => {
      state.robot.color = action.payload;
    },
    unlockPart: (state, action) => {
      const { category, partId } = action.payload;
      if (!state.unlockedParts[category].includes(partId)) {
        state.unlockedParts[category].push(partId);
      }
    },
    addExperience: (state, action) => {
      state.experience += action.payload;
      
      // Simple level up logic
      const expNeededForNextLevel = state.level * 100;
      if (state.experience >= expNeededForNextLevel) {
        state.level += 1;
        state.experience -= expNeededForNextLevel;
      }
    },
    addAchievement: (state, action) => {
      if (!state.achievements.includes(action.payload)) {
        state.achievements.push(action.payload);
      }
    }
  }
});

export const {
  setPlayerName,
  setFaction,
  updateRobotPart,
  setRobotColor,
  unlockPart,
  addExperience,
  addAchievement
} = playerSlice.actions;

export default playerSlice.reducer;
```

### Main App Component

Update the `App.js` to integrate all components:

```jsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setCurrentScreen, setLoadingProgress } from './state/slices/gameSlice';
import GameCanvas from './components/game/GameCanvas';
import StartScreen from './components/screens/StartScreen';
import FactionSelectScreen from './components/screens/FactionSelectScreen';
import LoadingScreen from './components/ui/LoadingScreen';
import AssetManager from './game/engine/AssetManager';
import './App.css';

function App() {
  const dispatch = useDispatch();
  const { currentScreen, loadingProgress } = useSelector(state => state.game);
  const [assetManager] = useState(new AssetManager());
  
  // Load initial assets when the component mounts
  useEffect(() => {
    const loadAssets = async () => {
      dispatch(setCurrentScreen('loading'));
      
      // Set up progress callback
      assetManager.setCallbacks(
        (progress) => {
          dispatch(setLoadingProgress(progress * 100));
        },
        () => {
          // Move to start screen when loading completes
          dispatch(setCurrentScreen('start'));
        }
      );
      
      // Start loading assets
      await assetManager.loadInitialAssets();
    };
    
    loadAssets();
  }, [assetManager, dispatch]);
  
  // Render the appropriate screen based on game state
  const renderScreen = () => {
    switch (currentScreen) {
      case 'loading':
        return <LoadingScreen progress={loadingProgress} />;
      case 'start':
        return <StartScreen onStart={() => dispatch(setCurrentScreen('faction-select'))} />;
      case 'faction-select':
        return <FactionSelectScreen onSelect={(faction) => {
          // First go to loading, then transition to customization screen
          dispatch(setCurrentScreen('loading'));
          // Simulate loading faction-specific assets
          setTimeout(() => {
            dispatch(setCurrentScreen('robot-customization'));
          }, 1500);
        }} />;
      default:
        return <div>Screen not implemented yet</div>;
    }
  };
  
  return (
    <div className="App">
      {/* 3D Game Canvas - always present but sometimes hidden */}
      <GameCanvas />
      
      {/* UI Overlay - changes based on game state */}
      <div className="ui-overlay">
        {renderScreen()}
      </div>
    </div>
  );
}

export default App;
```

### User Interface Components

For the UI screens, create:

1. `src/components/screens/StartScreen.js`:

```jsx
import React from 'react';
import '../../styles/StartScreen.css';

const StartScreen = ({ onStart }) => {
  return (
    <div className="start-screen">
      <div className="game-title">
        <h1>TRANSFORMERS</h1>
        <h2>BATTLE ARENA</h2>
      </div>
      
      <div className="menu-buttons">
        <button className="start-button" onClick={onStart}>
          START GAME
        </button>
        <button className="options-button">
          OPTIONS
        </button>
        <button className="help-button">
          HOW TO PLAY
        </button>
      </div>
      
      <div className="footer">
        <p>A game for 7-10 year olds</p>
      </div>
    </div>
  );
};

export default StartScreen;
```

2. `src/components/screens/FactionSelectScreen.js`:

```jsx
import React from 'react';
import { useDispatch } from 'react-redux';
import { setFaction } from '../../state/slices/playerSlice';
import '../../styles/FactionSelectScreen.css';

const FactionSelectScreen = ({ onSelect }) => {
  const dispatch = useDispatch();
  
  const handleSelectFaction = (faction) => {
    dispatch(setFaction(faction));
    onSelect(faction);
  };
  
  return (
    <div className="faction-select-screen">
      <h1>CHOOSE YOUR SIDE</h1>
      
      <div className="factions-container">
        <div className="faction-card autobot" onClick={() => handleSelectFaction('autobot')}>
          <div className="faction-logo autobot-logo"></div>
          <h2>AUTOBOTS</h2>
          <p>Brave heroes who protect Earth and fight for peace!</p>
          <ul className="faction-traits">
            <li>Strong Defenses</li>
            <li>Healing Abilities</li>
            <li>Team Bonuses</li>
          </ul>
        </div>
        
        <div className="faction-card decepticon" onClick={() => handleSelectFaction('decepticon')}>
          <div className="faction-logo decepticon-logo"></div>
          <h2>DECEPTICONS</h2>
          <p>Powerful warriors seeking to conquer and rule!</p>
          <ul className="faction-traits">
            <li>Powerful Attacks</li>
            <li>Stealth Abilities</li>
            <li>Special Weapons</li>
          </ul>
        </div>
      </div>
      
      <button className="back-button" onClick={() => onSelect(null)}>
        BACK
      </button>
    </div>
  );
};

export default FactionSelectScreen;
```

3. `src/components/ui/LoadingScreen.js`:

```jsx
import React, { useState, useEffect } from 'react';
import '../../styles/LoadingScreen.css';

const LoadingScreen = ({ progress }) => {
  const [tip, setTip] = useState('');
  
  // Fun tips for kids while loading
  const tips = [
    "Autobots transform into cars, trucks, and planes!",
    "Decepticons often transform into military vehicles!",
    "Optimus Prime is the leader of the Autobots!",
    "Megatron is the leader of the Decepticons!",
    "Some robots can combine to form even bigger robots!",
    "The faster you move, the harder it is to aim your weapons!",
    "Use buildings for cover during battles!",
    "Different weapons work better against different robots!",
    "You can upgrade your