// Chase camera sits behind and above the Kestrel. Cockpit sits at the pilot's eye.
// Mouse look offsets the chase view and eases back so it never fights the pilot.

import * as THREE from '../vendor/three.module.min.js';

export function createCameraRig(aspect) {
  const camera = new THREE.PerspectiveCamera(50, aspect, 0.25, 9000);
  return {
    camera,
    mode: 'chase',
    lookYaw: 0,
    lookPitch: 0,
    cx: 0,
    cy: 8,
    cz: 30,
    ready: false,
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
    const eyeX = plane.x + aim.fx * 0.15;
    const eyeY = plane.y + 0.42;
    const eyeZ = plane.z + aim.fz * 0.15;
    rig.camera.position.set(eyeX, eyeY, eyeZ);
    rig.camera.up.set(
      aim.rx * Math.sin(plane.roll),
      Math.cos(plane.roll),
      aim.rz * Math.sin(plane.roll),
    );
    const reach = 90;
    rig.camera.lookAt(
      eyeX + aim.fx * reach,
      eyeY + Math.sin(plane.pitch) * reach + rig.lookPitch * 8,
      eyeZ + aim.fz * reach,
    );
    return;
  }

  const back = 32;
  const up = 10.5;
  const side = rig.lookYaw * 14;
  const desiredX = plane.x - aim.fx * back + aim.rx * side;
  const desiredY = plane.y + up + rig.lookPitch * 8;
  const desiredZ = plane.z - aim.fz * back + aim.rz * side;
  const blend = rig.ready ? 1 - Math.exp(-Math.max(dt, 0.016) * 3.2) : 1;
  rig.cx += (desiredX - rig.cx) * blend;
  rig.cy += (desiredY - rig.cy) * blend;
  rig.cz += (desiredZ - rig.cz) * blend;
  rig.ready = true;
  rig.camera.up.set(0, 1, 0);
  rig.camera.position.set(rig.cx, rig.cy, rig.cz);
  rig.camera.lookAt(
    plane.x + aim.fx * 14,
    plane.y + 2.4,
    plane.z + aim.fz * 14,
  );
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
