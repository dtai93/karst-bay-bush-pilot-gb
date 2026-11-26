// Arcade flight for the Kestrel K-2. Thrust, lift that grows with speed
// and angle of attack, drag, a real stall, and a ground roll that rotates.

import {
  AERO,
  SPAWN,
  WORLD,
  UNITS,
  clamp,
  fieldAt,
  formatHdg,
  headingDeg,
  heightAt,
  wrapPi,
} from './config.js';

export function createFlight(over) {
  const spec = over ?? {};
  const yaw = spec.yaw ?? SPAWN.yaw;
  const speed = spec.speed ?? 0;
  return {
    x: spec.x ?? SPAWN.x,
    y: spec.y ?? SPAWN.y,
    z: spec.z ?? SPAWN.z,
    vx: spec.vx ?? Math.sin(yaw) * speed,
    vy: spec.vy ?? 0,
    vz: spec.vz ?? -Math.cos(yaw) * speed,
    pitch: spec.pitch ?? SPAWN.pitch,
    roll: spec.roll ?? SPAWN.roll,
    yaw,
    throttle: spec.throttle ?? SPAWN.throttle,
    flaps: spec.flaps ?? 0,
    brake: false,
    rpm: spec.throttle ?? SPAWN.throttle,
    fuel: spec.fuel ?? SPAWN.fuel,
    damage: spec.damage ?? SPAWN.damage,
    onGround: spec.onGround ?? true,
    crashed: false,
    crashReason: '',
    buffet: 0,
    age: 0,
    touch: null,
  };
}

function axes(yaw, pitch) {
  const cp = Math.cos(pitch);
  return {
    x: Math.sin(yaw) * cp,
    y: Math.sin(pitch),
    z: -Math.cos(yaw) * cp,
  };
}

export function stepFlight(plane, controls, dt) {
  plane.age += dt;
  if (plane.crashed) {
    plane.rpm += (0 - plane.rpm) * Math.min(1, dt * 2);
    plane.vx *= Math.max(0, 1 - dt * 1.4);
    plane.vz *= Math.max(0, 1 - dt * 1.4);
    plane.vy = 0;
    return plane;
  }

  if (typeof controls.throttle === 'number') {
    plane.throttle = clamp(controls.throttle, 0, 1);
  } else {
    const delta = controls.throttleDelta ?? 0;
    plane.throttle = clamp(plane.throttle + delta * 0.45 * dt, 0, 1);
  }
  if (controls.flap) plane.flaps = (plane.flaps + 1) % 3;
  plane.brake = !!controls.brake;

  const alive = plane.fuel > 0.008;
  const power = plane.throttle * (1 - plane.damage * 0.42) * (alive ? 1 : 0);
  plane.rpm += (power - plane.rpm) * Math.min(1, dt * 2.4);
  if (alive) plane.fuel = Math.max(0, plane.fuel - plane.throttle * AERO.fuelBurn * dt);

  const ground = heightAt(plane.x, plane.z);
  const watery = ground < 0.7 && !fieldAt(plane.x, plane.z);
  const floor = ground + WORLD.gear;

  if (plane.onGround) {
    const targetPitch = 0.02 + (controls.pitch ?? 0) * 0.16;
    plane.pitch += (targetPitch - plane.pitch) * Math.min(1, dt * 4);
    plane.roll += (0 - plane.roll) * Math.min(1, dt * 3);
    plane.yaw = wrapPi(plane.yaw + (controls.rudder ?? 0) * 0.85 * dt);
    const along = Math.max(0, plane.vx * Math.sin(plane.yaw) + plane.vz * -Math.cos(plane.yaw));
    const drag = AERO.dragK * along * along + 0.85 + (plane.brake ? 7.5 : 0.35);
    const accel = power * AERO.maxThrust * 0.62 - drag;
    const next = Math.max(0, along + accel * dt);
    plane.vx = Math.sin(plane.yaw) * next;
    plane.vy = 0;
    plane.vz = -Math.cos(plane.yaw) * next;
    plane.x += plane.vx * dt;
    plane.z += plane.vz * dt;
    const nextGround = heightAt(plane.x, plane.z);
    plane.y = nextGround + WORLD.gear;
    const rotating = next > AERO.rotateSpeed && (controls.pitch ?? 0) > 0.45 && plane.pitch > 0.08;
    if (rotating && !watery) {
      plane.onGround = false;
      plane.vy = 1.4;
      plane.pitch = Math.max(plane.pitch, 0.12);
    }
    plane.buffet = 0;
    return plane;
  }

  plane.pitch += (controls.pitch ?? 0) * 1.05 * dt;
  plane.roll += (controls.roll ?? 0) * 1.5 * dt;
  plane.roll += -plane.roll * 0.5 * dt;
  plane.roll = clamp(plane.roll, -1.15, 1.15);

  const horiz = Math.hypot(plane.vx, plane.vz);
  const speed = Math.hypot(horiz, plane.vy);
  const gamma = Math.atan2(plane.vy, Math.max(horiz, 0.4));
  const trim = AERO.trim + plane.flaps * 0.028;
  plane.pitch += (gamma + trim - plane.pitch) * 0.85 * dt;
  plane.pitch = clamp(plane.pitch, -0.7, 0.62);

  if (speed > 10) {
    const turn = (AERO.gravity * Math.tan(clamp(plane.roll, -1.05, 1.05))) / Math.max(speed, 16);
    plane.yaw += turn * dt;
  }
  plane.yaw = wrapPi(plane.yaw + (controls.rudder ?? 0) * 0.4 * dt);

  const stalling = horiz < AERO.stall;
  if (stalling) plane.pitch -= (1 - horiz / AERO.stall) * 0.85 * dt;
  plane.buffet = stalling ? Math.min(1, plane.buffet + dt * 2.5) : Math.max(0, plane.buffet - dt * 1.5);

  const aoa = plane.pitch - gamma;
  let cl = clamp(aoa * AERO.clAoa + AERO.clBase, -0.4, AERO.clMax + plane.flaps * AERO.flapLift);
  if (stalling) cl *= (horiz / AERO.stall) ** 2;

  const lift = cl * AERO.liftK * horiz * horiz;
  const nose = axes(plane.yaw, plane.pitch);
  const rightX = Math.cos(plane.yaw);
  const rightZ = Math.sin(plane.yaw);
  const thrust = power * AERO.maxThrust;
  let ax = nose.x * thrust + rightX * Math.sin(plane.roll) * lift;
  let ay = nose.y * thrust + Math.cos(plane.roll) * lift - AERO.gravity;
  let az = nose.z * thrust + rightZ * Math.sin(plane.roll) * lift;

  const dragK = AERO.dragK + plane.flaps * AERO.flapDrag + (stalling ? 0.0045 : 0);
  if (speed > 0.4) {
    const drag = dragK * speed * speed + 0.12;
    ax -= (plane.vx / speed) * drag;
    ay -= (plane.vy / speed) * drag;
    az -= (plane.vz / speed) * drag;
  }

  plane.vx = clamp(plane.vx + ax * dt, -120, 120);
  plane.vy = clamp(plane.vy + ay * dt, -80, 40);
  plane.vz = clamp(plane.vz + az * dt, -120, 120);
  plane.x += plane.vx * dt;
  plane.y += plane.vy * dt;
  plane.z += plane.vz * dt;

  const landed = heightAt(plane.x, plane.z);
  const wet = landed < 0.7 && !fieldAt(plane.x, plane.z);
  const deck = landed + WORLD.gear;
  if (plane.y > deck) return plane;

  const sink = -plane.vy;
  const bank = Math.abs(plane.roll);
  const field = fieldAt(plane.x, plane.z);
  plane.touch = {
    fpm: sink * UNITS.mpsToFpm,
    bank,
    fieldId: field ? field.id : '',
    x: plane.x,
    z: plane.z,
  };
  plane.y = deck;
  plane.vy = 0;

  if (wet || sink > AERO.crashSink || bank > AERO.crashBank) {
    plane.crashed = true;
    plane.onGround = true;
    plane.damage = 1;
    plane.crashReason = wet ? 'DITCHED' : bank > AERO.crashBank ? 'WING STRIKE' : 'HARD LANDING';
    return plane;
  }

  if (sink > AERO.hardSink) {
    plane.damage = clamp(plane.damage + (sink - AERO.hardSink) * 0.04, 0, 1);
  }
  plane.onGround = true;
  const gs = Math.hypot(plane.vx, plane.vz);
  plane.vx = Math.sin(plane.yaw) * gs;
  plane.vz = -Math.cos(plane.yaw) * gs;
  return plane;
}

export function readout(plane) {
  const speed = Math.hypot(plane.vx, plane.vy, plane.vz);
  return {
    kts: speed * UNITS.mpsToKts,
    altFt: plane.y * UNITS.mToFt,
    hdg: headingDeg(plane.yaw),
    hdgText: formatHdg(plane.yaw),
    vsFpm: plane.vy * UNITS.mpsToFpm,
    thr: plane.throttle,
    fuel: plane.fuel,
    dmg: plane.damage,
    pitch: plane.pitch,
    roll: plane.roll,
    yaw: plane.yaw,
    flaps: plane.flaps,
    brake: plane.brake,
    onGround: plane.onGround,
    crashed: plane.crashed,
    crashReason: plane.crashReason,
    buffet: plane.buffet,
    rpm: plane.rpm,
    x: plane.x,
    y: plane.y,
    z: plane.z,
  };
}
