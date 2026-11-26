// Shared numbers for Limestone Wings: the bay, the Kestrel, and the HUD units.

export const STEP = 1 / 60;

export const WORLD = {
  size: 5200,
  water: 0.22,
  gear: 1.58,
};

export const UNITS = {
  mpsToKts: 1.943844,
  mToFt: 3.28084,
  mpsToFpm: 196.8504,
};

// Tuned so level flight sits near 78 kt with the throttle around two thirds,
// and the wing stops holding the aeroplane near 45 kt.
export const AERO = {
  mass: 1180,
  gravity: 9.81,
  stall: 23.15,
  maxThrust: 8.15,
  liftK: 0.01613,
  clAoa: 4.8,
  clBase: 0.12,
  clMax: 1.16,
  trim: 0.058,
  dragK: 0.00345,
  flapLift: 0.16,
  flapDrag: 0.00105,
  fuelBurn: 0.0034,
  rotateSpeed: 29,
  crashSink: 8.4,
  crashBank: 0.7,
  hardSink: 3.4,
};

export const SPAWN = {
  x: 0,
  y: 3.2 + WORLD.gear,
  z: 28,
  yaw: 0,
  pitch: 0.02,
  roll: 0,
  throttle: 0.15,
  fuel: 0.86,
  damage: 0,
};

export const HARBOUR = {
  id: 'harbour',
  name: 'Harbour Field',
  x: 0,
  z: -420,
  length: 780,
  width: 36,
  elevation: 3.2,
  heading: 0,
  surface: 'asphalt',
};

export const TERRACE = {
  id: 'terrace',
  name: 'Terrace Strip',
  x: -760,
  z: 40,
  length: 400,
  width: 24,
  elevation: 33.6,
  heading: 0.15,
  surface: 'grass',
};

export const LAGOON = {
  id: 'lagoon',
  name: 'Lagoon Strip',
  x: 1080,
  z: 470,
  length: 440,
  width: 26,
  elevation: 4.4,
  heading: 0.9,
  surface: 'grass',
};

export const FIELDS = [HARBOUR, TERRACE, LAGOON];

// Six gates for First Light. Index 4 sits on the Harbour approach.
export const FIRST_LIGHT_RINGS = [
  { x: -240, y: 74, z: 220 },
  { x: -520, y: 110, z: -30 },
  { x: -150, y: 92, z: -760 },
  { x: 430, y: 120, z: -340 },
  { x: 16, y: 56, z: 86 },
  { x: -24, y: 50, z: -260 },
];

export const TOWERS = [
  { x: -250, z: 170, r: 48, h: 155 },
  { x: -530, z: -50, r: 60, h: 215 },
  { x: -170, z: -690, r: 42, h: 128 },
  { x: 410, z: -310, r: 64, h: 236 },
  { x: 270, z: 210, r: 38, h: 102 },
  { x: 640, z: -90, r: 52, h: 176 },
  { x: -70, z: -1040, r: 46, h: 148 },
  { x: 180, z: -1180, r: 72, h: 268 },
  { x: 920, z: 390, r: 50, h: 136 },
  { x: -980, z: 380, r: 58, h: 188 },
];

export const VILLAGE = { x: 168, z: -90 };
export const LIGHTHOUSE = { x: -158, z: -8 };

export const LIVERY = {
  cream: 0xf4e4c8,
  red: 0xc4372d,
  redDeep: 0x8d241c,
  rubber: 0x241c18,
  glass: 0x9ed8d4,
  metal: 0x8d949c,
  tail: 0xf7efe0,
};

export function clamp(value, lo, hi) {
  return value < lo ? lo : value > hi ? hi : value;
}

export function wrapPi(angle) {
  let a = angle;
  while (a > Math.PI) a -= Math.PI * 2;
  while (a < -Math.PI) a += Math.PI * 2;
  return a;
}

export function headingDeg(yaw) {
  const deg = (yaw * 180) / Math.PI;
  return ((deg % 360) + 360) % 360;
}

export function formatHdg(yaw) {
  const n = Math.round(headingDeg(yaw)) % 360;
  const text = String(n);
  return '000'.slice(text.length) + text;
}

function ellipse(x, z, cx, cz, rx, rz) {
  return Math.hypot((x - cx) / rx, (z - cz) / rz);
}

function blob(x, z, cx, cz, rx, rz, height) {
  const d = ellipse(x, z, cx, cz, rx, rz);
  if (d >= 1) return 0;
  const u = 1 - d;
  const s = u * u * (3 - 2 * u);
  return height * s;
}

export function islandHeight(x, z) {
  let h = 0;
  h = Math.max(h, blob(x, z, 0, -340, 230, 720, 4.8));
  h = Math.max(h, blob(x, z, -20, 340, 460, 280, 8.2));
  h = Math.max(h, blob(x, z, -760, 50, 360, 280, 52));
  h = Math.max(h, blob(x, z, 1080, 470, 300, 230, 7.4));
  h = Math.max(h, blob(x, z, 720, -760, 220, 180, 6.5));
  h = Math.max(h, blob(x, z, -1180, -420, 260, 200, 18));
  const terrace = Math.hypot(x + 760, z - 50);
  if (h > 9 && terrace < 340) {
    h = Math.floor(h / 3.4) * 3.4 + 0.55;
  }
  return h;
}

function towerColumn(x, z, tower) {
  const d = Math.hypot(x - tower.x, z - tower.z);
  const foot = tower.r * 1.28;
  if (d >= foot) return 0;
  const crown = tower.r * 0.78;
  if (d <= crown) return tower.h;
  const u = (foot - d) / (foot - crown);
  return tower.h * u * u;
}

function insideField(x, z, field, pad) {
  const dx = x - field.x;
  const dz = z - field.z;
  const c = Math.cos(field.heading);
  const s = Math.sin(field.heading);
  const along = dx * s + dz * c;
  const across = dx * c - dz * s;
  const halfL = field.length * 0.5 + pad;
  const halfW = field.width * 0.5 + pad;
  return Math.abs(along) <= halfL && Math.abs(across) <= halfW;
}

export function fieldAt(x, z) {
  for (let i = 0; i < FIELDS.length; i += 1) {
    if (insideField(x, z, FIELDS[i], 8)) return FIELDS[i];
  }
  return null;
}

export function heightAt(x, z) {
  let h = islandHeight(x, z);
  for (let i = 0; i < TOWERS.length; i += 1) {
    const column = towerColumn(x, z, TOWERS[i]);
    if (column > h) h = column;
  }
  for (let i = 0; i < FIELDS.length; i += 1) {
    const field = FIELDS[i];
    if (insideField(x, z, field, 18)) {
      if (insideField(x, z, field, 0)) h = field.elevation;
      else h = Math.max(h, field.elevation - 0.15);
    }
  }
  return h;
}
