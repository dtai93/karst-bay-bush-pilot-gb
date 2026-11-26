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
  if (height < 0.9) return [0.89, 0.79, 0.56];
  if (height < 2.2) return [0.55, 0.67, 0.4];
  if (fieldAt(x, z)) return [0.42, 0.4, 0.36];
  if (slope > 8) return [0.63, 0.56, 0.48];
  if (terrace < 360 && height > 8) {
    const band = Math.floor(height / 3.4) % 2;
    return band ? [0.39, 0.59, 0.27] : [0.69, 0.67, 0.37];
  }
  if (height > 20) return [0.17, 0.37, 0.2];
  if (height > 8) return [0.25, 0.49, 0.23];
  return [0.31, 0.53, 0.25];
}

function buildLand() {
  const segments = 106;
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
    flatShading: true,
    roughness: 0.96,
    metalness: 0,
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.receiveShadow = false;
  return mesh;
}

function noise(a, b, seed) {
  const value = Math.sin(a * 127.1 + b * 311.7 + seed * 74.7) * 43758.5453;
  return value - Math.floor(value);
}

function buildVegetation() {
  const treeLimit = 720;
  const trunk = new THREE.InstancedMesh(
    new THREE.CylinderGeometry(0.2, 0.42, 7, 5),
    new THREE.MeshStandardMaterial({ color: 0x785437, roughness: 1 }),
    treeLimit,
  );
  const canopy = new THREE.InstancedMesh(
    new THREE.IcosahedronGeometry(4.2, 0),
    new THREE.MeshStandardMaterial({ color: 0xffffff, flatShading: true, roughness: 0.94 }),
    treeLimit * 3,
  );
  const dummy = new THREE.Object3D();
  const shade = new THREE.Color();
  let treeCount = 0;
  let canopyCount = 0;
  for (let attempt = 0; attempt < 8000 && treeCount < treeLimit; attempt += 1) {
    const x = (noise(attempt, 1, 17) - 0.5) * WORLD.size * 0.91;
    const z = (noise(attempt, 2, 41) - 0.5) * WORLD.size * 0.91;
    const ground = islandHeight(x, z);
    if (ground < 3 || fieldAt(x, z) || noise(attempt, 3, 61) < 0.48) continue;
    let towerClear = true;
    for (let i = 0; i < TOWERS.length; i += 1) {
      if (Math.hypot(x - TOWERS[i].x, z - TOWERS[i].z) < TOWERS[i].r * 1.65) {
        towerClear = false;
        break;
      }
    }
    if (!towerClear) continue;
    const size = 0.62 + noise(attempt, 4, 89) * 0.78;
    dummy.position.set(x, ground + 3.5, z);
    dummy.rotation.set(0, noise(attempt, 5, 23) * Math.PI * 2, 0);
    dummy.scale.set(size, size, size);
    dummy.updateMatrix();
    trunk.setMatrixAt(treeCount, dummy.matrix);
    const green = [0x2d5535, 0x3c683e, 0x587543][Math.floor(noise(attempt, 6, 53) * 3)];
    shade.setHex(green);
    for (let crown = 0; crown < 3; crown += 1) {
      const angle = crown / 3 * Math.PI * 2 + dummy.rotation.y;
      const offset = crown === 0 ? 0 : 2.5 * size;
      dummy.position.set(
        x + Math.cos(angle) * offset,
        ground + (8.2 + (crown === 0 ? 0.5 : 0)) * size,
        z + Math.sin(angle) * offset,
      );
      dummy.scale.setScalar(size * (crown === 0 ? 1 : 0.82));
      dummy.updateMatrix();
      canopy.setMatrixAt(canopyCount, dummy.matrix);
      canopy.setColorAt(canopyCount, shade);
      canopyCount += 1;
    }
    treeCount += 1;
  }
  trunk.count = treeCount;
  canopy.count = canopyCount;
  trunk.instanceMatrix.needsUpdate = true;
  canopy.instanceMatrix.needsUpdate = true;
  if (canopy.instanceColor) canopy.instanceColor.needsUpdate = true;
  const group = new THREE.Group();
  group.add(trunk, canopy);
  return group;
}

function buildDistantRidges() {
  const count = 42;
  const geometry = new THREE.ConeGeometry(1, 1, 5, 1);
  const material = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    flatShading: true,
    fog: false,
    transparent: true,
    opacity: 0.84,
    depthWrite: false,
  });
  const ridges = new THREE.InstancedMesh(geometry, material, count);
  const dummy = new THREE.Object3D();
  const shade = new THREE.Color();
  for (let i = 0; i < count; i += 1) {
    const angle = i / count * Math.PI * 2;
    const distance = 1740 + noise(i, 1, 101) * 260;
    const height = 130 + noise(i, 2, 103) * 190;
    const radius = 200 + noise(i, 3, 107) * 190;
    dummy.position.set(Math.cos(angle) * distance, height * 0.5 - 8, Math.sin(angle) * distance);
    dummy.rotation.set(0, noise(i, 4, 109) * Math.PI, 0);
    dummy.scale.set(radius, height, radius);
    dummy.updateMatrix();
    ridges.setMatrixAt(i, dummy.matrix);
    shade.setHex(noise(i, 5, 113) > 0.5 ? 0x747b98 : 0x85819d);
    ridges.setColorAt(i, shade);
  }
  return ridges;
}

export function createTerrain() {
  const group = new THREE.Group();
  group.add(buildLand());
  group.add(createKarstTowers());
  group.add(buildVegetation());
  group.add(buildDistantRidges());
  return group;
}
