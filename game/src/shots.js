// Deterministic scenes for ?shot=name&seed=1. The real flight model runs a
// fixed number of steps under a simple autopilot, then the picture freezes.

import { HARBOUR, STEP, VILLAGE, WORLD, clamp, wrapPi } from './config.js';
import { createMissionState } from './mission-runner.js';

function aimAt(plane, point, altitude) {
  const dx = point.x - plane.x;
  const dz = point.z - plane.z;
  const want = Math.atan2(dx, -dz);
  const dyaw = wrapPi(want - plane.yaw);
  const altErr = altitude - plane.y;
  return {
    pitch: clamp(altErr * 0.045 - plane.vy * 0.18, -1, 1),
    roll: clamp(dyaw * 1.7, -1, 1),
    rudder: clamp(dyaw * 0.35, -1, 1),
    throttle: 0.64,
    brake: false,
  };
}

function flyToward(session, steps, point, altitude) {
  for (let i = 0; i < steps; i += 1) {
    session.step(STEP, aimAt(session.flight, point, altitude));
  }
}

function pinVelocity(plane, speed) {
  plane.vx = Math.sin(plane.yaw) * speed;
  plane.vy = plane.pitch * speed * 0.35;
  plane.vz = -Math.cos(plane.yaw) * speed;
}

function moveRing(session, index, x, y, z) {
  const ring = session.rings.list[index];
  ring.x = x;
  ring.y = y;
  ring.z = z;
  ring.group.position.set(x, y, z);
  ring.group.rotation.y = 0;
  return ring;
}

function markRings(session, active) {
  session.rings.index = active;
  for (let i = 0; i < session.rings.list.length; i += 1) {
    session.rings.list[i].taken = i < active;
    session.rings.list[i].group.visible = i >= active && i <= active + 1;
  }
}

function airborne(plane, x, y, z, yaw, roll, pitch) {
  plane.x = x;
  plane.y = y;
  plane.z = z;
  plane.yaw = yaw;
  plane.pitch = pitch;
  plane.roll = roll;
  plane.onGround = false;
  plane.crashed = false;
  plane.crashReason = '';
  plane.brake = false;
  pinVelocity(plane, 40);
}

function frameCamera(session, mode, lookYaw, lookPitch, backMul, lead) {
  session.camera.mode = mode;
  session.camera.lookYaw = lookYaw;
  session.camera.lookPitch = lookPitch;
  session.camera.backMul = backMul;
  session.camera.lead = lead;
  session.camera.ready = false;
}

function finish(session) {
  session.screen = 'flight';
  session.paused = false;
  session.scripted = true;
  session.frozen = true;
  session.flight.crashed = false;
}

function stageCover(session) {
  const plane = session.flight;
  airborne(plane, 48, 62, 150, -0.06, -0.28, 0.02);
  plane.throttle = 0.66;
  plane.rpm = 0.72;
  plane.fuel = 0.71;
  plane.damage = 0;
  plane.flaps = 1;
  session.mission = createMissionState('first-light');
  session.mission.status = 'flying';
  session.mission.rings = 3;
  markRings(session, 3);
  moveRing(session, 3, 8, 54, 28);
  moveRing(session, 4, -6, 42, -150);
  session.scripted = true;
  flyToward(session, 36, { x: 8, z: 28 }, 54);
  airborne(plane, 28, 50, 92, -0.04, -0.33, 0.04);
  plane.throttle = 0.66;
  plane.rpm = 0.72;
  plane.fuel = 0.7;
  plane.damage = 0;
  plane.flaps = 1;
  frameCamera(session, 'chase', 0.42, -0.14, 0.74, 6);
  session.objective = { title: 'FIRST LIGHT', line: 'RING 4/6  ·  HARBOUR FIELD', timer: '02:46' };
  session.callout = { title: 'RING 4/6', line: 'RING CLEAN +150', color: '#9dffb8' };
  session.sack = null;
  session.target = null;
}

function stageCockpit(session) {
  const plane = session.flight;
  airborne(plane, 0, 42, 160, 0, 0, -0.04);
  plane.throttle = 0.48;
  plane.rpm = 0.58;
  plane.fuel = 0.46;
  plane.damage = 0.02;
  plane.flaps = 2;
  session.mission = createMissionState('first-light');
  session.mission.rings = 6;
  markRings(session, 5);
  session.scripted = true;
  flyToward(session, 28, { x: HARBOUR.x, z: HARBOUR.z }, 26);
  airborne(plane, 0.4, 16, 18, 0.005, 0.01, -0.06);
  plane.throttle = 0.46;
  plane.rpm = 0.57;
  plane.fuel = 0.44;
  plane.flaps = 2;
  pinVelocity(plane, 32);
  plane.vy = -2.4;
  frameCamera(session, 'cockpit', 0, -0.04, 1, 8);
  session.objective = { title: 'FIRST LIGHT', line: 'HARBOUR  ·  SHORT FINAL', timer: '00:38' };
  session.callout = null;
  session.sack = null;
  session.target = null;
}

function stageMail(session) {
  const plane = session.flight;
  airborne(plane, 210, 36, 20, 2.4, 0.22, -0.03);
  plane.throttle = 0.55;
  plane.rpm = 0.6;
  plane.fuel = 0.31;
  plane.damage = 0.05;
  plane.flaps = 1;
  session.mission = createMissionState('mail-drop');
  session.mission.status = 'flying';
  session.mission.drops = 2;
  markRings(session, 6);
  session.scripted = true;
  flyToward(session, 24, { x: VILLAGE.x, z: VILLAGE.z }, 28);
  airborne(plane, 160, 24, -28, 0.16, -0.38, 0.03);
  plane.fuel = 0.3;
  plane.throttle = 0.52;
  plane.rpm = 0.58;
  plane.flaps = 1;
  pinVelocity(plane, 34);
  frameCamera(session, 'chase', 0.72, -0.2, 0.82, 6);
  session.objective = { title: 'MAIL DROP', line: 'DROPS 2/3  ·  PAY $420', timer: '01:12' };
  session.callout = { title: 'ROOFTOP', line: '+250 BULLSEYE', color: '#ffe08a' };
  session.sack = { x: 164, y: 16, z: -58 };
  session.target = { x: VILLAGE.x, y: 12.4, z: VILLAGE.z };
}

function stageTouchdown(session) {
  const plane = session.flight;
  const y = HARBOUR.elevation + WORLD.gear + 0.55;
  airborne(plane, 3.2, y + 8, 20, 0, 0, -0.02);
  plane.throttle = 0.18;
  plane.rpm = 0.42;
  plane.fuel = 0.22;
  plane.damage = 0;
  plane.flaps = 2;
  session.mission = createMissionState('first-light');
  session.mission.rings = 6;
  markRings(session, 6);
  session.scripted = true;
  flyToward(session, 20, { x: 0, z: -80 }, y + 1);
  airborne(plane, 1.4, y, -72, 0.01, -0.03, 0.012);
  plane.throttle = 0.12;
  plane.rpm = 0.36;
  plane.fuel = 0.22;
  plane.flaps = 2;
  pinVelocity(plane, 28);
  plane.vy = -0.6;
  plane.brake = true;
  frameCamera(session, 'chase', 0.78, -0.2, 0.78, 4);
  session.objective = { title: 'FIRST LIGHT', line: 'HARBOUR 36  ·  ROLLOUT', timer: '00:08' };
  session.callout = null;
  session.eventBanner = { title: 'TOUCHDOWN', detail: 'GRADE A  ·  160 FPM', crash: false };
  session.sack = null;
  session.target = null;
}

export function stageShot(name, session) {
  const shot = name || 'cover';
  session.screen = 'flight';
  session.callout = null;
  session.eventBanner = null;
  session.sack = null;
  session.target = null;
  if (shot === 'cockpit') stageCockpit(session);
  else if (shot === 'maildrop' || shot === 'mail') stageMail(session);
  else if (shot === 'touchdown' || shot === 'landing') stageTouchdown(session);
  else stageCover(session);
  finish(session);
}
