// The Kestrel K-2: high wing, struts, tundra tyres, red-and-cream, tail KW-07.

import * as THREE from '../vendor/three.module.min.js';
import { LIVERY } from './config.js';

function paint(color, extra) {
  const opts = extra ?? {};
  return new THREE.MeshStandardMaterial({
    color,
    roughness: opts.roughness ?? 0.58,
    metalness: opts.metalness ?? 0.05,
    emissive: opts.emissive ?? 0x000000,
    emissiveIntensity: opts.emissiveIntensity ?? 1,
    transparent: !!opts.transparent,
    opacity: opts.opacity ?? 1,
  });
}

function add(group, geometry, material, x, y, z, rx, ry, rz) {
  const piece = new THREE.Mesh(geometry, material);
  piece.position.set(x, y, z);
  if (rx || ry || rz) piece.rotation.set(rx ?? 0, ry ?? 0, rz ?? 0);
  piece.castShadow = false;
  piece.receiveShadow = false;
  group.add(piece);
  return piece;
}

function tailNumberTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 128;
  const pen = canvas.getContext('2d');
  pen.fillStyle = '#f6ecda';
  pen.fillRect(0, 0, 256, 128);
  pen.fillStyle = '#8d241c';
  pen.fillRect(0, 0, 256, 14);
  pen.fillRect(0, 114, 256, 14);
  pen.fillStyle = '#2c1410';
  pen.font = '700 62px Arial, sans-serif';
  pen.textAlign = 'center';
  pen.textBaseline = 'middle';
  pen.fillText('KW-07', 128, 66);
  const texture = new THREE.CanvasTexture(canvas);
  if (THREE.SRGBColorSpace) texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

function blade(material, radius) {
  const shape = new THREE.BoxGeometry(0.16, radius, 0.05);
  const piece = new THREE.Mesh(shape, material);
  piece.position.y = radius * 0.52;
  return piece;
}

export function createAircraft() {
  const root = new THREE.Group();
  const cream = paint(LIVERY.cream, { roughness: 0.62 });
  const red = paint(LIVERY.red, { roughness: 0.5 });
  const deep = paint(LIVERY.redDeep, { roughness: 0.55 });
  const rubber = paint(LIVERY.rubber, { roughness: 0.9 });
  const metal = paint(LIVERY.metal, { roughness: 0.35, metalness: 0.45 });
  const dark = paint(0x241810, { roughness: 0.8 });
  const glass = paint(LIVERY.glass, {
    roughness: 0.08,
    metalness: 0.15,
    transparent: true,
    opacity: 0.42,
  });

  add(root, new THREE.BoxGeometry(1.22, 1.38, 3.55), cream, 0, 0.12, 0.15);
  add(root, new THREE.BoxGeometry(1.05, 1.05, 2.15), cream, 0, 0.28, 2.35);
  add(root, new THREE.BoxGeometry(0.72, 0.62, 1.15), cream, 0, 0.42, 3.55);
  add(root, new THREE.BoxGeometry(1.18, 0.22, 3.3), deep, 0, -0.52, 0.2);

  const cowling = add(root, new THREE.CylinderGeometry(0.58, 0.66, 1.55, 14), red, 0, 0.02, -2.55, Math.PI / 2);
  cowling.rotation.x = Math.PI / 2;
  add(root, new THREE.BoxGeometry(0.92, 0.16, 0.7), cream, 0, 0.02, -2.15);

  add(root, new THREE.BoxGeometry(14.6, 0.16, 1.9), cream, 0, 1.28, -0.15);
  add(root, new THREE.BoxGeometry(1.15, 0.18, 1.95), red, -6.75, 1.28, -0.15);
  add(root, new THREE.BoxGeometry(1.15, 0.18, 1.95), red, 6.75, 1.28, -0.15);
  add(root, new THREE.BoxGeometry(14.2, 0.05, 0.22), deep, 0, 1.22, 0.55);

  const strut = new THREE.CylinderGeometry(0.045, 0.045, 1, 6);
  for (const side of [-1, 1]) {
    const front = add(root, strut, deep, side * 1.7, 0.45, -0.45);
    front.scale.set(1, 1.85, 1);
    front.rotation.z = side * 0.18;
    const rear = add(root, strut, deep, side * 1.7, 0.45, 0.45);
    rear.scale.set(1, 1.85, 1);
    rear.rotation.z = side * 0.18;
    add(root, new THREE.BoxGeometry(0.06, 0.06, 1.15), metal, side * 1.85, 0.15, 0);
  }

  add(root, new THREE.BoxGeometry(0.12, 1.55, 1.05), red, 0, 1.05, 3.85);
  add(root, new THREE.BoxGeometry(4.3, 0.09, 0.85), cream, 0, 0.42, 3.72);
  add(root, new THREE.BoxGeometry(1.3, 0.07, 0.28), red, -1.5, 0.42, 4.05);
  add(root, new THREE.BoxGeometry(1.3, 0.07, 0.28), red, 1.5, 0.42, 4.05);

  const numberMat = paint(0xffffff, { roughness: 0.7 });
  numberMat.map = tailNumberTexture();
  const plate = add(root, new THREE.BoxGeometry(0.05, 0.58, 1.05), numberMat, 0.1, 0.95, 3.72);
  plate.material = numberMat;

  add(root, new THREE.BoxGeometry(1.05, 0.72, 0.08), glass, 0, 0.48, -1.52);
  add(root, new THREE.BoxGeometry(0.06, 0.62, 1.35), glass, -0.62, 0.42, -0.35);
  add(root, new THREE.BoxGeometry(0.06, 0.62, 1.35), glass, 0.62, 0.42, -0.35);
  add(root, new THREE.BoxGeometry(1.15, 0.08, 1.4), dark, 0, 0.78, -0.45);
  add(root, new THREE.BoxGeometry(0.08, 0.55, 0.08), dark, -0.55, 0.4, -1.48);
  add(root, new THREE.BoxGeometry(0.08, 0.55, 0.08), dark, 0.55, 0.4, -1.48);

  const yoke = new THREE.Group();
  const column = add(yoke, new THREE.CylinderGeometry(0.045, 0.045, 0.55, 8), dark, 0, 0.15, 0);
  column.rotation.x = 0.5;
  add(yoke, new THREE.TorusGeometry(0.22, 0.035, 8, 16, Math.PI), dark, 0, 0.32, -0.12, Math.PI, 0, 0);
  yoke.position.set(0, -0.05, -0.85);
  root.add(yoke);

  for (const side of [-1, 1]) {
    const leg = add(root, new THREE.CylinderGeometry(0.05, 0.05, 1.15, 6), metal, side * 1.15, -0.85, 0.05);
    leg.rotation.z = side * -0.08;
    const tyre = add(root, new THREE.CylinderGeometry(0.46, 0.46, 0.4, 14), rubber, side * 1.28, -1.52, 0.1, 0, 0, Math.PI / 2);
    tyre.rotation.z = Math.PI / 2;
    add(root, new THREE.CylinderGeometry(0.18, 0.18, 0.44, 10), metal, side * 1.28, -1.52, 0.1, 0, 0, Math.PI / 2);
  }
  add(root, new THREE.CylinderGeometry(0.04, 0.04, 0.7, 5), metal, 0, -0.15, 3.55);
  add(root, new THREE.CylinderGeometry(0.16, 0.16, 0.14, 10), rubber, 0, -1.22, 3.72, Math.PI / 2);

  add(root, new THREE.CylinderGeometry(0.02, 0.02, 0.55, 4), metal, 0, 1.55, -0.2);
  add(root, new THREE.SphereGeometry(0.06, 8, 6), paint(0xffe08a, { emissive: 0xffb020, emissiveIntensity: 0.8 }), 0, 1.82, -0.2);

  const nav = (color, emissive, x) => add(
    root,
    new THREE.SphereGeometry(0.09, 8, 6),
    paint(color, { emissive, emissiveIntensity: 0.9 }),
    x,
    1.32,
    -0.15,
  );
  nav(0xff3030, 0xff2020, -7.25);
  nav(0x30ff68, 0x20ff60, 7.25);
  add(root, new THREE.SphereGeometry(0.08, 8, 6), paint(0xffffff, { emissive: 0xfff2d0, emissiveIntensity: 0.8 }), 0, 1.7, 4.15);

  const prop = new THREE.Group();
  prop.position.set(0, 0.02, -3.38);
  const bladeMat = paint(0x2a241c, { roughness: 0.45 });
  const ghostMat = paint(0x4a4034, { transparent: true, opacity: 0.28, roughness: 0.4 });
  for (let i = 0; i < 3; i += 1) {
    const arm = blade(bladeMat, 1.55);
    arm.rotation.z = (i * Math.PI * 2) / 3;
    prop.add(arm);
    const fade = blade(ghostMat, 1.48);
    fade.rotation.z = (i * Math.PI * 2) / 3 + 0.42;
    prop.add(fade);
  }
  add(prop, new THREE.ConeGeometry(0.2, 0.42, 10), red, 0, 0, -0.16, -Math.PI / 2);
  root.add(prop);

  return { root, prop };
}

export function updateAircraft(craft, plane, dt) {
  craft.root.position.set(plane.x, plane.y, plane.z);
  craft.root.rotation.order = 'YXZ';
  craft.root.rotation.y = plane.yaw;
  craft.root.rotation.x = plane.pitch;
  const shake = Math.sin(plane.age * 48) * 0.05 * plane.buffet;
  const rough = plane.damage > 0.2 ? Math.sin(plane.age * 90) * 0.012 * plane.damage : 0;
  craft.root.rotation.z = -(plane.roll + shake);
  const rate = plane.crashed ? 2 : 16 + plane.rpm * 78;
  craft.prop.rotation.z += (rate + rough * 40) * dt;
}
