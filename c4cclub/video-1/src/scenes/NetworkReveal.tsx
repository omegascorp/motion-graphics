import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {CONFIG, sec} from '../config';
import {SANS} from '../fonts';
import {arrive, lerp, progress} from '../motion';
import {BASE_NODES, NETWORK} from '../network/layout';
import {Network} from '../network/Network';

const B = CONFIG.brand;
const S = CONFIG.scenes.network;

// Entrance schedule (frames), computed once.
const nodeEnter: Record<string, number> = {you: sec(S.youAt)};
BASE_NODES.filter((id) => id !== 'you').forEach((id, i) => {
	nodeEnter[id] = sec(S.ringAt + i * S.ringStagger);
});
const edgeEnter: Record<string, number> = {};
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
		<AbsoluteFill style={{background: B.bg}}>
			<Network
				frame={frame}
				camera={{scale: lerp(S.camera.fromScale, S.camera.toScale, pull), x: 0, y: 0}}
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
					fontFamily: SANS,
					fontSize: 34,
					fontWeight: 500,
					color: B.muted,
					opacity: Math.min(1, caption),
					transform: `translateY(${interpolate(caption, [0, 1], [16, 0])}px)`,
				}}
			>
				{S.caption}
			</div>
		</AbsoluteFill>
	);
};
