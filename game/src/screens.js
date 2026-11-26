import { MISSIONS } from './missions.js';

function centered(ctx, text, x, y, size, color) {
  ctx.fillStyle = color;
  ctx.font = `800 ${size}px Arial, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = '#000';
  ctx.shadowBlur = 8;
  ctx.fillText(text, x, y);
  ctx.shadowBlur = 0;
}

function panel(ctx, width, height) {
  ctx.fillStyle = 'rgba(7, 12, 15, 0.96)';
  ctx.fillRect(width * 0.2, height * 0.12, width * 0.6, height * 0.76);
  ctx.strokeStyle = '#e9bc6a';
  ctx.lineWidth = 3;
  ctx.strokeRect(width * 0.2, height * 0.12, width * 0.6, height * 0.76);
}

export function drawScreen(canvas, screen, mission) {
  if (screen !== 'title' && screen !== 'debrief') return;
  const ctx = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;
  const sx = width / 1024;
  const sy = height / 640;
  ctx.save();
  ctx.scale(sx, sy);
  ctx.clearRect(0, 0, width, height);
  panel(ctx, 1024, 640);
  if (screen === 'title') {
    centered(ctx, 'LIMESTONE WINGS', 512, 122, 34, '#ffe14a');
    centered(ctx, 'KARST BAY BUSH PILOT  ·  KESTREL K-2', 512, 158, 16, '#fff3d3');
    centered(ctx, 'TODAY’S FLIGHT  /  FIRST LIGHT', 512, 208, 21, '#ffe14a');
    centered(ctx, 'Fly six glowing rings around the towers, then land at Harbour Field.', 512, 240, 16, '#fff3d3');
    for (let i = 0; i < MISSIONS.length; i += 1) {
      const item = MISSIONS[i];
      const y = 287 + i * 39;
      ctx.fillStyle = item.available ? 'rgba(224, 153, 55, 0.28)' : 'rgba(255,255,255,0.07)';
      ctx.fillRect(246, y - 15, 532, 32);
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.font = '700 15px Arial, sans-serif';
      ctx.fillStyle = item.available ? '#ffe14a' : '#c1c0b9';
      ctx.fillText(`${i + 1}. ${item.title}`, 260, y);
      ctx.textAlign = 'right';
      ctx.fillStyle = item.available ? '#f5ead4' : '#9d9b93';
      ctx.fillText(item.available ? 'READY' : 'NEXT FLIGHT', 764, y);
    }
    centered(ctx, 'ENTER  FLY FIRST LIGHT    ·    C  CHASE / COCKPIT', 512, 523, 16, '#ffe14a');
    centered(ctx, 'W/S pitch   A/D roll   Q/E rudder   SHIFT/CTRL throttle   F flaps   G brakes', 512, 557, 13, '#fff3d3');
  } else {
    const success = mission.status === 'complete';
    centered(ctx, success ? 'FLIGHT COMPLETE' : 'SORTIE ENDED', 512, 178, 30, success ? '#ffe14a' : '#ff7154');
    centered(ctx, mission.status === 'crashed' ? 'AIRCRAFT DAMAGED  ·  RESTART TO FLY AGAIN' : 'FIRST LIGHT  ·  HARBOUR FIELD', 512, 222, 18, '#fff3d3');
    if (mission.landing) {
      centered(ctx, `${mission.landing.grade} LANDING  ·  ${mission.landing.fpm} FPM`, 512, 294, 22, '#ffe14a');
      centered(ctx, `CENTRE-LINE OFFSET  ${mission.landing.offset} M`, 512, 330, 17, '#fff3d3');
    } else {
      centered(ctx, 'RINGS COMPLETE  ·  LAND AT HARBOUR FIELD', 512, 294, 20, '#fff3d3');
    }
    centered(ctx, `SCORE  ${mission.score}`, 512, 390, 24, '#ffe14a');
    centered(ctx, 'R  RESTART SORTIE', 512, 500, 18, '#fff3d3');
  }
  ctx.restore();
}
