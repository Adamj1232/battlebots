export interface AccessibilitySettings {
  motionReduced: boolean;
  screenReaderEnabled: boolean;
  colorblindMode: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';
  highContrast: boolean;
  fontSize: 'small' | 'medium' | 'large';
}

export interface GameSettings {
  showFPS: boolean;
  showControls: boolean;
  showDebug: boolean;
  volume: number;
  quality: 'low' | 'medium' | 'high';
  vsync: boolean;
  fullscreen: boolean;
  resolution: {
    width: number;
    height: number;
  };
}

export interface GameConfig {
  physics: {
    gravity: number;
    allowSleep: boolean;
  };
  graphics: {
    antialias: boolean;
    shadows: boolean;
    pixelRatio: number;
  };
  controls: {
    sensitivity: number;
    invertY: boolean;
  };
  accessibility: {
    enableColorblindMode: boolean;
    enableScreenReader: boolean;
    enableMotionReduction: boolean;
  };
} 