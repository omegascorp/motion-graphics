import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {CONFIG, sec} from '../config';
import {alpha, easeOut, progress} from '../motion';
import {Backdrop} from './Backdrop';

const B = CONFIG.brand;
const T = CONFIG.transitions;

export type Enter = {type: 'iris'; origin: {x: number; y: number}} | null;

type Props = {
	/** Global frame this scene starts on, so the backdrop stays continuous. */
	start: number;
	/** Frames this scene is on screen before the next one starts covering it. */
	duration: number;
	enter: Enter;
	/** Whether the next scene covers this one with a transition (then sink back). */
	coveredByNext: boolean;
	children: React.ReactNode;
};

/**
 * Wraps a scene with the shared backdrop and its transitions: an iris-in when it
 * arrives, and a gentle sink (scale + dim) while the next scene covers it.
 */
export const SceneShell: React.FC<Props> = ({start, duration, enter, coveredByNext, children}) => {
	const frame = useCurrentFrame();
	const {width, height} = useVideoConfig();
	const tDur = sec(T.dur);

	const sink = coveredByNext ? progress(frame, duration, tDur) : 0;
	const sinkStyle: React.CSSProperties = {
		transform: `scale(${interpolate(sink, [0, 1], [1, T.sink.scale])})`,
		filter: sink > 0 ? `brightness(${1 - T.sink.dim * sink}) blur(${sink * 4}px)` : undefined,
	};

	let clip: string | undefined;
	let ring: React.ReactNode = null;
	if (enter?.type === 'iris' && frame < tDur) {
		const p = interpolate(frame, [0, tDur], [0, 1], {extrapolateRight: 'clamp', easing: easeOut});
		const {x, y} = enter.origin;
		const maxR = Math.hypot(Math.max(x, width - x), Math.max(y, height - y));
		const r = p * maxR;
		clip = `circle(${r}px at ${x}px ${y}px)`;
		ring = (
			<div
				style={{
					position: 'absolute',
					left: x - r,
					top: y - r,
					width: r * 2,
					height: r * 2,
					borderRadius: '50%',
					border: `3px solid ${alpha(B.textTo, 0.9 * (1 - p))}`,
					boxShadow: `0 0 40px 8px ${alpha(B.blue, 0.7 * (1 - p))}, inset 0 0 40px 8px ${alpha(B.purple, 0.6 * (1 - p))}`,
				}}
			/>
		);
	}

	return (
		<AbsoluteFill>
			<AbsoluteFill style={{clipPath: clip, ...sinkStyle}}>
				<Backdrop frame={start + frame} />
				{children}
			</AbsoluteFill>
			{ring}
		</AbsoluteFill>
	);
};
