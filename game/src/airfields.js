// Three strips. Harbour Field is the lit asphalt runway with numbers and PAPI.

import * as THREE from '../vendor/three.module.min.js';
import { FIELDS } from './config.js';

function numberTexture(label) {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const pen = canvas.getContext('2d');
  pen.clearRect(0, 0, 256, 256);
  pen.fillStyle = '#f4f6f2';
  pen.font = '800 150px Arial, sans-serif';
  pen.textAlign = 'center';
  pen.textBaseline = 'middle';
  pen.fillText(label, 128, 136);
  const texture = new THREE.CanvasTexture(canvas);
  if (THREE.SRGBColorSpace) texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function paintedNumber(label) {
  const material = new THREE.MeshBasicMaterial({
    map: numberTexture(label),
    transparent: true,
    depthWrite: false,
  });
  return new THREE.Mesh(new THREE.PlaneGeometry(23, 28), material);
}

function lamp(color, emissive) {
  return new THREE.Mesh(
    new THREE.SphereGeometry(0.72, 8, 6),
    new THREE.MeshBasicMaterial({ color, toneMapped: false }),
  );
}

function buildStrip(field) {
  const group = new THREE.Group();
  const half = field.length * 0.5;
  const asphalt = field.surface === 'asphalt';
  const deck = new THREE.Mesh(
    new THREE.BoxGeometry(field.width, 0.22, field.length),
    new THREE.MeshStandardMaterial({
      color: asphalt ? 0x2c3134 : 0x3c7840,
      roughness: asphalt ? 0.84 : 0.95,
    }),
  );
  deck.position.y = 0.08;
  group.add(deck);

  const lineMat = new THREE.MeshBasicMaterial({ color: 0xf4f1ea });
  for (let z = -half + 36; z < half - 30; z += 32) {
    const dash = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.06, 15), lineMat);
    dash.position.set(0, 0.2, z);
    group.add(dash);
  }
  for (const side of [-1, 1]) {
    const edge = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.05, field.length - 16), lineMat);
    edge.position.set(side * (field.width * 0.5 - 1.2), 0.2, 0);
    group.add(edge);
  }

  if (asphalt) {
    const south = paintedNumber('36');
    south.rotation.x = -Math.PI / 2;
    south.position.set(0, 0.24, half - 42);
    group.add(south);
    const north = paintedNumber('18');
    north.rotation.x = -Math.PI / 2;
    north.rotation.z = Math.PI;
    north.position.set(0, 0.24, -half + 42);
    group.add(north);

    for (let i = -3; i <= 3; i += 1) {
      const bar = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.05, 20), lineMat);
      bar.position.set(i * 3.2, 0.22, half - 16);
      group.add(bar);
      const far = bar.clone();
      far.position.z = -half + 16;
      group.add(far);
    }

    for (let z = -half + 16; z <= half - 16; z += 40) {
      for (const side of [-1, 1]) {
        const glow = lamp(z % 80 === 0 ? 0xffc14a : 0xfff4d2);
        glow.position.set(side * (field.width * 0.5 + 3.2), 1.05, z);
        group.add(glow);
      }
    }
    const papiColors = [0xff2a2a, 0xff2a2a, 0xfff6ea, 0xfff6ea];
    for (let i = 0; i < 4; i += 1) {
      const papi = new THREE.Mesh(
        new THREE.BoxGeometry(2.1, 1, 1.8),
        new THREE.MeshBasicMaterial({ color: papiColors[i], toneMapped: false }),
      );
      papi.position.set(-field.width * 0.5 - 8, 1.1, half - 70 - i * 7);
      group.add(papi);
    }

    const shed = new THREE.Mesh(
      new THREE.BoxGeometry(16, 5.5, 11),
      new THREE.MeshStandardMaterial({ color: 0xe7d7bd, roughness: 0.75 }),
    );
    shed.position.set(field.width * 0.5 + 18, 2.8, half - 30);
    group.add(shed);
    const roof = new THREE.Mesh(
      new THREE.BoxGeometry(17.5, 0.5, 12.5),
      new THREE.MeshStandardMaterial({ color: 0xa33a30, roughness: 0.6 }),
    );
    roof.position.set(field.width * 0.5 + 18, 5.8, half - 30);
    group.add(roof);

    const pole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.12, 7, 6),
      new THREE.MeshStandardMaterial({ color: 0xded6c8, roughness: 0.5 }),
    );
    pole.position.set(-field.width * 0.5 - 14, 3.5, half - 24);
    group.add(pole);
    const sock = new THREE.Mesh(
      new THREE.ConeGeometry(0.7, 3.4, 8),
      new THREE.MeshStandardMaterial({ color: 0xe07020, roughness: 0.6 }),
    );
    sock.rotation.z = -Math.PI / 2;
    sock.position.set(-field.width * 0.5 - 11.2, 6.4, half - 24);
    group.add(sock);
  }

  group.position.set(field.x, field.elevation, field.z);
  group.rotation.y = field.heading;
  return group;
}

export function createAirfields() {
  const group = new THREE.Group();
  for (let i = 0; i < FIELDS.length; i += 1) group.add(buildStrip(FIELDS[i]));
  return group;
}
