import React from 'react';
import {AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Caption} from '../components/Caption';
import {Cursor} from '../components/Cursor';
import {FriendIcon, YouIcon} from '../components/Monogram';
import {CONFIG, sec} from '../config';
import {DISPLAY, MONO, SANS} from '../fonts';
import {alpha, arrive, easeOut, lerp, progress} from '../motion';
import {brandFill, brandGlow, raised} from '../style';

const B = CONFIG.brand;
const R = CONFIG.referral;
const S = CONFIG.scenes.link;
const P = S.panel;
const F = S.friendCard;
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// Panel-local layout, fixed so the cursor and the flying link can aim at it.
const PAD = 52;
const FIELD = {top: 140, h: 88};
const BUTTON = {w: 190, inset: 10};
const URL_CENTER_X = PAD + 28 + 250; // roughly the middle of the URL text
const MESSAGE_Y = 225; // friend-card-local centre of the message slot

// The rewards as the app's InvitePanel lists them.
const REWARDS = [
	{amount: R.inviteBonus, who: 'for them', when: 'when they join through your link'},
	{amount: R.advertiserReward, who: 'for you', when: `once their ad has spent ${R.qualifying} credits`},
	{amount: R.publisherReward, who: 'for you', when: `once their site has earned ${R.qualifying} credits`},
];

/** Scene-local frames of the beats that sounds and the next scene hang off. */
export const LINK_TIMES = {
	panel: sec(S.panelAt),
	field: sec(S.fieldAt),
	rewards: REWARDS.map((_, i) => sec(S.fieldAt + 0.35 + i * 0.14)),
	click: sec(S.clickAt),
	friend: sec(S.friendAt),
	send: sec(S.sendAt),
	arrive: sec(S.sendAt + S.flightDur),
};

const panelLeft = (frame: number) => P.x - P.w / 2 - S.slideLeft * progress(frame, sec(S.friendAt), sec(S.slideDur));
const panelTop = P.y - P.h / 2;

/** Point on the arc from the invite field to the friend's message slot, t = 0 → 1. */
const flightPoint = (t: number) => {
	const from = {x: P.x - P.w / 2 - S.slideLeft + URL_CENTER_X, y: panelTop + FIELD.top + FIELD.h / 2};
	const to = {x: F.x, y: F.y - F.h / 2 + MESSAGE_Y};
	const c = {x: (from.x + to.x) / 2, y: Math.min(from.y, to.y) - S.arc};
	const u = 1 - t;
	return {x: u * u * from.x + 2 * u * t * c.x + t * t * to.x, y: u * u * from.y + 2 * u * t * c.y + t * t * to.y};
};

export const InviteLink: React.FC = () => {
	const frame = useCurrentFrame();
	return (
		<AbsoluteFill style={{fontFamily: SANS}}>
			<Caption text={S.caption} accent={S.captionAccent} at={sec(S.captionAt)} sweep={[sec(1.2), sec(2.1)]} />
			<InvitePanel frame={frame} />
			<FriendCard frame={frame} />
			<FlyingLink frame={frame} />
			<PointerCursor frame={frame} />
		</AbsoluteFill>
	);
};

const InvitePanel: React.FC<{frame: number}> = ({frame}) => {
	const {fps} = useVideoConfig();
	const enter = arrive(frame, LINK_TIMES.panel, fps);
	const field = arrive(frame, LINK_TIMES.field, fps);
	const copied = progress(frame, LINK_TIMES.click, sec(0.25));
	const flash = interpolate(frame - LINK_TIMES.click, [0, sec(0.15), sec(0.9)], [0, 1, 0], clamp);

	return (
		<div
			style={{
				position: 'absolute',
				left: panelLeft(frame),
				top: panelTop,
				width: P.w,
				height: P.h,
				borderRadius: 28,
				border: `1px solid ${alpha('#FFFFFF', 0.07)}`,
				opacity: Math.min(1, enter),
				transform: `perspective(1600px) rotateX(${interpolate(enter, [0, 1], [14, 0])}deg) scale(${interpolate(enter, [0, 1], [0.94, 1])})`,
				...raised(B.violet, 0.35),
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
					transform: `scaleX(${Math.min(1, enter)})`,
				}}
			/>
			<div
				style={{
					position: 'absolute',
					left: PAD,
					top: 44,
					display: 'flex',
					alignItems: 'center',
					gap: 14,
					color: B.textTo,
					fontSize: 22,
					fontWeight: 700,
					letterSpacing: '0.14em',
					textTransform: 'uppercase',
				}}
			>
				<Img src={staticFile(CONFIG.assets.icon)} style={{width: 34, height: 34, borderRadius: 8}} />
				{S.kicker}
			</div>

			<div
				style={{
					position: 'absolute',
					left: PAD,
					top: FIELD.top - 32,
					color: B.muted,
					fontSize: 17,
					fontWeight: 700,
					letterSpacing: '0.12em',
					textTransform: 'uppercase',
					opacity: Math.min(1, field),
				}}
			>
				{S.fieldLabel}
			</div>
			<div
				style={{
					position: 'absolute',
					left: PAD,
					right: PAD,
					top: FIELD.top,
					height: FIELD.h,
					borderRadius: 16,
					background: alpha(B.black, 0.5),
					border: `1.5px solid ${copied > 0 ? alpha(B.accent, 0.4 + 0.5 * flash) : B.lineHi}`,
					boxShadow: `0 0 ${36 * flash}px ${alpha(B.accent, 0.6 * flash)}`,
					display: 'flex',
					alignItems: 'center',
					paddingLeft: 28,
					opacity: Math.min(1, field),
					transform: `translateY(${interpolate(field, [0, 1], [24, 0])}px)`,
				}}
			>
				<span
					style={{
						fontFamily: MONO,
						fontSize: 34,
						color: B.text,
						padding: '2px 6px',
						marginLeft: -6,
						borderRadius: 6,
						background: alpha(B.accent, 0.35 * flash),
					}}
				>
					{S.url}
				</span>
				<CopyButton copied={copied} press={clickPress(frame)} />
			</div>

			<div style={{position: 'absolute', left: PAD, right: PAD, top: 272, display: 'flex', flexDirection: 'column', gap: 12}}>
				{REWARDS.map((r, i) => {
					const a = arrive(frame, LINK_TIMES.rewards[i], fps);
					return (
						<div
							key={r.when}
							style={{
								height: 70,
								borderRadius: 14,
								background: alpha('#FFFFFF', 0.03),
								border: `1px solid ${alpha('#FFFFFF', 0.05)}`,
								display: 'flex',
								alignItems: 'center',
								gap: 18,
								padding: '0 22px',
								fontSize: 27,
								opacity: Math.min(1, a),
								transform: `translateX(${interpolate(a, [0, 1], [40, 0])}px)`,
							}}
						>
							<span style={{width: 78, fontFamily: DISPLAY, fontSize: 36, fontWeight: 800, color: B.pop}}>+{r.amount}</span>
							<span style={{fontWeight: 700, color: B.text}}>{r.who}</span>
							<span style={{color: B.muted}}>{r.when}</span>
						</div>
					);
				})}
			</div>
		</div>
	);
};

/** 0 → 1 → 0 around the click, for the cursor squeeze and button press. */
const clickPress = (frame: number) =>
	interpolate(frame - LINK_TIMES.click, [-sec(0.08), 0, sec(0.14)], [0, 1, 0], clamp);

const CopyButton: React.FC<{copied: number; press: number}> = ({copied, press}) => {
	const done = copied >= 0.5;
	return (
		<div
			style={{
				position: 'absolute',
				right: BUTTON.inset,
				top: BUTTON.inset,
				bottom: BUTTON.inset,
				width: BUTTON.w,
				borderRadius: 11,
				background: done ? alpha(B.green, 0.2) : brandFill(),
				border: done ? `1.5px solid ${alpha(B.green, 0.75)}` : 'none',
				color: done ? B.green : '#FFFFFF',
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				gap: 10,
				fontSize: 27,
				fontWeight: 700,
				transform: `scale(${1 - 0.06 * press})`,
				boxShadow: done ? `0 0 24px ${alpha(B.green, 0.4)}` : `inset 0 1px 0 ${alpha('#FFFFFF', 0.25)}`,
			}}
		>
			{done ? (
				<svg width={26} height={26} viewBox="0 0 24 24" style={{transform: `scale(${interpolate(copied, [0.5, 1], [0.4, 1], clamp)})`}}>
					<path d="M4 12.5l5 5L20 6.5" fill="none" stroke={B.green} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
				</svg>
			) : (
				<svg width={24} height={24} viewBox="0 0 24 24">
					<rect x="8" y="8" width="12" height="12" rx="2.5" fill="none" stroke="#FFFFFF" strokeWidth={2} />
					<path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" fill="none" stroke="#FFFFFF" strokeWidth={2} />
				</svg>
			)}
			{done ? S.copied : S.copy}
		</div>
	);
};

const PointerCursor: React.FC<{frame: number}> = ({frame}) => {
	const C = S.cursor;
	const target = {x: P.x + P.w / 2 - PAD - BUTTON.inset - BUTTON.w / 2 + 14, y: panelTop + FIELD.top + FIELD.h / 2 + 6};
	const move = progress(frame, sec(C.at), sec(C.moveDur));
	const show = progress(frame, sec(C.at), sec(0.2)) * (1 - progress(frame, LINK_TIMES.friend, sec(0.3)));
	if (show <= 0) return null;
	// Glide in on a slight curve, like a hand, then rest on the button.
	const x = lerp(C.from.x, target.x, move);
	const y = lerp(C.from.y, target.y, move) - Math.sin(move * Math.PI) * 60;
	return <Cursor x={x} y={y} press={clickPress(frame)} opacity={show} />;
};

const FriendCard: React.FC<{frame: number}> = ({frame}) => {
	const {fps} = useVideoConfig();
	const enter = arrive(frame, LINK_TIMES.friend, fps);
	const got = arrive(frame, LINK_TIMES.arrive, fps);
	const pulse = interpolate(frame - LINK_TIMES.arrive, [0, sec(0.1), sec(0.7)], [0, 1, 0], clamp);
	if (enter <= 0.001) return null;

	return (
		<div
			style={{
				position: 'absolute',
				left: F.x - F.w / 2,
				top: F.y - F.h / 2,
				width: F.w,
				height: F.h,
				borderRadius: 24,
				border: `1.5px solid ${alpha(CONFIG.friend.color, 0.35 + 0.5 * pulse)}`,
				padding: 30,
				opacity: Math.min(1, enter),
				filter: `blur(${interpolate(enter, [0, 1], [10, 0], clamp)}px)`,
				transform: `translateX(${interpolate(enter, [0, 1], [160, 0])}px) scale(${1 + 0.04 * pulse})`,
				...raised(CONFIG.friend.color, 0.3 + 0.7 * pulse),
			}}
		>
			<div style={{display: 'flex', alignItems: 'center', gap: 18}}>
				<FriendIcon size={64} />
				<div>
					<div style={{fontFamily: DISPLAY, fontSize: 34, fontWeight: 800, color: B.text, letterSpacing: '-0.02em'}}>
						{CONFIG.friend.name}
					</div>
					<div style={{fontFamily: MONO, fontSize: 19, color: B.muted}}>{CONFIG.friend.domain}</div>
				</div>
			</div>
			{/* Empty inbox lines until the invite lands */}
			<div style={{marginTop: 34, display: 'flex', flexDirection: 'column', gap: 12, opacity: 1 - Math.min(1, got)}}>
				<div style={{height: 10, width: '82%', borderRadius: 5, background: B.line}} />
				<div style={{height: 10, width: '58%', borderRadius: 5, background: B.line}} />
			</div>
			<div
				style={{
					position: 'absolute',
					left: 30,
					right: 30,
					top: MESSAGE_Y - 62,
					borderRadius: 16,
					padding: '16px 20px',
					background: alpha(B.accent, 0.12),
					border: `1px solid ${alpha(B.accent, 0.45)}`,
					opacity: Math.min(1, got),
					transform: `translateY(${interpolate(got, [0, 1], [20, 0])}px) scale(${interpolate(got, [0, 1], [0.9, 1])})`,
				}}
			>
				<div style={{display: 'flex', alignItems: 'center', gap: 10, fontSize: 20, fontWeight: 600, color: B.muted}}>
					<YouIcon size={26} />
					{S.deliveredLabel}
				</div>
				<div style={{marginTop: 10, fontFamily: MONO, fontSize: 23, color: B.textTo}}>{S.url}</div>
			</div>
		</div>
	);
};

/** The copied link as a glowing pill, arcing from the field into the friend's card. */
const FlyingLink: React.FC<{frame: number}> = ({frame}) => {
	const start = LINK_TIMES.send;
	const dur = LINK_TIMES.arrive - start;
	if (frame < start || frame > LINK_TIMES.arrive + sec(0.2)) return null;
	const t = interpolate(frame, [start, start + dur], [0, 1], {...clamp, easing: easeOut});
	const lift = interpolate(frame - start, [0, sec(0.15)], [0, 1], clamp);
	const land = interpolate(frame, [LINK_TIMES.arrive - sec(0.05), LINK_TIMES.arrive + sec(0.2)], [1, 0], clamp);
	const p = flightPoint(t);
	const trail = Array.from({length: 8}, (_, k) => flightPoint(Math.max(0, t - (k + 1) * 0.035)));

	return (
		<>
			{trail.map((q, k) => (
				<div
					key={k}
					style={{
						position: 'absolute',
						left: q.x - 7,
						top: q.y - 7,
						width: 14,
						height: 14,
						borderRadius: 7,
						background: B.textTo,
						boxShadow: `0 0 16px ${B.blue}`,
						opacity: (1 - k / 8) * 0.5 * land * (t > 0.02 ? 1 : 0),
						transform: `scale(${1 - k / 10})`,
					}}
				/>
			))}
			<div
				style={{
					position: 'absolute',
					left: p.x,
					top: p.y,
					transform: `translate(-50%, -50%) scale(${lerp(1, 0.72, t) * (0.85 + 0.15 * lift)})`,
					opacity: lift * land,
					display: 'flex',
					alignItems: 'center',
					gap: 12,
					padding: '12px 22px',
					borderRadius: 999,
					background: brandFill(),
					color: '#FFFFFF',
					fontFamily: MONO,
					fontSize: 26,
					whiteSpace: 'nowrap',
					boxShadow: `inset 0 1px 0 ${alpha('#FFFFFF', 0.3)}, 0 0 40px ${alpha(B.blue, 0.8)}`,
				}}
			>
				<svg width={24} height={24} viewBox="0 0 24 24">
					<path d="M10 14a4.5 4.5 0 0 0 6.4 0l3-3a4.5 4.5 0 0 0-6.4-6.4l-1 1M14 10a4.5 4.5 0 0 0-6.4 0l-3 3a4.5 4.5 0 0 0 6.4 6.4l1-1" fill="none" stroke="#FFFFFF" strokeWidth={2.2} strokeLinecap="round" />
				</svg>
				{S.url}
			</div>
		</>
	);
};
