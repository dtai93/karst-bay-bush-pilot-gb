// Synthesized flight sound; audio nodes are created only after user input.

export function createAudio() {
  let context;
  let engineGain;
  let windGain;
  let noiseGain;
  let hornGain;
  let muted = false;
  let hornClock = 0;

  function start() {
    if (!context) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      context = new AudioContext();
      const engine = context.createOscillator();
      const overtone = context.createOscillator();
      const filter = context.createBiquadFilter();
      engine.type = 'sawtooth';
      overtone.type = 'triangle';
      filter.type = 'lowpass';
      filter.frequency.value = 420;
      engineGain = context.createGain();
      engineGain.gain.value = 0.0001;
      engine.connect(filter); overtone.connect(filter); filter.connect(engineGain); engineGain.connect(context.destination);
      engine.start(); overtone.start();
      const buffer = context.createBuffer(1, context.sampleRate, context.sampleRate);
      const data = buffer.getChannelData(0);
      let last = 0;
      for (let i = 0; i < data.length; i += 1) {
        last = last * 0.96 + (Math.random() * 2 - 1) * 0.04;
        data[i] = last;
      }
      const source = context.createBufferSource();
      source.buffer = buffer; source.loop = true;
      const windFilter = context.createBiquadFilter();
      windFilter.type = 'lowpass'; windFilter.frequency.value = 800;
      windGain = context.createGain(); windGain.gain.value = 0;
      noiseGain = context.createGain(); noiseGain.gain.value = 0;
      source.connect(windFilter); windFilter.connect(windGain); windGain.connect(context.destination);
      source.connect(noiseGain); noiseGain.connect(context.destination); source.start();
      hornGain = context.createGain(); hornGain.gain.value = 0;
      const horn = context.createOscillator();
      horn.type = 'square'; horn.frequency.value = 520; horn.connect(hornGain); hornGain.connect(context.destination); horn.start();
      engine.onended = () => { engine.frequency.value = 55; overtone.frequency.value = 110; };
      context._engine = engine;
      context._overtone = overtone;
      context._horn = horn;
    }
    if (context.state === 'suspended') context.resume();
  }

  function tone(frequency, duration, waveform = 'sine', volume = 0.16) {
    start();
    if (!context || muted) return;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = waveform;
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(volume, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + duration);
    oscillator.connect(gain); gain.connect(context.destination);
    oscillator.start(); oscillator.stop(context.currentTime + duration);
  }

  return {
    start,
    toggleMute() { muted = !muted; },
    update(plane, dt) {
      if (!context) return;
      const t = context.currentTime;
      const kts = Math.hypot(plane.vx, plane.vy, plane.vz) * 1.94384;
      context._engine.frequency.setTargetAtTime(38 + plane.rpm * 82, t, 0.12);
      context._overtone.frequency.setTargetAtTime(76 + plane.rpm * 164, t, 0.12);
      engineGain.gain.setTargetAtTime(muted ? 0 : 0.035 + plane.rpm * 0.075, t, 0.15);
      windGain.gain.setTargetAtTime(muted ? 0 : Math.min(0.2, kts / 900), t, 0.2);
      noiseGain.gain.setTargetAtTime(muted ? 0 : plane.buffet * 0.015, t, 0.1);
      hornClock -= dt;
      if (plane.buffet > 0.55 && hornClock <= 0) {
        hornClock = 0.65;
        tone(520, 0.18, 'square', 0.09);
      }
    },
    event(name) {
      if (name === 'ring') { tone(880, 0.12); setTimeout(() => tone(1320, 0.22), 90); }
      if (name === 'touchdown') tone(660, 0.22, 'sine', 0.12);
      if (name === 'crash') { tone(90, 0.55, 'sawtooth', 0.22); tone(48, 0.7, 'square', 0.14); }
    },
  };
}
