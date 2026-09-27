import React from 'react';
import {AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {CONFIG, sec} from '../config';
import {MONO, SANS} from '../fonts';
import {alpha, arrive, lerp, progress} from '../motion';
import {DenseNetwork, socialCamera} from './SocialProof';

const B = CONFIG.brand;
const S = CONFIG.scenes.cta;
const SOCIAL_FRAMES = sec(CONFIG.scenes.social.duration);

export const CTA: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const recede = progress(frame, 0, sec(S.recedeDur));
	const from = socialCamera(SOCIAL_FRAMES);

	const rise = (at: number) => {
		const s = arrive(frame, sec(at), fps);
		return {opacity: Math.min(1, s), transform: `translateY(${interpolate(s, [0, 1], [24, 0])}px)`};
	};
	const button = arrive(frame, sec(S.buttonAt), fps);

	return (
		<AbsoluteFill style={{background: B.bg}}>
			<DenseNetwork
				frame={SOCIAL_FRAMES + frame}
				camera={{...from, scale: lerp(from.scale, S.camera.toScale, recede)}}
				style={{filter: `blur(${recede * S.blurTo}px)`, opacity: lerp(1, S.dimTo, recede)}}
			/>
			<AbsoluteFill
				style={{
					background: `radial-gradient(ellipse at center, ${alpha(B.bg, 0.85 * recede)} 0%, ${alpha(B.bg, 0.4 * recede)} 70%)`,
				}}
			/>
			<AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column', fontFamily: SANS}}>
				<Img src={staticFile(CONFIG.assets.wordmark)} style={{width: S.wordmarkWidth, ...rise(S.wordmarkAt)}} />
				<div style={{marginTop: 34, fontSize: 52, fontWeight: 500, color: B.text, ...rise(S.taglineAt)}}>
					{S.tagline}
				</div>
				<div
					style={{
						marginTop: 52,
						padding: '24px 52px',
						borderRadius: 999,
						background: B.accent,
						color: B.adText,
						fontSize: 38,
						fontWeight: 700,
						opacity: Math.min(1, button),
						transform: `scale(${interpolate(button, [0, 1], [0.85, 1])})`,
						boxShadow: `0 12px 40px ${alpha(B.accent, 0.35)}`,
					}}
				>
					{S.button}
				</div>
				<div style={{marginTop: 30, fontFamily: MONO, fontSize: 32, color: B.muted, ...rise(S.urlAt)}}>{S.url}</div>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};
