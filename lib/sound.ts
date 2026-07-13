// lib/sound.ts
// Звуки через Web Audio API — генерируются на лету, без mp3/wav файлов.
// Работает во всех современных браузерах.

let audioCtx: AudioContext | null = null;

function getCtx() {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioCtx;
}

function beep(freq: number, duration: number, type: OscillatorType = "sine", volume = 0.15) {
  const ctx = getCtx();
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.value = volume;
  osc.connect(gain);
  gain.connect(ctx.destination);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  osc.start();
  osc.stop(ctx.currentTime + duration);
}

export function playJumpSound() {
  beep(500, 0.15, "square", 0.1);
}

export function playBoneSound() {
  // короткий "звяк" из двух нот подряд
  beep(880, 0.1, "sine", 0.15);
  setTimeout(() => beep(1200, 0.12, "sine", 0.12), 60);
}

export function playLevelCompleteSound() {
  const notes = [523, 659, 784, 1047]; // до-ми-соль-до, бодрая мелодия
  notes.forEach((freq, i) => {
    setTimeout(() => beep(freq, 0.18, "triangle", 0.15), i * 110);
  });
}

export function playWinGameSound() {
  const notes = [523, 659, 784, 1047, 1319];
  notes.forEach((freq, i) => {
    setTimeout(() => beep(freq, 0.25, "triangle", 0.16), i * 140);
  });
}
