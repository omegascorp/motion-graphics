import React from 'react';
import {CONFIG} from '../config';
import {DISPLAY} from '../fonts';
import {CreditCoin} from './CreditCoin';

/** A coin beside a credit amount, rounded to whole credits. `bump` 0 → 1 swells it. */
export const CreditCount: React.FC<{value: number; size: number; bump?: number; rotateY?: number; color?: string}> = ({
	value,
	size,
	bump = 0,
	rotateY = 0,
	color = CONFIG.brand.text,
}) => (
	<div
		style={{
			display: 'flex',
			alignItems: 'center',
			gap: size * 0.22,
			transform: `scale(${1 + 0.08 * bump})`,
			perspective: 600,
		}}
	>
		<CreditCoin size={size * 0.72} rotateY={rotateY} glow={0.25 + 0.6 * bump} />
		<span
			style={{
				fontFamily: DISPLAY,
				fontSize: size,
				fontWeight: 800,
				letterSpacing: '-0.04em',
				lineHeight: 1,
				fontVariantNumeric: 'tabular-nums',
				color,
			}}
		>
			{Math.round(value)}
		</span>
	</div>
);
