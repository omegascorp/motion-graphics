import React from 'react';
import {CONFIG} from '../config';

/** Stand-in icon for the viewer's own app (an espresso cup). */
export const YourAppIcon: React.FC<{size: number}> = ({size}) => {
	const {tile, ink} = CONFIG.yourApp.iconColors;
	return (
		<svg width={size} height={size} viewBox="0 0 48 48" style={{display: 'block'}}>
			<rect width="48" height="48" rx="12" fill={tile} />
			<path d="M12 21h19v6a8 8 0 0 1-8 8h-3a8 8 0 0 1-8-8z" fill={ink} />
			<path d="M31 23h2.5a3.5 3.5 0 0 1 0 7H30" stroke={ink} strokeWidth="2.5" fill="none" />
			<path d="M18 11c0 2.5 2.5 2.5 2.5 5M24 11c0 2.5 2.5 2.5 2.5 5" stroke={ink} strokeWidth="2" strokeLinecap="round" fill="none" />
		</svg>
	);
};
