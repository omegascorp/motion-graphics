import React from 'react';
import {Html5Audio, Sequence, staticFile} from 'remotion';
import {CONFIG} from '../config';
import {CUES} from './cues';

const A = CONFIG.audio;

/** Music bed plus every sound effect, each placed on its cue frame. */
export const Soundtrack: React.FC = () => (
	<>
		<Html5Audio src={staticFile(`${A.dir}/${A.music.file}`)} volume={A.music.volume} />
		{CUES.map((c, i) => (
			<Sequence key={`${c.file}-${c.at}-${i}`} from={c.at} layout="none" name={c.file}>
				<Html5Audio src={staticFile(c.file)} volume={c.volume} />
			</Sequence>
		))}
	</>
);
