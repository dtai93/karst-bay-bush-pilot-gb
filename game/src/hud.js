// Lit flight deck overlay: tapes, horizon, fuel, damage, objective, minimap.

import { FIELDS, TOWERS, islandHeight, wrapPi } from './config.js';

function roundRect(ctx, x, y, w, h, r) {
  const radius = Math.min(r, w * 0.5, h * 0.5);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

function panel(ctx, x, y, w, h) {
  ctx.fillStyle = 'rgba(8, 12, 16, 0.8)';
  roundRect(ctx, x, y, w, h, 8);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 212, 138, 0.95)';
  ctx.lineWidth = 2;
  ctx.stroke();
}

function label(ctx, text, x, y, size, color, align) {
  ctx.fillStyle = color || '#fff6e4';
  ctx.font = `800 ${size}px Arial, sans-serif`;
  ctx.textAlign = align || 'left';
  ctx.textBaseline = 'middle';
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.65)';
  ctx.lineWidth = 4;
  ctx.strokeText(text, x, y);
  ctx.fillText(text, x, y);
}

function cardinal(deg) {
  const wrapped = ((deg % 360) + 360) % 360;
  if (wrapped === 0) return 'N';
  if (wrapped === 90) return 'E';
  if (wrapped === 180) return 'S';
  if (wrapped === 270) return 'W';
  return String(wrapped);
}

function headingRibbon(ctx, x, y, w, h, degrees) {
  panel(ctx, x, y, w, h);
  const mid = x + w * 0.5;
  const px = 3.6;
  ctx.save();
  ctx.beginPath();
  ctx.rect(x + 2, y + 2, w - 4, h - 4);
  ctx.clip();
  ctx.strokeStyle = '#ffe7b8';
  ctx.fillStyle = '#ffe7b8';
  ctx.lineWidth = 2;
  const start = Math.floor((degrees - 70) / 10) * 10;
  for (let mark = start; mark < degrees + 70; mark += 10) {
    const at = mid + (mark - degrees) * px;
    const major = ((mark % 360) + 360) % 360;
    const tall = major % 30 === 0;
    ctx.beginPath();
    ctx.moveTo(at, y + (tall ? 8 : 16));
    ctx.lineTo(at, y + 28);
    ctx.stroke();
    if (tall) {
      ctx.font = '700 16px Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(cardinal(major), at, y + 30);
    }
  }
  ctx.restore();
  ctx.fillStyle = 'rgba(8, 12, 16, 0.92)';
  roundRect(ctx, mid - 78, y + 6, 156, h - 12, 6);
  ctx.fill();
  const text = String(Math.round(degrees) % 360).padStart(3, '0');
  label(ctx, 'HDG', mid - 48, y + h * 0.5, 16, '#ffd48a', 'center');
  label(ctx, text, mid + 22, y + h * 0.5, 32, '#ffe14a', 'center');
  ctx.fillStyle = '#ffe14a';
  ctx.beginPath();
  ctx.moveTo(mid, y + h);
  ctx.lineTo(mid - 8, y + h + 8);
  ctx.lineTo(mid + 8, y + h + 8);
  ctx.fill();
}

function verticalTape(ctx, x, y, w, h, value, span, step, title, unit) {
  panel(ctx, x, y, w, h);
  const mid = y + h * 0.58;
  const scale = (h * 0.72) / span;
  ctx.save();
  ctx.beginPath();
  ctx.rect(x + 2, y + 28, w - 4, h - 34);
  ctx.clip();
  ctx.strokeStyle = '#fff1d4';
  ctx.fillStyle = '#fff1d4';
  ctx.lineWidth = 2;
  const start = Math.floor((value - span) / step) * step;
  for (let mark = start; mark <= value + span; mark += step) {
    const at = mid - (mark - value) * scale;
    if (at < y + 24 || at > y + h - 4) continue;
    ctx.beginPath();
    ctx.moveTo(x + w - 16, at);
    ctx.lineTo(x + w - 4, at);
    ctx.stroke();
    if (Math.round(mark) % (step * 2) === 0) {
      ctx.font = '700 15px Arial, sans-serif';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(Math.round(mark)), x + w - 20, at);
    }
  }
  ctx.restore();
  label(ctx, title, x + w * 0.5, y + 16, 18, '#ffd48a', 'center');
  ctx.fillStyle = 'rgba(6, 8, 10, 0.92)';
  roundRect(ctx, x + 6, mid - 22, w - 12, 44, 6);
  ctx.fill();
  label(ctx, String(Math.round(value)), x + w * 0.5, mid, 30, '#ffe14a', 'center');
  label(ctx, unit, x + w * 0.5, y + h - 16, 14, '#fff6e4', 'center');
}

function attitude(ctx, cx, cy, radius, pitch, roll) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.clip();
  ctx.translate(cx, cy);
  ctx.rotate(-roll);
  const offset = pitch * 160;
  ctx.fillStyle = '#3c8fd0';
  ctx.fillRect(-radius * 2, -radius * 3 + offset, radius * 4, radius * 3);
  ctx.fillStyle = '#c4783a';
  ctx.fillRect(-radius * 2, offset, radius * 4, radius * 3);
  ctx.strokeStyle = '#fff8ea';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-radius, offset);
  ctx.lineTo(radius, offset);
  ctx.stroke();
  ctx.restore();
  ctx.strokeStyle = '#ffd48a';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = '#ffe14a';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(cx - radius * 0.72, cy);
  ctx.lineTo(cx - 14, cy);
  ctx.moveTo(cx + 14, cy);
  ctx.lineTo(cx + radius * 0.72, cy);
  ctx.moveTo(cx - 14, cy);
  ctx.lineTo(cx - 14, cy + 8);
  ctx.moveTo(cx + 14, cy);
  ctx.lineTo(cx + 14, cy + 8);
  ctx.moveTo(cx, cy);
  ctx.lineTo(cx, cy + 12);
  ctx.stroke();
  label(ctx, 'AH', cx, cy + radius + 14, 14, '#ffd48a', 'center');
}

function meter(ctx, x, y, w, h, fraction, title, warn) {
  panel(ctx, x, y, w, h);
  const amount = Math.max(0, Math.min(1, fraction));
  label(ctx, title, x + 10, y + 16, 16, '#ffd48a', 'left');
  label(ctx, `${Math.round(amount * 100)}%`, x + w - 10, y + 16, 16, warn ? '#ff6a4a' : '#ffe14a', 'right');
  ctx.fillStyle = '#1a140e';
  roundRect(ctx, x + 10, y + 32, w - 20, 16, 4);
  ctx.fill();
  ctx.fillStyle = warn ? '#ff4d32' : '#ffb02e';
  roundRect(ctx, x + 10, y + 32, Math.max(4, (w - 20) * amount), 16, 4);
  ctx.fill();
}

function objectivePanel(ctx, x, y, w, h, objective) {
  panel(ctx, x, y, w, h);
  label(ctx, objective.title, x + 12, y + 24, 22, '#ffe14a', 'left');
  label(ctx, objective.line, x + 12, y + 54, 18, '#fff8ea', 'left');
  label(ctx, objective.timer, x + 12, y + 84, 26, '#fff8ea', 'left');
}

function waypoint(ctx, x, y, plane, ring) {
  if (!ring) return;
  const dx = ring.x - plane.x;
  const dz = ring.z - plane.z;
  const dist = Math.hypot(dx, dz);
  const bearing = Math.atan2(dx, -dz);
  const rel = wrapPi(bearing - plane.yaw);
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rel);
  ctx.fillStyle = '#ffe14a';
  ctx.beginPath();
  ctx.moveTo(0, -22);
  ctx.lineTo(12, 14);
  ctx.lineTo(0, 6);
  ctx.lineTo(-12, 14);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
  const text = dist >= 1000 ? `${(dist / 1000).toFixed(1)} KM` : `${Math.round(dist)} M`;
  label(ctx, `NEXT ${text}`, x, y + 36, 20, '#ffe14a', 'center');
}

function minimap(ctx, x, y, w, h, plane, rings) {
  panel(ctx, x, y, w, h);
  label(ctx, 'MAP', x + 10, y + 14, 14, '#ffd48a', 'left');
  const span = 1700;
  const toX = (wx) => x + 8 + ((wx - plane.x + span * 0.5) / span) * (w - 16);
  const toY = (wz) => y + h - 8 - ((wz - plane.z + span * 0.5) / span) * (h - 28);
  ctx.save();
  ctx.beginPath();
  ctx.rect(x + 6, y + 24, w - 12, h - 32);
  ctx.clip();
  ctx.fillStyle = '#135e58';
  ctx.fillRect(x + 6, y + 24, w - 12, h - 32);
  const cells = 26;
  for (let iz = 0; iz < cells; iz += 1) {
    for (let ix = 0; ix < cells; ix += 1) {
      const wx = plane.x - span * 0.5 + ((ix + 0.5) / cells) * span;
      const wz = plane.z - span * 0.5 + ((iz + 0.5) / cells) * span;
      const height = islandHeight(wx, wz);
      if (height < 0.35) continue;
      ctx.fillStyle = height > 14 ? '#7ea24a' : height < 1.3 ? '#e4d2a4' : '#2f8a40';
      const px = toX(wx);
      const py = toY(wz);
      ctx.fillRect(px, py, (w - 16) / cells + 1, (h - 28) / cells + 1);
    }
  }
  for (let i = 0; i < TOWERS.length; i += 1) {
    ctx.fillStyle = '#cbb892';
    ctx.beginPath();
    ctx.arc(toX(TOWERS[i].x), toY(TOWERS[i].z), 3.5, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.strokeStyle = '#f4f1ea';
  ctx.lineWidth = 2;
  for (let i = 0; i < FIELDS.length; i += 1) {
    const field = FIELDS[i];
    const c = Math.cos(field.heading);
    const s = Math.sin(field.heading);
    const half = field.length * 0.5;
    ctx.beginPath();
    ctx.moveTo(toX(field.x + s * half), toY(field.z + c * half));
    ctx.lineTo(toX(field.x - s * half), toY(field.z - c * half));
    ctx.stroke();
  }
  if (rings) {
    for (let i = 0; i < rings.list.length; i += 1) {
      const ring = rings.list[i];
      ctx.fillStyle = ring.taken ? '#7dffa8' : i === rings.index ? '#ffe14a' : '#c89030';
      ctx.beginPath();
      ctx.arc(toX(ring.x), toY(ring.z), i === rings.index ? 4.5 : 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.save();
  ctx.translate(toX(plane.x), toY(plane.z));
  ctx.rotate(plane.yaw);
  ctx.fillStyle = '#ff5a3c';
  ctx.beginPath();
  ctx.moveTo(0, -7);
  ctx.lineTo(5, 6);
  ctx.lineTo(-5, 6);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
  ctx.restore();
}

function keys(ctx, width, height) {
  const y = height - 28;
  ctx.fillStyle = 'rgba(8, 12, 16, 0.82)';
  ctx.fillRect(0, y, width, 28);
  label(
    ctx,
    'W/S PITCH   A/D ROLL   Q/E RUDDER   SHIFT/CTRL THR   F FLAPS   G BRAKE   C VIEW   P PAUSE',
    width * 0.5,
    y + 14,
    14,
    '#fff1d0',
    'center',
  );
}

export function drawHud(canvas, view) {
  const ctx = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;
  ctx.clearRect(0, 0, width, height);
  const sx = width / 1024;
  const sy = height / 640;
  ctx.save();
  ctx.scale(sx, sy);
  const plane = view.readout;
  const objective = view.objective;

  headingRibbon(ctx, 190, 8, 644, 58, plane.hdg);
  verticalTape(ctx, 14, 78, 112, 400, plane.kts, 80, 10, 'KTS', 'AIRSPEED');
  verticalTape(ctx, 898, 78, 112, 400, plane.altFt, 500, 50, 'ALT', 'FEET');
  objectivePanel(ctx, 140, 78, 330, 108, objective);
  attitude(ctx, 196, 360, 62, plane.pitch, plane.roll);

  panel(ctx, 276, 320, 120, 78);
  label(ctx, 'VS FPM', 292, 340, 15, '#ffd48a', 'left');
  const vs = Math.round(plane.vsFpm);
  const vsText = `${vs > 0 ? '+' : ''}${vs}`;
  label(ctx, vsText, 292, 372, 28, '#ffe14a', 'left');

  meter(ctx, 140, 470, 168, 58, plane.thr, 'THR', false);
  meter(ctx, 318, 470, 168, 58, plane.fuel, 'FUEL', plane.fuel < 0.22);
  meter(ctx, 496, 470, 168, 58, plane.dmg, 'DMG', plane.dmg > 0.45);

  panel(ctx, 140, 538, 150, 36);
  label(ctx, `FLAPS ${plane.flaps}`, 152, 556, 16, plane.flaps ? '#ffe14a' : '#fff6e4', 'left');
  panel(ctx, 298, 538, 110, 36);
  label(ctx, plane.brake ? 'BRAKE' : 'BRAKE', 312, 556, 16, plane.brake ? '#ff6a4a' : '#9aa098', 'left');

  const ring = view.rings && view.rings.list[view.rings.index];
  waypoint(ctx, 512, 168, plane, ring && !ring.taken ? ring : null);
  minimap(ctx, 690, 430, 196, 168, plane, view.rings);

  if (plane.buffet > 0.45 && !plane.crashed) {
    label(ctx, 'STALL', 512, 250, 42, '#ff4d32', 'center');
  }
  if (plane.crashed) {
    panel(ctx, 300, 230, 424, 90);
    label(ctx, 'CRASH', 512, 258, 36, '#ff4d32', 'center');
    label(ctx, plane.crashReason || 'TERRAIN', 512, 294, 22, '#fff6e4', 'center');
  }
  if (view.paused) label(ctx, 'PAUSED', 512, 250, 40, '#ffe14a', 'center');
  ctx.restore();
  keys(ctx, width, height);
}
