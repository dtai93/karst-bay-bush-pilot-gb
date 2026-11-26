// Keyboard and mouse. Pitch, roll, rudder, throttle, flaps, brakes, view, pause.

const PITCH_UP = ['KeyW', 'ArrowUp'];
const PITCH_DOWN = ['KeyS', 'ArrowDown'];
const ROLL_LEFT = ['KeyA', 'ArrowLeft'];
const ROLL_RIGHT = ['KeyD', 'ArrowRight'];
const BLOCK = new Set([
  'KeyW', 'KeyS', 'KeyA', 'KeyD',
  'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
  'Space',
]);

function held(keys, names) {
  for (let i = 0; i < names.length; i += 1) {
    if (keys.has(names[i])) return true;
  }
  return false;
}

export function createInput(canvas) {
  const keys = new Set();
  const edges = new Set();
  let wheel = 0;
  let dragX = 0;
  let dragY = 0;
  let dragging = false;
  let lastX = 0;
  let lastY = 0;

  window.addEventListener('keydown', (event) => {
    if (BLOCK.has(event.code)) event.preventDefault();
    if (!keys.has(event.code)) edges.add(event.code);
    keys.add(event.code);
  });
  window.addEventListener('keyup', (event) => {
    keys.delete(event.code);
  });
  window.addEventListener('blur', () => {
    keys.clear();
  });
  canvas.addEventListener('wheel', (event) => {
    event.preventDefault();
    wheel += event.deltaY < 0 ? 1 : -1;
  }, { passive: false });
  canvas.addEventListener('pointerdown', (event) => {
    dragging = true;
    lastX = event.clientX;
    lastY = event.clientY;
    canvas.setPointerCapture(event.pointerId);
  });
  canvas.addEventListener('pointermove', (event) => {
    if (!dragging) return;
    dragX += event.clientX - lastX;
    dragY += event.clientY - lastY;
    lastX = event.clientX;
    lastY = event.clientY;
  });
  const endDrag = () => {
    dragging = false;
  };
  canvas.addEventListener('pointerup', endDrag);
  canvas.addEventListener('pointercancel', endDrag);

  function takeEdge(code) {
    if (!edges.has(code)) return false;
    edges.delete(code);
    return true;
  }

  return {
    sample() {
      const lookX = dragX;
      const lookY = dragY;
      const notch = wheel;
      dragX = 0;
      dragY = 0;
      wheel = 0;
      const pitch = (held(keys, PITCH_UP) ? 1 : 0) - (held(keys, PITCH_DOWN) ? 1 : 0);
      const roll = (held(keys, ROLL_RIGHT) ? 1 : 0) - (held(keys, ROLL_LEFT) ? 1 : 0);
      const rudder = (keys.has('KeyE') ? 1 : 0) - (keys.has('KeyQ') ? 1 : 0);
      const throttleUp = keys.has('ShiftLeft') || keys.has('ShiftRight');
      const throttleDown = keys.has('ControlLeft') || keys.has('ControlRight');
      return {
        pitch,
        roll,
        rudder,
        throttleDelta: (throttleUp ? 1 : 0) - (throttleDown ? 1 : 0) + notch * 0.55,
        brake: keys.has('KeyG'),
        flap: takeEdge('KeyF'),
        view: takeEdge('KeyC'),
        pause: takeEdge('KeyP'),
        mute: takeEdge('KeyM'),
        restart: takeEdge('KeyR'),
        lookX,
        lookY,
      };
    },
  };
}
