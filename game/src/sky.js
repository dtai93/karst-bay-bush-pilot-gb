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

function puffTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const brush = canvas.getContext('2d');
  brush.clearRect(0, 0, 256, 256);
  const glow = brush.createRadialGradient(128, 112, 8, 128, 136, 126);
  glow.addColorStop(0, 'rgba(255, 252, 247, 0.96)');
  glow.addColorStop(0.26, 'rgba(255, 228, 196, 0.70)');
  glow.addColorStop(0.52, 'rgba(255, 214, 186, 0.34)');
  glow.addColorStop(0.76, 'rgba(220, 210, 226, 0.12)');
  glow.addColorStop(1, 'rgba(220, 210, 226, 0)');
  brush.fillStyle = glow;
  brush.beginPath();
  brush.ellipse(128, 132, 118, 78, 0, 0, Math.PI * 2);
  brush.fill();
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function buildClouds() {
  const clouds = new THREE.Group();
  const map = puffTexture();
  const sunlit = new THREE.SpriteMaterial({
    map, color: 0xfff6ea, transparent: true, opacity: 0.9,
    depthWrite: false, fog: false,
  });
  const belly = new THREE.SpriteMaterial({
    map, color: 0xe7e0ea, transparent: true, opacity: 0.42,
    depthWrite: false, fog: false,
  });
  const places = [
    [-240, 230, -40, 0.28], [380, 260, -180, 0.34], [-80, 300, -640, 0.42],
    [-680, 640, -1680, 1], [420, 600, -2100, 1], [1100, 720, -980, 1],
    [-1500, 680, -420, 1], [240, 700, 1760, 1], [-360, 760, -860, 1],
  ];
  for (let cluster = 0; cluster < places.length; cluster += 1) {
    const [centerX, centerY, centerZ, scale] = places[cluster];
    const puffs = 4;
    for (let puff = 0; puff < puffs; puff += 1) {
      const warm = new THREE.Sprite(sunlit);
      const size = (70 + noise(cluster * 5 + puff, 4) * 90) * scale;
      warm.position.set(
        centerX + (noise(cluster * 3 + puff, 1) - 0.5) * 220,
        centerY + (noise(cluster * 3 + puff, 2) - 0.35) * 40,
        centerZ + (noise(cluster * 3 + puff, 3) - 0.5) * 160,
      );
      warm.scale.set(size * 1.7, size * 0.95, 1);
      clouds.add(warm);
      const under = new THREE.Sprite(belly);
      under.position.set(warm.position.x, warm.position.y - 28, warm.position.z);
      under.scale.set(size * 1.35, size * 0.55, 1);
      clouds.add(under);
    }
  }
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
