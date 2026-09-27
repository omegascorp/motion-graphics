import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {CONFIG, sec} from '../config';
import {SANS} from '../fonts';
import {arrive, progress} from '../motion';

const B = CONFIG.brand;
const S = CONFIG.scenes.hook;

export const Hook: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const words = S.line1.split(' ');
	const line2 = progress(frame, sec(S.line2At), sec(S.line2Fade));
	const out = progress(frame, sec(S.fadeOutAt), sec(S.fadeOutDur));

	return (
		<AbsoluteFill
			style={{
				background: B.black,
				alignItems: 'center',
				justifyContent: 'center',
				flexDirection: 'column',
				gap: 28,
				fontFamily: SANS,
				opacity: 1 - out,
			}}
		>
			<div style={{display: 'flex', gap: '0.28em', fontSize: 96, fontWeight: 700, color: B.text, letterSpacing: -1.5}}>
				{words.map((w, i) => {
					const s = arrive(frame, sec(S.wordsAt + i * S.wordStagger), fps);
					return (
						<span
							key={i}
							style={{
								display: 'inline-block',
								opacity: Math.min(1, s),
								transform: `translateY(${interpolate(s, [0, 1], [18, 0])}px)`,
							}}
						>
							{w}
						</span>
					);
				})}
			</div>
			<div
				style={{
					fontSize: 64,
					fontWeight: 500,
					color: B.accent,
					opacity: line2,
					transform: `translateY(${interpolate(line2, [0, 1], [16, 0])}px)`,
				}}
			>
				{S.line2}
			</div>
		</AbsoluteFill>
	);
};
