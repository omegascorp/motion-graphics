import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {CONFIG, sec} from '../config';
import {DISPLAY} from '../fonts';
import {arrive, lerp, progress} from '../motion';
import {BASE_NODES, NETWORK} from '../network/layout';
import {Network} from '../network/Network';

const B = CONFIG.brand;
const S = CONFIG.scenes.network;

// Entrance schedule (frames), computed once.
export const nodeEnter: Record<string, number> = {you: sec(S.youAt)};
BASE_NODES.filter((id) => id !== 'you').forEach((id, i) => {
	nodeEnter[id] = sec(S.ringAt + i * S.ringStagger);
});
export const edgeEnter: Record<string, number> = {};
NETWORK.edges
	.filter((e) => !e.extra)
	.forEach((e, i) => {
		edgeEnter[e.key] = sec(S.linesAt + i * S.lineStagger);
	});

export const NetworkReveal: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const pull = progress(frame, 0, sec(S.camera.pullDur));
	const caption = arrive(frame, sec(S.captionAt), fps);

	return (
		<AbsoluteFill>
			<Network
				frame={frame}
				clock={sec(S.start) + frame}
				camera={{
					scale: lerp(S.camera.fromScale, S.camera.toScale, pull),
					x: 0,
					y: 0,
					tilt: lerp(S.camera.fromTilt, 0, pull),
					roll: lerp(S.camera.fromRoll, 0, pull),
				}}
				nodes={BASE_NODES}
				nodeEnter={nodeEnter}
				edgeEnter={edgeEnter}
				edgeDraw={sec(S.lineDraw)}
				populate={0}
				snippet={0}
			/>
			<div
				style={{
					position: 'absolute',
					bottom: 48,
					width: '100%',
					textAlign: 'center',
					fontFamily: DISPLAY,
					fontSize: 44,
					fontWeight: 700,
					letterSpacing: '-0.02em',
					color: B.text,
					opacity: Math.min(1, caption),
					transform: `translateY(${interpolate(caption, [0, 1], [16, 0])}px)`,
				}}
			>
				{S.caption}
			</div>
		</AbsoluteFill>
	);
};
