function dial(ctx, x, y, radius, label, value, fraction) {
  ctx.save();
  ctx.shadowColor = '#65dce8';
  ctx.shadowBlur = 12;
  ctx.fillStyle = '#09141a';
  ctx.strokeStyle = '#83e7ed';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.shadowBlur = 0;
  for (let tick = 0; tick <= 10; tick += 1) {
    const angle = Math.PI * (0.78 + tick * 1.44 / 10);
    ctx.strokeStyle = tick % 5 === 0 ? '#f5fbef' : '#75a9a9';
    ctx.lineWidth = tick % 5 === 0 ? 1.6 : 1;
    ctx.beginPath();
    ctx.moveTo(x + Math.cos(angle) * (radius - 7), y + Math.sin(angle) * (radius - 7));
    ctx.lineTo(x + Math.cos(angle) * (radius - 13), y + Math.sin(angle) * (radius - 13));
    ctx.stroke();
  }
  const needle = Math.PI * (0.78 + Math.max(0, Math.min(1, fraction)) * 1.44);
  ctx.strokeStyle = '#ffce67';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + Math.cos(needle) * (radius - 16), y + Math.sin(needle) * (radius - 16));
  ctx.stroke();
  ctx.fillStyle = '#ffce67';
  ctx.beginPath();
  ctx.arc(x, y, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowColor = '#81eaf1';
  ctx.shadowBlur = 6;
  ctx.fillStyle = '#f4fcff';
  ctx.font = '800 10px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, x, y + radius + 14);
  ctx.font = '700 11px Arial, sans-serif';
  ctx.fillText(value, x, y + 15);
  ctx.restore();
}

export function drawInstrumentPanel(ctx, plane) {
  ctx.save();
  ctx.fillStyle = 'rgba(7, 14, 18, 0.94)';
  ctx.strokeStyle = 'rgba(155, 224, 222, 0.82)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(132, 418);
  ctx.lineTo(892, 418);
  ctx.lineTo(1010, 610);
  ctx.lineTo(14, 610);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = 'rgba(184, 232, 224, 0.16)';
  ctx.fillRect(144, 418, 736, 8);
  ctx.fillStyle = '#ffd778';
  ctx.font = '800 12px "Segoe UI", system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`FUEL ${Math.round(plane.fuel * 100)}%     RPM ${Math.round(plane.rpm * 100)}%     DMG ${Math.round(plane.dmg * 100)}%`, 512, 441);

  ctx.strokeStyle = 'rgba(197, 230, 225, 0.58)';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(78, 70);
  ctx.lineTo(104, 418);
  ctx.moveTo(946, 70);
  ctx.lineTo(920, 418);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(255, 215, 120, 0.32)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(80, 72);
  ctx.lineTo(106, 416);
  ctx.moveTo(944, 72);
  ctx.lineTo(918, 416);
  ctx.stroke();

  ctx.strokeStyle = 'rgba(255, 211, 117, 0.75)';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(478, 589);
  ctx.lineTo(478, 570);
  ctx.quadraticCurveTo(512, 543, 546, 570);
  ctx.lineTo(546, 589);
  ctx.stroke();
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(478, 579);
  ctx.lineTo(468, 579);
  ctx.moveTo(546, 579);
  ctx.lineTo(556, 579);
  ctx.stroke();

  const gauges = [
    ['KTS', `${Math.round(plane.kts)}`, plane.kts / 140],
    ['ATTITUDE', 'FLIGHT', (plane.pitch + 0.5) / 1],
    ['ALT FT', `${Math.round(plane.altFt)}`, plane.altFt / 1800],
    ['HDG', plane.hdgText, plane.hdg / 360],
    ['VS FPM', `${Math.round(plane.vsFpm)}`, (plane.vsFpm + 1200) / 2400],
    ['TURN', 'BANK', (plane.roll + 1.2) / 2.4],
  ];
  for (let i = 0; i < gauges.length; i += 1) {
    dial(ctx, 207 + i * 122, 520, 31, gauges[i][0], gauges[i][1], gauges[i][2]);
  }
  ctx.restore();
}
