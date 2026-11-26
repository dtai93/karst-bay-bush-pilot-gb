// Compact glass avionics overlay for chase and cockpit views.

import { FIELDS, TOWERS, islandHeight, wrapPi } from './config.js';
import { drawInstrumentPanel } from './instrument-panel.js';

const CYAN = '#68e7f2';
const AMBER = '#ffc768';
const WHITE = '#f2fbff';
const GLASS = 'rgba(8,14,24,0.45)';

function box(ctx, x, y, w, h, r = 7) {
  const radius = Math.min(r, w * 0.5, h * 0.5);
  ctx.fillStyle = GLASS;
  ctx.strokeStyle = 'rgba(104,231,242,0.76)';
  ctx.lineWidth = 1.25;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, radius);
  ctx.fill();
  ctx.stroke();
}

function text(ctx, value, x, y, size = 14, color = WHITE, align = 'left', weight = 700) {
  ctx.fillStyle = color;
  ctx.font = `${weight} ${size}px "Segoe UI", system-ui, sans-serif`;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.fillText(value, x, y);
}

function heading(ctx, degrees) {
  const x = 418;
  const y = 10;
  box(ctx, x, y, 188, 42, 8);
  const center = x + 94;
  ctx.save();
  ctx.beginPath();
  ctx.rect(x + 4, y + 3, 92, 36);
  ctx.clip();
  for (let mark = Math.floor((degrees - 40) / 10) * 10; mark <= degrees + 40; mark += 10) {
    let relative = ((mark - degrees + 540) % 360) - 180;
    const at = center + relative * 1.55;
    const major = ((mark % 360) + 360) % 360;
    ctx.strokeStyle = 'rgba(220,247,255,0.75)';
    ctx.beginPath();
    ctx.moveTo(at, y + 7);
    ctx.lineTo(at, y + (major % 30 === 0 ? 18 : 13));
    ctx.stroke();
    if (major % 30 === 0) text(ctx, String(major).padStart(3, '0'), at, y + 28, 9, WHITE, 'center');
  }
  ctx.restore();
  ctx.fillStyle = 'rgba(8,14,24,0.9)';
  ctx.fillRect(center - 44, y + 4, 88, 34);
  text(ctx, 'HDG', center - 23, y + 21, 11, CYAN, 'center', 800);
  text(ctx, String(Math.round(degrees)).padStart(3, '0'), center + 19, y + 21, 19, WHITE, 'center', 800);
  ctx.fillStyle = AMBER;
  ctx.beginPath();
  ctx.moveTo(center, y + 42);
  ctx.lineTo(center - 5, y + 48);
  ctx.lineTo(center + 5, y + 48);
  ctx.fill();
}

function tape(ctx, x, y, title, value, unit, span, step, low, high) {
  const w = 72;
  const h = 286;
  box(ctx, x, y, w, h, 9);
  text(ctx, title, x + w * 0.5, y + 17, 13, CYAN, 'center', 800);
  const center = y + 151;
  const scale = 116 / span;
  const first = Math.floor((value - span) / step) * step;
  ctx.save();
  ctx.beginPath();
  ctx.rect(x + 4, y + 31, w - 8, h - 63);
  ctx.clip();
  for (let mark = first; mark <= value + span; mark += step) {
    const py = center - (mark - value) * scale;
    ctx.strokeStyle = 'rgba(232,249,255,0.68)';
    ctx.beginPath();
    ctx.moveTo(x + 47, py);
    ctx.lineTo(x + 64, py);
    ctx.stroke();
    if (Math.round(mark / step) % 2 === 0) text(ctx, String(Math.round(mark)), x + 43, py, 10, WHITE, 'right');
  }
  ctx.restore();
  ctx.fillStyle = 'rgba(8,14,24,0.88)';
  ctx.fillRect(x + 4, center - 21, w - 8, 42);
  ctx.strokeStyle = AMBER;
  ctx.strokeRect(x + 4, center - 21, w - 8, 42);
  text(ctx, String(Math.round(value)), x + w * 0.5, center - 2, 20, WHITE, 'center', 800);
  text(ctx, unit, x + w * 0.5, center + 14, 8, AMBER, 'center', 800);
  text(ctx, low, x + w * 0.5, y + h - 21, 9, WHITE, 'center', 700);
  text(ctx, high, x + w * 0.5, y + h - 7, 9, 'rgba(220,240,248,0.7)', 'center', 600);
}

function attitude(ctx, cx, cy, radius, pitch, roll, vs) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.clip();
  ctx.translate(cx, cy);
  ctx.rotate(-roll);
  const offset = Math.max(-radius, Math.min(radius, pitch * 88));
  ctx.fillStyle = '#2782a4';
  ctx.fillRect(-radius * 2, -radius * 2 + offset, radius * 4, radius * 2);
  ctx.fillStyle = '#956d48';
  ctx.fillRect(-radius * 2, offset, radius * 4, radius * 2);
  ctx.strokeStyle = WHITE;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(-radius, offset);
  ctx.lineTo(radius, offset);
  ctx.stroke();
  ctx.restore();
  ctx.strokeStyle = CYAN;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = AMBER;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx - 16, cy);
  ctx.lineTo(cx - 5, cy);
  ctx.lineTo(cx, cy + 4);
  ctx.lineTo(cx + 5, cy);
  ctx.lineTo(cx + 16, cy);
  ctx.stroke();
  box(ctx, cx - radius, cy + radius + 8, radius * 2, 33, 6);
  text(ctx, 'VS FPM', cx, cy + radius + 17, 8, CYAN, 'center', 800);
  const rate = Math.round(vs);
  text(ctx, `${rate > 0 ? '+' : ''}${rate}`, cx, cy + radius + 31, 12, rate < -900 ? '#ff7d69' : WHITE, 'center', 800);
}

function bar(ctx, x, y, width, fraction, name, warning = false) {
  const amount = Math.max(0, Math.min(1, fraction));
  const color = warning ? '#ff625c' : AMBER;
  text(ctx, name, x, y, 10, CYAN, 'left', 800);
  text(ctx, `${Math.round(amount * 100)}%`, x + width, y, 10, warning ? color : WHITE, 'right', 800);
  ctx.fillStyle = 'rgba(220,244,250,0.15)';
  ctx.fillRect(x, y + 8, width, 5);
  ctx.fillStyle = color;
  ctx.fillRect(x, y + 8, Math.max(2, width * amount), 5);
}

function systems(ctx, x, y, plane, warning) {
  box(ctx, x, y, 254, 67, 7);
  bar(ctx, x + 10, y + 12, 72, plane.thr, 'THR');
  bar(ctx, x + 91, y + 12, 72, plane.fuel, 'FUEL', plane.fuel < 0.22);
  bar(ctx, x + 172, y + 12, 72, plane.dmg, 'DMG', plane.dmg > 0.45);
  text(ctx, plane.flaps ? `FLAPS ${plane.flaps}` : 'FLAPS UP', x + 11, y + 48, 9, plane.flaps ? AMBER : WHITE, 'left', 800);
  text(ctx, plane.brake ? 'BRAKE ON' : 'BRAKE OFF', x + 94, y + 48, 9, plane.brake ? '#ff776b' : WHITE, 'left', 800);
  if (warning) text(ctx, `LOW FUEL  ·  ${warning}`, x + 243, y + 48, 9, '#ff776b', 'right', 900);
  else if (plane.dmg > 0.1) text(ctx, `ENGINE ROUGH  −${Math.round(plane.dmg * 55)}% THRUST`, x + 243, y + 48, 8, AMBER, 'right', 700);
}

function missionCard(ctx, objective, cargo) {
  const x = 96;
  const y = 12;
  box(ctx, x, y, 238, 70, 7);
  text(ctx, objective.title, x + 10, y + 16, 13, AMBER, 'left', 900);
  text(ctx, objective.line, x + 10, y + 37, 10, WHITE, 'left', 700);
  text(ctx, `${cargo || 'OBJECTIVE'}   ·   ${objective.timer}`, x + 10, y + 56, 9, CYAN, 'left', 800);
}

function waypoint(ctx, plane, ring, marker) {
  if (!ring && !marker) return;
  const point = ring || marker;
  const dx = point.x - plane.x;
  const dz = point.z - plane.z;
  const bearing = Math.atan2(dx, -dz);
  const relative = wrapPi(bearing - plane.yaw);
  const cx = 512 + Math.sin(relative) * 150;
  const cy = 184 - Math.cos(relative) * 50;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(relative);
  ctx.strokeStyle = AMBER;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, -10);
  ctx.lineTo(7, 7);
  ctx.lineTo(0, 3);
  ctx.lineTo(-7, 7);
  ctx.closePath();
  ctx.stroke();
  ctx.restore();
  const distance = Math.hypot(dx, dz);
  const label = marker && marker.label ? marker.label : ring ? 'NEXT RING' : 'RUNWAY';
  text(ctx, `${label}  ${Math.round(distance)} M`, cx, cy + 16, 10, AMBER, 'center', 800);
}

function map(ctx, x, y, plane, rings) {
  const radius = 62;
  ctx.save();
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.clip();
  ctx.fillStyle = 'rgba(8,40,47,0.84)';
  ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
  const span = 1450;
  const toX = (wx) => x + ((wx - plane.x) / span) * radius * 2;
  const toY = (wz) => y + ((wz - plane.z) / span) * radius * 2;
  const cells = 24;
  for (let iz = 0; iz < cells; iz += 1) {
    for (let ix = 0; ix < cells; ix += 1) {
      const wx = plane.x - span / 2 + ((ix + 0.5) / cells) * span;
      const wz = plane.z - span / 2 + ((iz + 0.5) / cells) * span;
      const elevation = islandHeight(wx, wz);
      if (elevation < 0.35) continue;
      ctx.fillStyle = elevation > 14 ? '#82985c' : elevation < 1.3 ? '#d9c99a' : '#43834e';
      ctx.fillRect(toX(wx), toY(wz), radius * 2 / cells + 1, radius * 2 / cells + 1);
    }
  }
  for (let i = 0; i < TOWERS.length; i += 1) {
    ctx.fillStyle = '#d7bf93';
    ctx.beginPath();
    ctx.arc(toX(TOWERS[i].x), toY(TOWERS[i].z), 2.2, 0, Math.PI * 2);
    ctx.fill();
  }
  for (const field of FIELDS) {
    const length = field.length / 2;
    ctx.strokeStyle = '#f3f5e8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(toX(field.x + Math.sin(field.heading) * length), toY(field.z - Math.cos(field.heading) * length));
    ctx.lineTo(toX(field.x - Math.sin(field.heading) * length), toY(field.z + Math.cos(field.heading) * length));
    ctx.stroke();
  }
  if (rings) {
    for (let i = 0; i < rings.list.length; i += 1) {
      const item = rings.list[i];
      ctx.fillStyle = item.taken ? '#69f5b2' : i === rings.index ? AMBER : '#b8a06a';
      ctx.beginPath();
      ctx.arc(toX(item.x), toY(item.z), i === rings.index ? 3.2 : 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(plane.yaw);
  ctx.fillStyle = '#ff675e';
  ctx.beginPath();
  ctx.moveTo(0, -7);
  ctx.lineTo(4, 5);
  ctx.lineTo(0, 3);
  ctx.lineTo(-4, 5);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
  ctx.restore();
  ctx.strokeStyle = 'rgba(104,231,242,0.9)';
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.stroke();
  text(ctx, 'NAV', x, y - radius + 9, 8, WHITE, 'center', 800);
}

function flightCues(ctx, plane) {
  const centerX = 512;
  const centerY = 322;
  ctx.strokeStyle = 'rgba(111,239,204,0.82)';
  ctx.lineWidth = 1.2;
  for (let i = -2; i <= 2; i += 1) {
    if (!i) continue;
    const dy = i * 18 + plane.pitch * 55;
    ctx.beginPath();
    ctx.moveTo(centerX - (i % 2 ? 18 : 27), centerY + dy);
    ctx.lineTo(centerX + (i % 2 ? 18 : 27), centerY + dy);
    if (Math.abs(i) === 2) {
      ctx.moveTo(centerX - 27, centerY + dy);
      ctx.lineTo(centerX - 20, centerY + dy - 4);
      ctx.moveTo(centerX + 27, centerY + dy);
      ctx.lineTo(centerX + 20, centerY + dy - 4);
    }
    ctx.stroke();
  }
  ctx.strokeStyle = '#a9ffb5';
  ctx.beginPath();
  ctx.moveTo(centerX - 13, centerY);
  ctx.lineTo(centerX - 5, centerY);
  ctx.moveTo(centerX + 5, centerY);
  ctx.lineTo(centerX + 13, centerY);
  ctx.moveTo(centerX, centerY - 5);
  ctx.lineTo(centerX, centerY + 5);
  ctx.stroke();
}

function keyStrip(ctx) {
  ctx.fillStyle = 'rgba(5,11,18,0.55)';
  ctx.fillRect(0, 621, 1024, 19);
  text(ctx, 'W/S PITCH   A/D ROLL   Q/E RUDDER   SHIFT/CTRL THR   F FLAPS   G BRAKE   C VIEW   P PAUSE', 512, 631, 9, WHITE, 'center', 700);
}

function weather(ctx, state) {
  if (!state || state.rain <= 0) return;
  box(ctx, 738, 12, 188, 36, 7);
  text(ctx, 'WIND 240/18 G26', 832, 30, 12, '#bdebf4', 'center', 900);
  ctx.strokeStyle = `rgba(205,235,244,${0.3 + state.rain * 0.35})`;
  ctx.lineWidth = 1;
  for (let i = 0; i < 38; i += 1) {
    const px = ((i * 83 + 29 - Math.floor(state.time * 45)) % 1024 + 1024) % 1024;
    const py = (i * 47 + 17 + Math.floor(state.time * 110)) % 610;
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.lineTo(px - 6, py + 16);
    ctx.stroke();
  }
}

export function drawHud(canvas, view) {
  const ctx = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;
  ctx.clearRect(0, 0, width, height);
  ctx.save();
  ctx.scale(width / 1024, height / 640);
  const plane = view.readout;
  weather(ctx, view.weather);
  heading(ctx, plane.hdg);
  missionCard(ctx, view.objective, view.missionLabel);

  if (view.cockpit) {
    text(ctx, `KTS ${Math.round(plane.kts)}`, 350, 73, 14, WHITE, 'center', 900);
    text(ctx, `ALT ${Math.round(plane.altFt)} FT`, 512, 73, 14, WHITE, 'center', 900);
    text(ctx, `HDG ${plane.hdgText}`, 674, 73, 14, WHITE, 'center', 900);
    systems(ctx, 152, 337, plane, plane.fuel < 0.16 ? 'RETURN TO FIELD' : '');
    drawInstrumentPanel(ctx, plane);
  } else {
    tape(ctx, 10, 112, 'KTS', plane.kts, 'KNOTS', 80, 10, '0', '140');
    tape(ctx, 942, 112, 'ALT', plane.altFt, 'FT', 600, 50, 'MSL', 'AGL');
    attitude(ctx, 112, 462, 34, plane.pitch, plane.roll, plane.vsFpm);
    systems(ctx, 166, 503, plane, plane.fuel < 0.16 ? 'RETURN TO FIELD' : '');
    map(ctx, 928, 542, plane, view.rings);
  }
  flightCues(ctx, plane);
  const ring = view.rings && view.rings.list[view.rings.index];
  waypoint(ctx, plane, ring && !ring.taken ? ring : null, view.waypoint);

  if (plane.buffet > 0.45 && !plane.crashed && Math.floor((view.time || 0) * 5) % 2 === 0) {
    box(ctx, 474, 230, 76, 34, 6);
    text(ctx, 'STALL', 512, 247, 17, '#ff625c', 'center', 900);
  }
  if (view.callout) {
    box(ctx, 755, 535, 250, 76, 7);
    text(ctx, view.callout.title, 880, 550, 13, AMBER, 'center', 900);
    text(ctx, view.callout.line, 880, 570, 10, WHITE, 'center', 800);
    text(ctx, view.callout.detail, 880, 591, 15, '#8effb8', 'center', 900);
  }
  if (view.eventBanner && view.eventBanner.until > (view.time || 0)) {
    box(ctx, 340, 215, 344, 78, 8);
    text(ctx, view.eventBanner.title, 512, 240, 24, view.eventBanner.crash ? '#ff625c' : AMBER, 'center', 900);
    text(ctx, view.eventBanner.detail, 512, 270, 14, WHITE, 'center', 800);
  }
  if (plane.crashed) {
    box(ctx, 362, 220, 300, 70, 8);
    text(ctx, 'CRASH', 512, 242, 25, '#ff625c', 'center', 900);
    text(ctx, plane.crashReason || 'TERRAIN', 512, 270, 13, WHITE, 'center', 800);
  }
  if (view.paused) text(ctx, 'PAUSED', 512, 250, 30, AMBER, 'center', 900);
  keyStrip(ctx);
  ctx.restore();
}
