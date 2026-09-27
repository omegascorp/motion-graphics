import React from 'react';
import {CONFIG} from '../config';
import {MONO, SANS} from '../fonts';
import {alpha} from '../motion';
import {raised} from '../style';

const B = CONFIG.brand;

/** A small browser window: title bar with URL, icon + name, skeleton lines. */
export const BrowserCard: React.FC<{
	w: number;
	h: number;
	domain: React.ReactNode;
	icon: React.ReactNode;
	name: React.ReactNode;
	borderColor: string;
	/** 0 → 1: coloured glow around the card (arrivals, focus). */
	glow?: number;
	glowColor?: string;
	footer?: React.ReactNode;
}> = ({w, h, domain, icon, name, borderColor, glow = 0, glowColor = B.accent, footer}) => {
	const bar = Math.round(h * 0.18);
	return (
		<div
			style={{
				width: w,
				height: h,
				borderRadius: 16,
				border: `1.5px solid ${borderColor}`,
				overflow: 'hidden',
				display: 'flex',
				flexDirection: 'column',
				fontFamily: SANS,
				...raised(glowColor, glow),
			}}
		>
			<div
				style={{
					height: bar,
					background: alpha('#FFFFFF', 0.035),
					borderBottom: `1px solid ${alpha('#FFFFFF', 0.05)}`,
					display: 'flex',
					alignItems: 'center',
					gap: 5,
					padding: '0 10px',
				}}
			>
				{[0, 1, 2].map((i) => (
					<div key={i} style={{width: 7, height: 7, borderRadius: 4, background: B.lineHi}} />
				))}
				<div
					style={{
						marginLeft: 8,
						flex: 1,
						height: bar - 10,
						borderRadius: 6,
						background: alpha(B.black, 0.45),
						color: B.muted,
						fontFamily: MONO,
						fontSize: 11,
						display: 'flex',
						alignItems: 'center',
						padding: '0 8px',
						whiteSpace: 'nowrap',
						overflow: 'hidden',
					}}
				>
					{domain}
				</div>
			</div>
			<div style={{flex: 1, display: 'flex', alignItems: 'center', gap: 12, padding: '0 14px'}}>
				{icon}
				<div style={{flex: 1, display: 'flex', flexDirection: 'column', gap: 7}}>
					<div style={{color: B.text, fontWeight: 700, fontSize: 19, lineHeight: 1.1, height: 21, letterSpacing: '-0.01em'}}>
						{name}
					</div>
					<div style={{height: 6, width: '85%', borderRadius: 3, background: B.line}} />
					<div style={{height: 6, width: '55%', borderRadius: 3, background: B.line}} />
				</div>
			</div>
			{footer}
		</div>
	);
};
