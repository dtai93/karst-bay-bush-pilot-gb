// Crafted high-wing Kestrel K-2 airframe and animated controls.

import * as THREE from '../vendor/three.module.min.js';
import { LIVERY } from './config.js';

function mat(color, extra = {}) {
  return new THREE.MeshStandardMaterial({
    color, roughness: extra.roughness ?? 0.55, metalness: extra.metalness ?? 0.04,
    transparent: extra.opacity !== undefined, opacity: extra.opacity ?? 1,
    emissive: extra.emissive ?? 0x000000, emissiveIntensity: extra.emissiveIntensity ?? 1,
  });
}

function mesh(parent, geometry, material, position, rotation = [0, 0, 0]) {
  const item = new THREE.Mesh(geometry, material);
  item.position.set(...position);
  item.rotation.set(...rotation);
  parent.add(item);
  return item;
}

function paintRegistration() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 96;
  const c = canvas.getContext('2d');
  c.fillStyle = '#f5ead3'; c.fillRect(0, 0, 256, 96);
  c.fillStyle = '#b92d21'; c.fillRect(0, 0, 256, 10); c.fillRect(0, 86, 256, 10);
  c.fillStyle = '#252733'; c.font = 'bold 52px Arial'; c.textAlign = 'center'; c.textBaseline = 'middle';
  c.fillText('KW-07', 128, 50);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return new THREE.MeshStandardMaterial({ map: texture, roughness: 0.8, side: THREE.DoubleSide });
}

function wing(parent, span, chord, y, z, material) {
  const shape = new THREE.Shape();
  shape.moveTo(-span / 2, -chord * 0.34);
  shape.lineTo(-span / 2 + 0.55, -chord / 2);
  shape.lineTo(span / 2 - 0.55, -chord / 2);
  shape.lineTo(span / 2, -chord * 0.34);
  shape.lineTo(span / 2 - 0.25, chord / 2);
  shape.lineTo(-span / 2 + 0.25, chord / 2);
  shape.closePath();
  const geometry = new THREE.ExtrudeGeometry(shape, { depth: 0.17, bevelEnabled: true, bevelSegments: 1, steps: 1, bevelSize: 0.035, bevelThickness: 0.035 });
  const part = mesh(parent, geometry, material, [0, y - 0.085, z]);
  part.rotation.x = Math.PI / 2;
  part.geometry.computeVertexNormals();
  return part;
}

export function createAircraft() {
  const root = new THREE.Group();
  const cream = mat(LIVERY.cream, { roughness: 0.48 });
  const red = mat(LIVERY.red, { roughness: 0.42 });
  const darkRed = mat(LIVERY.redDeep);
  const metal = mat(LIVERY.metal, { metalness: 0.55, roughness: 0.3 });
  const rubber = mat(LIVERY.rubber, { roughness: 0.9 });
  const dark = mat(0x252b30, { roughness: 0.78 });
  const glass = mat(0x62a9bd, { roughness: 0.13, metalness: 0.15, opacity: 0.78 });

  const profile = [
    new THREE.Vector2(0.13, -3.25), new THREE.Vector2(0.43, -3.0),
    new THREE.Vector2(0.58, -2.35), new THREE.Vector2(0.62, -1.3),
    new THREE.Vector2(0.57, 0.1), new THREE.Vector2(0.43, 1.65),
    new THREE.Vector2(0.3, 2.85), new THREE.Vector2(0.18, 3.75),
    new THREE.Vector2(0.08, 4.12), new THREE.Vector2(0.015, 4.2),
  ];
  const body = mesh(root, new THREE.LatheGeometry(profile, 12), cream, [0, 0, 0], [Math.PI / 2, 0, 0]);
  body.material = cream;
  mesh(root, new THREE.CylinderGeometry(0.47, 0.36, 0.82, 12), red, [0, 0.02, -2.78], [Math.PI / 2, 0, 0]);
  mesh(root, new THREE.ConeGeometry(0.36, 0.58, 12), red, [0, 0.02, -3.45], [-Math.PI / 2, 0, 0]);
  mesh(root, new THREE.CylinderGeometry(0.16, 0.16, 0.08, 12), metal, [0, 0.02, -3.81], [Math.PI / 2, 0, 0]);
  mesh(root, new THREE.BoxGeometry(0.075, 0.17, 5.1), red, [0.51, 0.05, 0.08], [0, 0, 0.03]);
  mesh(root, new THREE.BoxGeometry(0.075, 0.17, 5.1), red, [-0.51, 0.05, 0.08], [0, 0, -0.03]);

  const wings = new THREE.Group();
  root.add(wings);
  wing(wings, 14.4, 2.05, 1.34, -0.12, cream);
  mesh(wings, new THREE.BoxGeometry(1.05, 0.045, 1.94), red, [-6.65, 1.36, -0.12]);
  mesh(wings, new THREE.BoxGeometry(1.05, 0.045, 1.94), red, [6.65, 1.36, -0.12]);
  mesh(wings, new THREE.BoxGeometry(13.45, 0.035, 0.14), darkRed, [0, 1.3, 0.65]);

  const ailerons = [];
  for (const side of [-1, 1]) {
    const ail = mesh(wings, new THREE.BoxGeometry(3.0, 0.08, 0.44), red, [side * 4.25, 1.25, 0.88]);
    ailerons.push({ item: ail, side });
    const strutGeo = new THREE.CylinderGeometry(0.045, 0.045, 1.8, 8);
    const v1 = mesh(root, strutGeo, darkRed, [side * 1.35, 0.63, -0.2], [0, 0, side * -0.2]);
    v1.scale.y = 1.05;
    const v2 = mesh(root, strutGeo, metal, [side * 1.65, 0.63, 0.62], [0, 0, side * 0.2]);
    v2.scale.y = 0.95;
    mesh(root, new THREE.CylinderGeometry(0.045, 0.055, 1.2, 8), metal, [side * 1.12, -0.74, 0.25], [0, 0, side * -0.14]);
    mesh(root, new THREE.CylinderGeometry(0.44, 0.44, 0.43, 16), rubber, [side * 1.22, -1.48, 0.25], [0, 0, Math.PI / 2]);
    mesh(root, new THREE.CylinderGeometry(0.18, 0.18, 0.46, 12), metal, [side * 1.22, -1.48, 0.25], [0, 0, Math.PI / 2]);
  }
  mesh(root, new THREE.BoxGeometry(0.13, 1.18, 0.82), red, [0, 0.88, 3.53]);
  wing(root, 4.1, 1.0, 0.42, 3.55, cream);
  const elevator = mesh(root, new THREE.BoxGeometry(1.75, 0.07, 0.33), red, [0, 0.38, 3.96]);
  const rudder = mesh(root, new THREE.BoxGeometry(0.09, 0.65, 0.55), darkRed, [0, 1.08, 3.68]);
  mesh(root, new THREE.PlaneGeometry(0.88, 0.32), paintRegistration(), [0.071, 1.05, 3.6], [0, Math.PI / 2, 0]);

  mesh(root, new THREE.BoxGeometry(1.0, 0.56, 1.0), glass, [0, 0.52, -1.18], [-0.22, 0, 0]);
  for (const side of [-1, 1]) {
    mesh(root, new THREE.BoxGeometry(0.045, 0.48, 1.0), glass, [side * 0.54, 0.48, -0.12], [0, 0, side * -0.06]);
    mesh(root, new THREE.BoxGeometry(0.05, 0.48, 0.66), glass, [side * 0.43, 0.46, 1.0], [0, side * -0.08, 0]);
  }
  mesh(root, new THREE.BoxGeometry(1.08, 0.07, 1.45), dark, [0, 0.82, -0.42]);
  mesh(root, new THREE.CylinderGeometry(0.04, 0.04, 0.72, 8), metal, [0, -0.12, 3.32]);
  mesh(root, new THREE.CylinderGeometry(0.16, 0.16, 0.34, 12), rubber, [0, -1.12, 3.75], [Math.PI / 2, 0, 0]);

  const glow = (color, x, y, z) => mesh(root, new THREE.SphereGeometry(0.095, 10, 8), mat(color, { emissive: color, emissiveIntensity: 1.8 }), [x, y, z]);
  glow(0xff3030, -7.15, 1.37, -0.1); glow(0x36ff75, 7.15, 1.37, -0.1); glow(0xffffff, 0, 1.4, 0.25);

  const prop = new THREE.Group();
  prop.position.set(0, 0.02, -3.66);
  root.add(prop);
  for (let i = 0; i < 2; i += 1) {
    const b = mesh(prop, new THREE.BoxGeometry(0.18, 2.75, 0.09), dark, [0, 0.69, 0]);
    b.rotation.z = i * Math.PI / 2;
  }
  const disc = mesh(prop, new THREE.CircleGeometry(1.34, 32), mat(0xd8edf0, { opacity: 0.12 }), [0, 0.02, 0.02], [0, 0, 0]);
  disc.material.side = THREE.DoubleSide;
  mesh(prop, new THREE.SphereGeometry(0.2, 12, 8), red, [0, 0, -0.08]);

  return { root, prop, wings, ailerons, elevator, rudder };
}

export function updateAircraft(craft, plane, dt) {
  craft.root.position.set(plane.x, plane.y, plane.z);
  craft.root.rotation.order = 'YXZ';
  craft.root.rotation.y = plane.yaw;
  craft.root.rotation.x = plane.pitch;
  craft.root.rotation.z = -(plane.roll + Math.sin(plane.age * 48) * 0.05 * plane.buffet);
  craft.prop.rotation.z += (16 + plane.rpm * 78) * dt;
  for (const control of craft.ailerons) control.item.rotation.z = control.side * plane.roll * 0.13;
  craft.elevator.rotation.x = -plane.pitch * 0.24;
  craft.rudder.rotation.y = Math.sin(plane.yaw) * 0.08;
}
