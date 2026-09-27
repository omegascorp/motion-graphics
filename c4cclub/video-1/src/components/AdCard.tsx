import React from 'react';
import {CONFIG} from '../config';
import {SANS} from '../fonts';
import {NodeId} from '../network/layout';
import {SiteIcon} from './SiteIcon';

const B = CONFIG.brand;

/** One-line ad: source icon + copy + tiny "Ad" tag. */
export const AdCard: React.FC<{source: NodeId; text: string}> = ({source, text}) => (
	<div
		style={{
			display: 'flex',
			alignItems: 'center',
			gap: 9,
			padding: '8px 12px 8px 8px',
			borderRadius: 12,
			background: B.adBg,
			color: B.adText,
			fontFamily: SANS,
			fontWeight: 500,
			fontSize: 17,
			whiteSpace: 'nowrap',
			maxWidth: CONFIG.network.adCard.maxW,
			boxShadow: '0 8px 20px rgba(0,0,0,0.35)',
		}}
	>
		<SiteIcon id={source} size={24} />
		<span style={{overflow: 'hidden', textOverflow: 'ellipsis'}}>{text}</span>
		<span
			style={{
				fontSize: 11,
				fontWeight: 700,
				padding: '2px 6px',
				borderRadius: 6,
				background: B.accent,
				color: B.adText,
			}}
		>
			Ad
		</span>
	</div>
);
