import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {Caption} from '../components/Caption';
import {CONFIG, sec} from '../config';
import {SANS} from '../fonts';
import {alpha, arrive, progress} from '../motion';
import {raised} from '../style';

const B = CONFIG.brand;
const S = CONFIG.scenes.fair;
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

type Row = (typeof S.rows)[number];

/** Scene-local frames for a row: slide in, then its verdict lands. */
export const fairRowTimes = (index: number) => {
	const inAt = sec(S.rowsAt + index * S.rowStagger);
	return {inAt, verdictAt: inAt + sec(S.verdictDelay)};
};

export const FairPlay: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const foot = arrive(frame, sec(S.footnoteAt), fps);
	return (
		<AbsoluteFill style={{fontFamily: SANS, alignItems: 'center'}}>
			<Caption text={S.headline} accent={S.headlineAccent} at={sec(S.headlineAt)} sweep={[sec(0.6), sec(1.5)]} top={170} />
			<div style={{position: 'absolute', top: 350, width: 1200, display: 'flex', flexDirection: 'column', gap: 20}}>
				{S.rows.map((row, i) => (
					<FairRow key={row.label} row={row} index={i} frame={frame} />
				))}
			</div>
			<div
				style={{
					position: 'absolute',
					top: 870,
					display: 'flex',
					alignItems: 'center',
					gap: 14,
					fontSize: 30,
					color: B.muted,
					opacity: Math.min(1, foot),
					transform: `translateY(${interpolate(foot, [0, 1], [20, 0])}px)`,
				}}
			>
				<svg width={32} height={32} viewBox="0 0 24 24">
					<circle cx="12" cy="12" r="9" fill="none" stroke={B.textTo} strokeWidth={2} />
					<path d="M12 7v5l3 2" fill="none" stroke={B.textTo} strokeWidth={2} strokeLinecap="round" />
				</svg>
				{S.footnote}
			</div>
		</AbsoluteFill>
	);
};

const FairRow: React.FC<{row: Row; index: number; frame: number}> = ({row, index, frame}) => {
	const {fps} = useVideoConfig();
	const {inAt, verdictAt} = fairRowTimes(index);
	const enter = arrive(frame, inAt, fps);
	const verdict = arrive(frame, verdictAt, fps);
	const color = row.ok ? B.green : B.red;
	const strike = row.ok ? 0 : progress(frame, verdictAt + sec(0.1), sec(0.3));
	const dim = row.ok ? 0 : progress(frame, verdictAt + sec(0.4), sec(0.4));
	const wash = interpolate(frame - verdictAt, [0, sec(0.1), sec(0.7)], [0, 0.28, 0.1], clamp);

	return (
		<div
			style={{
				height: 128,
				borderRadius: 22,
				display: 'flex',
				alignItems: 'center',
				gap: 26,
				padding: '0 36px',
				border: `1px solid ${frame >= verdictAt ? alpha(color, 0.4) : alpha('#FFFFFF', 0.06)}`,
				opacity: Math.min(1, enter) * (1 - 0.45 * dim),
				filter: `blur(${interpolate(enter, [0, 1], [8, 0], clamp)}px)`,
				transform: `translateX(${interpolate(enter, [0, 1], [120, 0])}px)`,
				...raised(),
				background: `linear-gradient(90deg, ${alpha(color, wash)} 0%, ${B.surface} 70%)`,
			}}
		>
			<div
				style={{
					width: 60,
					height: 60,
					borderRadius: 30,
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					background: alpha(color, 0.15 * Math.min(1, verdict)),
					border: `2px solid ${alpha(color, Math.min(1, verdict))}`,
				}}
			>
				<svg width={30} height={30} viewBox="0 0 24 24" style={{opacity: Math.min(1, verdict), transform: `scale(${Math.min(1.2, verdict)})`}}>
					{row.ok ? (
						<path d="M4 12.5l5 5L20 6.5" fill="none" stroke={color} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
					) : (
						<path d="M6 6l12 12M18 6L6 18" fill="none" stroke={color} strokeWidth={3} strokeLinecap="round" />
					)}
				</svg>
			</div>
			<div style={{position: 'relative', fontSize: 40, fontWeight: 600, color: B.text, letterSpacing: '-0.01em'}}>
				{row.label}
				<div
					style={{
						position: 'absolute',
						left: -4,
						top: '54%',
						height: 3,
						width: `calc(${strike * 100}% + 8px)`,
						background: B.red,
						borderRadius: 2,
						boxShadow: `0 0 10px ${B.red}`,
						opacity: strike > 0 ? 1 : 0,
					}}
				/>
			</div>
			<div
				style={{
					marginLeft: 'auto',
					padding: '12px 26px',
					borderRadius: 999,
					background: alpha(color, 0.16),
					border: `2px solid ${alpha(color, 0.7)}`,
					color,
					fontSize: 28,
					fontWeight: 800,
					whiteSpace: 'nowrap',
					opacity: Math.min(1, verdict * 1.5),
					transform: `scale(${interpolate(verdict, [0, 1], [1.6, 1])}) rotate(${row.ok ? 0 : interpolate(verdict, [0, 1], [-12, -3])}deg)`,
					boxShadow: `0 0 ${24 * Math.min(1, verdict)}px ${alpha(color, 0.45)}`,
				}}
			>
				{row.verdict}
			</div>
		</div>
	);
};
