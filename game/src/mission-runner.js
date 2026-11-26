import { gradeLanding } from './landing-judge.js';

export function createMissionState() {
  return { rings: 0, status: 'ready', landing: null, score: 0 };
}

export function advanceMission(mission, plane, rings, collected) {
  if (mission.status === 'crashed' || mission.status === 'complete') return mission;
  if (collected) {
    mission.rings += 1;
    mission.score += 100;
    mission.status = 'flying';
  }
  if (plane.crashed) {
    mission.status = 'crashed';
    mission.score = Math.max(0, mission.score - 100);
  } else if (plane.touch) {
    mission.landing = gradeLanding(plane.touch);
    if (rings >= 6 && plane.touch.fieldId === 'harbour') {
      mission.status = 'complete';
      mission.score += mission.landing.score;
    } else {
      mission.status = 'landed';
    }
  }
  return mission;
}
