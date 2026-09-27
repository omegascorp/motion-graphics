import React from 'react';
import {AbsoluteFill, interpolate, Sequence, useCurrentFrame, useVideoConfig} from 'remotion';
import {CONFIG, sec} from '../config';
import {MONO, SANS} from '../fonts';
import {arrive, lerp, progress} from '../motion';
import {SiteIcon} from '../components/SiteIcon';
import {BASE_NODES, Flight} from '../network/layout';
import {Gain, Network} from '../network/Network';

const B = CONFIG.brand;
const S = CONFIG.scenes.how;
const Y = CONFIG.yourApp;
const [STEP1, STEP2, STEP3] = S.steps;

// ── Schedule (scene-local frames), computed once ──────────────────────────────
export const step2Start = sec(STEP2.start);
export const step3Start = sec(STEP3.start);

export const OUTBOUND: Flight[] = S.step2.targets.map((to, i) => ({
	from: 'you',
	to,
	start: step2Start + sec(S.step2.at + i * S.step2.stagger),
	dur: sec(S.step2.flightDur),
}));
export const INBOUND: Flight[] = S.step3.sources.map((from, i) => ({
	from,
	to: 'you',
	start: step3Start + sec(S.step3.at + i * S.step3.stagger),
	dur: sec(S.step3.flightDur),
}));
const FLIGHTS = [...OUTBOUND, ...INBOUND];
const GAINS: Gain[] = INBOUND.map((f) => ({at: f.start + f.dur, text: S.step3.gainLabel}));

const CREDIT_EVENTS = [
	...OUTBOUND.map((f) => ({at: f.start + f.dur, delta: -S.counter.costPerImpression})),
	...INBOUND.map((f) => ({at: f.start + f.dur, delta: S.counter.gainPerClick})),
];

export const POPULATE_AT = sec(STEP1.start + S.step1.populateAt);
export const SNIPPET_AT = step3Start + sec(S.step3.snippetAt);

export const HowItWorks: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const move = progress(frame, 0, sec(S.camera.moveDur));

	return (
		<AbsoluteFill style={{background: B.bg}}>
			<Network
				frame={frame}
				camera={{scale: lerp(1, S.camera.scale, move), x: lerp(0, S.camera.x, move), y: lerp(0, S.camera.y, move)}}
				nodes={BASE_NODES}
				flights={FLIGHTS}
				gains={GAINS}
				populate={arrive(frame, POPULATE_AT, fps)}
				snippet={arrive(frame, SNIPPET_AT, fps)}
			/>

			{S.steps.map((step, i) => (
				<Sequence key={step.n} from={sec(step.start)} durationInFrames={sec(step.dur)} layout="none">
					<StepPanel index={i} />
				</Sequence>
			))}

			<Counter frame={frame} />
		</AbsoluteFill>
	);
};

// ── Left-hand step panel ──────────────────────────────────────────────────────
const StepPanel: React.FC<{index: number}> = ({index}) => {
	const frame = useCurrentFrame(); // step-local
	const {fps} = useVideoConfig();
	const step = S.steps[index];
	const numIn = arrive(frame, 0, fps);
	const titleIn = arrive(frame, sec(0.08), fps);
	const out = progress(frame, sec(step.dur - S.stepExit), sec(S.stepExit));

	return (
		<div
			style={{
				position: 'absolute',
				left: S.panel.x,
				top: S.panel.top,
				width: S.panel.width,
				fontFamily: SANS,
				opacity: 1 - out,
				transform: `translateY(${-out * 20}px)`,
			}}
		>
			<div
				style={{
					fontSize: 240,
					fontWeight: 700,
					lineHeight: 0.85,
					color: B.accent,
					opacity: Math.min(1, numIn),
					transform: `translateX(${interpolate(numIn, [0, 1], [-40, 0])}px)`,
				}}
			>
				{step.n}
			</div>
			<div
				style={{
					marginTop: 28,
					fontSize: 68,
					fontWeight: 700,
					lineHeight: 1.05,
					letterSpacing: -1,
					color: B.text,
					opacity: Math.min(1, titleIn),
					transform: `translateY(${interpolate(titleIn, [0, 1], [20, 0])}px)`,
				}}
			>
				{step.title}
			</div>
			{step.body ? (
				<div
					style={{
						marginTop: 18,
						fontSize: 30,
						lineHeight: 1.35,
						color: B.muted,
						opacity: Math.min(1, arrive(frame, sec(0.2), fps)),
					}}
				>
					{step.body}
				</div>
			) : null}
			{index === 0 ? <AddAppForm frame={frame} /> : null}
		</div>
	);
};

/** Step 1: URL types into an input, then name + icon snap in. */
const AddAppForm: React.FC<{frame: number}> = ({frame}) => {
	const {fps} = useVideoConfig();
	const typeStart = sec(S.step1.typeAt);
	const perChar = S.step1.charEvery * fps;
	const chars = Math.max(0, Math.min(Y.url.length, Math.floor((frame - typeStart) / perChar)));
	const typing = chars < Y.url.length;
	const caretOn = typing || Math.floor(frame / 8) % 2 === 0;
	const inputIn = arrive(frame, sec(0.15), fps);
	const snap = arrive(frame, sec(S.step1.populateAt), fps);

	return (
		<div style={{marginTop: 34, opacity: Math.min(1, inputIn)}}>
			<div style={{fontSize: 22, color: B.muted, marginBottom: 10}}>{S.step1.inputLabel}</div>
			<div
				style={{
					width: 520,
					height: 72,
					borderRadius: 14,
					background: B.surface,
					border: `2px solid ${typing ? B.accent : B.line}`,
					display: 'flex',
					alignItems: 'center',
					padding: '0 22px',
					fontFamily: MONO,
					fontSize: 28,
					color: B.text,
				}}
			>
				{Y.url.slice(0, chars)}
				<span style={{width: 3, height: 32, marginLeft: 3, background: B.accent, opacity: caretOn ? 1 : 0}} />
			</div>
			<div
				style={{
					marginTop: 18,
					display: 'flex',
					alignItems: 'center',
					gap: 16,
					opacity: Math.min(1, snap),
					transform: `translateY(${interpolate(snap, [0, 1], [14, 0])}px) scale(${interpolate(snap, [0, 1], [0.9, 1])})`,
					transformOrigin: 'left center',
				}}
			>
				<SiteIcon id="you" size={64} />
				<div>
					<div style={{fontSize: 34, fontWeight: 700, color: B.text}}>{Y.name}</div>
					<div style={{fontSize: 22, fontFamily: MONO, color: B.muted}}>{Y.domain}</div>
				</div>
			</div>
		</div>
	);
};

/** Credit counter: appears with step 2, ticks down on landings, up on hosted clicks. */
const Counter: React.FC<{frame: number}> = ({frame}) => {
	const {fps} = useVideoConfig();
	const C = S.counter;
	const inAt = step2Start + sec(0.1);
	if (frame < inAt) return null;
	const enter = arrive(frame, inAt, fps);
	const value = CREDIT_EVENTS.filter((e) => frame >= e.at).reduce((v: number, e) => v + e.delta, C.start as number);
	const last = CREDIT_EVENTS.filter((e) => frame >= e.at).reduce((m, e) => Math.max(m, e.at), -Infinity);
	const bump = interpolate(frame - last, [0, sec(0.08), sec(0.35)], [0, 1, 0], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});
	const hosting = progress(frame, step3Start, sec(0.3));
	const shown = Math.abs(value - Math.round(value)) < 1e-6 ? String(Math.round(value)) : value.toFixed(1);

	return (
		<div
			style={{
				position: 'absolute',
				left: S.panel.x,
				top: C.top,
				fontFamily: SANS,
				opacity: Math.min(1, enter),
				transform: `translateY(${interpolate(enter, [0, 1], [20, 0])}px)`,
				display: 'flex',
				alignItems: 'center',
				gap: 20,
				padding: '16px 26px',
				borderRadius: 18,
				background: B.surface,
				border: `2px solid ${B.line}`,
			}}
		>
			<div style={{display: 'flex', alignItems: 'baseline', gap: 10}}>
				<span
					style={{
						fontSize: 56,
						fontWeight: 700,
						color: B.text,
						fontVariantNumeric: 'tabular-nums',
						display: 'inline-block',
						transform: `scale(${1 + bump * 0.08})`,
						transformOrigin: 'left center',
					}}
				>
					{shown}
				</span>
				<span style={{fontSize: 30, color: B.text, fontWeight: 500}}>{C.unit}</span>
			</div>
			<div style={{position: 'relative', width: 330, height: 36}}>
				{[C.labelFree, C.labelHosting].map((label, i) => (
					<span
						key={label}
						style={{
							position: 'absolute',
							left: 0,
							top: 0,
							fontSize: 24,
							fontWeight: 700,
							color: i === 0 ? B.accent : B.green,
							padding: '4px 12px',
							borderRadius: 999,
							background: `${i === 0 ? B.accent : B.green}22`,
							whiteSpace: 'nowrap',
							opacity: i === 0 ? 1 - hosting : hosting,
						}}
					>
						{label}
					</span>
				))}
			</div>
		</div>
	);
};
