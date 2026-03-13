/**
 * Web Audio API sound palette for TodFod Season 2.
 * All functions fail silently if AudioContext is unavailable or muted.
 */

let _ctx: AudioContext | null = null;
let _muted = false;

function ctx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (_muted) return null;
  try {
    if (!_ctx) _ctx = new AudioContext();
    if (_ctx.state === 'suspended') _ctx.resume();
    return _ctx;
  } catch {
    return null;
  }
}

export function setSoundMuted(v: boolean) { _muted = v; }
export function isSoundMuted() { return _muted; }

// Ascending C-E-G chime — correct answer
export function playCorrect() {
  const c = ctx(); if (!c) return;
  [523.25, 659.25, 783.99].forEach((freq, i) => {
    const o = c.createOscillator(), g = c.createGain();
    o.connect(g); g.connect(c.destination);
    o.type = 'sine'; o.frequency.value = freq;
    const t = c.currentTime + i * 0.09;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.22, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
    o.start(t); o.stop(t + 0.55);
  });
}

// Descending sawtooth whoosh — puzzle launch
export function playWhoosh() {
  const c = ctx(); if (!c) return;
  const o = c.createOscillator(), g = c.createGain();
  o.connect(g); g.connect(c.destination);
  o.type = 'sawtooth';
  o.frequency.setValueAtTime(400, c.currentTime);
  o.frequency.exponentialRampToValueAtTime(80, c.currentTime + 0.45);
  g.gain.setValueAtTime(0.16, c.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.45);
  o.start(c.currentTime); o.stop(c.currentTime + 0.5);
}

// Rising A-C#-E stab — rank up
export function playRankUp() {
  const c = ctx(); if (!c) return;
  [440, 554.37, 659.25].forEach((freq, i) => {
    const o = c.createOscillator(), g = c.createGain();
    o.connect(g); g.connect(c.destination);
    o.type = 'triangle'; o.frequency.value = freq;
    const t = c.currentTime + i * 0.08;
    g.gain.setValueAtTime(0.18, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
    o.start(t); o.stop(t + 0.4);
  });
}

// Short tick — countdown
export function playTick() {
  const c = ctx(); if (!c) return;
  const o = c.createOscillator(), g = c.createGain();
  o.connect(g); g.connect(c.destination);
  o.type = 'square'; o.frequency.value = 900;
  g.gain.setValueAtTime(0.035, c.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.06);
  o.start(c.currentTime); o.stop(c.currentTime + 0.07);
}

// Low buzzer — time's up
export function playBuzz() {
  const c = ctx(); if (!c) return;
  const o = c.createOscillator(), g = c.createGain();
  o.connect(g); g.connect(c.destination);
  o.type = 'sawtooth'; o.frequency.value = 140;
  g.gain.setValueAtTime(0.28, c.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.9);
  o.start(c.currentTime); o.stop(c.currentTime + 0.95);
}
