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

function puff(x, y, z, scale) {
  const group = new THREE.Group();
  const material = new THREE.MeshBasicMaterial({ color: 0xfff6e6, transparent: true, opacity: 0.9 });
  const seeds = [[0, 0, 0, 1], [0.7, 0.1, 0.2, 0.75], [-0.65, 0.05, 0.15, 0.7], [0.2, 0.25, -0.2, 0.55]];
  for (let i = 0; i < seeds.length; i += 1) {
    const ball = new THREE.Mesh(new THREE.SphereGeometry(18, 8, 6), material);
    ball.position.set(seeds[i][0] * 40, seeds[i][1] * 20, seeds[i][2] * 30);
    ball.scale.setScalar(seeds[i][3]);
    group.add(ball);
  }
  group.position.set(x, y, z);
  group.scale.set(scale, scale * 0.45, scale);
  return group;
}

export function createSky(scene) {
  scene.background = new THREE.Color(FOG);
  scene.fog = new THREE.Fog(FOG, 420, 2800);
  scene.add(skyDome());

  const sun = new THREE.DirectionalLight(0xffd4a6, 2.35);
  sun.position.set(-180, 140, 90);
  scene.add(sun);
  scene.add(new THREE.HemisphereLight(0xffe4c0, 0x4e6a40, 0.72));
  scene.add(new THREE.AmbientLight(0xfff0dc, 0.28));

  const sunDir = new THREE.Vector3(-0.74, 0.52, 0.32).normalize().multiplyScalar(5200);
  const disc = new THREE.Mesh(
    new THREE.CircleGeometry(210, 24),
    new THREE.MeshBasicMaterial({ color: 0xfff4cc, fog: false, depthWrite: false }),
  );
  disc.position.copy(sunDir);
  disc.lookAt(0, 0, 0);
  scene.add(disc);
  const halo = new THREE.Mesh(
    new THREE.CircleGeometry(420, 24),
    new THREE.MeshBasicMaterial({ color: 0xffc98a, transparent: true, opacity: 0.35, fog: false, depthWrite: false }),
  );
  halo.position.copy(sunDir);
  halo.lookAt(0, 0, 0);
  scene.add(halo);

  const clouds = new THREE.Group();
  clouds.add(puff(-280, 340, -520, 2.4));
  clouds.add(puff(460, 390, -180, 2.1));
  clouds.add(puff(-720, 420, 380, 2.8));
  clouds.add(puff(180, 460, -1400, 3.2));
  clouds.add(puff(980, 360, 220, 2.2));
  clouds.add(puff(-80, 300, 820, 1.8));
  clouds.add(puff(240, 480, 1400, 2.6));
  scene.add(clouds);
  return { clouds };
}
