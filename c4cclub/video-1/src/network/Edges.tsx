import React from 'react';
import {interpolate} from 'remotion';
import {CONFIG, sec} from '../config';
import {progress} from '../motion';
import {edgeOfFlight, Flight, NETWORK, NodeId, pointOnFlight} from './layout';

const B = CONFIG.brand;
const N = CONFIG.network;

type Props = {
	frame: number;
	/** Global frame, so ambient packets keep flowing across cuts. */
	clock: number;
	fps: number;
	visible: Set<NodeId>;
	edgeEnter: Record<string, number>;
	edgeDraw: number;
	flights: Flight[];
	width: number;
	height: number;
};

const toneColor = (f: Flight) => (f.tone === 'pop' ? B.pop : B.textTo);

/** How lit an edge is: rises while an ad travels on it, then fades. */
const heatOf = (key: string, flights: Flight[], frame: number) =>
	Math.min(
		1,
		flights.reduce((sum, f) => {
			if (edgeOfFlight(f.from, f.to).edge.key !== key) return sum;
			return (
				sum +
				interpolate(frame, [f.start, f.start + sec(0.15), f.start + f.dur, f.start + f.dur + sec(0.5)], [0, 1, 1, 0], {
					extrapolateLeft: 'clamp',
					extrapolateRight: 'clamp',
				})
			);
		}, 0),
	);

/** Lines (base + lit layer), ambient packets and comet trails behind ads in flight. */
export const Edges: React.FC<Props> = ({frame, clock, fps, visible, edgeEnter, edgeDraw, flights, width, height}) => {
	const edges = NETWORK.edges.filter((e) => visible.has(e.a) && visible.has(e.b));
	const drawn = (key: string) => (key in edgeEnter ? progress(frame, edgeEnter[key], edgeDraw) : 1);

	return (
		<svg width={width} height={height} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
			<defs>
				<linearGradient id="net-lit" gradientUnits="userSpaceOnUse" x1={0} y1={0} x2={width} y2={height}>
					<stop offset="0" stopColor={B.purple} />
					<stop offset="0.5" stopColor={B.violet} />
					<stop offset="1" stopColor={B.blue} />
				</linearGradient>
				<filter id="net-glow" x="-50%" y="-50%" width="200%" height="200%">
					<feGaussianBlur stdDeviation="5" result="b" />
					<feMerge>
						<feMergeNode in="b" />
						<feMergeNode in="SourceGraphic" />
					</feMerge>
				</filter>
			</defs>

			{edges.map((e) => {
				const p = drawn(e.key);
				const heat = heatOf(e.key, flights, frame);
				const dash = {pathLength: 1, strokeDasharray: 1, strokeDashoffset: 1 - p};
				return (
					<g key={e.key}>
						<path d={e.d} fill="none" stroke={B.line} strokeWidth={2} strokeLinecap="round" {...dash} />
						<path
							d={e.d}
							fill="none"
							stroke="url(#net-lit)"
							strokeWidth={2 + heat * 2}
							strokeLinecap="round"
							opacity={0.4 + heat * 0.6}
							filter={heat > 0.02 ? 'url(#net-glow)' : undefined}
							{...dash}
						/>
					</g>
				);
			})}

			{/* Ambient packets: always something moving on a finished line */}
			{edges.flatMap((e, ei) => {
				if (drawn(e.key) < 1) return [];
				const settle = e.key in edgeEnter ? progress(frame, edgeEnter[e.key] + edgeDraw, sec(0.4)) : 1;
				return Array.from({length: N.packets.perEdge}, (_, k) => {
					const forward = (ei + k) % 2 === 0;
					const t = ((clock / fps) * (N.packets.speed / e.length) + (k / N.packets.perEdge) + ei * 0.137) % 1;
					const pt = pointOnFlight(forward ? e.a : e.b, forward ? e.b : e.a, t);
					return (
						<circle
							key={`${e.key}-pk${k}`}
							cx={pt.x}
							cy={pt.y}
							r={N.packets.radius}
							fill={B.textTo}
							opacity={0.75 * Math.sin(Math.PI * t) * settle}
							filter="url(#net-glow)"
						/>
					);
				});
			})}

			{/* Comet trails: a tapered streak along the curve behind each ad */}
			{flights.map((f, i) => {
				const local = frame - f.start;
				if (local < 0 || local > f.dur + sec(0.3)) return null;
				const {edge, reversed} = edgeOfFlight(f.from, f.to);
				const t = progress(frame, f.start, f.dur);
				const fade = interpolate(local, [f.dur, f.dur + sec(0.3)], [1, 0], {
					extrapolateLeft: 'clamp',
					extrapolateRight: 'clamp',
				});
				const color = toneColor(f);
				return [1, 0.6, 0.3].map((len, layer) => {
					const t0 = Math.max(0, t - N.trail * len);
					const [a, b] = reversed ? [1 - t, 1 - t0] : [t0, t];
					return (
						<path
							key={`trail-${i}-${layer}`}
							d={edge.d}
							fill="none"
							stroke={layer === 2 ? '#FFFFFF' : color}
							strokeWidth={[3, 5, 3][layer]}
							strokeLinecap="round"
							opacity={[0.35, 0.7, 0.9][layer] * fade}
							pathLength={1}
							strokeDasharray={`${Math.max(0.0001, b - a)} 2`}
							strokeDashoffset={-a}
							filter={layer === 1 ? 'url(#net-glow)' : undefined}
						/>
					);
				});
			})}
		</svg>
	);
};
