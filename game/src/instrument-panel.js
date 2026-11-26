function dial(ctx, x, y, radius, label, value, fraction) {
  ctx.save();
  ctx.shadowColor = '#f0a83b';
  ctx.shadowBlur = 10;
  ctx.fillStyle = '#101614';
  ctx.strokeStyle = '#e6b968';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.shadowBlur = 0;
  for (let tick = 0; tick <= 10; tick += 1) {
    const angle = Math.PI * (0.78 + tick * 1.44 / 10);
    ctx.strokeStyle = tick % 5 === 0 ? '#ffe4a8' : '#9b8967';
    ctx.lineWidth = tick % 5 === 0 ? 2 : 1;
    ctx.beginPath();
    ctx.moveTo(x + Math.cos(angle) * (radius - 7), y + Math.sin(angle) * (radius - 7));
    ctx.lineTo(x + Math.cos(angle) * (radius - 13), y + Math.sin(angle) * (radius - 13));
    ctx.stroke();
  }
  const needle = Math.PI * (0.78 + Math.max(0, Math.min(1, fraction)) * 1.44);
  ctx.strokeStyle = '#ffdb55';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + Math.cos(needle) * (radius - 16), y + Math.sin(needle) * (radius - 16));
  ctx.stroke();
  ctx.fillStyle = '#ffdb55';
  ctx.beginPath();
  ctx.arc(x, y, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowColor = '#ffe78a';
  ctx.shadowBlur = 8;
  ctx.fillStyle = '#fff0bd';
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
  ctx.fillStyle = 'rgba(24, 27, 24, 0.96)';
  ctx.strokeStyle = '#c9a765';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(132, 418);
  ctx.lineTo(892, 418);
  ctx.lineTo(1010, 610);
  ctx.lineTo(14, 610);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#34352d';
  ctx.fillRect(144, 426, 736, 18);
  ctx.fillStyle = '#ffcf58';
  ctx.font = '800 13px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`FUEL ${Math.round(plane.fuel * 100)}%     RPM ${Math.round(plane.rpm * 100)}%     DAMAGE ${Math.round(plane.dmg * 100)}%`, 512, 439);
  const gauges = [
    ['KTS', `${Math.round(plane.kts)}`, plane.kts / 140],
    ['ATTITUDE', 'FLIGHT', (plane.pitch + 0.5) / 1],
    ['ALT FT', `${Math.round(plane.altFt)}`, plane.altFt / 1800],
    ['HDG', plane.hdgText, plane.hdg / 360],
    ['VS FPM', `${Math.round(plane.vsFpm)}`, (plane.vsFpm + 1200) / 2400],
    ['TURN', 'BANK', (plane.roll + 1.2) / 2.4],
  ];
  for (let i = 0; i < gauges.length; i += 1) {
    dial(ctx, 207 + i * 122, 520, 32, gauges[i][0], gauges[i][1], gauges[i][2]);
  }
  ctx.restore();
}
