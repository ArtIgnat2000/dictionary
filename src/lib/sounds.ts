/**
 * Sound effects via Web Audio API — no external files needed.
 * All sounds are synthesized in the browser.
 */

let ctx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!ctx) ctx = new AudioContext();
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function playTone(
  frequency: number,
  startTime: number,
  duration: number,
  volume: number,
  type: OscillatorType = 'sine',
  fadeOut = true,
): void {
  const ac = getCtx();
  const osc = ac.createOscillator();
  const gain = ac.createGain();

  osc.connect(gain);
  gain.connect(ac.destination);

  osc.type = type;
  osc.frequency.setValueAtTime(frequency, ac.currentTime + startTime);

  gain.gain.setValueAtTime(0, ac.currentTime + startTime);
  gain.gain.linearRampToValueAtTime(volume, ac.currentTime + startTime + 0.01);
  if (fadeOut) {
    gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + startTime + duration);
  }

  osc.start(ac.currentTime + startTime);
  osc.stop(ac.currentTime + startTime + duration + 0.05);
}

/** 🎉 Восходящий радостный аккорд — правильный ответ */
export function playCorrect(): void {
  // C5 → E5 → G5 → C6  (быстрое арпеджио + финальный аккорд)
  const notes = [523.25, 659.25, 783.99, 1046.5];
  notes.forEach((freq, i) => {
    playTone(freq, i * 0.08, 0.35, 0.18, 'sine');
  });
  // Добавляем тёплый overtone
  playTone(523.25, 0.24, 0.45, 0.08, 'triangle');
  playTone(1046.5, 0.24, 0.45, 0.08, 'triangle');
}

/** 😢 Нисходящий печальный звук — ошибка */
export function playWrong(): void {
  // Нисходящий минорный интервал
  playTone(350, 0,    0.22, 0.15, 'sawtooth');
  playTone(285, 0.15, 0.30, 0.12, 'sawtooth');
  playTone(240, 0.35, 0.35, 0.08, 'sawtooth');
}

/** 🔥 Короткий позитивный джингл — серия (streak) */
export function playStreak(): void {
  const notes = [523.25, 783.99, 1046.5, 1318.5];
  notes.forEach((freq, i) => {
    playTone(freq, i * 0.07, 0.3, 0.14, 'sine');
  });
}

/** ⭐ Финальный торжественный звук — завершение сессии */
export function playSessionComplete(stars: number): void {
  if (stars === 3) {
    // Полная фанфара
    [523.25, 659.25, 783.99, 1046.5, 1318.5].forEach((f, i) => {
      playTone(f, i * 0.1, 0.55, 0.16, 'sine');
    });
    playTone(1046.5, 0.5, 0.8, 0.1, 'triangle');
  } else if (stars >= 1) {
    [523.25, 659.25, 783.99].forEach((f, i) => {
      playTone(f, i * 0.1, 0.45, 0.14, 'sine');
    });
  } else {
    playTone(350, 0, 0.3, 0.12, 'sawtooth');
    playTone(300, 0.25, 0.4, 0.1, 'sawtooth');
  }
}
