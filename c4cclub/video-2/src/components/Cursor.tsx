import React from 'react';

/** A macOS-style pointer. `press` 0 → 1 squeezes it for a click. */
export const Cursor: React.FC<{x: number; y: number; press?: number; opacity?: number}> = ({x, y, press = 0, opacity = 1}) => (
	<svg
		width={44}
		height={44}
		viewBox="0 0 24 24"
		style={{
			position: 'absolute',
			left: x - 6,
			top: y - 3,
			opacity,
			transform: `scale(${1 - 0.18 * press})`,
			transformOrigin: '6px 3px',
			filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.6))',
		}}
	>
		<path d="M4 2.5 L4 19.5 L8.6 15.2 L11.6 21.8 L14.4 20.6 L11.4 14.1 L17.6 14.1 Z" fill="#FFFFFF" stroke="#05040C" strokeWidth={1.3} strokeLinejoin="round" />
	</svg>
);
