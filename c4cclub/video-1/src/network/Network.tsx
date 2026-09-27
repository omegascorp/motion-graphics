import React from 'react';
import {AbsoluteFill, interpolate, interpolateColors, useVideoConfig} from 'remotion';
import {CONFIG, sec} from '../config';
import {arrive, easeOut, progress} from '../motion';
import {AdCard} from '../components/AdCard';
import {BrowserCard} from '../components/BrowserCard';
import {SiteIcon} from '../components/SiteIcon';
import {YouCard} from '../components/YouCard';
import {Edges} from './Edges';
import {Arrival, ArrivalFx, Gain, GainFx} from './Effects';
import {adFor, Flight, NETWORK, NodeId, pointOnFlight} from './layout';

export type {Gain} from './Effects';

const B = CONFIG.brand;
const N = CONFIG.network;
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

/**
 * World point (cx, cy) maps to screen centre + (x, y), at `scale`.
 * `tilt` leans the whole network back in 3D (degrees about X); `roll` turns it about Z.
 */
export type Camera = {scale: number; x: number; y: number; tilt?: number; roll?: number};

type Props = {
	frame: number;
	/** Global frame for continuous ambient motion (packets, float). Defaults to `frame`. */
	clock?: number;
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
	clock = frame,
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
	const arrivals: Arrival[] = flights.map((f) => ({node: f.to, at: f.start + f.dur, tone: f.tone}));
	const pulseOf = (id: NodeId) =>
		Math.min(
			1,
			arrivals
				.filter((a) => a.node === id)
				.reduce(
					(sum, a) =>
						sum +
						interpolate(frame - a.at, [0, pulseRise, pulseRise + pulseFall], [0, 1, 0], {...clamp, easing: easeOut}),
					0,
				),
		);

	// Slow handheld float, on the global clock so it never jumps at a cut.
	const w = (2 * Math.PI * clock) / (fps * N.drift.period);
	const fx = Math.sin(w) * N.drift.x;
	const fy = Math.sin(w * 0.73 + 1.3) * N.drift.y;
	const world = `translate(${width / 2 + camera.x + fx}px, ${height / 2 + camera.y + fy}px) scale(${camera.scale}) translate(${-N.center.x}px, ${-N.center.y}px)`;
	const lean = `rotateX(${camera.tilt ?? 0}deg) rotateZ(${camera.roll ?? 0}deg)`;

	return (
		<AbsoluteFill style={{perspective: N.perspective, ...style}}>
			<AbsoluteFill style={{transform: lean, transformStyle: 'preserve-3d'}}>
				<div style={{position: 'absolute', left: 0, top: 0, width, height, transformOrigin: '0 0', transform: world}}>
					<Edges
						frame={frame}
						clock={clock}
						fps={fps}
						visible={visible}
						edgeEnter={edgeEnter}
						edgeDraw={edgeDraw}
						flights={flights}
						width={width}
						height={height}
					/>

					{arrivals
						.filter((a) => visible.has(a.node))
						.map((a, i) => (
							<ArrivalFx key={`arr-${i}`} arrival={a} frame={frame} />
						))}

					{nodes.map((id) => {
						const n = NETWORK.nodes[id];
						const enter = enterOf(id);
						const pulse = pulseOf(id);
						const scale = interpolate(enter, [0, 1], [0.6, 1]) * (1 + N.pulse.cardScale * pulse);
						const lift = interpolate(enter, [0, 1], [30, 0]);
						return (
							<div
								key={id}
								style={{
									position: 'absolute',
									left: n.x - n.w / 2,
									top: n.y - n.h / 2,
									opacity: Math.min(1, enter),
									filter: enter < 0.98 ? `blur(${(1 - Math.min(1, enter)) * 8}px)` : undefined,
									transform: `translateY(${lift}px) scale(${scale})`,
								}}
							>
								{n.isYou ? (
									<YouCard w={n.w} h={n.h} pulse={pulse} populate={populate} snippet={snippet} />
								) : (
									<BrowserCard
										w={n.w}
										h={n.h}
										domain={n.site!.domain}
										icon={<SiteIcon id={id} size={50} />}
										name={n.site!.name}
										borderColor={interpolateColors(pulse, [0, 1], [B.line, B.accent])}
										glow={pulse}
										glowColor={B.blue}
									/>
								)}
							</div>
						);
					})}

					{flights.map((f, i) => (
						<FlyingAd key={`flight-${i}`} flight={f} frame={frame} fps={fps} />
					))}

					{gains.map((g, i) => (
						<GainFx key={`gain-${i}`} gain={g} frame={frame} fps={fps} />
					))}
				</div>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};

/** An ad detaching with a spring, riding the curve, banking into turns, shrinking into its target. */
const FlyingAd: React.FC<{flight: Flight; frame: number; fps: number}> = ({flight: f, frame, fps}) => {
	const local = frame - f.start;
	const exit = sec(N.flightExit);
	if (local < 0 || local > f.dur + exit) return null;
	const t = progress(frame, f.start, f.dur);
	const p = pointOnFlight(f.from, f.to, t);
	const ahead = pointOnFlight(f.from, f.to, Math.min(1, t + 0.03));
	const bank = Math.max(-8, Math.min(8, (ahead.x - p.x) * 0.25)) * (1 - t);
	const lift = arrive(frame, f.start, fps);
	const land = progress(frame, f.start + f.dur, exit);
	const scale = interpolate(lift, [0, 1], [0.4, 1]) * interpolate(land, [0, 1], [1, 0.3]);
	return (
		<div
			style={{
				position: 'absolute',
				left: p.x,
				top: p.y,
				opacity: Math.min(1, lift) * (1 - land),
				transform: `translate(-50%, -50%) scale(${scale}) rotate(${bank}deg)`,
			}}
		>
			<AdCard source={f.from} text={adFor(f.from)} glow={f.tone === 'pop' ? B.pop : B.blue} />
		</div>
	);
};
