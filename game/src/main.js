// Boot, fixed-step loop, and the wiring between the bay and the Kestrel.

import * as THREE from '../vendor/three.module.min.js';
import { FIRST_LIGHT_RINGS, STEP } from './config.js';
import { createInput } from './input.js';
import { createFlight, readout, stepFlight } from './flight-model.js';
import { createAircraft, updateAircraft } from './aircraft-model.js';
import { createTerrain } from './terrain.js';
import { createWater, updateWater } from './water.js';
import { createSky } from './sky.js';
import { createAirfields } from './airfields.js';
import { createVillage } from './village.js';
import { collectRing, createRings, updateRings } from './rings.js';
import { createCameraRig, easeLook, nudgeLook, setCameraMode, updateCameraRig } from './camera-rig.js';
import { drawHud } from './hud.js';
import { createRng } from './random.js';
import { stageShot } from './shots.js';

const viewCanvas = document.getElementById('view');
const hudCanvas = document.getElementById('hud');
const status = document.getElementById('status');

const renderer = new THREE.WebGLRenderer({ canvas: viewCanvas, antialias: true, alpha: false });
renderer.setPixelRatio(1);
if (THREE.SRGBColorSpace) renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.setClearColor(0xf0c27a, 1);

const scene = new THREE.Scene();
createSky(scene);
scene.add(createTerrain());
const water = createWater();
scene.add(water.mesh);
scene.add(createAirfields());
scene.add(createVillage());
const rings = createRings(FIRST_LIGHT_RINGS);
scene.add(rings.root);
const aircraft = createAircraft();
scene.add(aircraft.root);

const params = new URLSearchParams(window.location.search);
const shotName = params.get('shot');
const seed = Number(params.get('seed') || '1') || 1;

function freshFlight() {
  return createFlight({
    x: 0,
    y: 4.78,
    z: -48,
    yaw: 0,
    pitch: 0.12,
    roll: 0,
    speed: 0,
    throttle: 0.18,
    onGround: true,
    fuel: 0.86,
    damage: 0,
  });
}

const session = {
  flight: freshFlight(),
  rings,
  camera: createCameraRig(1.6),
  frozen: false,
  paused: false,
  scripted: false,
  time: 0,
  rng: createRng(seed),
  objective: {
    title: 'FIRST LIGHT',
    line: 'RING 1 / 6  ·  FLY THROUGH',
    timer: '06:00',
  },
  step(dt, controls) {
    stepFlight(this.flight, controls, dt);
    collectRing(this.rings, this.flight);
    this.time += dt;
    if (!this.scripted) this.writeObjective();
  },
  writeObjective() {
    const left = Math.max(0, 360 - this.time);
    const minutes = Math.floor(left / 60);
    const seconds = Math.floor(left % 60);
    const next = Math.min(this.rings.index + 1, this.rings.list.length);
    const finished = this.rings.index >= this.rings.list.length;
    const timer = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    this.objective = {
      title: 'FIRST LIGHT',
      line: finished ? 'LAND AT HARBOUR FIELD' : `RING ${next} / 6  ·  FLY THROUGH`,
      timer,
    };
  },
};

function fit() {
  const width = window.innerWidth || 1024;
  const height = window.innerHeight || 640;
  renderer.setSize(width, height, false);
  session.camera.camera.aspect = width / Math.max(height, 1);
  session.camera.camera.updateProjectionMatrix();
  hudCanvas.width = width;
  hudCanvas.height = height;
}

fit();
window.addEventListener('resize', fit);

const input = createInput(viewCanvas);

function resetSortie() {
  session.flight = freshFlight();
  session.time = 0;
  session.paused = false;
  session.rings.index = 0;
  for (let i = 0; i < session.rings.list.length; i += 1) session.rings.list[i].taken = false;
  session.camera.ready = false;
  if (!session.scripted) session.writeObjective();
}

if (shotName) stageShot(shotName, session);

let last = performance.now();
let accumulator = 0;
let statusClock = 0;

function frame(now) {
  const elapsed = Math.min(0.05, (now - last) / 1000);
  last = now;
  if (!session.frozen) {
    const sample = input.sample();
    if (sample.view) {
      setCameraMode(session.camera, session.camera.mode === 'chase' ? 'cockpit' : 'chase');
    }
    if (sample.pause) session.paused = !session.paused;
    if (sample.restart && !session.scripted) resetSortie();
    nudgeLook(session.camera, sample.lookX, sample.lookY);
    if (!session.paused) {
      accumulator += elapsed;
      let guard = 0;
      while (accumulator >= STEP && guard < 5) {
        session.step(STEP, sample);
        accumulator -= STEP;
        guard += 1;
      }
    }
    easeLook(session.camera, elapsed);
  }
  updateAircraft(aircraft, session.flight, session.frozen ? 0 : elapsed);
  updateRings(rings, session.time);
  updateWater(water, session.time, session.frozen);
  updateCameraRig(session.camera, session.flight, session.frozen ? 0.5 : elapsed);
  renderer.render(scene, session.camera.camera);
  drawHud(hudCanvas, {
    readout: readout(session.flight),
    objective: session.objective,
    rings: session.rings,
    paused: session.paused,
  });
  statusClock += elapsed;
  if (status && statusClock > 0.5) {
    statusClock = 0;
    const dial = readout(session.flight);
    status.textContent = `Altitude ${Math.round(dial.altFt)} feet, ${Math.round(dial.kts)} knots, heading ${dial.hdgText}`;
  }
  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
