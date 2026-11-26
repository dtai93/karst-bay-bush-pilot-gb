// Karst bay ground: a coloured heightfield, plus the limestone towers.

import * as THREE from '../vendor/three.module.min.js';
import { FIELDS, TOWERS, WORLD, fieldAt, islandHeight } from './config.js';
import { createKarstTowers } from './karst-towers.js';

function visualHeight(x, z) {
  let h = islandHeight(x, z);
  for (let i = 0; i < FIELDS.length; i += 1) {
    const field = FIELDS[i];
    const dx = x - field.x;
    const dz = z - field.z;
    const c = Math.cos(field.heading);
    const s = Math.sin(field.heading);
    const along = dx * s + dz * c;
    const across = dx * c - dz * s;
    if (Math.abs(along) < field.length * 0.5 + 16 && Math.abs(across) < field.width * 0.5 + 20) {
      h = Math.max(h, field.elevation);
    }
  }
  for (let i = 0; i < TOWERS.length; i += 1) {
    const tower = TOWERS[i];
    const d = Math.hypot(x - tower.x, z - tower.z);
    const foot = tower.r * 1.7;
    if (d < foot) {
      const u = 1 - d / foot;
      h = Math.max(h, u * u * 7);
    }
  }
  return h;
}

function paintVertex(height, x, z, step) {
  const east = visualHeight(x + step, z);
  const north = visualHeight(x, z + step);
  const slope = Math.max(Math.abs(east - height), Math.abs(north - height));
  const terrace = Math.hypot(x + 760, z - 50);
  if (height < 0.2) return [0.05, 0.22, 0.24];
  if (height < 1.25) return [0.86, 0.78, 0.55];
  if (fieldAt(x, z)) return [0.42, 0.4, 0.36];
  if (slope > 7) return [0.62, 0.56, 0.48];
  if (terrace < 320 && height > 8) {
    const band = Math.floor(height / 3.4) % 2;
    return band ? [0.55, 0.72, 0.28] : [0.78, 0.68, 0.36];
  }
  if (height > 16) return [0.22, 0.42, 0.2];
  return [0.29, 0.58, 0.28];
}

function buildLand() {
  const segments = 148;
  const geometry = new THREE.PlaneGeometry(WORLD.size, WORLD.size, segments, segments);
  geometry.rotateX(-Math.PI / 2);
  const position = geometry.attributes.position;
  const step = WORLD.size / segments;
  const colors = new Float32Array(position.count * 3);
  for (let i = 0; i < position.count; i += 1) {
    const x = position.getX(i);
    const z = position.getZ(i);
    const h = visualHeight(x, z);
    position.setY(i, h < 0.12 ? -1.4 : h);
    const rgb = paintVertex(h, x, z, step);
    colors[i * 3] = rgb[0];
    colors[i * 3 + 1] = rgb[1];
    colors[i * 3 + 2] = rgb[2];
  }
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geometry.computeVertexNormals();
  const material = new THREE.MeshStandardMaterial({
    vertexColors: true,
    roughness: 0.96,
    metalness: 0,
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.receiveShadow = false;
  return mesh;
}

export function createTerrain() {
  const group = new THREE.Group();
  group.add(buildLand());
  group.add(createKarstTowers());
  return group;
}
