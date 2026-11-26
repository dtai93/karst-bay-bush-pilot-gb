// Deterministic scenes for ?shot=name&seed=1. The real flight model runs a
// fixed number of steps under a simple autopilot, then the picture freezes.

import { FIRST_LIGHT_RINGS, HARBOUR, STEP, WORLD, clamp, wrapPi } from './config.js';
import { createMissionState } from './mission-runner.js';

const COVER_RING = 3;

function aimAt(plane, point, altitude) {
  const dx = point.x - plane.x;
  const dz = point.z - plane.z;
  const want = Math.atan2(dx, -dz);
  const dyaw = wrapPi(want - plane.yaw);
  const altErr = altitude - plane.y;
  return {
    pitch: clamp(altErr * 0.04 - plane.vy * 0.15, -1, 1),
    roll: clamp(dyaw * 1.6, -1, 1),
    rudder: clamp(dyaw * 0.3, -1, 1),
    throttle: 0.62,
    brake: false,
  };
}

function placeCover(session) {
  const plane = session.flight;
  const speed = 39;
  plane.x = 30;
  plane.y = 60;
  plane.z = 300;
  plane.yaw = -0.02;
  plane.pitch = 0.04;
  plane.roll = -0.36;
  plane.vx = Math.sin(plane.yaw) * speed;
  plane.vy = -1.1;
  plane.vz = -Math.cos(plane.yaw) * speed;
  plane.throttle = 0.62;
  plane.rpm = 0.68;
  plane.fuel = 0.64;
  plane.damage = 0.16;
  plane.flaps = 1;
  plane.onGround = false;
  plane.crashed = false;
  plane.crashReason = '';
  pinApproach(session);
  session.camera.mode = 'chase';
  session.camera.lookYaw = 0;
  session.camera.lookPitch = 0;
  session.camera.ready = false;
  session.scripted = true;
}

function placeFinal(session) {
  const plane = session.flight;
  plane.x = HARBOUR.x;
  plane.y = 49;
  plane.z = 105;
  plane.yaw = HARBOUR.heading;
  plane.pitch = -0.035;
  plane.roll = 0.015;
  plane.vx = 0;
  plane.vy = -1.3;
  plane.vz = -38;
  plane.throttle = 0.57;
  plane.rpm = 0.62;
  plane.fuel = 0.34;
  plane.damage = 0.04;
  plane.flaps = 2;
  plane.onGround = false;
  plane.crashed = false;
  plane.crashReason = '';
  session.camera.mode = 'cockpit';
  session.camera.lookYaw = 0;
  session.camera.lookPitch = 0;
  session.camera.ready = false;
  session.scripted = true;
}

function pinApproach(session) {
  session.rings.index = COVER_RING;
  for (let i = 0; i < session.rings.list.length; i += 1) {
    session.rings.list[i].taken = i < COVER_RING;
  }
}

function flyToward(session, steps, point, altitude) {
  for (let i = 0; i < steps; i += 1) {
    session.step(STEP, aimAt(session.flight, point, altitude));
  }
}

export function stageShot(name, session) {
  const shot = name || 'cover';
  session.screen = 'flight';
  placeCover(session);
  if (shot === 'cockpit') {
    placeFinal(session);
    flyToward(session, 36, { x: HARBOUR.x, z: HARBOUR.z }, 40);
    session.objective = { title: 'FIRST LIGHT', line: 'HARBOUR FIELD · FINAL 0.1 NM', timer: '00:42' };
  } else if (shot === 'missions') {
    flyToward(session, 50, FIRST_LIGHT_RINGS[COVER_RING], 56);
    session.mission = createMissionState('ice-market');
    session.selectedMission = 2;
    session.screen = 'missions';
  } else if (shot === 'debrief') {
    placeFinal(session);
    flyToward(session, 30, { x: HARBOUR.x, z: HARBOUR.z }, 28);
    session.flight.x = HARBOUR.x + 4;
    session.flight.y = HARBOUR.elevation + WORLD.gear;
    session.flight.z = HARBOUR.z;
    session.flight.yaw = -0.25;
    session.flight.pitch = 0;
    session.flight.roll = 0;
    session.flight.vx = 0;
    session.flight.vy = 0;
    session.flight.vz = 0;
    session.flight.fuel = 0.11;
    session.flight.onGround = true;
    session.camera.mode = 'chase';
    session.camera.lookYaw = -0.3;
    session.camera.ready = false;
    session.time = 271;
    session.mission = createMissionState('first-light');
    session.mission.status = 'complete';
    session.mission.rings = 6;
    session.mission.landing = { grade: 'A', fpm: 142, offset: 4, zone: 86, score: 94 };
    session.mission.score = 694;
    session.mission.stars = 3;
    session.mission.pay = 226;
    session.mission.stats = { fuel: 11, damage: 4, elapsed: 271 };
    session.screen = 'debrief';
  } else {
    const coverRing = session.rings.list[COVER_RING];
    coverRing.x = 18;
    coverRing.y = 50;
    coverRing.z = 12;
    coverRing.group.position.set(coverRing.x, coverRing.y, coverRing.z);
    const followingRing = session.rings.list[COVER_RING + 1];
    if (followingRing) followingRing.group.visible = false;
    flyToward(session, 50, coverRing, 56);
    pinApproach(session);
    session.objective = {
      title: 'MISSION 1 · FIRST LIGHT',
      line: 'RING 4/6 - THEN LAND\nAT HARBOUR FIELD',
      timer: '02:46',
    };
  }
  session.frozen = true;
}
