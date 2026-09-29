import React from 'react';
import {Composition} from 'remotion';
import {CONFIG, sec} from './config';
import {C4CReferral} from './C4CReferral';

export const RemotionRoot: React.FC = () => (
	<Composition
		id={CONFIG.video.id}
		component={C4CReferral}
		width={CONFIG.video.width}
		height={CONFIG.video.height}
		fps={CONFIG.video.fps}
		durationInFrames={sec(CONFIG.video.durationInSeconds)}
	/>
);
