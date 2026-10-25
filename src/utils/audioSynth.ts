// Web Audio API Synthesizer for Retro Mechanical Escapement & Brass Chimes

let audioCtx: AudioContext | null = null;
let tickCount = 0;

export function unlockAudio(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  try {
    if (!audioCtx) {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  } catch (err) {
    console.warn('AudioContext unlock failed:', err);
  }
  return audioCtx;
}

/**
 * Authentic alternating antique wooden mantel clock tick-tock
 */
export function playClockTick(isSubtle = false): void {
  try {
    const ctx = unlockAudio();
    if (!ctx) return;

    tickCount++;
    const isTick = tickCount % 2 === 0;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    // Alternating frequencies for natural "tick... tock..." rhythm
    const baseFreq = isTick ? 850 : 640;
    const filterFreq = isTick ? 2400 : 1800;

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(filterFreq, ctx.currentTime);
    filter.Q.setValueAtTime(3.5, ctx.currentTime);

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(baseFreq, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(140, ctx.currentTime + 0.04);

    // Warm, crisp mechanical volume
    const volume = isSubtle ? 0.12 : 0.18;
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.045);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.05);
  } catch {
    // Ignore audio errors on un-interacted gestures
  }
}

/**
 * Tactile brass dial detent click
 */
export function playDialClick(): void {
  try {
    const ctx = unlockAudio();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(280, ctx.currentTime + 0.02);

    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.02);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.025);
  } catch {
    // Ignore
  }
}

/**
 * Soft grandfather clock cathedral harmonic chime
 */
export function playMinuteChime(): void {
  try {
    const ctx = unlockAudio();
    if (!ctx) return;

    const frequencies = [523.25, 659.25, 783.99]; // C5, E5, G5 harmonic triad
    frequencies.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.12);

      const startTime = ctx.currentTime + idx * 0.12;
      const duration = 1.6;

      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.12, startTime + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + duration);
    });
  } catch {
    // Ignore
  }
}
