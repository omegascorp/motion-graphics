import React from 'react';
import {CONFIG} from '../config';
import {DISPLAY} from '../fonts';
import {KineticWords} from './KineticWords';

/** The scene's headline, pinned to the top of the frame, words landing one by one. */
export const Caption: React.FC<{text: string; accent: readonly string[]; at: number; sweep?: [number, number]; top?: number}> = ({
	text,
	accent,
	at,
	sweep,
	top = 120,
}) => (
	<div style={{position: 'absolute', left: 0, right: 0, top}}>
		<KineticWords
			text={text}
			at={at}
			stagger={4}
			accent={[...accent]}
			sweep={sweep}
			style={{fontFamily: DISPLAY, fontSize: 76, fontWeight: 800, letterSpacing: '-0.03em', color: CONFIG.brand.text, gap: '0.24em'}}
		/>
	</div>
);
