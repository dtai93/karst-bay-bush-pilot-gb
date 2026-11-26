// Emerald bay, shallow shore shelves, tower foam, and a warm sun-glitter path.

import * as THREE from '../vendor/three.module.min.js';
import { TOWERS, WORLD, islandHeight } from './config.js';

const SHORE_DIRECTIONS = [
  [1, 0], [-1, 0], [0, 1], [0, -1],
  [0.707, 0.707], [-0.707, 0.707], [0.707, -0.707], [-0.707, -0.707],
];

function rippleTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const pen = canvas.getContext('2d');
  pen.fillStyle = '#b7cbc4';
  pen.fillRect(0, 0, canvas.width, canvas.height);
  pen.strokeStyle = 'rgba(230, 249, 226, 0.25)';
  pen.lineWidth = 2;
  for (let i = 0; i < 44; i += 1) {
    const x = (i * 137) % 512;
    const y = (i * 211) % 512;
    pen.beginPath();
    pen.ellipse(x, y, 22 + (i % 5) * 11, 5 + (i % 3) * 3, i * 0.31, 0, Math.PI * 2);
    pen.stroke();
  }
  pen.strokeStyle = 'rgba(255, 215, 154, 0.22)';
  pen.lineWidth = 1.4;
  for (let y = 12; y < 512; y += 24) {
    pen.beginPath();
    pen.moveTo(0, y);
    pen.bezierCurveTo(150, y - 9, 350, y + 9, 512, y);
    pen.stroke();
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(16, 16);
  if (THREE.SRGBColorSpace) texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function paintWater(geometry) {
  const position = geometry.attributes.position;
  const colors = new Float32Array(position.count * 3);
  const deep = new THREE.Color(0x0a555b);
  const teal = new THREE.Color(0x168078);
  const shallows = new THREE.Color(0x42c2ad);
  const color = new THREE.Color();
  const sampleDistances = [38, 88, 138];
  for (let i = 0; i < position.count; i += 1) {
    const x = position.getX(i);
    const z = position.getZ(i);
    let shore = 0;
    for (let sample = 0; sample < sampleDistances.length; sample += 1) {
      const distance = sampleDistances[sample];
      for (let direction = 0; direction < SHORE_DIRECTIONS.length; direction += 1) {
        const offset = SHORE_DIRECTIONS[direction];
        if (islandHeight(x + offset[0] * distance, z + offset[1] * distance) > 0.25) {
          shore = Math.max(shore, [0.96, 0.72, 0.46][sample]);
          break;
        }
      }
    }
    for (let towerIndex = 0; towerIndex < TOWERS.length; towerIndex += 1) {
      const tower = TOWERS[towerIndex];
      const distance = Math.hypot(x - tower.x, z - tower.z);
      if (distance < tower.r * 2.1) {
        shore = Math.max(shore, 0.52 + (1 - distance / (tower.r * 2.1)) * 0.3);
      }
    }
    const bayTint = Math.min(0.35, Math.hypot(x, z) / 8000);
    color.copy(deep).lerp(teal, bayTint).lerp(shallows, shore);
    colors[i * 3] = color.r;
    colors[i * 3 + 1] = color.g;
    colors[i * 3 + 2] = color.b;
  }
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
}

function foamRings() {
  const aquatic = TOWERS.filter((tower) => islandHeight(tower.x, tower.z) < 1.2);
  const mesh = new THREE.InstancedMesh(
    new THREE.TorusGeometry(1, 0.028, 3, 32),
    new THREE.MeshBasicMaterial({ color: 0xd7f1d7, transparent: true, opacity: 0.58, depthWrite: false }),
    aquatic.length,
  );
  const dummy = new THREE.Object3D();
  for (let i = 0; i < aquatic.length; i += 1) {
    const tower = aquatic[i];
    dummy.position.set(tower.x, WORLD.water + 0.12, tower.z);
    dummy.rotation.x = Math.PI / 2;
    const radius = tower.r * 1.14;
    dummy.scale.set(radius, radius, 1);
    dummy.updateMatrix();
    mesh.setMatrixAt(i, dummy.matrix);
  }
  mesh.instanceMatrix.needsUpdate = true;
  return mesh;
}

function sunGlitter() {
  const direction = new THREE.Vector2(-0.74, 0.32).normalize();
  const across = new THREE.Vector2(-direction.y, direction.x);
  const geometry = new THREE.PlaneGeometry(1, 1);
  geometry.rotateX(-Math.PI / 2);
  const mesh = new THREE.InstancedMesh(
    geometry,
    new THREE.MeshBasicMaterial({ color: 0xffd28a, transparent: true, opacity: 0.22, depthWrite: false }),
    64,
  );
  const dummy = new THREE.Object3D();
  const heading = Math.atan2(-direction.y, direction.x);
  for (let i = 0; i < 64; i += 1) {
    const along = (i - 31.5) * 31;
    const side = Math.sin(i * 12.9898) * 54;
    const length = 10 + (i % 5) * 5;
    const width = 2 + (i % 3) * 1.3;
    dummy.position.set(
      direction.x * along + across.x * side,
      WORLD.water + 0.16,
      direction.y * along + across.y * side,
    );
    dummy.rotation.set(0, heading, 0);
    dummy.scale.set(length, width, 1);
    dummy.updateMatrix();
    mesh.setMatrixAt(i, dummy.matrix);
  }
  mesh.instanceMatrix.needsUpdate = true;
  return mesh;
}

export function createWater() {
  const texture = rippleTexture();
  const geometry = new THREE.PlaneGeometry(9000, 9000, 180, 180);
  geometry.rotateX(-Math.PI / 2);
  paintWater(geometry);
  const material = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    vertexColors: true,
    map: texture,
    bumpMap: texture,
    bumpScale: 0.32,
    roughness: 0.3,
    metalness: 0.22,
    emissive: 0x0b3532,
    emissiveIntensity: 0.2,
  });
  const surface = new THREE.Mesh(geometry, material);
  surface.position.y = WORLD.water;
  const group = new THREE.Group();
  group.add(surface, foamRings(), sunGlitter());
  return { mesh: group, texture };
}

export function updateWater(water, time, frozen) {
  if (frozen) return;
  water.texture.offset.x = time * 0.005;
  water.texture.offset.y = time * 0.0025;
}
