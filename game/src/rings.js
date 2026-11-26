// Glowing course rings. Flying through the active one advances the leg.

import * as THREE from '../vendor/three.module.min.js';

function makeRing(point) {
  const group = new THREE.Group();
  const gold = new THREE.MeshBasicMaterial({ color: 0xffe14a });
  const glow = new THREE.MeshBasicMaterial({
    color: 0xff9a1a,
    transparent: true,
    opacity: 0.38,
  });
  const done = new THREE.MeshBasicMaterial({ color: 0x7dffa8 });
  const band = new THREE.Mesh(new THREE.TorusGeometry(22, 1.15, 8, 28), gold);
  const halo = new THREE.Mesh(new THREE.TorusGeometry(22, 2.4, 8, 20), glow);
  group.add(band);
  group.add(halo);
  group.position.set(point.x, point.y, point.z);
  const dx = point.aimX ?? 0;
  const dz = point.aimZ ?? -1;
  group.rotation.y = Math.atan2(dx, -dz);
  return { group, band, halo, gold, glow, done, taken: false, x: point.x, y: point.y, z: point.z, radius: 22 };
}

export function createRings(points) {
  const root = new THREE.Group();
  const list = [];
  for (let i = 0; i < points.length; i += 1) {
    const next = points[i + 1] ?? { x: points[i].x, z: points[i].z - 80 };
    const ring = makeRing({
      x: points[i].x,
      y: points[i].y,
      z: points[i].z,
      aimX: next.x - points[i].x,
      aimZ: next.z - points[i].z,
    });
    root.add(ring.group);
    list.push(ring);
  }
  return { root, list, index: 0 };
}

export function updateRings(rings, time) {
  for (let i = 0; i < rings.list.length; i += 1) {
    const ring = rings.list[i];
    const active = i === rings.index && !ring.taken;
    const pulse = active ? 1 + Math.sin(time * 3.5) * 0.045 : 1;
    ring.group.scale.setScalar(ring.taken ? 0.82 : pulse);
    ring.band.material = ring.taken ? ring.done : ring.gold;
    ring.halo.material = ring.glow;
    ring.halo.material.opacity = ring.taken ? 0.12 : active ? 0.45 : 0.22;
  }
}

export function collectRing(rings, plane) {
  const ring = rings.list[rings.index];
  if (!ring || ring.taken) return false;
  const dx = plane.x - ring.x;
  const dy = plane.y - ring.y;
  const dz = plane.z - ring.z;
  if (dx * dx + dy * dy + dz * dz > ring.radius * ring.radius) return false;
  ring.taken = true;
  rings.index += 1;
  return true;
}
