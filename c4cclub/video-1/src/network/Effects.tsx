import React from 'react';
import {interpolate} from 'remotion';
import {CONFIG, sec} from '../config';
import {DISPLAY} from '../fonts';
import {alpha, arrive, progress} from '../motion';
import {CreditCoin, coinFlip} from '../components/CreditCoin';
import {NETWORK, NodeId} from './layout';

const B = CONFIG.brand;
const N = CONFIG.network;
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

export type Arrival = {node: NodeId; at: number; tone?: 'brand' | 'pop'};
export type Gain = {at: number; text: string};

/** Expanding ring + a burst of sparks thrown off the card that received an ad. */
export const ArrivalFx: React.FC<{arrival: Arrival; frame: number}> = ({arrival, frame}) => {
	const life = sec(Math.max(N.pulse.rise + N.pulse.fall, N.burst.dur));
	const d = frame - arrival.at;
	if (d < 0 || d > life) return null;
	const n = NETWORK.nodes[arrival.node];
	const color = arrival.tone === 'pop' ? B.pop : B.textTo;
	const ring = progress(frame, arrival.at, sec(N.pulse.rise + N.pulse.fall));
	const burst = progress(frame, arrival.at, sec(N.burst.dur));
	return (
		<>
			<div
				style={{
					position: 'absolute',
					left: n.x - n.w / 2,
					top: n.y - n.h / 2,
					width: n.w,
					height: n.h,
					borderRadius: 18,
					border: `3px solid ${color}`,
					boxShadow: `0 0 30px ${alpha(color, 0.6)}`,
					opacity: interpolate(ring, [0, 1], [N.pulse.ringOpacity + 0.3, 0]),
					transform: `scale(${interpolate(ring, [0, 1], [1, N.pulse.ringScale])})`,
				}}
			/>
			{Array.from({length: N.burst.count}, (_, k) => {
				const ang = (k / N.burst.count) * Math.PI * 2 + arrival.at * 0.7;
				const reach = Math.max(n.w, n.h) / 2 + N.burst.distance * burst * (0.7 + 0.3 * ((k * 7) % 3) / 2);
				const size = interpolate(burst, [0, 1], [7, 2]);
				return (
					<div
						key={k}
						style={{
							position: 'absolute',
							left: n.x + Math.cos(ang) * reach * (n.w / n.h) * 0.75 - size / 2,
							top: n.y + Math.sin(ang) * reach * 0.75 - size / 2,
							width: size,
							height: size,
							borderRadius: size,
							background: k % 3 === 0 ? '#FFFFFF' : color,
							boxShadow: `0 0 10px ${color}`,
							opacity: interpolate(burst, [0, 0.15, 1], [0, 1, 0], clamp),
						}}
					/>
				);
			})}
		</>
	);
};

/** "+80%" chip that pops above "Your app" and floats away. */
export const GainFx: React.FC<{gain: Gain; frame: number; fps: number}> = ({gain, frame, fps}) => {
	const life = sec(1.2);
	const d = frame - gain.at;
	if (d < 0 || d > life) return null;
	const you = NETWORK.nodes.you;
	const pop = arrive(frame, gain.at, fps);
	const rise = progress(frame, gain.at, life);
	return (
		<div
			style={{
				position: 'absolute',
				left: you.x + you.w / 2 - 6,
				top: you.y - you.h / 2 - 14 - rise * 64,
				transform: `translate(-50%, -50%) scale(${interpolate(pop, [0, 1], [0.4, 1])}) rotate(${interpolate(pop, [0, 1], [-12, -4])}deg)`,
				opacity: Math.min(1, pop) * interpolate(rise, [0.6, 1], [1, 0], clamp),
				display: 'flex',
				alignItems: 'center',
				gap: 8,
				padding: '8px 16px 8px 8px',
				borderRadius: 999,
				background: B.pop,
				color: B.adText,
				fontFamily: DISPLAY,
				fontWeight: 800,
				fontSize: 26,
				boxShadow: `0 0 30px ${alpha(B.pop, 0.7)}, 0 8px 20px rgba(0,0,0,0.4)`,
			}}
		>
			<CreditCoin size={30} rotateY={coinFlip((frame - gain.at) / sec(0.42))} />
			{gain.text}
		</div>
	);
};
