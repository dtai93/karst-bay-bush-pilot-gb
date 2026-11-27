// Slim edge avionics. The centre of the frame stays on the bay and the aircraft.

import { FIELDS, TOWERS, islandHeight, wrapPi } from './config.js';

const CYAN = '#9af6ff';
const AMBER = '#ffd36a';
const WHITE = '#f7fdff';
const GLASS = 'rgba(6, 12, 18, 0.38)';

function box(ctx, x, y, w, h, r = 6) {
  const radius = Math.min(r, w * 0.5, h * 0.5);
  ctx.fillStyle = GLASS;
  ctx.strokeStyle = 'rgba(154, 246, 255, 0.55)';
  ctx.lineWidth = 1;
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
  const x = 372;
  const y = 8;
  const w = 280;
  const h = 28;
  box(ctx, x, y, w, h, 6);
  const center = x + w * 0.5;
  ctx.save();
  ctx.beginPath();
  ctx.rect(x + 3, y + 2, w - 6, h - 4);
  ctx.clip();
  for (let mark = Math.floor((degrees - 50) / 10) * 10; mark <= degrees + 50; mark += 10) {
    const relative = ((mark - degrees + 540) % 360) - 180;
    const at = center + relative * 2.1;
    const major = ((mark % 360) + 360) % 360;
    ctx.strokeStyle = 'rgba(232, 249, 255, 0.8)';
    ctx.beginPath();
    ctx.moveTo(at, y + 4);
    ctx.lineTo(at, y + (major % 30 === 0 ? 12 : 8));
    ctx.stroke();
  }
  ctx.restore();
  ctx.fillStyle = 'rgba(6, 12, 18, 0.72)';
  ctx.fillRect(center - 58, y + 3, 116, h - 6);
  text(ctx, 'HDG', center - 34, y + 14, 12, CYAN, 'center', 800);
  text(ctx, String(Math.round(degrees)).padStart(3, '0'), center + 22, y + 14, 18, WHITE, 'center', 800);
}

function tape(ctx, x, y, title, value, unit, span, step) {
  const w = 58;
  const h = 196;
  box(ctx, x, y, w, h, 7);
  text(ctx, title, x + w * 0.5, y + 14, 13, CYAN, 'center', 800);
  const center = y + 104;
  const scale = 78 / span;
  const first = Math.floor((value - span) / step) * step;
  ctx.save();
  ctx.beginPath();
  ctx.rect(x + 3, y + 26, w - 6, h - 34);
  ctx.clip();
  for (let mark = first; mark <= value + span; mark += step) {
    const py = center - (mark - value) * scale;
    ctx.strokeStyle = 'rgba(232, 249, 255, 0.7)';
    ctx.beginPath();
    ctx.moveTo(x + 36, py);
    ctx.lineTo(x + 50, py);
    ctx.stroke();
    if (Math.round(mark / step) % 2 === 0) text(ctx, String(Math.round(mark)), x + 34, py, 11, WHITE, 'right');
  }
  ctx.restore();
  ctx.fillStyle = 'rgba(6, 12, 18, 0.78)';
  ctx.fillRect(x + 3, center - 18, w - 6, 36);
  text(ctx, String(Math.round(value)), x + w * 0.5, center - 4, 18, WHITE, 'center', 800);
  text(ctx, unit, x + w * 0.5, center + 12, 9, AMBER, 'center', 800);
}

function bar(ctx, x, y, width, fraction, name, warning = false) {
  const amount = Math.max(0, Math.min(1, fraction));
  const color = warning ? '#ff625c' : AMBER;
  text(ctx, name, x, y, 11, CYAN, 'left', 800);
  text(ctx, `${Math.round(amount * 100)}%`, x + width, y, 11, warning ? color : WHITE, 'right', 800);
  ctx.fillStyle = 'rgba(220, 244, 250, 0.16)';
  ctx.fillRect(x, y + 8, width, 4);
  ctx.fillStyle = color;
  ctx.fillRect(x, y + 8, Math.max(2, width * amount), 4);
}

function systems(ctx, x, y, plane) {
  box(ctx, x, y, 228, 62, 6);
  bar(ctx, x + 8, y + 8, 64, plane.thr, 'THR');
  bar(ctx, x + 82, y + 8, 64, plane.fuel, 'FUEL', plane.fuel < 0.34);
  bar(ctx, x + 156, y + 8, 64, plane.dmg, 'DMG', plane.dmg > 0.45);
  text(ctx, plane.flaps ? `FLAPS ${plane.flaps}` : 'FLAPS UP', x + 8, y + 32, 10, plane.flaps ? AMBER : WHITE, 'left', 800);
  text(ctx, plane.brake ? 'BRAKE ON' : 'BRAKE OFF', x + 92, y + 32, 10, plane.brake ? '#ff776b' : WHITE, 'left', 800);
  if (plane.fuel < 0.34) text(ctx, 'LOW FUEL', x + 8, y + 48, 11, '#ff776b', 'left', 900);
  else if (plane.dmg > 0.08) text(ctx, `ENGINE ROUGH -${Math.round(plane.dmg * 55)}% THRUST`, x + 8, y + 48, 10, AMBER, 'left', 800);
}

function missionCard(ctx, objective) {
  box(ctx, 8, 8, 250, 46, 6);
  text(ctx, objective.title, 16, 20, 13, AMBER, 'left', 900);
  text(ctx, objective.line, 16, 38, 11, WHITE, 'left', 700);
  text(ctx, objective.timer, 246, 20, 12, CYAN, 'right', 800);
}

function waypoint(ctx, plane, ring, marker) {
  if (!ring && !marker) return;
  const point = ring || marker;
  const dx = point.x - plane.x;
  const dz = point.z - plane.z;
  const bearing = Math.atan2(dx, -dz);
  const relative = wrapPi(bearing - plane.yaw);
  const cx = 512;
  const cy = 48;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(relative);
  ctx.strokeStyle = AMBER;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, -8);
  ctx.lineTo(6, 6);
  ctx.lineTo(0, 2);
  ctx.lineTo(-6, 6);
  ctx.closePath();
  ctx.stroke();
  ctx.restore();
  const distance = Math.hypot(dx, dz);
  const label = marker && marker.label ? marker.label : ring ? 'NEXT RING' : 'RUNWAY';
  text(ctx, `${label} ${Math.round(distance)} M`, cx, cy + 16, 11, AMBER, 'center', 800);
}

function map(ctx, x, y, plane, rings) {
  const radius = 48;
  ctx.save();
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.clip();
  ctx.fillStyle = 'rgba(6, 28, 34, 0.55)';
  ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
  const span = 1450;
  const toX = (wx) => x + ((wx - plane.x) / span) * radius * 2;
  const toY = (wz) => y + ((wz - plane.z) / span) * radius * 2;
  const cells = 18;
  for (let iz = 0; iz < cells; iz += 1) {
    for (let ix = 0; ix < cells; ix += 1) {
      const wx = plane.x - span / 2 + ((ix + 0.5) / cells) * span;
      const wz = plane.z - span / 2 + ((iz + 0.5) / cells) * span;
      const elevation = islandHeight(wx, wz);
      if (elevation < 0.35) continue;
      ctx.fillStyle = elevation > 14 ? '#6f8a48' : elevation < 1.3 ? '#e2d2a4' : '#3f8a52';
      ctx.fillRect(toX(wx), toY(wz), radius * 2 / cells + 1, radius * 2 / cells + 1);
    }
  }
  for (let i = 0; i < TOWERS.length; i += 1) {
    ctx.fillStyle = '#e6d2ae';
    ctx.beginPath();
    ctx.arc(toX(TOWERS[i].x), toY(TOWERS[i].z), 2, 0, Math.PI * 2);
    ctx.fill();
  }
  for (const field of FIELDS) {
    const length = field.length / 2;
    ctx.strokeStyle = '#f4f6ea';
    ctx.lineWidth = 1.5;
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
      ctx.arc(toX(item.x), toY(item.z), i === rings.index ? 3 : 1.8, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(plane.yaw);
  ctx.fillStyle = '#ff675e';
  ctx.beginPath();
  ctx.moveTo(0, -6);
  ctx.lineTo(3.5, 4);
  ctx.lineTo(0, 2);
  ctx.lineTo(-3.5, 4);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
  ctx.restore();
  ctx.strokeStyle = 'rgba(154, 246, 255, 0.8)';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.stroke();
  text(ctx, 'NAV', x, y - radius + 8, 8, WHITE, 'center', 800);
}

function chip(ctx, x, y, w, h, title, line, accent) {
  box(ctx, x, y, w, h, 6);
  text(ctx, title, x + 10, y + 16, 12, AMBER, 'left', 900);
  text(ctx, line, x + 10, y + h - 16, 16, accent || '#9dffb8', 'left', 900);
}

function keyStrip(ctx) {
  ctx.fillStyle = 'rgba(5, 10, 16, 0.28)';
  ctx.fillRect(0, 624, 1024, 16);
  text(ctx, 'W/S PITCH   A/D ROLL   Q/E RUDDER   SHIFT THR   F FLAPS   G BRAKE   C VIEW', 512, 632, 10, 'rgba(247,253,255,0.8)', 'center', 700);
}

function weather(ctx, state) {
  if (!state || state.rain <= 0) return;
  box(ctx, 748, 8, 196, 28, 6);
  text(ctx, 'WIND 240/18 G26', 846, 22, 13, '#d7f6ff', 'center', 900);
  ctx.strokeStyle = `rgba(210, 230, 240, ${0.28 + state.rain * 0.3})`;
  ctx.lineWidth = 1;
  for (let i = 0; i < 46; i += 1) {
    const px = ((i * 97 + 19) % 1024);
    const py = ((i * 53 + 11) % 600);
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.lineTo(px - 7, py + 18);
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
  missionCard(ctx, view.objective);

  if (!view.cockpit) {
    tape(ctx, 8, 64, 'KTS', plane.kts, 'KNOTS', 40, 10);
    tape(ctx, 958, 64, 'ALT', plane.altFt, 'FT', 400, 100);
    systems(ctx, 8, 548, plane);
    map(ctx, 956, 548, plane, view.rings);
    const ring = view.rings && view.rings.list[view.rings.index];
    if (!view.callout) waypoint(ctx, plane, ring && !ring.taken ? ring : null, view.waypoint);
  } else {
    text(ctx, `KTS ${Math.round(plane.kts)}`, 78, 78, 20, WHITE, 'left', 900);
    text(ctx, `ALT ${Math.round(plane.altFt)}`, 946, 78, 20, WHITE, 'right', 900);
  }

  if (view.callout) chip(ctx, 76, 66, 214, 40, view.callout.title, view.callout.line, view.callout.color);
  if (view.eventBanner && (!view.eventBanner.until || view.eventBanner.until > (view.time || 0))) {
    chip(ctx, 690, 66, 250, 46, view.eventBanner.title, view.eventBanner.detail, view.eventBanner.crash ? '#ff7d72' : '#9dffb8');
  }
  if (plane.buffet > 0.45 && !plane.crashed) chip(ctx, 452, 250, 120, 40, 'STALL', 'NOSE DOWN', '#ff7d72');
  if (plane.crashed) chip(ctx, 760, 120, 220, 48, 'CRASH', plane.crashReason || 'TERRAIN', '#ff7d72');
  if (view.paused) text(ctx, 'PAUSED', 512, 300, 28, AMBER, 'center', 900);
  keyStrip(ctx);
  ctx.restore();
}
