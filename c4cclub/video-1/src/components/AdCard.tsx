import React from 'react';
import {CONFIG} from '../config';
import {SANS} from '../fonts';
import {alpha} from '../motion';
import {NodeId} from '../network/layout';
import {brandFill} from '../style';
import {SiteIcon} from './SiteIcon';

const B = CONFIG.brand;

/** One-line ad: source icon + copy + tiny "Ad" tag. `glow` tints its halo. */
export const AdCard: React.FC<{source: NodeId; text: string; glow?: string}> = ({source, text, glow = B.blue}) => (
	<div
		style={{
			display: 'flex',
			alignItems: 'center',
			gap: 10,
			padding: '9px 12px 9px 9px',
			borderRadius: 14,
			background: B.adBg,
			color: B.adText,
			fontFamily: SANS,
			fontWeight: 600,
			fontSize: 18,
			letterSpacing: '-0.01em',
			whiteSpace: 'nowrap',
			maxWidth: CONFIG.network.adCard.maxW,
			boxShadow: `0 0 0 1px ${alpha('#FFFFFF', 0.6)}, 0 0 32px ${alpha(glow, 0.55)}, 0 10px 24px rgba(0,0,0,0.45)`,
		}}
	>
		<SiteIcon id={source} size={26} />
		<span style={{overflow: 'hidden', textOverflow: 'ellipsis'}}>{text}</span>
		<span
			style={{
				fontSize: 11,
				fontWeight: 700,
				padding: '3px 7px',
				borderRadius: 6,
				background: brandFill(),
				color: '#FFFFFF',
				letterSpacing: '0.04em',
			}}
		>
			AD
		</span>
	</div>
);
