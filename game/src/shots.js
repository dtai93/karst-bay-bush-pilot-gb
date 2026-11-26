// Deterministic scenes for ?shot=name&seed=1. The real flight model runs a
// fixed number of steps under a simple autopilot, then the picture freezes.

import { FIRST_LIGHT_RINGS, STEP, clamp, wrapPi } from './config.js';

const COVER_RING = 4;

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
  const yaw = -0.42;
  const speed = 39;
  plane.x = 120;
  plane.y = 60;
  plane.z = 270;
  plane.yaw = yaw;
  plane.pitch = 0.04;
  plane.roll = -0.36;
  plane.vx = Math.sin(yaw) * speed;
  plane.vy = -1.1;
  plane.vz = -Math.cos(yaw) * speed;
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
    session.camera.mode = 'cockpit';
    flyToward(session, 74, FIRST_LIGHT_RINGS[COVER_RING], 58);
    session.objective = { title: 'FIRST LIGHT', line: 'RING 5 / 6  ·  FLY THROUGH', timer: '02:31' };
  } else if (shot === 'missions') {
    flyToward(session, 50, FIRST_LIGHT_RINGS[COVER_RING], 56);
    session.objective = { title: 'FIRST LIGHT', line: 'SIX RINGS  ·  HARBOUR FIELD', timer: '04:18' };
  } else if (shot === 'debrief') {
    flyToward(session, 50, FIRST_LIGHT_RINGS[COVER_RING], 56);
    session.objective = { title: 'FIRST LIGHT', line: 'HARBOUR FIELD  ·  FINAL APPROACH', timer: '00:42' };
  } else {
    flyToward(session, 50, FIRST_LIGHT_RINGS[COVER_RING], 56);
    pinApproach(session);
    session.objective = {
      title: 'FIRST LIGHT',
      line: 'RING 5 / 6  ·  THEN LAND',
      timer: '02:46',
    };
  }
  session.frozen = true;
}
