// Shared visual recipes built on the brand tokens.
import type React from 'react';
import {CONFIG} from './config';
import {alpha} from './motion';

const B = CONFIG.brand;

/** Brand fill gradient (buttons, tiles): deep enough for white text. */
export const brandFill = (angle = 135) => `linear-gradient(${angle}deg, ${B.fillFrom} 0%, ${B.fillTo} 100%)`;

/** Brand glow gradient (borders, light): the brighter purple → blue. */
export const brandGlow = (angle = 135) => `linear-gradient(${angle}deg, ${B.purple} 0%, ${B.violet} 48%, ${B.blue} 100%)`;

/**
 * Gradient text with an optional moving highlight. `sweep` runs 0 → 1 across the
 * text; outside that range the highlight sits off-screen.
 */
export const gradientText = (sweep = -1): React.CSSProperties => {
	const pos = -40 + sweep * 180; // highlight centre, in % of the text width
	const shine =
		sweep >= 0 && sweep <= 1
			? `linear-gradient(100deg, transparent ${pos - 14}%, rgba(255,255,255,0.95) ${pos}%, transparent ${pos + 14}%), `
			: '';
	return {
		backgroundImage: `${shine}linear-gradient(120deg, ${B.textFrom} 0%, ${B.textTo} 100%)`,
		WebkitBackgroundClip: 'text',
		backgroundClip: 'text',
		color: 'transparent',
		WebkitTextFillColor: 'transparent',
	};
};

/** Raised dark surface: bright top edge instead of a drop shadow (as in the app). */
export const raised = (glow?: string, glowAmount = 0): React.CSSProperties => ({
	background: `linear-gradient(180deg, ${B.surfaceHi} 0%, ${B.surface} 100%)`,
	boxShadow: [
		`inset 0 1px 0 ${alpha('#FFFFFF', 0.1)}`,
		`inset 0 0 0 1px ${alpha('#FFFFFF', 0.05)}`,
		'0 12px 36px rgba(0,0,0,0.5)',
		glow && glowAmount > 0 ? `0 0 ${Math.round(18 + 42 * glowAmount)}px ${alpha(glow, 0.55 * glowAmount)}` : '',
	]
		.filter(Boolean)
		.join(', '),
});
