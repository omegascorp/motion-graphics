import React from 'react';
import {CONFIG} from '../config';
import {MONO, SANS} from '../fonts';

const B = CONFIG.brand;

/** A small browser window: title bar with URL, icon + name, skeleton lines. */
export const BrowserCard: React.FC<{
	w: number;
	h: number;
	domain: React.ReactNode;
	icon: React.ReactNode;
	name: React.ReactNode;
	borderColor: string;
	footer?: React.ReactNode;
}> = ({w, h, domain, icon, name, borderColor, footer}) => {
	const bar = Math.round(h * 0.18);
	return (
		<div
			style={{
				width: w,
				height: h,
				borderRadius: 14,
				background: B.surface,
				border: `2px solid ${borderColor}`,
				boxShadow: '0 10px 30px rgba(0,0,0,0.35)',
				overflow: 'hidden',
				display: 'flex',
				flexDirection: 'column',
				fontFamily: SANS,
			}}
		>
			<div
				style={{
					height: bar,
					background: B.surfaceHi,
					display: 'flex',
					alignItems: 'center',
					gap: 5,
					padding: '0 10px',
				}}
			>
				{[0, 1, 2].map((i) => (
					<div key={i} style={{width: 7, height: 7, borderRadius: 4, background: B.line}} />
				))}
				<div
					style={{
						marginLeft: 8,
						flex: 1,
						height: bar - 10,
						borderRadius: 6,
						background: B.surface,
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
					<div style={{color: B.text, fontWeight: 700, fontSize: 18, lineHeight: 1.1, height: 20}}>{name}</div>
					<div style={{height: 6, width: '85%', borderRadius: 3, background: B.line}} />
					<div style={{height: 6, width: '55%', borderRadius: 3, background: B.line}} />
				</div>
			</div>
			{footer}
		</div>
	);
};
