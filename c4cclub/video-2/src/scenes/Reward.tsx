import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {Caption} from '../components/Caption';
import {CreditCoin, coinFlip} from '../components/CreditCoin';
import {CreditCount} from '../components/CreditCount';
import {FriendIcon, Monogram} from '../components/Monogram';
import {CONFIG, sec} from '../config';
import {DISPLAY, MONO, SANS} from '../fonts';
import {alpha, arrive, easeOut, progress} from '../motion';
import {brandFill, brandGlow, raised} from '../style';

const B = CONFIG.brand;
const R = CONFIG.referral;
const S = CONFIG.scenes.reward;
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

type Path = (typeof S.paths)[number];

const LANE = {w: 760, h: 480, y: 735, xs: [540, 1380]};
const BALANCE = {y: 350, coin: {x: 895, y: 350}};
const CLICKS_PER_FILL = 5;

/** Scene-local frames of one path's beats: lane in, bar fill, payout, coin landings. */
export const pathTimes = (index: number) => {
	const p = S.paths[index];
	const lane = sec(p.at);
	const fill = sec(p.at + S.fillDelay);
	const full = fill + sec(S.fillDur);
	const pay = full + sec(S.payDelay);
	const coins = Array.from({length: S.coinsPerReward}, (_, i) => {
		const start = pay + sec(i * S.coinStagger);
		return {start, land: start + sec(S.coinFlight)};
	});
	const clicks = Array.from({length: CLICKS_PER_FILL}, (_, i) => fill + Math.round(((i + 0.5) / CLICKS_PER_FILL) * sec(S.fillDur)));
	return {lane, fill, full, pay, coins, clicks};
};

const TIMES = S.paths.map((_, i) => pathTimes(i));

export const Reward: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const chip = arrive(frame, sec(S.balanceAt), fps);
	const earned = S.paths.reduce((sum, p, i) => {
		const landed = TIMES[i].coins.filter((c) => frame >= c.land).length;
		return sum + (p.reward * landed) / S.coinsPerReward;
	}, 0);
	const lands = TIMES.flatMap((t) => t.coins.map((c) => c.land));
	const bump = Math.max(0, ...lands.map((l) => interpolate(frame - l, [0, sec(0.05), sec(0.3)], [0, 1, 0], clamp)));
	const lastLand = Math.max(...lands);
	const done = progress(frame, lastLand, sec(0.4));

	return (
		<AbsoluteFill style={{fontFamily: SANS}}>
			<Caption text={S.caption} accent={S.captionAccent} at={sec(S.captionAt)} sweep={[sec(0.9), sec(1.8)]} top={96} />
			<div
				style={{
					position: 'absolute',
					left: 0,
					right: 0,
					top: BALANCE.y - 88,
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
					gap: 12,
					opacity: Math.min(1, chip),
					transform: `translateY(${interpolate(chip, [0, 1], [20, 0])}px)`,
				}}
			>
				<div style={{color: B.muted, fontSize: 20, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase'}}>
					{S.balanceLabel}
				</div>
				<div
					style={{
						padding: '10px 36px 10px 24px',
						borderRadius: 999,
						border: `1.5px solid ${alpha(B.pop, 0.25 + 0.6 * Math.max(bump, done))}`,
						boxShadow: `0 0 ${50 * Math.max(bump, done)}px ${alpha(B.pop, 0.35)}`,
						...raised(),
					}}
				>
					<CreditCount value={earned} size={96} bump={bump} rotateY={coinFlip((frame - lastLand) / sec(0.7))} color={earned > 0 ? B.pop : B.text} />
				</div>
			</div>
			{S.paths.map((p, i) => (
				<Lane key={p.key} path={p} index={i} frame={frame} />
			))}
			{TIMES.flatMap((t, i) =>
				t.coins.map((c, k) => <FlyingCoin key={`${i}-${k}`} from={{x: LANE.xs[i], y: LANE.y + 150}} start={c.start} land={c.land} frame={frame} spread={k} />),
			)}
		</AbsoluteFill>
	);
};

const Lane: React.FC<{path: Path; index: number; frame: number}> = ({path, index, frame}) => {
	const {fps} = useVideoConfig();
	const t = TIMES[index];
	const enter = arrive(frame, t.lane, fps);
	const fill = interpolate(frame, [t.fill, t.full], [0, 1], clamp);
	const full = frame >= t.full;
	const paid = arrive(frame, t.pay, fps);
	const hot = path.badge !== null;
	const glow = interpolate(frame - t.pay, [0, sec(0.1), sec(0.9)], [0, 1, 0.35], clamp);
	const x = LANE.xs[index];

	return (
		<div
			style={{
				position: 'absolute',
				left: x - LANE.w / 2,
				top: LANE.y - LANE.h / 2,
				width: LANE.w,
				height: LANE.h,
				borderRadius: 26,
				padding: '34px 40px',
				border: `1.5px solid ${full ? alpha(B.pop, 0.3 + 0.4 * glow) : alpha('#FFFFFF', 0.07)}`,
				opacity: Math.min(1, enter),
				filter: `blur(${interpolate(enter, [0, 1], [10, 0], clamp)}px)`,
				transform: `translateY(${interpolate(enter, [0, 1], [60, 0])}px) scale(${interpolate(enter, [0, 1], [0.94, 1])})`,
				...raised(B.pop, glow),
			}}
		>
			<div style={{display: 'flex', alignItems: 'center', gap: 16}}>
				<FriendIcon size={46} />
				<div style={{fontFamily: DISPLAY, fontSize: 32, fontWeight: 800, color: B.text, letterSpacing: '-0.02em'}}>{path.title}</div>
			</div>
			{hot ? <Badge text={path.badge} frame={frame} at={t.lane + sec(0.3)} /> : null}

			<div style={{height: 150, marginTop: 26, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
				{path.key === 'advertiser' ? <OwnAd /> : <HostedAd />}
				{t.clicks.map((c) => (
					<ClickRipple key={c} at={c} frame={frame} index={c} cx={path.key === 'advertiser' ? 50 : 72} />
				))}
			</div>

			<div style={{marginTop: 20, display: 'flex', alignItems: 'baseline', gap: 12, fontSize: 24}}>
				<span style={{fontFamily: DISPLAY, fontSize: 32, fontWeight: 800, color: full ? B.green : B.text, fontVariantNumeric: 'tabular-nums'}}>
					{Math.floor(R.qualifying * fill)} / {R.qualifying}
				</span>
				<span style={{color: B.muted}}>credits {path.progressLabel}</span>
			</div>
			<div style={{marginTop: 12, height: 16, borderRadius: 8, background: alpha('#FFFFFF', 0.07), overflow: 'hidden'}}>
				<div
					style={{
						width: `${fill * 100}%`,
						height: '100%',
						borderRadius: 8,
						background: full ? B.green : brandGlow(90),
						boxShadow: `0 0 16px ${full ? B.green : B.blue}`,
					}}
				/>
			</div>

			<div
				style={{
					position: 'absolute',
					left: 40,
					right: 40,
					bottom: 30,
					display: 'flex',
					alignItems: 'baseline',
					gap: 16,
					opacity: Math.min(1, paid),
					transform: `scale(${interpolate(paid, [0, 1], [1.5, 1])})`,
					transformOrigin: 'left center',
				}}
			>
				<span style={{fontFamily: DISPLAY, fontSize: 60, fontWeight: 800, color: B.pop, letterSpacing: '-0.03em'}}>+{path.reward}</span>
				<span style={{fontSize: 30, fontWeight: 700, color: B.text}}>{S.tag}</span>
			</div>
		</div>
	);
};

const Badge: React.FC<{text: string; frame: number; at: number}> = ({text, frame, at}) => {
	const {fps} = useVideoConfig();
	const a = arrive(frame, at, fps);
	return (
		<div
			style={{
				position: 'absolute',
				right: 30,
				top: -22,
				padding: '9px 20px',
				borderRadius: 999,
				background: B.pop,
				color: B.black,
				fontSize: 22,
				fontWeight: 800,
				letterSpacing: '0.02em',
				boxShadow: `0 0 28px ${alpha(B.pop, 0.6)}`,
				opacity: Math.min(1, a),
				transform: `scale(${interpolate(a, [0, 1], [0.5, 1])}) rotate(${interpolate(a, [0, 1], [-10, 3])}deg)`,
			}}
		>
			{text}
		</div>
	);
};

/** The friend's own ad, as members' visitors see it. */
const OwnAd: React.FC = () => (
	<div
		style={{
			display: 'flex',
			alignItems: 'center',
			gap: 14,
			padding: '14px 18px 14px 14px',
			borderRadius: 16,
			background: '#F3F3F9',
			color: '#14132A',
			fontSize: 26,
			fontWeight: 600,
			whiteSpace: 'nowrap',
			boxShadow: `0 0 32px ${alpha(B.blue, 0.45)}, 0 10px 24px rgba(0,0,0,0.45)`,
		}}
	>
		<FriendIcon size={40} />
		{CONFIG.friend.ad}
		<span style={{fontSize: 14, fontWeight: 700, padding: '4px 8px', borderRadius: 6, background: brandFill(), color: '#FFFFFF'}}>AD</span>
	</div>
);

/** The friend's site with another member's ad in its slot. */
const HostedAd: React.FC = () => (
	<div style={{width: 560, height: 150, borderRadius: 14, border: `1.5px solid ${B.lineHi}`, overflow: 'hidden', background: alpha(B.black, 0.4)}}>
		<div style={{height: 30, display: 'flex', alignItems: 'center', gap: 6, padding: '0 12px', background: alpha('#FFFFFF', 0.04)}}>
			{[0, 1, 2].map((i) => (
				<div key={i} style={{width: 8, height: 8, borderRadius: 4, background: B.lineHi}} />
			))}
			<span style={{marginLeft: 10, fontFamily: MONO, fontSize: 14, color: B.muted}}>{CONFIG.friend.domain}</span>
		</div>
		<div style={{display: 'flex', alignItems: 'center', gap: 18, padding: '18px 18px'}}>
			<div style={{flex: 1, display: 'flex', flexDirection: 'column', gap: 10}}>
				<div style={{height: 10, width: '90%', borderRadius: 5, background: B.line}} />
				<div style={{height: 10, width: '70%', borderRadius: 5, background: B.line}} />
				<div style={{height: 10, width: '80%', borderRadius: 5, background: B.line}} />
			</div>
			<div
				style={{
					display: 'flex',
					alignItems: 'center',
					gap: 10,
					padding: '10px 12px',
					borderRadius: 12,
					background: '#F3F3F9',
					color: '#14132A',
					fontSize: 18,
					fontWeight: 600,
					whiteSpace: 'nowrap',
					boxShadow: `0 0 24px ${alpha(B.blue, 0.4)}`,
				}}
			>
				<Monogram letter="M" color="#3A9BD9" size={30} />
				Maps for tiny shops.
			</div>
		</div>
	</div>
);

/** A visitor's click: a ring expanding from a point on the ad. */
/** `cx`: horizontal centre of the clickable ad, in % of the visual. */
const ClickRipple: React.FC<{at: number; frame: number; index: number; cx: number}> = ({at, frame, index, cx}) => {
	const d = frame - at;
	if (d < 0 || d > sec(0.5)) return null;
	const p = progress(frame, at, sec(0.5));
	// Spread clicks over the ad, deterministically.
	const x = cx + Math.sin(index * 12.9898) * (cx === 50 ? 22 : 10);
	const y = 50 + Math.cos(index * 78.233) * 18;
	return (
		<div
			style={{
				position: 'absolute',
				left: `${x}%`,
				top: `${y}%`,
				width: 70,
				height: 70,
				marginLeft: -35,
				marginTop: -35,
				borderRadius: 35,
				border: `4px solid ${B.violet}`,
				boxShadow: `0 0 18px ${B.blue}, inset 0 0 12px ${alpha(B.blue, 0.6)}`,
				opacity: 1 - p,
				transform: `scale(${0.2 + p})`,
			}}
		/>
	);
};

/** A reward credit arcing from the lane up into the balance. */
const FlyingCoin: React.FC<{from: {x: number; y: number}; start: number; land: number; frame: number; spread: number}> = ({
	from,
	start,
	land,
	frame,
	spread,
}) => {
	if (frame < start || frame > land) return null;
	const t = interpolate(frame, [start, land], [0, 1], {...clamp, easing: easeOut});
	const to = BALANCE.coin;
	const cx = (from.x + to.x) / 2 + (spread - 2.5) * 40;
	const cy = Math.min(from.y, to.y) - 60;
	const u = 1 - t;
	const x = u * u * from.x + 2 * u * t * cx + t * t * to.x;
	const y = u * u * from.y + 2 * u * t * cy + t * t * to.y;
	const size = 64 - 20 * t;
	return (
		<div style={{position: 'absolute', left: x - size / 2, top: y - size / 2, perspective: 600}}>
			<CreditCoin size={size} rotateY={t * 540} glow={0.7} />
		</div>
	);
};
