import React from 'react';
import {Easing, interpolate} from 'remotion';
import {CONFIG} from '../config';
import {brandFill} from '../style';

// Ported from the c4c.club app: src/components/brand/CreditCoin.tsx (+ .credit-coin in globals.css).

/**
 * The club sign: Figtree's capital C outlined from the font, with short square-cut
 * bars through its top and bottom the way $ carries its stroke. 32-unit face.
 */
const SIGN = {
	letter:
		'M16.34 24L16.34 24Q14.04 24 12.29 22.97Q10.53 21.94 9.52 20.14Q8.52 18.34 8.52 16L8.52 16Q8.52 13.66 9.52 11.86Q10.53 10.06 12.29 9.03Q14.04 8 16.34 8L16.34 8Q18.02 8 19.43 8.59Q20.83 9.17 21.86 10.23Q22.88 11.29 23.44 12.69L23.44 12.69L20.1 13.81Q19.77 13.04 19.2 12.46Q18.64 11.89 17.92 11.58Q17.2 11.27 16.34 11.27L16.34 11.27Q15.13 11.27 14.18 11.87Q13.23 12.46 12.7 13.54Q12.17 14.61 12.17 16L12.17 16Q12.17 17.39 12.71 18.46Q13.25 19.54 14.21 20.14Q15.17 20.75 16.41 20.75L16.41 20.75Q17.31 20.75 18.02 20.42Q18.73 20.09 19.25 19.49Q19.77 18.9 20.14 18.12L20.14 18.12L23.48 19.25Q22.95 20.66 21.91 21.73Q20.87 22.81 19.46 23.4Q18.04 24 16.34 24',
	bars: [
		{x: 13.6, y: 5.4, width: 1.7, height: 3.6},
		{x: 16.7, y: 5.4, width: 1.7, height: 3.6},
		{x: 13.6, y: 23, width: 1.7, height: 3.6},
		{x: 16.7, y: 23, width: 1.7, height: 3.6},
	],
};

/** The app's coin-flip curve: cubic-bezier(0.34, 1.4, 0.64, 1), a slight overshoot. */
const flipEase = Easing.bezier(0.34, 1.4, 0.64, 1);

/** Degrees of the one-shot flip, `t` = 0 → 1 through the flip (clamped). */
export const coinFlip = (t: number) =>
	interpolate(t, [0, 1], [0, 360], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: flipEase});

/** A single credit: a struck brand-gradient disc carrying the club sign. */
export const CreditCoin: React.FC<{size: number; rotateY?: number; glow?: number}> = ({size, rotateY = 0, glow = 0}) => (
	<div
		style={{
			width: size,
			height: size,
			flexShrink: 0,
			borderRadius: size,
			backgroundImage: brandFill(),
			boxShadow: [
				'inset 0 1px 0 rgba(255,255,255,0.35)',
				'inset 0 0 0 1px rgba(0,0,0,0.12)',
				glow > 0 ? `0 0 ${Math.round(size * 0.8 * glow)}px ${CONFIG.brand.blue}` : '',
			]
				.filter(Boolean)
				.join(', '),
			transform: `rotateY(${rotateY}deg)`,
		}}
	>
		<svg viewBox="0 0 32 32" width={size} height={size} style={{display: 'block'}}>
			{/* Struck edge, then a bevel just inside it */}
			<circle cx="16" cy="16" r="15.1" fill="none" stroke="rgba(14,8,40,0.45)" strokeWidth={1.5} />
			<circle cx="16" cy="16" r="13.3" fill="none" stroke="white" strokeOpacity={0.38} strokeWidth={0.9} />
			<g fill="white">
				<path d={SIGN.letter} />
				{SIGN.bars.map((bar) => (
					<rect key={`${bar.x}-${bar.y}`} {...bar} />
				))}
			</g>
		</svg>
	</div>
);
