export interface MovementInput {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
  run: boolean;
}

export class KeyboardController {
  private keys = new Set<string>();
  private connected = false;

  private readonly movementKeys = [
    'KeyW',
    'KeyA',
    'KeyS',
    'KeyD',
    'ShiftLeft',
    'ShiftRight',
  ];

  private handleKeyDown = (event: KeyboardEvent) => {
    if (this.movementKeys.includes(event.code)) {
      event.preventDefault();
      this.keys.add(event.code);
    }
  };

  private handleKeyUp = (event: KeyboardEvent) => {
    this.keys.delete(event.code);
  };

  private handleBlur = () => {
    this.clear();
  };

  connect() {
    if (this.connected) return;

    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
    window.addEventListener('blur', this.handleBlur);

    this.connected = true;
  }

  getInput(): MovementInput {
    return {
      forward: this.keys.has('KeyW'),
      backward: this.keys.has('KeyS'),
      left: this.keys.has('KeyA'),
      right: this.keys.has('KeyD'),
      run: this.keys.has('ShiftLeft') || this.keys.has('ShiftRight'),
    };
  }

  clear() {
    this.keys.clear();
  }

  dispose() {
    if (!this.connected) return;

    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
    window.removeEventListener('blur', this.handleBlur);

    this.clear();
    this.connected = false;
  }
}