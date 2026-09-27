import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {CONFIG, sec} from '../config';
import {SANS} from '../fonts';
import {alpha, arrive, lerp, progress} from '../motion';
import {ALL_NODES, EXTRA_NODES, NETWORK, SOCIAL_FLIGHTS} from '../network/layout';
import {Camera, Network} from '../network/Network';

const B = CONFIG.brand;
const S = CONFIG.scenes.social;

const nodeEnter: Record<string, number> = {};
EXTRA_NODES.forEach((id, i) => {
	nodeEnter[id] = sec(S.extrasAt + i * S.extraStagger);
});
const edgeEnter: Record<string, number> = {};
NETWORK.edges
	.filter((e) => e.extra)
	.forEach((e, i) => {
		edgeEnter[e.key] = sec(S.edgesAt + i * S.lineStagger);
	});

/** Camera at a social-scene-local frame; the CTA continues from its end value. */
export const socialCamera = (frame: number): Camera => {
	const t = progress(frame, 0, sec(S.duration));
	return {scale: lerp(S.camera.fromScale, S.camera.toScale, t), x: 0, y: S.camera.y};
};

/** The dense network, shared with the CTA so the flow never stops. */
export const DenseNetwork: React.FC<{frame: number; camera: Camera; style?: React.CSSProperties}> = ({
	frame,
	camera,
	style,
}) => (
	<Network
		frame={frame}
		camera={camera}
		nodes={ALL_NODES}
		nodeEnter={nodeEnter}
		edgeEnter={edgeEnter}
		edgeDraw={sec(S.lineDraw)}
		flights={SOCIAL_FLIGHTS}
		populate={1}
		snippet={1}
		style={style}
	/>
);

export const SocialProof: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const caption = arrive(frame, sec(S.captionAt), fps);

	return (
		<AbsoluteFill style={{background: B.bg}}>
			<DenseNetwork frame={frame} camera={socialCamera(frame)} />
			<AbsoluteFill style={{background: `linear-gradient(180deg, transparent 72%, ${alpha(B.bg, 0.95)} 100%)`}} />
			<div
				style={{
					position: 'absolute',
					bottom: 52,
					width: '100%',
					textAlign: 'center',
					fontFamily: SANS,
					fontSize: 64,
					fontWeight: 700,
					letterSpacing: -1,
					color: B.text,
					opacity: Math.min(1, caption),
					transform: `translateY(${interpolate(caption, [0, 1], [24, 0])}px)`,
				}}
			>
				{S.caption}
			</div>
		</AbsoluteFill>
	);
};
