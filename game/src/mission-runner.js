import { RESCUE_BOAT, VILLAGE } from './config.js';
import { MISSIONS } from './missions.js';
import { gradeLanding } from './landing-judge.js';

const DISTANCE = (plane, point) => Math.hypot(plane.x - point.x, plane.z - point.z);

export function createMissionState(id = MISSIONS[0].id) {
  const definition = MISSIONS.find((item) => item.id === id) || MISSIONS[0];
  return {
    id: definition.id, goal: definition.goal, targetField: definition.field,
    rings: 0, drops: 0, rescued: false, elapsed: 0, status: 'ready',
    landing: null, score: 0, stars: 0, pay: 0, cargo: definition.cargo,
  };
}

export function advanceMission(mission, plane, rings, collected, controls = {}) {
  if (mission.status === 'crashed' || mission.status === 'complete' || mission.status === 'expired') return mission;
  const definition = MISSIONS.find((item) => item.id === mission.id) || MISSIONS[0];
  mission.elapsed += 1 / 60;
  if (mission.goal === 'cargo' && mission.elapsed > 300) {
    mission.status = 'expired';
    return mission;
  }
  if (collected && mission.goal === 'rings') {
    mission.rings = Math.max(mission.rings, rings);
    mission.score += 100;
    mission.status = 'flying';
  }
  if (mission.goal === 'mail' && controls.drop && mission.drops < 3 &&
      DISTANCE(plane, VILLAGE) < 150 && plane.y < 75 && !plane.onGround) {
    mission.drops += 1;
    mission.score += 125;
  }
  if (mission.goal === 'rescue' && !mission.rescued &&
      DISTANCE(plane, RESCUE_BOAT) < 115 && plane.y > 18 && plane.y < 100) {
    mission.rescued = true;
    mission.score += 250;
  }
  if (plane.crashed) {
    mission.status = 'crashed';
    mission.score = Math.max(0, mission.score - 100);
    return mission;
  }
  if (!plane.touch) return mission;
  mission.landing = gradeLanding(plane.touch);
  const objectiveDone = mission.goal === 'rings' ? mission.rings >= 6
    : mission.goal === 'mail' ? mission.drops >= 3
      : mission.goal === 'rescue' ? mission.rescued
        : true;
  if (plane.touch.fieldId === definition.field && objectiveDone) {
    mission.status = 'complete';
    mission.score += mission.landing.score;
    mission.stars = mission.landing.score >= 85 ? 3 : mission.landing.score >= 65 ? 2 : 1;
    mission.pay = Math.round(definition.pay * (mission.landing.score / 100));
  } else {
    mission.status = 'landed';
  }
  return mission;
}

export function missionObjective(mission, remaining = 360) {
  const definition = MISSIONS.find((item) => item.id === mission.id) || MISSIONS[0];
  let line = definition.objective.toUpperCase();
  if (mission.goal === 'rings') line = `RING ${Math.min(6, mission.rings + 1)} / 6 · HARBOUR`;
  if (mission.goal === 'mail') line = `MAIL ${mission.drops} / 3 · SPACE TO DROP`;
  if (mission.goal === 'rescue') line = mission.rescued ? 'RESCUE MARKED · RETURN TO HARBOUR' : 'FIND FLARE BOAT · CIRCLE TO MARK';
  if (mission.goal === 'cargo') line = `ICE DELIVERY · ${Math.max(0, Math.ceil(300 - mission.elapsed))} SEC · TERRACE`;
  if (mission.goal === 'landing') line = 'RAIN APPROACH · LAND AT LAGOON';
  const left = Math.max(0, remaining);
  return {
    title: definition.title.toUpperCase(),
    line: mission.status === 'crashed' ? `CRASHED · ${mission.crashReason || 'AIRCRAFT DOWN'}` : line,
    timer: `${String(Math.floor(left / 60)).padStart(2, '0')}:${String(Math.floor(left % 60)).padStart(2, '0')}`,
  };
}
