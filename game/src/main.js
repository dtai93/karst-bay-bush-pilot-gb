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
import { drawScreen } from './screens.js';
import { createMissionState, advanceMission, missionObjective } from './mission-runner.js';
import { MISSIONS } from './missions.js';
import { sampleWeather } from './weather.js';
import { buyUpgrade, creditMission, loadHangar, upgradeEffects } from './hangar-upgrades.js';
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

function freshFlight(hangar, missionId) {
  const upgrades = upgradeEffects(hangar);
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
    fuel: missionId === 'squall-line' ? 0.34 : upgrades.fuel,
    damage: 0,
  });
}
const session = {
  hangar: loadHangar(),
  flight: null,
  mission: createMissionState(),
  selectedMission: 1,
  rewardPaid: false,
  screen: 'title',
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
    const weather = sampleWeather(this.mission.id, this.time);
    const upgrades = upgradeEffects(this.hangar);
    stepFlight(this.flight, {
      ...controls, windX: weather.x, windZ: weather.z, payload: this.mission.cargo,
      engineBonus: upgrades.engineBonus, gearBonus: upgrades.gearBonus,
    }, dt);
    const collected = collectRing(this.rings, this.flight);
    advanceMission(this.mission, this.flight, this.rings.index, collected, controls);
    if (this.flight.crashed) this.mission.crashReason = this.flight.crashReason;
    if (this.mission.status === 'complete' && !this.rewardPaid) {
      creditMission(this.hangar, this.mission.pay, this.mission.id, this.mission.stars);
      this.rewardPaid = true;
    }
    if (['crashed', 'complete', 'landed', 'expired'].includes(this.mission.status)) this.screen = 'debrief';
    this.time += dt;
    if (!this.scripted) this.objective = missionObjective(this.mission, 360 - this.time);
  },
};
session.flight = freshFlight(session.hangar);

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

function resetSortie(id = MISSIONS[session.selectedMission - 1].id) {
  session.flight = freshFlight(session.hangar, id);
  session.mission = createMissionState(id);
  session.rewardPaid = false;
  session.time = 0;
  session.paused = false;
  session.rings.index = 0;
  for (let i = 0; i < session.rings.list.length; i += 1) session.rings.list[i].taken = false;
  session.camera.ready = false;
  if (!session.scripted) session.objective = missionObjective(session.mission, 360);
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
    if (sample.pause && session.screen === 'flight') session.paused = !session.paused;
    if (sample.selectMission) {
      session.selectedMission = sample.selectMission;
      if (session.screen === 'debrief') session.screen = 'title';
    }
    if (sample.hangar && session.screen !== 'flight') session.screen = session.screen === 'hangar' ? 'title' : 'hangar';
    if (session.screen === 'hangar') {
      if (sample.buyTank) buyUpgrade(session.hangar, 'tank');
      if (sample.buyEngine) buyUpgrade(session.hangar, 'engine');
      if (sample.buyGear) buyUpgrade(session.hangar, 'gear');
    }
    if (sample.start && ['title', 'missions', 'debrief', 'hangar'].includes(session.screen)) {
      resetSortie(MISSIONS[session.selectedMission - 1].id);
      session.screen = 'flight';
    }
    if (sample.restart && session.screen !== 'title') {
      resetSortie(MISSIONS[session.selectedMission - 1].id);
      session.screen = 'flight';
    }
    nudgeLook(session.camera, sample.lookX, sample.lookY);
    if (!session.paused && session.screen === 'flight') {
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
  aircraft.root.visible = session.camera.mode !== 'cockpit';
  updateRings(rings, session.time);
  updateWater(water, session.time, session.frozen);
  updateCameraRig(session.camera, session.flight, session.frozen ? 0.5 : elapsed);
  renderer.render(scene, session.camera.camera);
  const weather = sampleWeather(session.mission.id, session.time);
  drawHud(hudCanvas, {
    readout: readout(session.flight),
    objective: session.objective,
    rings: session.rings,
    paused: session.paused,
    cockpit: session.camera.mode === 'cockpit',
    weather,
  });
  session.mission.stats = {
    fuel: Math.round(session.flight.fuel * 100),
    damage: Math.round(session.flight.damage * 100),
    elapsed: Math.floor(session.time),
  };
  drawScreen(hudCanvas, session.screen, session.mission, session.selectedMission, session.hangar);
  statusClock += elapsed;
  if (status && statusClock > 0.5) {
    statusClock = 0;
    const dial = readout(session.flight);
    status.textContent = `Altitude ${Math.round(dial.altFt)} feet, ${Math.round(dial.kts)} knots, heading ${dial.hdgText}`;
  }
  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
