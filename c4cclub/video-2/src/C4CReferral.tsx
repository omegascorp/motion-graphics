import React from 'react';
import {AbsoluteFill, Sequence} from 'remotion';
import {Soundtrack} from './audio/Soundtrack';
import {Enter, SceneShell} from './components/SceneShell';
import {CONFIG, SceneKey, sec} from './config';
import {CTA} from './scenes/CTA';
import {FairPlay} from './scenes/FairPlay';
import {Hook} from './scenes/Hook';
import {InviteLink} from './scenes/InviteLink';
import {Join} from './scenes/Join';
import {Reward} from './scenes/Reward';

const SCENES: {key: SceneKey; Scene: React.FC}[] = [
	{key: 'hook', Scene: Hook},
	{key: 'link', Scene: InviteLink},
	{key: 'join', Scene: Join},
	{key: 'reward', Scene: Reward},
	{key: 'fair', Scene: FairPlay},
	{key: 'cta', Scene: CTA},
];

export const enterOf = (key: SceneKey): Enter => {
	const t = (CONFIG.transitions as Record<string, unknown>)[key] as Enter | undefined;
	return t ?? null;
};

export const C4CReferral: React.FC = () => (
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
