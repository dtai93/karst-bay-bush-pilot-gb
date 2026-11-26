// Golden-hour sky: dome, sun, a few soft clouds, and the bay fog.

import * as THREE from '../vendor/three.module.min.js';

export const FOG = 0xf0c27a;

function skyDome() {
  const radius = 6400;
  const geometry = new THREE.SphereGeometry(radius, 28, 18);
  const position = geometry.attributes.position;
  const colors = new Float32Array(position.count * 3);
  const zenith = new THREE.Color(0x3a5d92);
  const high = new THREE.Color(0x7f9cbc);
  const horizon = new THREE.Color(FOG);
  const under = new THREE.Color(0xd99058);
  const mix = new THREE.Color();
  for (let i = 0; i < position.count; i += 1) {
    const lift = position.getY(i) / radius;
    if (lift < 0) mix.copy(under);
    else if (lift < 0.22) mix.copy(horizon).lerp(high, lift / 0.22);
    else mix.copy(high).lerp(zenith, (lift - 0.22) / 0.78);
    colors[i * 3] = mix.r;
    colors[i * 3 + 1] = mix.g;
    colors[i * 3 + 2] = mix.b;
  }
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  const mesh = new THREE.Mesh(
    geometry,
    new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide, fog: false, depthWrite: false }),
  );
  mesh.renderOrder = -10;
  return mesh;
}

function noise(index, axis) {
  const value = Math.sin(index * 127.1 + axis * 311.7 + 74.7) * 43758.5453;
  return value - Math.floor(value);
}

function buildClouds() {
  const clouds = new THREE.InstancedMesh(
    new THREE.SphereGeometry(24, 8, 6),
    new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 1,
      flatShading: true,
      transparent: true,
      opacity: 0.88,
      depthWrite: false,
    }),
    132,
  );
  const dummy = new THREE.Object3D();
  const tint = new THREE.Color();
  let index = 0;
  for (let cluster = 0; cluster < 30; cluster += 1) {
    const forward = cluster < 18;
    const angle = forward
      ? -Math.PI / 2 + (cluster / 17 - 0.5) * 1.0
      : (cluster - 18) / 12 * Math.PI * 2 + noise(cluster, 1) * 0.16;
    const distance = forward
      ? 600 + noise(cluster, 2) * 900
      : 1000 + noise(cluster, 2) * 1900;
    const centerX = Math.cos(angle) * distance;
    const centerZ = Math.sin(angle) * distance;
    const centerY = forward
      ? 180 + noise(cluster, 3) * 160
      : 260 + noise(cluster, 3) * 220;
    const puffs = 3 + cluster % 2;
    for (let puff = 0; puff < puffs; puff += 1) {
      const side = (puff - (puffs - 1) * 0.5) * 42;
      const size = 0.75 + noise(cluster * 7 + puff, 4) * 1.15;
      dummy.position.set(
        centerX + Math.cos(angle + Math.PI / 2) * side + (noise(cluster * 9 + puff, 5) - 0.5) * 36,
        centerY + (noise(cluster * 11 + puff, 6) - 0.5) * 24,
        centerZ + Math.sin(angle + Math.PI / 2) * side,
      );
      dummy.rotation.set(0, angle, 0);
      dummy.scale.set(size * 1.55, size * 0.7, size);
      dummy.updateMatrix();
      clouds.setMatrixAt(index, dummy.matrix);
      tint.setHex(puff === 0 ? 0xffe6c6 : 0xfff5e4);
      clouds.setColorAt(index, tint);
      index += 1;
    }
  }
  clouds.count = index;
  clouds.instanceMatrix.needsUpdate = true;
  if (clouds.instanceColor) clouds.instanceColor.needsUpdate = true;
  return clouds;
}

export function createSky(scene) {
  scene.background = new THREE.Color(FOG);
  scene.fog = new THREE.Fog(FOG, 420, 2800);
  scene.add(skyDome());

  const sun = new THREE.DirectionalLight(0xffd4a6, 2.35);
  sun.position.set(120, 170, -500);
  scene.add(sun);
  scene.add(new THREE.HemisphereLight(0xffe4c0, 0x4e6a40, 0.72));
  scene.add(new THREE.AmbientLight(0xfff0dc, 0.28));

  const sunDir = new THREE.Vector3(0.22, 0.3, -0.93).normalize().multiplyScalar(5200);
  const disc = new THREE.Mesh(
    new THREE.CircleGeometry(105, 24),
    new THREE.MeshBasicMaterial({ color: 0xffbd68, fog: false, depthWrite: false }),
  );
  disc.position.copy(sunDir);
  disc.lookAt(0, 0, 0);
  scene.add(disc);
  const halo = new THREE.Mesh(
    new THREE.CircleGeometry(210, 24),
    new THREE.MeshBasicMaterial({ color: 0xffa45d, transparent: true, opacity: 0.1, fog: false, depthWrite: false }),
  );
  halo.position.copy(sunDir);
  halo.lookAt(0, 0, 0);
  scene.add(halo);

  const clouds = buildClouds();
  scene.add(clouds);
  return { clouds };
}
