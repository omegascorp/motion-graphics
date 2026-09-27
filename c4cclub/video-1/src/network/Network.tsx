import React from 'react';
import {AbsoluteFill, interpolate, interpolateColors, useVideoConfig} from 'remotion';
import {CONFIG, sec} from '../config';
import {MONO, SANS} from '../fonts';
import {alpha, arrive, easeOut, progress} from '../motion';
import {AdCard} from '../components/AdCard';
import {BrowserCard} from '../components/BrowserCard';
import {SiteIcon} from '../components/SiteIcon';
import {adFor, Flight, NETWORK, NodeId, pointOnFlight} from './layout';

const B = CONFIG.brand;
const N = CONFIG.network;
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

/** World point (cx, cy) maps to screen centre + (x, y), at `scale`. */
export type Camera = {scale: number; x: number; y: number};

export type Gain = {at: number; text: string};

type Props = {
	frame: number;
	camera: Camera;
	nodes: NodeId[];
	/** Frame at which a node springs in. Missing = already present. */
	nodeEnter?: Record<NodeId, number>;
	/** Frame at which an edge (by key) starts drawing. Missing = already drawn. */
	edgeEnter?: Record<string, number>;
	edgeDraw?: number;
	flights?: Flight[];
	/** "+80%" labels popping above "Your app". */
	gains?: Gain[];
	/** 0 → 1: "Your app" name + icon populated. */
	populate: number;
	/** 0 → 1: host snippet slid into "Your app". */
	snippet: number;
	style?: React.CSSProperties;
};

export const Network: React.FC<Props> = ({
	frame,
	camera,
	nodes,
	nodeEnter = {},
	edgeEnter = {},
	edgeDraw = sec(0.6),
	flights = [],
	gains = [],
	populate,
	snippet,
	style,
}) => {
	const {fps, width, height} = useVideoConfig();
	const visible = new Set(nodes);

	const enterOf = (id: NodeId) => (id in nodeEnter ? arrive(frame, nodeEnter[id], fps) : 1);

	// Pulses: every arrival bumps the receiving card and throws a ring.
	const pulseRise = sec(N.pulse.rise);
	const pulseFall = sec(N.pulse.fall);
	const arrivals = flights.map((f) => ({node: f.to, at: f.start + f.dur}));
	const pulseOf = (id: NodeId) =>
		Math.min(
			1,
			arrivals
				.filter((a) => a.node === id)
				.reduce(
					(sum, a) =>
						sum +
						interpolate(frame - a.at, [0, pulseRise, pulseRise + pulseFall], [0, 1, 0], {
							...clamp,
							easing: easeOut,
						}),
					0,
				),
		);

	const transform = `translate(${width / 2 + camera.x}px, ${height / 2 + camera.y}px) scale(${camera.scale}) translate(${-N.center.x}px, ${-N.center.y}px)`;

	return (
		<AbsoluteFill style={style}>
			<div style={{position: 'absolute', left: 0, top: 0, width, height, transformOrigin: '0 0', transform}}>
				{/* Lines */}
				<svg width={width} height={height} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
					{NETWORK.edges
						.filter((e) => visible.has(e.a) && visible.has(e.b))
						.map((e) => {
							const p = e.key in edgeEnter ? progress(frame, edgeEnter[e.key], edgeDraw) : 1;
							return (
								<path
									key={e.key}
									d={e.d}
									fill="none"
									stroke={B.line}
									strokeWidth={2}
									strokeLinecap="round"
									strokeDasharray={e.length}
									strokeDashoffset={e.length * (1 - p)}
								/>
							);
						})}
				</svg>

				{/* Arrival rings (under cards) */}
				{arrivals.map((a, i) => {
					const d = frame - a.at;
					if (d < 0 || d > pulseRise + pulseFall || !visible.has(a.node)) return null;
					const n = NETWORK.nodes[a.node];
					const t = progress(frame, a.at, pulseRise + pulseFall);
					return (
						<div
							key={`ring-${i}`}
							style={{
								position: 'absolute',
								left: n.x - n.w / 2,
								top: n.y - n.h / 2,
								width: n.w,
								height: n.h,
								borderRadius: 16,
								border: `3px solid ${B.accent}`,
								opacity: interpolate(t, [0, 1], [N.pulse.ringOpacity, 0]),
								transform: `scale(${interpolate(t, [0, 1], [1, N.pulse.ringScale])})`,
							}}
						/>
					);
				})}

				{/* Site cards */}
				{nodes.map((id) => {
					const n = NETWORK.nodes[id];
					const enter = enterOf(id);
					const pulse = pulseOf(id);
					const scale = interpolate(enter, [0, 1], [0.6, 1]) * (1 + N.pulse.cardScale * pulse);
					const rest = n.isYou ? alpha(B.accent, 0.55) : B.line;
					const borderColor = interpolateColors(pulse, [0, 1], [rest, B.accent]);
					return (
						<div
							key={id}
							style={{
								position: 'absolute',
								left: n.x - n.w / 2,
								top: n.y - n.h / 2,
								opacity: Math.min(1, enter),
								transform: `scale(${scale})`,
							}}
						>
							{n.isYou ? (
								<YouCard w={n.w} h={n.h} borderColor={borderColor} populate={populate} snippet={snippet} />
							) : (
								<BrowserCard
									w={n.w}
									h={n.h}
									domain={n.site!.domain}
									icon={<SiteIcon id={id} size={48} />}
									name={n.site!.name}
									borderColor={borderColor}
								/>
							)}
						</div>
					);
				})}

				{/* Ads in flight: detach with a spring, travel ease-out along the curved line, shrink into the target */}
				{flights.map((f, i) => {
					const local = frame - f.start;
					const exit = sec(N.flightExit);
					if (local < 0 || local > f.dur + exit) return null;
					const t = progress(frame, f.start, f.dur);
					const p = pointOnFlight(f.from, f.to, t);
					const lift = arrive(frame, f.start, fps);
					const land = progress(frame, f.start + f.dur, exit);
					const scale = interpolate(lift, [0, 1], [0.4, 1]) * interpolate(land, [0, 1], [1, 0.3]);
					return (
						<div
							key={`flight-${i}`}
							style={{
								position: 'absolute',
								left: p.x,
								top: p.y,
								opacity: Math.min(1, lift) * (1 - land),
								transform: `translate(-50%, -50%) scale(${scale})`,
							}}
						>
							<AdCard source={f.from} text={adFor(f.from)} />
						</div>
					);
				})}

				{/* Credit gains above "Your app" */}
				{gains.map((g, i) => {
					const d = frame - g.at;
					if (d < 0 || d > sec(1.1)) return null;
					const you = NETWORK.nodes.you;
					const pop = arrive(frame, g.at, fps);
					const rise = progress(frame, g.at, sec(1.1));
					return (
						<div
							key={`gain-${i}`}
							style={{
								position: 'absolute',
								left: you.x + you.w / 2 - 10,
								top: you.y - you.h / 2 - 10 - rise * 50,
								transform: `translate(-50%, -50%) scale(${interpolate(pop, [0, 1], [0.5, 1])})`,
								opacity: Math.min(1, pop) * interpolate(rise, [0.6, 1], [1, 0], clamp),
								padding: '6px 12px',
								borderRadius: 999,
								background: B.green,
								color: B.adText,
								fontFamily: SANS,
								fontWeight: 700,
								fontSize: 22,
							}}
						>
							{g.text}
						</div>
					);
				})}
			</div>
		</AbsoluteFill>
	);
};

/** The centre card: empty until populated, then carries the host snippet. */
const YouCard: React.FC<{w: number; h: number; borderColor: string; populate: number; snippet: number}> = ({
	w,
	h,
	borderColor,
	populate,
	snippet,
}) => {
	const Y = CONFIG.yourApp;
	const pop = Math.min(1, populate);
	const snip = Math.min(1, snippet);
	const skeleton = (
		<div
			style={{
				width: 48,
				height: 48,
				borderRadius: 12,
				border: `2px dashed ${B.line}`,
				opacity: 1 - pop,
				position: 'absolute',
			}}
		/>
	);
	return (
		<div style={{position: 'relative'}}>
			<div
				style={{
					position: 'absolute',
					left: '50%',
					top: -38,
					transform: 'translateX(-50%)',
					padding: '5px 12px',
					borderRadius: 999,
					background: B.accent,
					color: B.adText,
					fontFamily: SANS,
					fontWeight: 700,
					fontSize: 16,
					whiteSpace: 'nowrap',
				}}
			>
				{Y.label}
			</div>
			<BrowserCard
				w={w}
				h={h}
				borderColor={borderColor}
				domain={<span style={{opacity: pop}}>{Y.domain}</span>}
				icon={
					<div style={{width: 48, height: 48, position: 'relative'}}>
						{skeleton}
						<div style={{transform: `scale(${interpolate(populate, [0, 1], [0.5, 1])})`, opacity: pop}}>
							<SiteIcon id="you" size={48} />
						</div>
					</div>
				}
				name={
					<span style={{display: 'inline-block', opacity: pop, transform: `translateX(${(1 - populate) * -12}px)`}}>
						{Y.name}
					</span>
				}
				footer={
					<div style={{height: 30, padding: '0 10px 10px', overflow: 'visible'}}>
						<div
							style={{
								height: 22,
								borderRadius: 6,
								background: B.doorBg,
								color: B.accent,
								fontFamily: MONO,
								fontSize: 10.5,
								display: 'flex',
								alignItems: 'center',
								padding: '0 8px',
								whiteSpace: 'nowrap',
								opacity: snip,
								transform: `translateX(${(1 - snippet) * -260}px)`,
							}}
						>
							{Y.snippet}
						</div>
					</div>
				}
			/>
		</div>
	);
};
