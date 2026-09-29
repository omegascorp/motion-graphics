import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {CONFIG, sec} from '../config';
import {DISPLAY, SANS} from '../fonts';
import {arrive, easeOut, progress} from '../motion';
import {brandGlow, gradientText} from '../style';

const B = CONFIG.brand;
const S = CONFIG.scenes.hook;

/** A word landing: rises, un-blurs and settles with the arrival spring. */
const Word: React.FC<{text: string; at: number; accent: boolean}> = ({text, at, accent}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const s = arrive(frame, at, fps);
	const sweep = accent ? interpolate(frame, [sec(S.sweepAt), sec(S.sweepAt + S.sweepDur)], [0, 1]) : -1;
	const underline = accent ? progress(frame, sec(S.sweepAt - 0.15), sec(0.5)) : 0;
	return (
		<span
			style={{
				position: 'relative',
				display: 'inline-block',
				opacity: Math.min(1, s),
				filter: `blur(${interpolate(s, [0, 1], [14, 0], {extrapolateRight: 'clamp'})}px)`,
				transform: `translateY(${interpolate(s, [0, 1], [44, 0])}px) scale(${interpolate(s, [0, 1], [0.88, 1])})`,
				...(accent ? gradientText(sweep) : {}),
			}}
		>
			{text}
			{accent ? (
				<svg
					width="100%"
					height={28}
					viewBox="0 0 100 28"
					preserveAspectRatio="none"
					style={{position: 'absolute', left: 0, bottom: -22, overflow: 'visible'}}
				>
					<defs>
						<linearGradient id="hook-ul" x1="0" x2="1">
							<stop offset="0" stopColor={B.textFrom} />
							<stop offset="1" stopColor={B.blue} />
						</linearGradient>
					</defs>
					<path
						d="M2 18 C 30 6, 60 6, 98 14"
						fill="none"
						stroke="url(#hook-ul)"
						strokeWidth={4}
						strokeLinecap="round"
						pathLength={1}
						strokeDasharray={1}
						strokeDashoffset={1 - underline}
					/>
				</svg>
			) : null}
		</span>
	);
};

export const Hook: React.FC = () => {
	const frame = useCurrentFrame();
	const words = S.line1.split(' ');
	const line2 = progress(frame, sec(S.line2At), sec(S.line2Fade));
	const out = progress(frame, sec(S.fadeOutAt), sec(S.fadeOutDur));
	const drift = 1 + S.drift * (frame / sec(S.duration));
	const exitScale = interpolate(out, [0, 1], [1, S.exitScale], {easing: easeOut});
	const [before, after] = S.line2.split(S.line2Accent);

	return (
		<AbsoluteFill
			style={{
				alignItems: 'center',
				justifyContent: 'center',
				flexDirection: 'column',
				gap: 44,
				opacity: 1 - out,
				filter: out > 0 ? `blur(${out * S.exitBlur}px)` : undefined,
				transform: `scale(${drift * exitScale})`,
			}}
		>
			<div
				style={{
					display: 'flex',
					flexWrap: 'wrap',
					justifyContent: 'center',
					maxWidth: 1300,
					columnGap: '0.24em',
					rowGap: '0.12em',
					fontFamily: DISPLAY,
					fontSize: 120,
					fontWeight: 800,
					letterSpacing: '-0.035em',
					color: B.text,
					lineHeight: 1,
				}}
			>
				{words.map((w, i) => (
					<Word key={i} text={w} at={sec(S.wordsAt + i * S.wordStagger)} accent={w === S.accentWord} />
				))}
			</div>
			<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16}}>
				<div
					style={{
						fontFamily: SANS,
						fontSize: 54,
						fontWeight: 500,
						color: B.muted,
						letterSpacing: '-0.01em',
						clipPath: `inset(-20% ${(1 - line2) * 100}% -20% 0)`,
						transform: `translateX(${(1 - line2) * -24}px)`,
					}}
				>
					{before}
					<span style={{color: B.pop, fontWeight: 700}}>{S.line2Accent}</span>
					{after}
				</div>
				{/* A thin brand light bar tucked under the line, growing from the centre */}
				<div
					style={{
						width: 520 * line2,
						height: 2,
						borderRadius: 2,
						background: brandGlow(90),
						boxShadow: `0 0 24px ${B.blue}`,
						opacity: 0.8 * line2,
					}}
				/>
			</div>
		</AbsoluteFill>
	);
};
