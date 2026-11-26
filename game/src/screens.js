import { MISSIONS } from './missions.js';

function text(ctx, value, x, y, size, color = '#fff1d2', align = 'center') {
  ctx.fillStyle = color;
  ctx.font = `800 ${size}px Arial, sans-serif`;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.shadowColor = '#000';
  ctx.shadowBlur = 7;
  ctx.fillText(value, x, y);
  ctx.shadowBlur = 0;
}

function backdrop(ctx) {
  ctx.fillStyle = 'rgba(7, 17, 21, .72)';
  ctx.fillRect(72, 42, 880, 556);
  ctx.strokeStyle = '#e5b763';
  ctx.lineWidth = 2;
  ctx.strokeRect(72, 42, 880, 556);
}

function missionIcon(ctx, index, x, y) {
  ctx.save();
  ctx.translate(x, y);
  ctx.lineWidth = 3;
  const colors = ['#ffc94f', '#9de6ee', '#fff0d0', '#8dd8ef', '#ff7652'];
  ctx.strokeStyle = colors[index];
  ctx.fillStyle = colors[index];
  if (index === 0) {
    ctx.beginPath(); ctx.ellipse(0, 0, 13, 19, -0.3, 0, Math.PI * 2); ctx.stroke();
  } else if (index === 1) {
    ctx.fillRect(-13, -11, 26, 22);
    ctx.strokeStyle = '#ecffff'; ctx.strokeRect(-13, -11, 26, 22);
  } else if (index === 2) {
    ctx.fillRect(-14, -10, 28, 20);
    ctx.strokeStyle = '#594a39'; ctx.beginPath(); ctx.moveTo(-14, -10); ctx.lineTo(0, 2); ctx.lineTo(14, -10); ctx.stroke();
  } else if (index === 3) {
    ctx.beginPath(); ctx.arc(-4, -2, 10, Math.PI, 0); ctx.arc(6, -2, 8, Math.PI, 0); ctx.lineTo(14, 8); ctx.lineTo(-14, 8); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-7, 12); ctx.lineTo(-10, 18); ctx.moveTo(5, 12); ctx.lineTo(2, 18); ctx.stroke();
  } else {
    ctx.fillRect(-5, -12, 10, 24);
    ctx.beginPath(); ctx.moveTo(-10, -12); ctx.lineTo(10, -12); ctx.lineTo(0, -20); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.arc(0, -18, 19, -0.7, 0.7); ctx.stroke();
  }
  ctx.restore();
}

function drawMissionBoard(ctx, selected, hangar) {
  text(ctx, 'LIMESTONE WINGS', 512, 82, 32, '#ffe06a');
  text(ctx, 'KARST BAY BUSH PILOT  ·  KESTREL K-2', 512, 113, 14);
  text(ctx, 'SELECT A FLIGHT  ·  PRESS 1–5, THEN ENTER', 512, 151, 15, '#f4c777');
  for (let i = 0; i < MISSIONS.length; i += 1) {
    const item = MISSIONS[i];
    const y = 185 + i * 70;
    ctx.fillStyle = i + 1 === selected ? 'rgba(229,183,99,.25)' : 'rgba(255,255,255,.055)';
    ctx.fillRect(112, y, 800, 61);
    ctx.strokeStyle = i + 1 === selected ? '#ffe06a' : 'rgba(255,255,255,.15)';
    ctx.strokeRect(112, y, 800, 61);
    text(ctx, `${i + 1}`, 130, y + 29, 16, '#ffe06a');
    missionIcon(ctx, i, 165, y + 30);
    text(ctx, item.title.toUpperCase(), 198, y + 17, 16, '#fff1d2', 'left');
    text(ctx, item.objective.toUpperCase(), 198, y + 42, 12, '#b9d1c6', 'left');
    text(ctx, `${item.difficulty}  ·  BEST ${hangar.bestStars[item.id] || 0}/3  ·  $${item.pay}`, 894, y + 29, 12, '#f4c777', 'right');
  }
  text(ctx, 'W/S PITCH  ·  A/D BANK  ·  Q/E RUDDER  ·  SHIFT/CTRL THROTTLE  ·  F FLAPS  ·  G BRAKES', 512, 555, 11);
  text(ctx, 'C COCKPIT  ·  P PAUSE  ·  SPACE MAIL DROP  ·  H HANGAR', 512, 578, 11, '#f4c777');
}

function drawDebrief(ctx, mission) {
  const success = mission.status === 'complete';
  ctx.fillStyle = 'rgba(7, 17, 21, .9)';
  ctx.fillRect(72, 42, 880, 556);
  ctx.strokeStyle = '#e5b763';
  ctx.lineWidth = 2;
  ctx.strokeRect(72, 42, 880, 556);
  text(ctx, success ? 'SORTIE COMPLETE' : 'FLIGHT DEBRIEF', 512, 82, 27, success ? '#ffe06a' : '#ff8060');
  const item = MISSIONS.find((candidate) => candidate.id === mission.id) || MISSIONS[0];
  text(ctx, `${item.title.toUpperCase()}  ·  ${mission.status.toUpperCase()}`, 512, 116, 15);
  if (mission.status === 'crashed') text(ctx, `CRASHED: ${mission.crashReason || 'AIRCRAFT DOWN'}`, 512, 150, 17, '#ff7154');

  const landing = mission.landing;
  ctx.fillStyle = 'rgba(255, 224, 106, .12)';
  ctx.beginPath();
  ctx.arc(205, 248, 91, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = success ? '#ffe06a' : '#ff8060';
  ctx.lineWidth = 4;
  ctx.stroke();
  text(ctx, 'LANDING GRADE', 205, 190, 15, '#f4c777');
  text(ctx, landing ? landing.grade : '--', 205, 250, 66, success ? '#ffe06a' : '#ff8060');
  text(ctx, landing ? `${landing.fpm} FPM` : 'NO TOUCHDOWN', 205, 308, 16);

  const stats = mission.stats || { fuel: 0, damage: 0, elapsed: 0 };
  const metrics = [
    ['TOUCHDOWN VS', landing ? `${landing.fpm} FPM` : '-- FPM'],
    ['LINE OFFSET', landing ? `${landing.offset} M` : '-- M'],
    ['LANDING ZONE', landing ? `${landing.zone} M` : '-- M'],
    ['FUEL / DAMAGE', `${stats.fuel}% / ${stats.damage}%`],
  ];
  for (let i = 0; i < metrics.length; i += 1) {
    const x = 340 + (i % 2) * 282;
    const y = 166 + Math.floor(i / 2) * 82;
    ctx.fillStyle = 'rgba(255,255,255,.07)';
    ctx.fillRect(x, y, 264, 68);
    ctx.strokeStyle = 'rgba(229,183,99,.55)';
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, 264, 68);
    text(ctx, metrics[i][0], x + 132, y + 20, 13, '#f4c777');
    text(ctx, metrics[i][1], x + 132, y + 47, 21, '#fff1d2');
  }

  const objective = mission.goal === 'rings' ? `${mission.rings}/6 RINGS`
    : mission.goal === 'mail' ? `${mission.drops}/3 MAIL DROPS`
      : mission.goal === 'rescue' ? (mission.rescued ? 'BOAT MARKED' : 'BOAT NOT MARKED')
        : mission.goal === 'cargo' ? 'FISH ICE TO TERRACE'
          : 'SQUALL LANDING · LAGOON';
  const elapsed = `${String(Math.floor(stats.elapsed / 60)).padStart(2, '0')}:${String(stats.elapsed % 60).padStart(2, '0')}`;
  text(ctx, `OBJECTIVE COMPLETE  ·  ${objective}`, 512, 362, 16);
  text(ctx, `TIME ${elapsed}  ·  SCORE ${mission.score}`, 512, 395, 15, '#b9d1c6');
  text(ctx, `${mission.stars || 0} STARS  ·  FLIGHT PAY $${mission.pay}`, 512, 441, 24, '#ffe06a');
  const feat = landing && landing.grade === 'A' ? 'FEAT: SMOOTH TOUCHDOWN' : `FEAT: ${objective}`;
  text(ctx, feat, 512, 489, 14, '#f4c777');
  text(ctx, 'R REFLY  ·  1–5 NEXT FLIGHT  ·  H HANGAR', 512, 552, 15);
}

export function drawScreen(canvas, screen, mission, selected = 1, hangar = { credits: 0, tank: 0, engine: 0, gear: 0, bestStars: {} }) {
  if (!['title', 'missions', 'debrief', 'hangar'].includes(screen)) return;
  const ctx = canvas.getContext('2d');
  ctx.save();
  ctx.setTransform(canvas.width / 1024, 0, 0, canvas.height / 640, 0, 0);
  ctx.clearRect(0, 0, 1024, 640);
  if (screen === 'debrief') drawDebrief(ctx, mission);
  else if (screen === 'hangar') {
    backdrop(ctx);
    text(ctx, 'HANGAR · KESTREL K-2', 512, 145, 30, '#ffe06a');
    text(ctx, `FLIGHT FUND  $${hangar.credits}`, 512, 195, 20, '#ffe06a');
    text(ctx, `T · TANK ${hangar.tank}/3  ·  $180  ·  MORE RANGE`, 512, 270, 16);
    text(ctx, `E · ENGINE ${hangar.engine}/3  ·  $260  ·  MORE THRUST`, 512, 320, 16);
    text(ctx, `U · GEAR ${hangar.gear}/3  ·  $220  ·  GENTLER LANDINGS`, 512, 370, 16);
    text(ctx, 'H · RETURN TO FLIGHT BOARD', 512, 472, 15, '#ffe06a');
  } else {
    backdrop(ctx);
    drawMissionBoard(ctx, selected, hangar);
  }
  ctx.restore();
}
