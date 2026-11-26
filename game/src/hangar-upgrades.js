const STORAGE_KEY = 'limestone-wings-hangar';
const PRICES = { tank: 180, engine: 260, gear: 220 };

export function loadHangar() {
  const saved = window.localStorage.getItem(STORAGE_KEY);
  if (!saved) return { credits: 0, tank: 0, engine: 0, gear: 0, bestStars: {} };
  const value = JSON.parse(saved);
  const best = value.bestStars && typeof value.bestStars === 'object' ? value.bestStars : {};
  return {
    credits: Math.max(0, Number(value.credits) || 0),
    tank: Math.max(0, Math.min(3, Number(value.tank) || 0)),
    engine: Math.max(0, Math.min(3, Number(value.engine) || 0)),
    gear: Math.max(0, Math.min(3, Number(value.gear) || 0)),
    bestStars: Object.fromEntries(['first-light', 'ice-market', 'mail-drop', 'squall-line', 'lighthouse-rescue']
      .map((id) => [id, Math.max(0, Math.min(3, Number(best[id]) || 0))])),
  };
}

export function saveHangar(hangar) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(hangar));
}

export function creditMission(hangar, pay, missionId, stars) {
  hangar.credits += Math.max(0, Math.round(pay));
  hangar.bestStars[missionId] = Math.max(hangar.bestStars[missionId] || 0, stars);
  saveHangar(hangar);
}

export function buyUpgrade(hangar, name) {
  const price = PRICES[name];
  if (!price || hangar[name] >= 3 || hangar.credits < price) return false;
  hangar.credits -= price;
  hangar[name] += 1;
  saveHangar(hangar);
  return true;
}

export function upgradeEffects(hangar) {
  return {
    fuel: 0.86 + hangar.tank * 0.08,
    engineBonus: hangar.engine * 0.035,
    gearBonus: hangar.gear * 0.05,
  };
}
