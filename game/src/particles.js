// Small pooled visual cues for weather, flight wash, touchdown, and impact.

import * as THREE from '../vendor/three.module.min.js';
import { heightAt } from './config.js';

export function createParticles(scene) {
  const root = new THREE.Group();
  scene.add(root);
  return { root, items: [], rain: [], seed: 1, clocks: { wash: 0, spray: 0, rain: 0 } };
}

function random(system) {
  system.seed = (system.seed * 1664525 + 1013904223) >>> 0;
  return system.seed / 4294967296;
}

function puff(system, position, color, size, life, velocity) {
  const material = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.6, depthWrite: false });
  const particle = new THREE.Mesh(new THREE.SphereGeometry(size, 6, 5), material);
  particle.position.copy(position);
  system.root.add(particle);
  system.items.push({ mesh: particle, life, maxLife: life, velocity: velocity.clone() });
}

export function emitAircraftEvent(system, type, plane) {
  const origin = new THREE.Vector3(plane.x, plane.y + 0.1, plane.z);
  if (type === 'touchdown') {
    for (let i = 0; i < 10; i += 1) puff(system, origin.clone().add(new THREE.Vector3((random(system) - 0.5) * 2, 0, (random(system) - 0.5) * 1.5)), 0xc5b7a0, 0.12, 0.8, new THREE.Vector3((random(system) - 0.5) * 1.2, 1 + random(system), 1));
  } else if (type === 'crash') {
    for (let i = 0; i < 28; i += 1) puff(system, origin, i % 3 ? 0x393631 : 0xff762e, 0.16 + random(system) * 0.16, 1.4 + random(system), new THREE.Vector3((random(system) - 0.5) * 5, random(system) * 4, (random(system) - 0.5) * 5));
  }
}

export function updateParticles(system, plane, weather, dt, frozen = false) {
  if (frozen) return;
  const step = Math.min(dt, 0.05);
  system.clocks.wash -= step;
  system.clocks.spray -= step;
  system.clocks.rain -= step;
  const speed = Math.hypot(plane.vx, plane.vy, plane.vz);
  if (!plane.crashed && speed > 26 && system.clocks.wash <= 0) {
    system.clocks.wash = 0.13;
    const wake = new THREE.Vector3(plane.x, plane.y, plane.z + 3.2);
    puff(system, wake, 0xd7d0bc, 0.08, 0.45, new THREE.Vector3(-plane.vx * 0.02, 0.1, -plane.vz * 0.02));
    if (Math.abs(plane.roll) > 0.55 && speed > 32) for (const side of [-1, 1]) {
      const p = new THREE.Vector3(plane.x + side * 6.7, plane.y + 1.3, plane.z);
      puff(system, p, 0xd9efff, 0.07, 0.55, new THREE.Vector3(-plane.vx * 0.025, 0.25, -plane.vz * 0.025));
    }
  }
  if (!plane.crashed && plane.y < heightAt(plane.x, plane.z) + 4 && system.clocks.spray <= 0) {
    system.clocks.spray = 0.09;
    puff(system, new THREE.Vector3(plane.x, plane.y - 0.5, plane.z), 0x9fe5e7, 0.12, 0.65, new THREE.Vector3(0, 0.5, 0));
  }
  if (weather && weather.rain > 0 && system.clocks.rain <= 0) {
    system.clocks.rain = 0.035;
    const streak = new THREE.Mesh(new THREE.BoxGeometry(0.018, 0.42, 0.018), new THREE.MeshBasicMaterial({ color: 0xc8e9f2, transparent: true, opacity: 0.38 }));
    streak.position.set(plane.x + (random(system) - 0.5) * 32, plane.y + 8 + random(system) * 12, plane.z + (random(system) - 0.5) * 32);
    system.root.add(streak);
    system.rain.push(streak);
  }
  for (let i = system.items.length - 1; i >= 0; i -= 1) {
    const item = system.items[i];
    item.life -= step;
    item.mesh.position.addScaledVector(item.velocity, step);
    item.mesh.scale.multiplyScalar(1 + step * 0.7);
    item.mesh.material.opacity = Math.max(0, item.life / item.maxLife * 0.6);
    if (item.life <= 0) {
      system.root.remove(item.mesh);
      item.mesh.geometry.dispose();
      item.mesh.material.dispose();
      system.items.splice(i, 1);
    }
  }
  for (let i = system.rain.length - 1; i >= 0; i -= 1) {
    const rain = system.rain[i];
    rain.position.y -= step * 45;
    if (rain.position.y < plane.y - 8) {
      system.root.remove(rain);
      rain.geometry.dispose();
      rain.material.dispose();
      system.rain.splice(i, 1);
    }
  }
}
