import React from 'react';
import {AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {KineticWords} from '../components/KineticWords';
import {CONFIG, sec, Tone} from '../config';
import {DISPLAY, SANS} from '../fonts';
import {alpha, arrive, progress} from '../motion';
import {brandGlow, raised} from '../style';

const B = CONFIG.brand;
const S = CONFIG.scenes.bouncer;
const toneColor = (t: Tone) => B[t];
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const COLS = {visitor: 470, meter: 420};

/** Scene-local frames for a visitor row: slide in, score fill, status pill, shake. */
export const rowTimes = (index: number) => {
	const inAt = sec(S.rowsAt + index * S.rowStagger);
	const fillAt = inAt + sec(S.fillDelay);
	const statusAt = fillAt + sec(S.fillDur);
	return {inAt, fillAt, statusAt, shakeAt: statusAt + sec(0.1)};
};

export const Bouncer: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const panel = arrive(frame, sec(S.panelAt), fps);
	const head = arrive(frame, sec(S.headlineAt), fps);
	const beam = 0.8 + 0.2 * Math.sin(frame / 9);

	return (
		<AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', fontFamily: SANS}}>
			{/* Spotlight over the door */}
			<AbsoluteFill
				style={{
					background: `radial-gradient(ellipse 38% 70% at 50% -8%, ${alpha(B.textTo, 0.16 * beam * Math.min(1, panel))} 0%, transparent 70%)`,
				}}
			/>
			<div
				style={{
					position: 'relative',
					width: S.panel.w,
					height: S.panel.h,
					borderRadius: 32,
					padding: '52px 64px',
					display: 'flex',
					flexDirection: 'column',
					opacity: Math.min(1, panel),
					transform: `perspective(1600px) rotateX(${interpolate(panel, [0, 1], [14, 0])}deg) scale(${interpolate(panel, [0, 1], [0.94, 1])})`,
					...raised(B.violet, 0.35),
					border: `1px solid ${alpha('#FFFFFF', 0.07)}`,
				}}
			>
				{/* Brand hairline across the top edge */}
				<div
					style={{
						position: 'absolute',
						left: 60,
						right: 60,
						top: -1,
						height: 2,
						background: brandGlow(90),
						boxShadow: `0 0 18px ${B.blue}`,
						transform: `scaleX(${Math.min(1, head)})`,
					}}
				/>
				<div
					style={{
						display: 'flex',
						alignItems: 'center',
						gap: 14,
						color: B.textTo,
						fontSize: 22,
						fontWeight: 700,
						letterSpacing: '0.14em',
						textTransform: 'uppercase',
						opacity: Math.min(1, head),
					}}
				>
					<Img src={staticFile(CONFIG.assets.icon)} style={{width: 34, height: 34, borderRadius: 8}} />
					{S.kicker}
				</div>
				<KineticWords
					text={S.headline}
					at={sec(S.headlineAt)}
					stagger={sec(0.06)}
					accent={[...S.headlineAccent]}
					style={{
						justifyContent: 'flex-start',
						marginTop: 16,
						fontFamily: DISPLAY,
						fontSize: 72,
						fontWeight: 800,
						letterSpacing: '-0.03em',
						color: B.text,
						gap: '0.22em',
					}}
				/>

				<ColumnHeads opacity={Math.min(1, arrive(frame, sec(S.rowsAt - 0.1), fps))} />
				<div style={{marginTop: 14, display: 'flex', flexDirection: 'column', gap: 18}}>
					{S.rows.map((row, i) => (
						<VisitorRow key={row.label} index={i} frame={frame} />
					))}
				</div>
			</div>
		</AbsoluteFill>
	);
};

const ColumnHeads: React.FC<{opacity: number}> = ({opacity}) => (
	<div
		style={{
			marginTop: 44,
			display: 'flex',
			padding: '0 32px',
			color: B.muted,
			fontSize: 17,
			fontWeight: 700,
			letterSpacing: '0.12em',
			textTransform: 'uppercase',
			opacity: opacity * 0.8,
		}}
	>
		<div style={{width: COLS.visitor}}>{S.columns[0]}</div>
		<div style={{width: COLS.meter}}>{S.columns[1]}</div>
		<div style={{flex: 1, textAlign: 'right'}}>{S.columns[2]}</div>
	</div>
);

const VisitorRow: React.FC<{index: number; frame: number}> = ({index, frame}) => {
	const {fps} = useVideoConfig();
	const row = S.rows[index];
	const color = toneColor(row.tone);
	const {inAt, fillAt, statusAt, shakeAt} = rowTimes(index);
	const enter = arrive(frame, inAt, fps);
	const fill = progress(frame, fillAt, sec(S.fillDur));
	const scan = interpolate(frame, [fillAt, statusAt], [0, 1], clamp);
	const scanning = frame >= fillAt && frame <= statusAt + sec(0.1);
	const status = arrive(frame, statusAt, fps);

	// Rejected row: stamp, red wash, 2px shake, strike-through, then dim.
	const d = frame - shakeAt;
	const shaking = row.rejected && d >= 0 && d <= sec(S.shakeDur);
	const shake = shaking ? Math.sin(d * Math.PI * 0.75) * S.shakePx * 3 : 0;
	const dim = row.rejected ? progress(frame, shakeAt + sec(S.shakeDur), sec(S.dimDur)) : 0;
	const wash = row.rejected ? interpolate(frame - statusAt, [0, sec(0.1), sec(0.7)], [0, 0.3, 0.1], clamp) : 0;
	const strike = row.rejected ? progress(frame, shakeAt, sec(0.35)) : 0;

	return (
		<div
			style={{
				position: 'relative',
				height: 122,
				borderRadius: 20,
				background: `linear-gradient(90deg, ${alpha(color, wash)} 0%, ${alpha(B.black, 0.35)} 70%)`,
				border: `1px solid ${frame >= statusAt ? alpha(color, 0.35) : alpha('#FFFFFF', 0.06)}`,
				display: 'flex',
				alignItems: 'center',
				padding: '0 32px',
				overflow: 'hidden',
				opacity: Math.min(1, enter) * interpolate(dim, [0, 1], [1, S.dimTo]),
				filter: `blur(${interpolate(enter, [0, 1], [8, 0], clamp)}px)`,
				transform: `translateX(${interpolate(enter, [0, 1], [120, 0]) + shake}px)`,
			}}
		>
			{scanning ? <ScanBeam at={scan} color={color} /> : null}

			<div style={{width: COLS.visitor, display: 'flex', alignItems: 'center', gap: 22, position: 'relative'}}>
				<div
					style={{
						width: 68,
						height: 68,
						borderRadius: 18,
						background: alpha('#FFFFFF', 0.05),
						border: `1px solid ${alpha('#FFFFFF', 0.08)}`,
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						fontSize: 40,
					}}
				>
					{row.flag}
				</div>
				<div style={{position: 'relative', fontSize: 32, fontWeight: 600, color: B.text, letterSpacing: '-0.01em'}}>
					{row.label}
					<div
						style={{
							position: 'absolute',
							left: -4,
							top: '52%',
							height: 3,
							width: `calc(${strike * 100}% + 8px)`,
							background: B.red,
							borderRadius: 2,
							boxShadow: `0 0 10px ${B.red}`,
						}}
					/>
				</div>
			</div>

			<Meter fill={fill} score={row.score} color={color} />

			<div style={{flex: 1, display: 'flex', justifyContent: 'flex-end'}}>
				<Stamp text={row.status} color={color} p={status} slam={row.rejected} />
			</div>
		</div>
	);
};

/** A vertical light sweeping across the row while its score is measured. */
const ScanBeam: React.FC<{at: number; color: string}> = ({at, color}) => (
	<div
		style={{
			position: 'absolute',
			top: 0,
			bottom: 0,
			left: `${at * 100}%`,
			width: 160,
			transform: 'translateX(-100%)',
			background: `linear-gradient(90deg, transparent 0%, ${alpha(color, 0.18)} 80%, ${alpha('#FFFFFF', 0.85)} 100%)`,
			boxShadow: `6px 0 24px ${alpha(color, 0.8)}`,
			opacity: interpolate(at, [0, 0.08, 0.92, 1], [0, 1, 1, 0]),
		}}
	/>
);

/** Segmented risk meter: ticks light up to the score, number counts along. */
const Meter: React.FC<{fill: number; score: number; color: string}> = ({fill, score, color}) => {
	const lit = (score / 100) * S.meterTicks * fill;
	return (
		<div style={{width: COLS.meter, display: 'flex', alignItems: 'center', gap: 22, position: 'relative'}}>
			<div style={{display: 'flex', gap: 4}}>
				{Array.from({length: S.meterTicks}, (_, k) => {
					const on = Math.max(0, Math.min(1, lit - k));
					return (
						<div
							key={k}
							style={{
								width: 8,
								height: 30,
								borderRadius: 3,
								background: on > 0 ? alpha(color, 0.35 + 0.65 * on) : alpha('#FFFFFF', 0.07),
								boxShadow: on > 0.5 ? `0 0 10px ${alpha(color, 0.7)}` : undefined,
							}}
						/>
					);
				})}
			</div>
			<div
				style={{
					width: 80,
					fontFamily: DISPLAY,
					fontSize: 40,
					fontWeight: 800,
					color,
					fontVariantNumeric: 'tabular-nums',
					textAlign: 'right',
				}}
			>
				{Math.round(score * fill)}
			</div>
		</div>
	);
};

/** Verdict pill that lands like a stamp; the rejection slams harder and tilts. */
const Stamp: React.FC<{text: string; color: string; p: number; slam: boolean}> = ({text, color, p, slam}) => {
	const scale = interpolate(p, [0, 1], [slam ? 2.2 : 1.6, 1]);
	const rot = slam ? interpolate(p, [0, 1], [-14, -4]) : 0;
	return (
		<div style={{position: 'relative'}}>
			<div
				style={{
					position: 'absolute',
					inset: 0,
					borderRadius: 999,
					border: `2px solid ${color}`,
					opacity: interpolate(p, [0.6, 1.1], [0.8, 0], clamp),
					transform: `scale(${interpolate(p, [0.6, 1.1], [1, 1.5], clamp)})`,
				}}
			/>
			<div
				style={{
					display: 'flex',
					alignItems: 'center',
					gap: 12,
					padding: '12px 24px',
					borderRadius: 999,
					background: alpha(color, 0.16),
					border: `2px solid ${alpha(color, 0.7)}`,
					color,
					fontFamily: SANS,
					fontSize: 26,
					fontWeight: 800,
					letterSpacing: slam ? '0.06em' : '0',
					textTransform: slam ? 'uppercase' : 'none',
					whiteSpace: 'nowrap',
					boxShadow: `0 0 ${24 * Math.min(1, p)}px ${alpha(color, 0.45)}`,
					opacity: Math.min(1, p * 1.5),
					transform: `scale(${scale}) rotate(${rot}deg)`,
				}}
			>
				<div style={{width: 12, height: 12, borderRadius: 6, background: color, boxShadow: `0 0 10px ${color}`}} />
				{text}
			</div>
		</div>
	);
};
