import React from 'react';
import {AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {KineticWords} from '../components/KineticWords';
import {CONFIG, sec} from '../config';
import {DISPLAY, MONO} from '../fonts';
import {alpha, arrive, lerp, progress} from '../motion';
import {brandFill} from '../style';
import {DenseNetwork, socialCamera} from './SocialProof';

const B = CONFIG.brand;
const S = CONFIG.scenes.cta;
const SOCIAL_FRAMES = sec(CONFIG.scenes.social.duration);
const WORDMARK_ASPECT = 93 / 489; // height / width of wordmark-on-dark.svg

/** Diagonal white light passing over its parent, driven by 0 → 1. */
const shine = (t: number) =>
	`linear-gradient(105deg, transparent ${t * 160 - 50}%, rgba(255,255,255,0.9) ${t * 160 - 35}%, transparent ${t * 160 - 20}%)`;

export const CTA: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const recede = progress(frame, 0, sec(S.recedeDur));
	const from = socialCamera(SOCIAL_FRAMES);
	const mark = arrive(frame, sec(S.wordmarkAt), fps);
	const markShine = interpolate(frame, [sec(S.shineAt), sec(S.shineAt + S.shineDur)], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});
	const button = arrive(frame, sec(S.buttonAt), fps);
	const buttonShine = interpolate(frame, [sec(S.buttonShineAt), sec(S.buttonShineAt + 0.7)], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});
	const breathe = 1 + 0.015 * Math.sin((frame - sec(S.buttonAt)) / 6) * Math.min(1, button);
	const url = arrive(frame, sec(S.urlAt), fps);
	const markW = S.wordmarkWidth;

	return (
		<AbsoluteFill>
			<DenseNetwork
				frame={SOCIAL_FRAMES + frame}
				camera={{
					...from,
					scale: lerp(from.scale, S.camera.toScale, recede),
					tilt: lerp(from.tilt ?? 0, S.camera.toTilt, recede),
				}}
				style={{filter: `blur(${recede * S.blurTo}px)`, opacity: lerp(1, S.dimTo, recede)}}
			/>
			{/* Brand glow pooling behind the lockup */}
			<AbsoluteFill
				style={{
					background: [
						`radial-gradient(ellipse 34% 30% at 50% 44%, ${alpha(B.violet, 0.55 * recede)} 0%, transparent 70%)`,
						`radial-gradient(ellipse 80% 70% at 50% 50%, ${alpha(B.bg, 0.8 * recede)} 0%, ${alpha(B.bg, 0.35 * recede)} 75%)`,
					].join(', '),
				}}
			/>
			<AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column'}}>
				<div
					style={{
						position: 'relative',
						width: markW,
						height: markW * WORDMARK_ASPECT,
						opacity: Math.min(1, mark),
						filter: `blur(${interpolate(mark, [0, 1], [16, 0], {extrapolateRight: 'clamp'})}px) drop-shadow(0 0 30px ${alpha(B.blue, 0.5)})`,
						transform: `translateY(${interpolate(mark, [0, 1], [30, 0])}px) scale(${interpolate(mark, [0, 1], [0.9, 1])})`,
					}}
				>
					<Img src={staticFile(CONFIG.assets.wordmark)} style={{width: '100%', display: 'block'}} />
					{/* Shine clipped to the wordmark's own shape */}
					<div
						style={{
							position: 'absolute',
							inset: 0,
							background: shine(markShine),
							WebkitMaskImage: `url(${staticFile(CONFIG.assets.wordmark)})`,
							WebkitMaskSize: '100% 100%',
							opacity: markShine > 0 && markShine < 1 ? 1 : 0,
						}}
					/>
				</div>
				<KineticWords
					text={S.tagline}
					at={sec(S.taglineAt)}
					stagger={sec(0.05)}
					accent={[...S.taglineAccent]}
					sweep={[sec(S.shineAt + 0.2), sec(S.shineAt + 1)]}
					style={{marginTop: 38, fontFamily: DISPLAY, fontSize: 60, fontWeight: 700, letterSpacing: '-0.025em', color: B.text}}
				/>
				<div
					style={{
						position: 'relative',
						marginTop: 54,
						padding: '26px 58px',
						borderRadius: 999,
						overflow: 'hidden',
						background: brandFill(),
						color: '#FFFFFF',
						fontFamily: DISPLAY,
						fontSize: 40,
						fontWeight: 700,
						letterSpacing: '-0.01em',
						display: 'flex',
						alignItems: 'center',
						gap: 16,
						opacity: Math.min(1, button),
						transform: `scale(${interpolate(button, [0, 1], [0.8, 1]) * breathe})`,
						boxShadow: `inset 0 1px 0 ${alpha('#FFFFFF', 0.3)}, 0 0 0 1px ${alpha(B.textTo, 0.35)}, 0 14px 50px ${alpha(B.blue, 0.55)}`,
					}}
				>
					{S.button}
					<span style={{transform: `translateX(${Math.max(0, Math.sin((frame - sec(S.buttonAt)) / 5)) * 6}px)`}}>→</span>
					<div style={{position: 'absolute', inset: 0, background: shine(buttonShine), opacity: 0.6}} />
				</div>
				<div
					style={{
						marginTop: 32,
						fontFamily: MONO,
						fontSize: 32,
						color: B.muted,
						letterSpacing: '0.04em',
						opacity: Math.min(1, url),
						transform: `translateY(${interpolate(url, [0, 1], [20, 0])}px)`,
					}}
				>
					{S.url}
				</div>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};
