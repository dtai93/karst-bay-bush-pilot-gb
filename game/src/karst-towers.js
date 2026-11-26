// Sculpted limestone columns and their jungle crowns.

import * as THREE from '../vendor/three.module.min.js';
import { TOWERS, towerRadiusAt } from './config.js';

function hash(a, b, seed) {
  const n = Math.sin(a * 127.1 + b * 311.7 + seed * 74.7) * 43758.5453;
  return n - Math.floor(n);
}

function towerGeometry(tower, index) {
  const radial = 18;
  const rows = 24;
  const positions = [];
  const colors = [];
  const indices = [];
  for (let row = 0; row <= rows; row += 1) {
    const u = row / rows;
    const y = u * tower.h;
    for (let side = 0; side < radial; side += 1) {
      const angle = side / radial * Math.PI * 2;
      const radius = towerRadiusAt(tower, y, angle);
      const x = Math.cos(angle) * radius + tower.leanX * u;
      const z = Math.sin(angle) * radius + tower.leanZ * u;
      positions.push(x, y, z);
      const streak = Math.sin(angle * 4 + index * 2.7 + hash(side, row, index) * 1.4);
      const wet = u < 0.12 ? 0.58 : 1;
      const shade = Math.max(0.55, Math.min(1.05, 0.82 + streak * 0.13 + (hash(side, row, index + 9) - 0.5) * 0.16)) * wet;
      colors.push(0.83 * shade, 0.79 * shade, 0.68 * shade);
    }
  }
  for (let row = 0; row < rows; row += 1) {
    for (let side = 0; side < radial; side += 1) {
      const a = row * radial + side;
      const b = row * radial + (side + 1) % radial;
      const c = (row + 1) * radial + side;
      const d = (row + 1) * radial + (side + 1) % radial;
      indices.push(a, c, b, b, c, d);
    }
  }
  const top = positions.length / 3;
  positions.push(tower.leanX, tower.h, tower.leanZ);
  colors.push(0.62, 0.59, 0.49);
  const firstTop = rows * radial;
  for (let side = 0; side < radial; side += 1) {
    indices.push(firstTop + side, top, firstTop + (side + 1) % radial);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

function addCrown(group, tower, index, foliage, ledge) {
  const count = 9 + index % 5;
  for (let tree = 0; tree < count; tree += 1) {
    const angle = tree / count * Math.PI * 2 + index;
    const radius = tower.r * (0.18 + hash(tree, 2, index) * 0.42);
    const size = tower.r * (0.16 + hash(tree, 4, index) * 0.12);
    const crown = new THREE.Mesh(new THREE.IcosahedronGeometry(size, 0), tree % 3 ? foliage : ledge);
    crown.position.set(
      tower.x + tower.leanX + Math.cos(angle) * radius,
      tower.h + size * (0.45 + hash(tree, 8, index) * 0.35),
      tower.z + tower.leanZ + Math.sin(angle) * radius,
    );
    crown.scale.y = 0.72 + hash(tree, 6, index) * 0.45;
    group.add(crown);
  }
  if (index % 2 === 0) {
    for (let ledgeIndex = 0; ledgeIndex < 2; ledgeIndex += 1) {
      const u = 0.38 + ledgeIndex * 0.21 + hash(index, ledgeIndex, 12) * 0.08;
      const angle = hash(index, ledgeIndex, 24) * Math.PI * 2;
      const y = tower.h * u;
      const radius = towerRadiusAt(tower, y, angle);
      const patch = new THREE.Mesh(new THREE.IcosahedronGeometry(tower.r * 0.18, 0), ledge);
      patch.position.set(
        tower.x + tower.leanX * u + Math.cos(angle) * radius,
        y + 1,
        tower.z + tower.leanZ * u + Math.sin(angle) * radius,
      );
      patch.scale.set(1.35, 0.35, 1.1);
      group.add(patch);
    }
  }
}

export function createKarstTowers() {
  const group = new THREE.Group();
  const limestone = new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 0.96 });
  const foliage = new THREE.MeshStandardMaterial({ color: 0x28583a, flatShading: true, roughness: 0.92 });
  const ledge = new THREE.MeshStandardMaterial({ color: 0x49713d, flatShading: true, roughness: 0.9 });
  for (let i = 0; i < TOWERS.length; i += 1) {
    const tower = TOWERS[i];
    const cliff = new THREE.Mesh(towerGeometry(tower, i), limestone);
    cliff.position.set(tower.x, 0, tower.z);
    group.add(cliff);
    addCrown(group, tower, i, foliage, ledge);
  }
  return group;
}
