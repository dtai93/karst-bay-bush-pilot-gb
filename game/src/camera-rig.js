// Chase camera sits behind and above the Kestrel. Cockpit sits at the pilot's eye.
// Mouse look offsets the chase view and eases back so it never fights the pilot.

import * as THREE from '../vendor/three.module.min.js';
import { heightAt } from './config.js';

const euler = new THREE.Euler(0, 0, 0, 'YXZ');
const quat = new THREE.Quaternion();
const eyeLocal = new THREE.Vector3();
const lookLocal = new THREE.Vector3();
const upLocal = new THREE.Vector3(0, 1, 0);
const worldPoint = new THREE.Vector3();

export function createCameraRig(aspect) {
  const camera = new THREE.PerspectiveCamera(46, aspect, 0.25, 9000);
  return {
    camera,
    mode: 'chase',
    lookYaw: 0,
    lookPitch: 0,
    cx: 0,
    cy: 8,
    cz: 30,
    roll: 0,
    yaw: 0,
    ready: false,
    backMul: 1,
    lead: 10,
  };
}

function body(yaw) {
  return {
    fx: Math.sin(yaw),
    fz: -Math.cos(yaw),
    rx: Math.cos(yaw),
    rz: Math.sin(yaw),
  };
}

export function setCameraMode(rig, mode) {
  rig.mode = mode;
  rig.ready = false;
}

export function updateCameraRig(rig, plane, dt) {
  const aim = body(plane.yaw);
  if (rig.mode === 'cockpit') {
    euler.set(plane.pitch, plane.yaw, -plane.roll, 'YXZ');
    quat.setFromEuler(euler);
    eyeLocal.set(0, 0.9, 0.62);
    lookLocal.set(0, -6.5, -42);
    upLocal.set(Math.sin(plane.roll) * 0.15, 1, 0);
    worldPoint.copy(eyeLocal).applyQuaternion(quat);
    rig.camera.position.set(plane.x + worldPoint.x, plane.y + worldPoint.y, plane.z + worldPoint.z);
    const look = lookLocal.applyQuaternion(quat);
    rig.camera.up.copy(upLocal.applyQuaternion(quat));
    rig.camera.lookAt(plane.x + look.x, plane.y + look.y, plane.z + look.z);
    if (rig.camera.near !== 0.05) {
      rig.camera.near = 0.05;
      rig.camera.fov = 52;
      rig.camera.updateProjectionMatrix();
    }
    return;
  }
  if (rig.camera.near !== 0.25) {
    rig.camera.near = 0.25;
    rig.camera.fov = 46;
    rig.camera.updateProjectionMatrix();
  }

  const speed = Math.hypot(plane.vx, plane.vy, plane.vz);
  const back = (24 + Math.min(5, speed * 0.035)) * rig.backMul;
  const up = 4.6 + Math.min(1.2, speed * 0.01);
  const side = rig.lookYaw * 14;
  const desiredX = plane.x - aim.fx * back + aim.rx * side;
  const terrainFloor = heightAt(desiredX, plane.z - aim.fz * back + aim.rz * side) + 2.4;
  const desiredY = Math.max(plane.y + up + rig.lookPitch * 8, terrainFloor);
  const desiredZ = plane.z - aim.fz * back + aim.rz * side;
  const blend = rig.ready ? 1 - Math.exp(-Math.max(dt, 0.016) * 2.7) : 1;
  rig.cx += (desiredX - rig.cx) * blend;
  rig.cy += (desiredY - rig.cy) * blend;
  rig.cz += (desiredZ - rig.cz) * blend;
  rig.roll += (plane.roll * 0.22 - rig.roll) * blend;
  rig.yaw += (plane.yaw - rig.yaw) * blend;
  rig.ready = true;
  rig.camera.up.set(Math.sin(rig.roll) * 0.45, Math.cos(rig.roll * 0.45), 0);
  rig.camera.position.set(rig.cx, rig.cy, rig.cz);
  rig.camera.lookAt(
    plane.x + aim.fx * rig.lead,
    plane.y + 0.4,
    plane.z + aim.fz * rig.lead,
  );
  const buffet = plane.buffet || 0;
  rig.camera.position.x += Math.sin(plane.age * 47) * buffet * 0.12;
  rig.camera.position.y += Math.sin(plane.age * 61) * buffet * 0.08;
}

export function nudgeLook(rig, dx, dy) {
  rig.lookYaw = Math.max(-1.2, Math.min(1.2, rig.lookYaw - dx * 0.004));
  rig.lookPitch = Math.max(-0.8, Math.min(0.6, rig.lookPitch - dy * 0.003));
}

export function easeLook(rig, dt) {
  const keep = Math.exp(-dt * 0.7);
  rig.lookYaw *= keep;
  rig.lookPitch *= keep;
}
