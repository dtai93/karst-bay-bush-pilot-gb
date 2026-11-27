// Stilt houses, sail boats and the bay lighthouse.

import * as THREE from '../vendor/three.module.min.js';
import { LIGHTHOUSE, RESCUE_BOAT, VILLAGE, islandHeight } from './config.js';

function house(group, x, z, wood, roof) {
  const floor = islandHeight(x, z);
  const base = Math.max(floor, 0.4);
  for (const corner of [[-2.7, -2], [2.7, -2], [-2.7, 2], [2.7, 2]]) {
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.16, 5.6, 5), wood);
    pole.position.set(x + corner[0], base + 2.5, z + corner[1]);
    group.add(pole);
  }
  const deck = new THREE.Mesh(new THREE.BoxGeometry(7.6, 0.22, 5.6), wood);
  deck.position.set(x, base + 5.4, z);
  group.add(deck);
  const wall = new THREE.Mesh(new THREE.BoxGeometry(7, 3.2, 5.1), wood);
  wall.position.set(x, base + 7.1, z);
  group.add(wall);
  const cap = new THREE.Mesh(new THREE.ConeGeometry(6.2, 2.6, 4), roof);
  cap.position.set(x, base + 9.6, z);
  cap.rotation.y = Math.PI / 4;
  group.add(cap);
  const window = new THREE.Mesh(
    new THREE.BoxGeometry(1.15, 1.05, 0.08),
    new THREE.MeshBasicMaterial({ color: 0xffc56a }),
  );
  window.position.set(x, base + 7.2, z + 2.56);
  group.add(window);
}

function boat(group, x, z, hull, sail) {
  const body = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.7, 6.8), hull);
  body.position.set(x, 0.55, z);
  group.add(body);
  const mast = new THREE.Mesh(
    new THREE.CylinderGeometry(0.07, 0.07, 5.2, 5),
    new THREE.MeshStandardMaterial({ color: 0x6a5038, roughness: 0.7 }),
  );
  mast.position.set(x, 3.2, z);
  group.add(mast);
  const makeSail = (width, height) => {
    const shape = new THREE.Shape();
    shape.moveTo(0, -height * 0.5);
    shape.lineTo(width, height * 0.25);
    shape.lineTo(0, height * 0.5);
    shape.closePath();
    return new THREE.Mesh(new THREE.ShapeGeometry(shape), sail);
  };
  const mainsail = makeSail(1.7, 4);
  mainsail.position.set(x + 0.9, 3.5, z + 0.05);
  group.add(mainsail);
  const foresail = makeSail(-1.1, 2.4);
  foresail.position.set(x - 0.7, 2.9, z - 0.35);
  group.add(foresail);
}

export function createVillage() {
  const group = new THREE.Group();
  const wood = new THREE.MeshStandardMaterial({ color: 0xc48a48, roughness: 0.82 });
  const woodDark = new THREE.MeshStandardMaterial({ color: 0x8d5a30, roughness: 0.84 });
  const roof = new THREE.MeshStandardMaterial({ color: 0xb63c2b, roughness: 0.7 });
  const roofOrange = new THREE.MeshStandardMaterial({ color: 0xd46732, roughness: 0.72 });
  const roofGold = new THREE.MeshStandardMaterial({ color: 0xc6532f, roughness: 0.72 });
  const hull = new THREE.MeshStandardMaterial({ color: 0x6b3e28, roughness: 0.78 });
  const sail = new THREE.MeshStandardMaterial({ color: 0xfff7e8, roughness: 0.55, side: THREE.DoubleSide });

  const homes = [
    [0, 0, wood, roof],
    [14, 5, woodDark, roofOrange],
    [-12, 7, wood, roofGold],
    [7, -12, woodDark, roof],
    [-5, 16, wood, roofOrange],
    [26, -8, woodDark, roofGold],
    [-24, -12, wood, roof],
    [20, 20, woodDark, roofOrange],
    [-20, 22, wood, roofGold],
  ];
  for (let i = 0; i < homes.length; i += 1) {
    const home = homes[i];
    house(group, VILLAGE.x + home[0], VILLAGE.z + home[1], home[2], home[3]);
  }

  const jetty = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.2, 14), woodDark);
  const jettyBase = Math.max(islandHeight(VILLAGE.x + 8, VILLAGE.z + 10), 0.3);
  jetty.position.set(VILLAGE.x + 8, jettyBase + 0.4, VILLAGE.z + 12);
  group.add(jetty);

  boat(group, VILLAGE.x + 16, VILLAGE.z + 18, hull, sail);
  boat(group, VILLAGE.x + 22, VILLAGE.z + 6, hull, sail);
  boat(group, VILLAGE.x - 18, VILLAGE.z + 22, hull, sail);
  boat(group, RESCUE_BOAT.x, RESCUE_BOAT.z, hull, new THREE.MeshStandardMaterial({ color: 0xf17b42, roughness: 0.6 }));
  const flare = new THREE.Mesh(
    new THREE.SphereGeometry(1.2, 8, 6),
    new THREE.MeshBasicMaterial({ color: 0xff6138 }),
  );
  flare.position.set(RESCUE_BOAT.x, 8, RESCUE_BOAT.z);
  group.add(flare);
  const beam = new THREE.Mesh(
    new THREE.ConeGeometry(7, 42, 8, 1, true),
    new THREE.MeshBasicMaterial({ color: 0xff8a55, transparent: true, opacity: 0.2, side: THREE.DoubleSide }),
  );
  beam.position.set(RESCUE_BOAT.x, 25, RESCUE_BOAT.z);
  group.add(beam);

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
