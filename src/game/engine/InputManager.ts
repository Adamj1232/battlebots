type MovementKeys = 'forward' | 'backward' | 'left' | 'right' | 'jump' | 'transform';

export interface InputState {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
  jump: boolean;
  transform: boolean;
  mousePosition: { x: number; y: number };
  mouseButtons: {
    left: boolean;
    middle: boolean;
    right: boolean;
  };
}

export class InputManager {
  private inputState: InputState = {
    forward: false,
    backward: false,
    left: false,
    right: false,
    jump: false,
    transform: false,
    mousePosition: { x: 0, y: 0 },
    mouseButtons: {
      left: false,
      middle: false,
      right: false
    }
  };

  private keyMap: { [key: string]: MovementKeys } = {
    'w': 'forward',
    'ArrowUp': 'forward',
    's': 'backward',
    'ArrowDown': 'backward',
    'a': 'left',
    'ArrowLeft': 'left',
    'd': 'right',
    'ArrowRight': 'right',
    ' ': 'jump',
    'Shift': 'transform'
  };

  private isEnabled: boolean = false;

  public initialize(): void {
    if (this.isEnabled) return;
    this.isEnabled = true;

    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
    window.addEventListener('mousemove', this.handleMouseMove);
    window.addEventListener('mousedown', this.handleMouseDown);
    window.addEventListener('mouseup', this.handleMouseUp);
  }

  public dispose(): void {
    if (!this.isEnabled) return;
    this.isEnabled = false;

    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
    window.removeEventListener('mousemove', this.handleMouseMove);
    window.removeEventListener('mousedown', this.handleMouseDown);
    window.removeEventListener('mouseup', this.handleMouseUp);
  }

  public getInputState(): InputState {
    return { ...this.inputState };
  }

  private handleKeyDown = (event: KeyboardEvent): void => {
    const key = event.key;
    const action = this.keyMap[key];
    if (action) {
      this.inputState[action] = true;
      event.preventDefault();
    }
  };

  private handleKeyUp = (event: KeyboardEvent): void => {
    const key = event.key;
    const action = this.keyMap[key];
    if (action) {
      this.inputState[action] = false;
      event.preventDefault();
    }
  };

  private handleMouseMove = (event: MouseEvent): void => {
    this.inputState.mousePosition = {
      x: event.clientX,
      y: event.clientY
    };
  };

  private handleMouseDown = (event: MouseEvent): void => {
    switch (event.button) {
      case 0:
        this.inputState.mouseButtons.left = true;
        break;
      case 1:
        this.inputState.mouseButtons.middle = true;
        break;
      case 2:
        this.inputState.mouseButtons.right = true;
        break;
    }
  };

  private handleMouseUp = (event: MouseEvent): void => {
    switch (event.button) {
      case 0:
        this.inputState.mouseButtons.left = false;
        break;
      case 1:
        this.inputState.mouseButtons.middle = false;
        break;
      case 2:
        this.inputState.mouseButtons.right = false;
        break;
    }
  };
}

export default InputManager; 