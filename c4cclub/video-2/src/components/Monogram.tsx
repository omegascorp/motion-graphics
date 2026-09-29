import React from 'react';
import {CONFIG} from '../config';
import {SANS} from '../fonts';

/** A member's app icon: a rounded colour tile carrying its initial. */
export const Monogram: React.FC<{letter: string; color: string; size: number}> = ({letter, color, size}) => (
	<div
		style={{
			width: size,
			height: size,
			flexShrink: 0,
			borderRadius: size * 0.25,
			background: color,
			color: CONFIG.brand.text,
			fontFamily: SANS,
			fontWeight: 700,
			fontSize: size * 0.5,
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'center',
			boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.25)',
		}}
	>
		{letter}
	</div>
);

export const FriendIcon: React.FC<{size: number}> = ({size}) => (
	<Monogram letter={CONFIG.friend.monogram} color={CONFIG.friend.color} size={size} />
);

export const YouIcon: React.FC<{size: number}> = ({size}) => (
	<Monogram letter={CONFIG.you.monogram} color={CONFIG.you.color} size={size} />
);
