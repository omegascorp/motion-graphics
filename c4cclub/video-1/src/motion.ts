import {Easing, interpolate, spring} from 'remotion';
import {CONFIG} from './config';

export const easeOut = Easing.out(Easing.cubic);

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

/** Spring for things arriving (0 → ~1), starting at `delay` frames. */
export const arrive = (frame: number, delay: number, fps: number) =>
	spring({frame: frame - delay, fps, config: CONFIG.motion.spring});

/** Cubic ease-out progress 0 → 1 over [start, start + dur] frames. */
export const progress = (frame: number, start: number, dur: number) =>
	interpolate(frame, [start, start + Math.max(1, dur)], [0, 1], {...clamp, easing: easeOut});

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Hex colour + alpha (0–1) → #RRGGBBAA. */
export const alpha = (hex: string, a: number) =>
	hex + Math.round(Math.max(0, Math.min(1, a)) * 255).toString(16).padStart(2, '0');
