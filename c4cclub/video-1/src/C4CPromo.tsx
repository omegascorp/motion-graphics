import React from 'react';
import {AbsoluteFill, Sequence} from 'remotion';
import {Soundtrack} from './audio/Soundtrack';
import {Enter, SceneShell} from './components/SceneShell';
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

type SceneKey = (typeof SCENES)[number]['key'];

const enterOf = (key: SceneKey): Enter => {
	const t = (CONFIG.transitions as Record<string, unknown>)[key] as Enter | undefined;
	return t ?? null;
};

export const C4CPromo: React.FC = () => (
	<AbsoluteFill style={{background: CONFIG.brand.black}}>
		{SCENES.map(({key, Scene}, i) => {
			const s = CONFIG.scenes[key];
			const next = SCENES[i + 1];
			// A scene covered by the next one's transition stays mounted underneath it.
			const coveredByNext = next ? enterOf(next.key) !== null : false;
			const tail = coveredByNext ? sec(CONFIG.transitions.dur) : 0;
			return (
				<Sequence key={key} name={key} from={sec(s.start)} durationInFrames={sec(s.duration) + tail}>
					<SceneShell start={sec(s.start)} duration={sec(s.duration)} enter={enterOf(key)} coveredByNext={coveredByNext}>
						<Scene />
					</SceneShell>
				</Sequence>
			);
		})}
		<Soundtrack />
	</AbsoluteFill>
);
