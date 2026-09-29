import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {Caption} from '../components/Caption';
import {CreditCoin, coinFlip} from '../components/CreditCoin';
import {CreditCount} from '../components/CreditCount';
import {FriendIcon} from '../components/Monogram';
import {CONFIG, sec} from '../config';
import {DISPLAY, SANS} from '../fonts';
import {alpha, arrive, easeOut, progress} from '../motion';
import {brandGlow, raised} from '../style';

const B = CONFIG.brand;
const R = CONFIG.referral;
const S = CONFIG.scenes.join;
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

const CARD = {w: 900, h: 540, x: 960, y: 620};
const BALANCE_Y = CARD.y - CARD.h / 2 + 215;
const COIN_TARGET = {x: CARD.x - 120, y: BALANCE_Y};
const COIN_FLIGHT = 0.55;

/** Scene-local frames: when each bonus coin leaves and lands. */
const coinTimes = Array.from({length: S.coins}, (_, i) => {
	const start = sec(S.bonusAt + i * S.coinStagger);
	return {start, land: start + sec(COIN_FLIGHT)};
});

export const JOIN_TIMES = {
	card: sec(S.cardAt),
	welcome: sec(S.welcomeAt),
	bonus: sec(S.bonusAt),
	coinLands: coinTimes.map((c) => c.land),
	tag: sec(S.tagAt),
};

export const Join: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const card = arrive(frame, JOIN_TIMES.card, fps);
	const welcome = R.signupBonus * progress(frame, JOIN_TIMES.welcome, sec(S.welcomeDur));
	const landed = coinTimes.filter((c) => frame >= c.land).length;
	const bonus = (R.inviteBonus * landed) / S.coins;
	const bump = Math.max(0, ...coinTimes.map((c) => interpolate(frame - c.land, [0, sec(0.05), sec(0.3)], [0, 1, 0], clamp)));
	const lastLand = coinTimes[coinTimes.length - 1].land;
	const flip = coinFlip((frame - lastLand) / sec(0.7));

	return (
		<AbsoluteFill style={{fontFamily: SANS}}>
			<Caption text={S.caption} accent={S.captionAccent} at={sec(S.captionAt)} sweep={[sec(2.4), sec(3.3)]} />
			<div
				style={{
					position: 'absolute',
					left: CARD.x - CARD.w / 2,
					top: CARD.y - CARD.h / 2,
					width: CARD.w,
					height: CARD.h,
					borderRadius: 28,
					border: `1px solid ${alpha('#FFFFFF', 0.07)}`,
					padding: '40px 48px',
					opacity: Math.min(1, card),
					transform: `translateY(${interpolate(card, [0, 1], [40, 0])}px) scale(${interpolate(card, [0, 1], [0.94, 1])})`,
					...raised(B.violet, 0.3 + 0.5 * bump),
				}}
			>
				<div
					style={{
						position: 'absolute',
						left: 60,
						right: 60,
						top: -1,
						height: 2,
						background: brandGlow(90),
						boxShadow: `0 0 18px ${B.blue}`,
					}}
				/>
				<div style={{display: 'flex', alignItems: 'center', gap: 18}}>
					<FriendIcon size={60} />
					<div style={{fontFamily: DISPLAY, fontSize: 36, fontWeight: 800, color: B.text, letterSpacing: '-0.02em'}}>
						{CONFIG.friend.name} joined c4c.club
					</div>
				</div>

				<div style={{position: 'absolute', left: 0, right: 0, top: 215 - 85, display: 'flex', justifyContent: 'center'}}>
					<CreditCount value={welcome + bonus} size={170} bump={bump} rotateY={flip} />
				</div>

				<div style={{position: 'absolute', left: 48, right: 48, bottom: 40, display: 'flex', flexDirection: 'column', gap: 12}}>
					<LedgerRow at={JOIN_TIMES.welcome} amount={R.signupBonus} label={S.welcomeLabel} />
					<LedgerRow at={JOIN_TIMES.bonus} amount={R.inviteBonus} label={S.bonusLabel} highlight tag={S.tag} tagAt={JOIN_TIMES.tag} />
				</div>
			</div>
			{coinTimes.map((c, i) => (
				<FallingCoin key={i} index={i} start={c.start} land={c.land} frame={frame} />
			))}
		</AbsoluteFill>
	);
};

const LedgerRow: React.FC<{at: number; amount: number; label: string; highlight?: boolean; tag?: string; tagAt?: number}> = ({
	at,
	amount,
	label,
	highlight = false,
	tag,
	tagAt = 0,
}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const a = arrive(frame, at, fps);
	const t = arrive(frame, tagAt, fps);
	const color = highlight ? B.pop : B.text;
	return (
		<div
			style={{
				height: 72,
				borderRadius: 14,
				background: highlight ? alpha(B.pop, 0.08) : alpha('#FFFFFF', 0.03),
				border: `1px solid ${highlight ? alpha(B.pop, 0.35) : alpha('#FFFFFF', 0.05)}`,
				display: 'flex',
				alignItems: 'center',
				gap: 18,
				padding: '0 24px',
				fontSize: 28,
				opacity: Math.min(1, a),
				transform: `translateX(${interpolate(a, [0, 1], [-40, 0])}px)`,
			}}
		>
			<span style={{width: 80, fontFamily: DISPLAY, fontSize: 36, fontWeight: 800, color}}>+{amount}</span>
			<span style={{color: highlight ? B.text : B.muted, fontWeight: highlight ? 700 : 500}}>{label}</span>
			{tag ? (
				<span
					style={{
						marginLeft: 'auto',
						padding: '8px 18px',
						borderRadius: 999,
						background: alpha(B.pop, 0.18),
						border: `1.5px solid ${alpha(B.pop, 0.7)}`,
						color: B.pop,
						fontWeight: 800,
						fontSize: 24,
						opacity: Math.min(1, t),
						transform: `scale(${interpolate(t, [0, 1], [1.6, 1])})`,
						boxShadow: `0 0 ${24 * Math.min(1, t)}px ${alpha(B.pop, 0.45)}`,
					}}
				>
					{tag}
				</span>
			) : null}
		</div>
	);
};

/** A bonus credit dropping in from above the frame onto the balance. */
const FallingCoin: React.FC<{index: number; start: number; land: number; frame: number}> = ({index, start, land, frame}) => {
	if (frame < start || frame > land + 1) return null;
	const t = interpolate(frame, [start, land], [0, 1], {...clamp, easing: easeOut});
	const fromX = COIN_TARGET.x + (index - (S.coins - 1) / 2) * 170;
	const x = fromX + (COIN_TARGET.x - fromX) * t;
	const y = -80 + (COIN_TARGET.y + 80) * t * t;
	const size = 84 - 30 * t;
	return (
		<div style={{position: 'absolute', left: x - size / 2, top: y - size / 2, perspective: 600}}>
			<CreditCoin size={size} rotateY={t * 540} glow={0.6} />
		</div>
	);
};
