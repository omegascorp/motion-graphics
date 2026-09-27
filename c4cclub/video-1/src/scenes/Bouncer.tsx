import React from 'react';
import {AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {CONFIG, sec, Tone} from '../config';
import {SANS} from '../fonts';
import {alpha, arrive, progress} from '../motion';

const B = CONFIG.brand;
const S = CONFIG.scenes.bouncer;
const toneColor = (t: Tone) => B[t];

export const Bouncer: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const panel = arrive(frame, sec(S.panelAt), fps);
	const head = arrive(frame, sec(S.headlineAt), fps);

	return (
		<AbsoluteFill style={{background: B.doorBg, alignItems: 'center', justifyContent: 'center', fontFamily: SANS}}>
			{/* The door */}
			<div
				style={{
					width: S.panel.w,
					height: S.panel.h,
					borderRadius: '40px 40px 14px 14px',
					background: `linear-gradient(180deg, ${B.surface} 0%, ${B.doorBg} 100%)`,
					border: `2px solid ${B.line}`,
					boxShadow: `0 -2px 0 ${alpha(B.accent, 0.5)} inset`,
					padding: '56px 72px',
					display: 'flex',
					flexDirection: 'column',
					opacity: Math.min(1, panel),
					transform: `scale(${interpolate(panel, [0, 1], [0.96, 1])})`,
				}}
			>
				<div
					style={{
						display: 'flex',
						alignItems: 'center',
						gap: 14,
						color: B.muted,
						fontSize: 24,
						fontWeight: 500,
						opacity: Math.min(1, head),
					}}
				>
					<Img src={staticFile(CONFIG.assets.icon)} style={{width: 36, height: 36}} />
					{S.kicker}
				</div>
				<div
					style={{
						marginTop: 18,
						fontSize: 60,
						fontWeight: 700,
						letterSpacing: -1,
						color: B.text,
						opacity: Math.min(1, head),
						transform: `translateY(${interpolate(head, [0, 1], [18, 0])}px)`,
					}}
				>
					{S.headline}
				</div>

				<div style={{marginTop: 56, display: 'flex', flexDirection: 'column', gap: 22}}>
					{S.rows.map((row, i) => (
						<VisitorRow key={row.label} index={i} frame={frame} />
					))}
				</div>
			</div>
		</AbsoluteFill>
	);
};

const VisitorRow: React.FC<{index: number; frame: number}> = ({index, frame}) => {
	const {fps} = useVideoConfig();
	const row = S.rows[index];
	const color = toneColor(row.tone);
	const inAt = sec(S.rowsAt + index * S.rowStagger);
	const enter = arrive(frame, inAt, fps);
	const fillAt = inAt + sec(S.fillDelay);
	const fill = progress(frame, fillAt, sec(S.fillDur));
	const statusAt = fillAt + sec(S.fillDur);
	const status = arrive(frame, statusAt, fps);

	// Rejected row: 2px shake, then dim.
	const shakeAt = statusAt + sec(0.1);
	const d = frame - shakeAt;
	const shaking = row.rejected && d >= 0 && d <= sec(S.shakeDur);
	const shake = shaking ? Math.sin(d * Math.PI * 0.75) * S.shakePx : 0;
	const dim = row.rejected ? progress(frame, shakeAt + sec(S.shakeDur), sec(S.dimDur)) : 0;

	return (
		<div
			style={{
				height: 116,
				borderRadius: 18,
				background: B.surface,
				border: `2px solid ${B.line}`,
				display: 'flex',
				alignItems: 'center',
				padding: '0 32px',
				gap: 28,
				opacity: Math.min(1, enter) * interpolate(dim, [0, 1], [1, S.dimTo]),
				transform: `translateX(${interpolate(enter, [0, 1], [90, 0]) + shake}px)`,
			}}
		>
			<div style={{fontSize: 48, width: 60, textAlign: 'center'}}>{row.flag}</div>
			<div style={{width: 340, fontSize: 32, fontWeight: 500, color: B.text}}>{row.label}</div>

			<div style={{display: 'flex', alignItems: 'center', gap: 18}}>
				<div style={{width: 220, height: 14, borderRadius: 7, background: B.line, overflow: 'hidden'}}>
					<div style={{width: `${row.score * fill}%`, height: '100%', borderRadius: 7, background: color}} />
				</div>
				<div
					style={{
						width: 64,
						fontSize: 30,
						fontWeight: 700,
						color,
						fontVariantNumeric: 'tabular-nums',
						textAlign: 'right',
					}}
				>
					{Math.round(row.score * fill)}
				</div>
			</div>

			<div style={{flex: 1, display: 'flex', justifyContent: 'flex-end'}}>
				<div
					style={{
						display: 'flex',
						alignItems: 'center',
						gap: 10,
						padding: '8px 18px',
						borderRadius: 999,
						background: alpha(color, 0.14),
						color,
						fontSize: 24,
						fontWeight: 700,
						whiteSpace: 'nowrap',
						opacity: Math.min(1, status),
						transform: `scale(${interpolate(status, [0, 1], [0.7, 1])})`,
					}}
				>
					<div style={{width: 10, height: 10, borderRadius: 5, background: color}} />
					{row.status}
				</div>
			</div>
		</div>
	);
};
