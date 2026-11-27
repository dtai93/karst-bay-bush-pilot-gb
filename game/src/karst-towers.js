// Sculpted limestone columns and their jungle crowns.

import * as THREE from '../vendor/three.module.min.js';
import { TOWERS, towerRadiusAt } from './config.js';

function hash(a, b, seed) {
  const n = Math.sin(a * 127.1 + b * 311.7 + seed * 74.7) * 43758.5453;
  return n - Math.floor(n);
}

function towerGeometry(tower, index) {
  const radial = 12;
  const rows = 16;
  const positions = [];
  const colors = [];
  const indices = [];
  for (let row = 0; row <= rows; row += 1) {
    const u = row / rows;
    const y = u * tower.h;
    for (let side = 0; side < radial; side += 1) {
      const angle = side / radial * Math.PI * 2;
      const jag = 1 + 0.2 * Math.sin(angle * 3 + index * 1.4) + 0.08 * Math.sin(row * 1.6 + angle * 2);
      const cave = u > 0.2 && u < 0.46 && Math.cos(angle - index * 0.7) > 0.45;
      const radius = towerRadiusAt(tower, y, angle) * jag * (cave ? 0.46 : 1);
      const x = Math.cos(angle) * radius + tower.leanX * u;
      const z = Math.sin(angle) * radius + tower.leanZ * u;
      positions.push(x, y, z);
      const sun = 0.5 + 0.5 * Math.cos(angle - 0.9);
      const streak = 0.78 + 0.22 * Math.sin(angle * 6 + row * 0.7 + index);
      const wet = u < 0.08 ? 0.62 : 1;
      const shade = (0.48 + sun * 0.28) * streak * wet;
      if (cave) colors.push(0.05, 0.055, 0.05);
      else if (u > 0.88) colors.push(0.22 * shade, 0.36 * shade, 0.2 * shade);
      else {
        colors.push(
          (0.32 + 0.14 * sun) * shade,
          (0.36 + 0.1 * sun) * shade,
          (0.38 + 0.06 * sun) * shade,
        );
      }
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
  colors.push(0.28, 0.4, 0.24);
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
    const size = tower.r * (0.24 + hash(tree, 4, index) * 0.16);
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
  const limestone = new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 0.92 });
  const foliage = new THREE.MeshStandardMaterial({ color: 0x1c7a38, flatShading: true, roughness: 0.88 });
  const ledge = new THREE.MeshStandardMaterial({ color: 0x46a24a, flatShading: true, roughness: 0.86 });
  const caveMat = new THREE.MeshStandardMaterial({ color: 0x141210, roughness: 1, flatShading: true });
  for (let i = 0; i < TOWERS.length; i += 1) {
    const tower = TOWERS[i];
    const cliff = new THREE.Mesh(towerGeometry(tower, i), limestone);
    cliff.position.set(tower.x, 0, tower.z);
    group.add(cliff);
    addCrown(group, tower, i, foliage, ledge);
    const caveY = tower.h * (0.3 + hash(i, 3, 5) * 0.12);
    const angle = i * 0.85;
    const radius = towerRadiusAt(tower, caveY, angle) * 0.82;
    const mouth = new THREE.Mesh(new THREE.SphereGeometry(tower.r * 0.2, 7, 5), caveMat);
    mouth.scale.set(1.25, 0.7, 0.48);
    const u = caveY / tower.h;
    mouth.position.set(
      tower.x + tower.leanX * u + Math.cos(angle) * radius,
      caveY,
      tower.z + tower.leanZ * u + Math.sin(angle) * radius,
    );
    group.add(mouth);
  }
  return group;
}
