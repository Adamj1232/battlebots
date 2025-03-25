export interface InputState {
  keys: { [key: string]: boolean };
  mouse: {
    x: number;
    y: number;
    leftButton: boolean;
    rightButton: boolean;
  };
  touch: {
    active: boolean;
    x: number;
    y: number;
    touches: TouchPoint[];
  };
  gamepad: {
    connected: boolean;
    axes: number[];
    buttons: GamepadButton[];
  };
}

interface TouchPoint {
  id: number;
  x: number;
  y: number;
  force: number;
}

interface InputConfig {
  enableTouch?: boolean;
  enableGamepad?: boolean;
  enableKeyboard?: boolean;
  enableMouse?: boolean;
  touchDeadzone?: number;
  gamepadDeadzone?: number;
  accessibility?: {
    enableColorblindMode?: boolean;
    enableScreenReader?: boolean;
    enableMotionReduction?: boolean;
  };
}

const DEFAULT_CONFIG: InputConfig = {
  enableTouch: true,
  enableGamepad: true,
  enableKeyboard: true,
  enableMouse: true,
  touchDeadzone: 0.1,
  gamepadDeadzone: 0.1,
  accessibility: {
    enableColorblindMode: false,
    enableScreenReader: false,
    enableMotionReduction: false,
  },
};

export class InputManager {
  private inputState: InputState = {
    keys: {},
    mouse: {
      x: 0,
      y: 0,
      leftButton: false,
      rightButton: false,
    },
    touch: {
      active: false,
      x: 0,
      y: 0,
      touches: [],
    },
    gamepad: {
      connected: false,
      axes: [],
      buttons: [],
    },
  };

  private config: InputConfig;
  private gamepadLoopId: number | null = null;
  private boundHandleGamepadConnected: (e: GamepadEvent) => void;
  private boundHandleGamepadDisconnected: (e: GamepadEvent) => void;

  constructor(config: Partial<InputConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.boundHandleGamepadConnected = this.handleGamepadConnected.bind(this);
    this.boundHandleGamepadDisconnected = this.handleGamepadDisconnected.bind(this);

    this.initializeInputHandlers();
  }

  private initializeInputHandlers(): void {
    if (this.config.enableKeyboard) {
      window.addEventListener('keydown', this.handleKeyDown);
      window.addEventListener('keyup', this.handleKeyUp);
    }

    if (this.config.enableMouse) {
      window.addEventListener('mousedown', this.handleMouseDown);
      window.addEventListener('mouseup', this.handleMouseUp);
      window.addEventListener('mousemove', this.handleMouseMove);
      window.addEventListener('contextmenu', (e) => e.preventDefault());
    }

    if (this.config.enableTouch) {
      window.addEventListener('touchstart', this.handleTouchStart);
      window.addEventListener('touchend', this.handleTouchEnd);
      window.addEventListener('touchmove', this.handleTouchMove);
    }

    if (this.config.enableGamepad) {
      window.addEventListener('gamepadconnected', this.boundHandleGamepadConnected);
      window.addEventListener('gamepaddisconnected', this.boundHandleGamepadDisconnected);
    }
  }

  private handleKeyDown = (event: KeyboardEvent): void => {
    this.inputState.keys[event.key.toLowerCase()] = true;
    this.handleAccessibilityKeyboard(event);
  };

  private handleKeyUp = (event: KeyboardEvent): void => {
    this.inputState.keys[event.key.toLowerCase()] = false;
  };

  private handleMouseDown = (event: MouseEvent): void => {
    if (event.button === 0) this.inputState.mouse.leftButton = true;
    if (event.button === 2) this.inputState.mouse.rightButton = true;
  };

  private handleMouseUp = (event: MouseEvent): void => {
    if (event.button === 0) this.inputState.mouse.leftButton = false;
    if (event.button === 2) this.inputState.mouse.rightButton = false;
  };

  private handleMouseMove = (event: MouseEvent): void => {
    this.inputState.mouse.x = event.clientX;
    this.inputState.mouse.y = event.clientY;
  };

  private handleTouchStart = (event: TouchEvent): void => {
    event.preventDefault();
    this.inputState.touch.active = true;
    this.updateTouchState(event);
  };

  private handleTouchEnd = (event: TouchEvent): void => {
    event.preventDefault();
    this.inputState.touch.active = false;
    this.inputState.touch.touches = [];
  };

  private handleTouchMove = (event: TouchEvent): void => {
    event.preventDefault();
    this.updateTouchState(event);
  };

  private updateTouchState(event: TouchEvent): void {
    const touches: TouchPoint[] = [];
    for (let i = 0; i < event.touches.length; i++) {
      const touch = event.touches[i];
      touches.push({
        id: touch.identifier,
        x: touch.clientX,
        y: touch.clientY,
        force: touch.force,
      });
    }

    this.inputState.touch.touches = touches;
    if (touches.length > 0) {
      this.inputState.touch.x = touches[0].x;
      this.inputState.touch.y = touches[0].y;
    }
  }

  private handleGamepadConnected(event: GamepadEvent): void {
    this.inputState.gamepad.connected = true;
    if (!this.gamepadLoopId) {
      this.gamepadLoopId = requestAnimationFrame(this.updateGamepad);
    }
  }

  private handleGamepadDisconnected(event: GamepadEvent): void {
    this.inputState.gamepad.connected = false;
    if (this.gamepadLoopId) {
      cancelAnimationFrame(this.gamepadLoopId);
      this.gamepadLoopId = null;
    }
  }

  private updateGamepad = (): void => {
    const gamepads = navigator.getGamepads();
    const gamepad = gamepads[0]; // Use first gamepad

    if (gamepad) {
      this.inputState.gamepad.axes = Array.from(gamepad.axes);
      this.inputState.gamepad.buttons = Array.from(gamepad.buttons);
    }

    if (this.inputState.gamepad.connected) {
      this.gamepadLoopId = requestAnimationFrame(this.updateGamepad);
    }
  };

  private handleAccessibilityKeyboard(event: KeyboardEvent): void {
    if (this.config.accessibility?.enableScreenReader) {
      // Handle screen reader specific shortcuts
      if (event.ctrlKey && event.key === 'r') {
        event.preventDefault();
        // Trigger screen reader description of current game state
      }
    }
  }

  public isKeyPressed(key: string): boolean {
    return !!this.inputState.keys[key.toLowerCase()];
  }

  public isMouseButtonPressed(button: 'left' | 'right'): boolean {
    return button === 'left'
      ? this.inputState.mouse.leftButton
      : this.inputState.mouse.rightButton;
  }

  public getMousePosition(): { x: number; y: number } {
    return {
      x: this.inputState.mouse.x,
      y: this.inputState.mouse.y,
    };
  }

  public getTouchState(): {
    active: boolean;
    position: { x: number; y: number };
    touches: TouchPoint[];
  } {
    return {
      active: this.inputState.touch.active,
      position: {
        x: this.inputState.touch.x,
        y: this.inputState.touch.y,
      },
      touches: [...this.inputState.touch.touches],
    };
  }

  public getGamepadState(): {
    connected: boolean;
    axes: number[];
    buttons: GamepadButton[];
  } {
    return {
      connected: this.inputState.gamepad.connected,
      axes: [...this.inputState.gamepad.axes],
      buttons: [...this.inputState.gamepad.buttons],
    };
  }

  public getInputState(): InputState {
    return {
      keys: { ...this.inputState.keys },
      mouse: { ...this.inputState.mouse },
      touch: {
        ...this.inputState.touch,
        touches: [...this.inputState.touch.touches],
      },
      gamepad: {
        ...this.inputState.gamepad,
        axes: [...this.inputState.gamepad.axes],
        buttons: [...this.inputState.gamepad.buttons],
      },
    };
  }

  public updateConfig(newConfig: Partial<InputConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  public dispose(): void {
    if (this.config.enableKeyboard) {
      window.removeEventListener('keydown', this.handleKeyDown);
      window.removeEventListener('keyup', this.handleKeyUp);
    }

    if (this.config.enableMouse) {
      window.removeEventListener('mousedown', this.handleMouseDown);
      window.removeEventListener('mouseup', this.handleMouseUp);
      window.removeEventListener('mousemove', this.handleMouseMove);
    }

    if (this.config.enableTouch) {
      window.removeEventListener('touchstart', this.handleTouchStart);
      window.removeEventListener('touchend', this.handleTouchEnd);
      window.removeEventListener('touchmove', this.handleTouchMove);
    }

    if (this.config.enableGamepad) {
      window.removeEventListener('gamepadconnected', this.boundHandleGamepadConnected);
      window.removeEventListener('gamepaddisconnected', this.boundHandleGamepadDisconnected);
    }

    if (this.gamepadLoopId) {
      cancelAnimationFrame(this.gamepadLoopId);
      this.gamepadLoopId = null;
    }
  }
}

export default InputManager; 