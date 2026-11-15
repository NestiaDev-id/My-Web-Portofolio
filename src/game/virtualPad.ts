export type PadButton =
  | "up"
  | "down"
  | "left"
  | "right"
  | "a"
  | "b"
  | "start"
  | "select";

export interface VirtualPadState {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
  a: boolean;
  b: boolean;
  start: boolean;
  select: boolean;
}

type PadListener = (button: PadButton, isDown: boolean) => void;

class VirtualPad {
  public state: VirtualPadState = {
    up: false,
    down: false,
    left: false,
    right: false,
    a: false,
    b: false,
    start: false,
    select: false,
  };

  private listeners: Set<PadListener> = new Set();

  public subscribe(listener: PadListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public setButton(button: PadButton, isDown: boolean): void {
    if (this.state[button] === isDown) return;
    this.state[button] = isDown;

    // Dispatch keyboard event for Phaser and window listeners
    this.dispatchKeyboardEvent(button, isDown);

    // Notify registered subscribers (like scenes)
    this.listeners.forEach((listener) => {
      try {
        listener(button, isDown);
      } catch (e) {
        console.error("VirtualPad listener error:", e);
      }
    });
  }

  private dispatchKeyboardEvent(button: PadButton, isDown: boolean): void {
    if (typeof window === "undefined") return;

    const type = isDown ? "keydown" : "keyup";
    const keyConfigs: Record<
      PadButton,
      { key: string; code: string; keyCode: number }[]
    > = {
      up: [
        { key: "ArrowUp", code: "ArrowUp", keyCode: 38 },
        { key: "w", code: "KeyW", keyCode: 87 },
      ],
      down: [
        { key: "ArrowDown", code: "ArrowDown", keyCode: 40 },
        { key: "s", code: "KeyS", keyCode: 83 },
      ],
      left: [
        { key: "ArrowLeft", code: "ArrowLeft", keyCode: 37 },
        { key: "a", code: "KeyA", keyCode: 65 },
      ],
      right: [
        { key: "ArrowRight", code: "ArrowRight", keyCode: 39 },
        { key: "d", code: "KeyD", keyCode: 68 },
      ],
      a: [
        { key: " ", code: "Space", keyCode: 32 },
        { key: "Enter", code: "Enter", keyCode: 13 },
      ],
      b: [
        { key: "Shift", code: "ShiftLeft", keyCode: 16 },
        { key: "b", code: "KeyB", keyCode: 66 },
        { key: "x", code: "KeyX", keyCode: 88 },
      ],
      start: [
        { key: "Enter", code: "Enter", keyCode: 13 },
        { key: "p", code: "KeyP", keyCode: 80 },
      ],
      select: [
        { key: "Tab", code: "Tab", keyCode: 9 },
        { key: "m", code: "KeyM", keyCode: 77 },
      ],
    };

    const configs = keyConfigs[button];
    if (configs) {
      configs.forEach((cfg) => {
        try {
          const event = new KeyboardEvent(type, {
            key: cfg.key,
            code: cfg.code,
            bubbles: true,
            cancelable: true,
          });
          // Ensure Phaser's KeyboardPlugin reads the proper keyCode & which
          Object.defineProperty(event, "keyCode", {
            get: () => cfg.keyCode,
            configurable: true,
          });
          Object.defineProperty(event, "which", {
            get: () => cfg.keyCode,
            configurable: true,
          });
          window.dispatchEvent(event);
        } catch {
          // Ignore
        }
      });
    }
  }

  public releaseAll(): void {
    (Object.keys(this.state) as PadButton[]).forEach((btn) => {
      if (this.state[btn]) {
        this.setButton(btn, false);
      }
    });
  }
}

export const virtualPad = new VirtualPad();
