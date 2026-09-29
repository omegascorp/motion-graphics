import React from 'react';
import {AbsoluteFill, interpolate, useVideoConfig} from 'remotion';
import {CONFIG} from '../config';
import {alpha} from '../motion';

const B = CONFIG.brand;
const D = CONFIG.backdrop;

/** Glow level at a global frame, from the CONFIG keyframes. */
const glowAt = (frame: number, fps: number) =>
	interpolate(
		frame / fps,
		D.glow.map((k) => k.at),
		D.glow.map((k) => k.v),
		{extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
	);

/**
 * The world every scene sits in: deep canvas, two slow-drifting brand glows,
 * a faint dot grid fading out from the centre, film grain and a vignette.
 * Driven by the *global* frame so it flows continuously across cuts.
 */
export const Backdrop: React.FC<{frame: number}> = ({frame}) => {
	const {fps, width, height} = useVideoConfig();
	const glow = glowAt(frame, fps);
	const t = frame / fps;
	const g1 = {x: 28 + Math.sin(t * 0.21) * 8, y: 22 + Math.cos(t * 0.17) * 7};
	const g2 = {x: 74 + Math.cos(t * 0.19) * 8, y: 80 + Math.sin(t * 0.23) * 6};
	const grid = D.grid;
	const drift = (t * 6) % grid.gap;

	return (
		<AbsoluteFill style={{background: B.bg, overflow: 'hidden'}}>
			<AbsoluteFill
				style={{
					background: [
						`radial-gradient(ellipse 55% 60% at ${g1.x}% ${g1.y}%, ${alpha(B.purple, 0.42 * glow)} 0%, transparent 70%)`,
						`radial-gradient(ellipse 60% 55% at ${g2.x}% ${g2.y}%, ${alpha(B.blue, 0.3 * glow)} 0%, transparent 70%)`,
					].join(', '),
				}}
			/>
			<svg
				width={width}
				height={height}
				style={{
					position: 'absolute',
					opacity: grid.opacity * Math.min(1, glow),
					WebkitMaskImage: 'radial-gradient(ellipse 70% 65% at 50% 50%, black 10%, transparent 80%)',
				}}
			>
				<defs>
					<pattern id="bd-grid" width={grid.gap} height={grid.gap} patternUnits="userSpaceOnUse" x={drift} y={drift * 0.5}>
						<circle cx={grid.gap / 2} cy={grid.gap / 2} r={grid.dot} fill={B.lineHi} />
					</pattern>
				</defs>
				<rect width={width} height={height} fill="url(#bd-grid)" />
			</svg>
			<svg width={width} height={height} style={{position: 'absolute', opacity: D.grain, mixBlendMode: 'overlay'}}>
				<filter id="bd-grain">
					<feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={frame % 7} stitchTiles="stitch" />
					<feColorMatrix type="saturate" values="0" />
				</filter>
				<rect width={width} height={height} filter="url(#bd-grain)" />
			</svg>
			<AbsoluteFill
				style={{
					background: `radial-gradient(ellipse 85% 80% at 50% 50%, transparent 55%, ${alpha(B.black, D.vignette)} 100%)`,
				}}
			/>
		</AbsoluteFill>
	);
};
