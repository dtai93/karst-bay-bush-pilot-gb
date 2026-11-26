import { FIELDS } from './config.js';

export function gradeLanding(touch) {
  const field = FIELDS.find((item) => item.id === touch.fieldId);
  const dx = field ? touch.x - field.x : 0;
  const dz = field ? touch.z - field.z : 0;
  const offset = field ? Math.abs(dx * Math.cos(field.heading) - dz * Math.sin(field.heading)) : Infinity;
  const along = field ? Math.abs(dx * Math.sin(field.heading) + dz * Math.cos(field.heading)) : Infinity;
  const zonePenalty = field ? Math.max(0, along - field.length * 0.22) * 0.08 : 100;
  const score = Math.min(100, Math.max(0, Math.round(100 - touch.fpm * 0.045 - touch.bank * 38 - offset * 0.24 - zonePenalty)));
  const grade = score >= 88 ? 'A' : score >= 70 ? 'B' : score >= 45 ? 'C' : 'D';
  return { score, grade, fpm: Math.round(touch.fpm), offset: Math.round(offset), zone: Math.round(along) };
}
