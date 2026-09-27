import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {CONFIG, sec} from '../config';
import {DISPLAY} from '../fonts';
import {KineticWords} from '../components/KineticWords';
import {alpha, arrive, lerp, progress} from '../motion';
import {ALL_NODES, EXTRA_NODES, NETWORK, SOCIAL_FLIGHTS} from '../network/layout';
import {Camera, Network} from '../network/Network';

const B = CONFIG.brand;
const S = CONFIG.scenes.social;

export const extraEnter: Record<string, number> = {};
EXTRA_NODES.forEach((id, i) => {
	extraEnter[id] = sec(S.extrasAt + i * S.extraStagger);
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
	return {
		scale: lerp(S.camera.fromScale, S.camera.toScale, t),
		x: 0,
		y: S.camera.y,
		tilt: lerp(0, S.camera.toTilt, t),
		roll: lerp(0, S.camera.toRoll, t),
	};
};

/** The dense network, shared with the CTA so the flow never stops. */
export const DenseNetwork: React.FC<{frame: number; camera: Camera; style?: React.CSSProperties}> = ({
	frame,
	camera,
	style,
}) => (
	<Network
		frame={frame}
		clock={sec(S.start) + frame}
		camera={camera}
		nodes={ALL_NODES}
		nodeEnter={extraEnter}
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

	return (
		<AbsoluteFill>
			<DenseNetwork frame={frame} camera={socialCamera(frame)} />
			<AbsoluteFill style={{background: `linear-gradient(180deg, transparent 62%, ${alpha(B.black, 0.9)} 100%)`}} />
			<KineticWords
				text={S.caption}
				at={sec(S.captionAt)}
				stagger={sec(S.captionStagger)}
				accent={[...S.captionAccent]}
				sweep={[sec(S.captionSweep[0]), sec(S.captionSweep[1])]}
				style={{
					position: 'absolute',
					bottom: 60,
					width: '100%',
					fontFamily: DISPLAY,
					fontSize: 84,
					fontWeight: 800,
					letterSpacing: '-0.03em',
					color: B.text,
				}}
			/>
		</AbsoluteFill>
	);
};
