import { EventEmitter } from 'events';

export interface InputState {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
  jump: boolean;
  transform: boolean;
  action: boolean;
}

export class InputManager extends EventEmitter {
  private keyState: { [key: string]: boolean } = {};
  private mousePosition: { x: number; y: number } = { x: 0, y: 0 };
  private mouseButtons: { [key: number]: boolean } = {};
  private isInitialized: boolean = false;

  constructor() {
    super();
    this.keyState = {};
    this.mousePosition = { x: 0, y: 0 };
    this.mouseButtons = {};
  }

  public async initialize(): Promise<void> {
    if (this.isInitialized) return;

    // Keyboard events
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);

    // Mouse events
    window.addEventListener('mousemove', this.handleMouseMove);
    window.addEventListener('mousedown', this.handleMouseDown);
    window.addEventListener('mouseup', this.handleMouseUp);

    this.isInitialized = true;
  }

  private handleKeyDown = (event: KeyboardEvent): void => {
    this.keyState[event.key.toLowerCase()] = true;
    this.emit('inputChange', this.getInputState());
  };

  private handleKeyUp = (event: KeyboardEvent): void => {
    this.keyState[event.key.toLowerCase()] = false;
    this.emit('inputChange', this.getInputState());
  };

  private handleMouseMove = (event: MouseEvent): void => {
    this.mousePosition.x = event.clientX;
    this.mousePosition.y = event.clientY;
    this.emit('mouseMove', this.mousePosition);
  };

  private handleMouseDown = (event: MouseEvent): void => {
    this.mouseButtons[event.button] = true;
    this.emit('mouseDown', event.button);
  };

  private handleMouseUp = (event: MouseEvent): void => {
    this.mouseButtons[event.button] = false;
    this.emit('mouseUp', event.button);
  };

  public getInputState(): InputState {
    return {
      forward: this.keyState['w'] || this.keyState['arrowup'] || false,
      backward: this.keyState['s'] || this.keyState['arrowdown'] || false,
      left: this.keyState['a'] || this.keyState['arrowleft'] || false,
      right: this.keyState['d'] || this.keyState['arrowright'] || false,
      jump: this.keyState[' '] || false,
      transform: this.keyState['t'] || false,
      action: this.keyState['e'] || false
    };
  }

  public getMousePosition(): { x: number; y: number } {
    return { ...this.mousePosition };
  }

  public isMouseButtonDown(button: number): boolean {
    return this.mouseButtons[button] || false;
  }

  public dispose(): void {
    if (!this.isInitialized) return;

    // Remove keyboard events
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);

    // Remove mouse events
    window.removeEventListener('mousemove', this.handleMouseMove);
    window.removeEventListener('mousedown', this.handleMouseDown);
    window.removeEventListener('mouseup', this.handleMouseUp);

    this.isInitialized = false;
  }
}

export default InputManager; 