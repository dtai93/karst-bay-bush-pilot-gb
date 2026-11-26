export function sampleWeather(missionId, time) {
  const squall = missionId === 'squall-line';
  const breeze = squall ? 2.8 : 0.22;
  const gust = squall ? Math.sin(time * 0.73) * 1.15 : Math.sin(time * 0.31) * 0.08;
  return {
    x: breeze + gust,
    z: (squall ? 0.85 : 0.12) * Math.sin(time * 0.23),
    rain: squall ? 0.72 : 0,
    label: squall ? 'SQUALL · CROSSWIND' : 'GOLDEN HOUR · LIGHT BREEZE',
    time,
  };
}
