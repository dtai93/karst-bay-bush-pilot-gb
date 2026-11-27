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
  { x: -250, z: 170, r: 48, h: 155, leanX: -8, leanZ: 5, seed: 1 },
  { x: -530, z: -50, r: 60, h: 215, leanX: 9, leanZ: -5, seed: 2 },
  { x: -170, z: -690, r: 42, h: 128, leanX: -4, leanZ: -6, seed: 3 },
  { x: 410, z: -310, r: 64, h: 236, leanX: 7, leanZ: 8, seed: 4 },
  { x: 270, z: 210, r: 38, h: 102, leanX: 4, leanZ: -3, seed: 5 },
  { x: 640, z: -90, r: 52, h: 176, leanX: -8, leanZ: 6, seed: 6 },
  { x: -70, z: -1040, r: 46, h: 148, leanX: 3, leanZ: -8, seed: 7 },
  { x: 180, z: -1180, r: 72, h: 268, leanX: -11, leanZ: 8, seed: 8 },
  { x: 920, z: 390, r: 50, h: 136, leanX: 5, leanZ: 4, seed: 9 },
  { x: -980, z: 380, r: 58, h: 188, leanX: -6, leanZ: 9, seed: 10 },
  { x: -1460, z: -250, r: 58, h: 205, leanX: 9, leanZ: -4, seed: 11 },
  { x: -1270, z: 180, r: 41, h: 112, leanX: -3, leanZ: 7, seed: 12 },
  { x: -1810, z: 240, r: 74, h: 278, leanX: 12, leanZ: -8, seed: 13 },
  { x: -2080, z: -430, r: 46, h: 146, leanX: -5, leanZ: 5, seed: 14 },
  { x: -1590, z: -820, r: 52, h: 169, leanX: 7, leanZ: 2, seed: 15 },
  { x: -1120, z: -1130, r: 78, h: 310, leanX: -9, leanZ: -12, seed: 16 },
  { x: -650, z: -1550, r: 50, h: 162, leanX: 6, leanZ: 7, seed: 17 },
  { x: -170, z: -1680, r: 62, h: 226, leanX: -8, leanZ: 10, seed: 18 },
  { x: 370, z: -1640, r: 43, h: 131, leanX: 5, leanZ: -6, seed: 19 },
  { x: 830, z: -1430, r: 68, h: 252, leanX: -12, leanZ: 5, seed: 20 },
  { x: 1230, z: -1100, r: 48, h: 153, leanX: 4, leanZ: 8, seed: 21 },
  { x: 1540, z: -640, r: 76, h: 298, leanX: -10, leanZ: -9, seed: 22 },
  { x: 1790, z: -160, r: 44, h: 137, leanX: 8, leanZ: 4, seed: 23 },
  { x: 1470, z: 330, r: 58, h: 184, leanX: -7, leanZ: 6, seed: 24 },
  { x: 1240, z: 830, r: 70, h: 264, leanX: 10, leanZ: -8, seed: 25 },
  { x: 730, z: 1110, r: 46, h: 144, leanX: -5, leanZ: -3, seed: 26 },
  { x: 210, z: 1040, r: 60, h: 198, leanX: 9, leanZ: 7, seed: 27 },
  { x: -330, z: 920, r: 48, h: 158, leanX: -6, leanZ: 5, seed: 28 },
  { x: -830, z: 1010, r: 72, h: 286, leanX: 11, leanZ: -5, seed: 29 },
  { x: -1280, z: 790, r: 44, h: 139, leanX: -4, leanZ: -7, seed: 30 },
];

export const VILLAGE = { x: 168, z: -90 };
export const LIGHTHOUSE = { x: -158, z: -8 };
export const RESCUE_BOAT = { x: -332, z: 132 };

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

export function towerRadiusAt(tower, y, angle) {
  const u = Math.max(0, Math.min(1, y / tower.h));
  const seed = tower.seed ?? 1;
  const foot = u < 0.1 ? 0.8 + u * 1.4 : 1;
  const taper = 1.02 - 0.46 * u + 0.1 * Math.sin((u * 2.2 + seed) * Math.PI);
  const shelf = 1 + 0.06 * Math.sin(u * 11 + seed * 2);
  const irregular = 1 + 0.2 * Math.sin(angle * 3 + seed * 1.7) + 0.08 * Math.sin(angle * 5 - seed + u * 4);
  const topRag = u > 0.84 ? 0.78 + 0.1 * Math.sin(angle * 4 + seed) : 1;
  return Math.max(tower.r * 0.32, tower.r * foot * taper * shelf * irregular * topRag);
}

function towerColumn(x, z, tower) {
  const leanX = tower.leanX ?? 0;
  const leanZ = tower.leanZ ?? 0;
  for (let band = 48; band >= 0; band -= 1) {
    const y = tower.h * band / 48;
    const dx = x - tower.x - leanX * (y / tower.h);
    const dz = z - tower.z - leanZ * (y / tower.h);
    const angle = Math.atan2(dz, dx);
    if (Math.hypot(dx, dz) <= towerRadiusAt(tower, y, angle)) return y;
  }
  return 0;
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
