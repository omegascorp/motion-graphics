import React from 'react';
import {interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {arrive} from '../motion';
import {gradientText} from '../style';

type Props = {
	text: string;
	/** Frame the first word lands on. */
	at: number;
	/** Frames between words. */
	stagger: number;
	/** Words (exact, with punctuation) drawn in the brand text gradient. */
	accent?: string[];
	/** Frame range [start, end] for a light sweep across the accent words. */
	sweep?: [number, number];
	style?: React.CSSProperties;
};

/** A line whose words rise, un-blur and settle one after another. */
export const KineticWords: React.FC<Props> = ({text, at, stagger, accent = [], sweep, style}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const s = sweep ? interpolate(frame, sweep, [0, 1]) : -1;
	return (
		<div style={{display: 'flex', justifyContent: 'center', gap: '0.26em', ...style}}>
			{text.split(' ').map((w, i) => {
				const a = arrive(frame, at + i * stagger, fps);
				return (
					<span
						key={i}
						style={{
							display: 'inline-block',
							opacity: Math.min(1, a),
							filter: `blur(${interpolate(a, [0, 1], [10, 0], {extrapolateRight: 'clamp'})}px)`,
							transform: `translateY(${interpolate(a, [0, 1], [34, 0])}px)`,
							...(accent.includes(w) ? gradientText(s) : {}),
						}}
					>
						{w}
					</span>
				);
			})}
		</div>
	);
};
