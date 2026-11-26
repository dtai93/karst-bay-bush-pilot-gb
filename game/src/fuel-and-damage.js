import { AERO, clamp } from './config.js';

export function burnFuel(plane, dt) {
  const consumed = plane.throttle * AERO.fuelBurn * dt;
  plane.fuel = Math.max(0, plane.fuel - consumed);
  return plane.fuel > 0.008;
}

export function availablePower(plane, engineBonus = 0) {
  const fuelPower = plane.fuel > 0.008 ? 1 : 0;
  return plane.throttle * (1 - plane.damage * 0.42) * (1 + engineBonus) * fuelPower;
}

export function recordDamage(plane, amount) {
  plane.damage = clamp(plane.damage + amount, 0, 1);
  return plane.damage;
}
