import React from 'react';
import {AbsoluteFill, Sequence} from 'remotion';
import {CONFIG, sec} from './config';
import {Bouncer} from './scenes/Bouncer';
import {CTA} from './scenes/CTA';
import {Hook} from './scenes/Hook';
import {HowItWorks} from './scenes/HowItWorks';
import {NetworkReveal} from './scenes/NetworkReveal';
import {SocialProof} from './scenes/SocialProof';

const SCENES = [
	{key: 'hook', Scene: Hook},
	{key: 'network', Scene: NetworkReveal},
	{key: 'how', Scene: HowItWorks},
	{key: 'bouncer', Scene: Bouncer},
	{key: 'social', Scene: SocialProof},
	{key: 'cta', Scene: CTA},
] as const;

export const C4CPromo: React.FC = () => (
	<AbsoluteFill style={{background: CONFIG.brand.black}}>
		{SCENES.map(({key, Scene}) => {
			const s = CONFIG.scenes[key];
			return (
				<Sequence key={key} name={key} from={sec(s.start)} durationInFrames={sec(s.duration)}>
					<Scene />
				</Sequence>
			);
		})}
	</AbsoluteFill>
);
