// Emerald bay. A broad plane with a painted ripple, nudged while time moves.

import * as THREE from '../vendor/three.module.min.js';
import { WORLD } from './config.js';

function rippleTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const pen = canvas.getContext('2d');
  pen.fillStyle = '#146e66';
  pen.fillRect(0, 0, 256, 256);
  pen.strokeStyle = 'rgba(210, 244, 214, 0.28)';
  pen.lineWidth = 2;
  for (let i = 0; i < 18; i += 1) {
    pen.beginPath();
    pen.ellipse(40 + (i * 37) % 220, 30 + (i * 53) % 200, 28 + (i % 4) * 8, 10, i * 0.4, 0, Math.PI * 2);
    pen.stroke();
  }
  pen.strokeStyle = 'rgba(255, 214, 150, 0.18)';
  for (let y = 8; y < 256; y += 22) {
    pen.beginPath();
    pen.moveTo(0, y);
    pen.bezierCurveTo(80, y - 6, 160, y + 6, 256, y);
    pen.stroke();
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(18, 18);
  if (THREE.SRGBColorSpace) texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export function createWater() {
  const texture = rippleTexture();
  const material = new THREE.MeshStandardMaterial({
    color: 0x1a8f84,
    map: texture,
    roughness: 0.22,
    metalness: 0.38,
    emissive: 0x0c3f3c,
    emissiveIntensity: 0.45,
  });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(9000, 9000), material);
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.y = WORLD.water;
  return { mesh, texture };
}

export function updateWater(water, time, frozen) {
  if (frozen) return;
  water.texture.offset.x = time * 0.008;
  water.texture.offset.y = time * 0.004;
}
