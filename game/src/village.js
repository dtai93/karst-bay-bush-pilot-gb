// Stilt houses, sail boats and the bay lighthouse.

import * as THREE from '../vendor/three.module.min.js';
import { LIGHTHOUSE, VILLAGE, islandHeight } from './config.js';

function house(group, x, z, wood, roof, warm) {
  const floor = islandHeight(x, z);
  const base = Math.max(floor, 0.4);
  for (const corner of [[-1.6, -1.2], [1.6, -1.2], [-1.6, 1.2], [1.6, 1.2]]) {
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 3.4, 5), wood);
    pole.position.set(x + corner[0], base + 1.5, z + corner[1]);
    group.add(pole);
  }
  const deck = new THREE.Mesh(new THREE.BoxGeometry(4.6, 0.18, 3.4), wood);
  deck.position.set(x, base + 3.3, z);
  group.add(deck);
  const wall = new THREE.Mesh(new THREE.BoxGeometry(4.2, 2.1, 3.1), wood);
  wall.position.set(x, base + 4.4, z);
  group.add(wall);
  const cap = new THREE.Mesh(new THREE.ConeGeometry(3.3, 1.5, 4), roof);
  cap.position.set(x, base + 6.1, z);
  cap.rotation.y = Math.PI / 4;
  group.add(cap);
  const window = new THREE.Mesh(
    new THREE.BoxGeometry(0.7, 0.7, 0.08),
    new THREE.MeshBasicMaterial({ color: 0xffc56a }),
  );
  window.position.set(x, base + 4.5, z + 1.56);
  group.add(window);
  warm.position && null;
}

function boat(group, x, z, hull, sail) {
  const body = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.45, 4.2), hull);
  body.position.set(x, 0.45, z);
  group.add(body);
  const mast = new THREE.Mesh(
    new THREE.CylinderGeometry(0.05, 0.05, 3.2, 5),
    new THREE.MeshStandardMaterial({ color: 0x6a5038, roughness: 0.7 }),
  );
  mast.position.set(x, 2.1, z);
  group.add(mast);
  const cloth = new THREE.Mesh(new THREE.ConeGeometry(0.9, 2.6, 4), sail);
  cloth.position.set(x + 0.35, 2.3, z + 0.2);
  cloth.scale.set(0.35, 1, 1);
  group.add(cloth);
}

export function createVillage() {
  const group = new THREE.Group();
  const wood = new THREE.MeshStandardMaterial({ color: 0xc48a48, roughness: 0.82 });
  const woodDark = new THREE.MeshStandardMaterial({ color: 0x8d5a30, roughness: 0.84 });
  const roof = new THREE.MeshStandardMaterial({ color: 0xa33b32, roughness: 0.7 });
  const roof2 = new THREE.MeshStandardMaterial({ color: 0x3d5c6e, roughness: 0.7 });
  const hull = new THREE.MeshStandardMaterial({ color: 0x6b3e28, roughness: 0.78 });
  const sail = new THREE.MeshStandardMaterial({ color: 0xf3ead6, roughness: 0.55 });

  const homes = [
    [0, 0, wood, roof],
    [7.5, 2.5, woodDark, roof2],
    [-6.5, 3, wood, roof],
    [3, -6, woodDark, roof],
    [-2, 8, wood, roof2],
  ];
  for (let i = 0; i < homes.length; i += 1) {
    const home = homes[i];
    house(group, VILLAGE.x + home[0], VILLAGE.z + home[1], home[2], home[3], {});
  }

  const jetty = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.2, 14), woodDark);
  const jettyBase = Math.max(islandHeight(VILLAGE.x + 8, VILLAGE.z + 10), 0.3);
  jetty.position.set(VILLAGE.x + 8, jettyBase + 0.4, VILLAGE.z + 12);
  group.add(jetty);

  boat(group, VILLAGE.x + 16, VILLAGE.z + 18, hull, sail);
  boat(group, VILLAGE.x + 22, VILLAGE.z + 6, hull, sail);
  boat(group, VILLAGE.x - 18, VILLAGE.z + 22, hull, sail);

  const base = islandHeight(LIGHTHOUSE.x, LIGHTHOUSE.z);
  const white = new THREE.MeshStandardMaterial({ color: 0xf4f0e6, roughness: 0.45 });
  const red = new THREE.MeshStandardMaterial({ color: 0xc4372d, roughness: 0.5 });
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(2.1, 2.5, 18, 10), white);
  shaft.position.set(LIGHTHOUSE.x, base + 9, LIGHTHOUSE.z);
  group.add(shaft);
  const band = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.2, 2.2, 10), red);
  band.position.set(LIGHTHOUSE.x, base + 14, LIGHTHOUSE.z);
  group.add(band);
  const lamp = new THREE.Mesh(
    new THREE.CylinderGeometry(1.5, 1.5, 2.4, 8),
    new THREE.MeshBasicMaterial({ color: 0xffe7a0 }),
  );
  lamp.position.set(LIGHTHOUSE.x, base + 19.2, LIGHTHOUSE.z);
  group.add(lamp);
  const cap = new THREE.Mesh(new THREE.ConeGeometry(1.9, 2.2, 8), red);
  cap.position.set(LIGHTHOUSE.x, base + 21.4, LIGHTHOUSE.z);
  group.add(cap);

  return group;
}
