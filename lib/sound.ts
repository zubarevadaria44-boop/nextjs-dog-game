// lib/sound.ts
// Звуки через Web Audio API — генерируются на лету, без mp3/wav файлов.

let audioCtx: AudioContext | null = null;
let unlocked = false;

function getCtx() {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioCtx;
}

// На телефонах (особенно iPhone/Safari) звук через Web Audio API молчит,
// пока не "разбужен" внутри самого первого касания экрана — причём мало
// просто вызвать resume(), нужно ещё и реально проиграть звук (пусть и
// беззвучный) прямо в момент касания. Вызови эту функцию один раз на первое
// touchstart/click в игре — дальше все звуки уже будут работать нормально.
export function unlockAudio() {
  if (unlocked) return;
  const ctx = getCtx();
  if (!ctx) return;
  if (ctx.state === "suspended") {
    ctx.resume();
  }
  // "тихий" щелчок нулевой громкости — специально, чтобы iOS засчитал
  // это как реальное воспроизведение и снял блокировку со звука насовсем
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  gain.gain.value = 0;
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.01);
  unlocked = true;
}

function beep(freq: number, duration: number, type: OscillatorType = "sine", volume = 0.15) {
  const ctx = getCtx();
  if (!ctx) return;
  if (ctx.state === "suspended") {
    ctx.resume();
  }
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

export function playLifeLostSound() {
  beep(220, 0.2, "sawtooth", 0.14);
  setTimeout(() => beep(160, 0.25, "sawtooth", 0.14), 120);
}

export function playGameOverSound() {
  const notes = [392, 330, 262, 196];
  notes.forEach((freq, i) => {
    setTimeout(() => beep(freq, 0.3, "sawtooth", 0.15), i * 160);
  });
}
