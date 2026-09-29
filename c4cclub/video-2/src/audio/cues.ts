// Sound cues — every one is derived from the same schedule the visuals use,
// so retiming a scene in CONFIG moves its sounds with it. Frames are global.
import {CONFIG, sec} from '../config';
import {fairRowTimes} from '../scenes/FairPlay';
import {LINK_TIMES} from '../scenes/InviteLink';
import {JOIN_TIMES} from '../scenes/Join';
import {pathTimes} from '../scenes/Reward';

type Sound = keyof typeof CONFIG.audio.volumes;

export type Cue = {at: number; file: string; volume: number};

const A = CONFIG.audio;
const SC = CONFIG.scenes;
const VARIANTS = 3; // pop-1..3, land-1..3

const cue = (at: number, sound: Sound, file: string = sound, gain = 1): Cue => ({
	at: Math.max(0, Math.round(at)),
	file: `${A.dir}/${file}.wav`,
	volume: A.volumes[sound] * gain,
});
const variant = (i: number) => (i % VARIANTS) + 1;
const pop = (at: number, i: number, gain = 1) => cue(at, 'pop', `pop-${variant(i)}`, gain);
const land = (at: number, i: number) => cue(at, 'land', `land-${variant(i)}`);
const whooshInto = (sceneStart: number) => cue(sec(sceneStart - A.whooshLead), 'whoosh');

const hook = (): Cue[] => {
	const S = SC.hook;
	const words = S.line1.split(' ').map((_, i) => pop(sec(S.wordsAt + i * S.wordStagger), i, 0.8));
	return [...words, land(sec(S.line2At), 2)];
};

const link = (): Cue[] => {
	const o = sec(SC.link.start);
	const T = LINK_TIMES;
	return [
		whooshInto(SC.link.start),
		pop(o + T.panel, 0),
		pop(o + T.field, 1, 0.8),
		...T.rewards.map((at, i) => pop(o + at, i + 2, 0.6)),
		cue(o + T.click, 'tick', 'tick', 1.6),
		cue(o + T.click + 2, 'confirm', 'confirm', 0.8),
		pop(o + T.friend, 2),
		cue(o + T.send, 'send'),
		land(o + T.arrive, 0),
	];
};

const join = (): Cue[] => {
	const o = sec(SC.join.start);
	const T = JOIN_TIMES;
	return [
		whooshInto(SC.join.start),
		pop(o + T.card, 0),
		cue(o + T.welcome, 'fill'),
		...T.coinLands.map((at) => cue(o + at, 'coin', 'coin', 0.7)),
		cue(o + T.tag, 'confirm', 'confirm', 0.8),
	];
};

const reward = (): Cue[] => {
	const o = sec(SC.reward.start);
	const paths = SC.reward.paths.flatMap((_, i) => {
		const t = pathTimes(i);
		return [
			pop(o + t.lane, i),
			...t.clicks.map((at) => cue(o + at, 'tick')),
			cue(o + t.full, 'confirm', 'confirm', 0.8),
			...t.coins.map((c) => cue(o + c.land, 'coin', 'coin', 0.6)),
		];
	});
	return [whooshInto(SC.reward.start), pop(o + sec(SC.reward.balanceAt), 2), ...paths];
};

const fair = (): Cue[] => {
	const S = SC.fair;
	const o = sec(S.start);
	const rows = S.rows.flatMap((row, i) => {
		const t = fairRowTimes(i);
		return [pop(o + t.inAt, i), cue(o + t.verdictAt, row.ok ? 'confirm' : 'deny', row.ok ? 'confirm' : 'deny', 0.8)];
	});
	return [whooshInto(S.start), ...rows, pop(o + sec(S.footnoteAt), 1, 0.6)];
};

const cta = (): Cue[] => {
	const S = SC.cta;
	const o = sec(S.start);
	return [whooshInto(S.start), cue(o + sec(S.wordmarkAt), 'hit'), pop(o + sec(S.buttonAt), 0, 1.3)];
};

export const CUES: Cue[] = [...hook(), ...link(), ...join(), ...reward(), ...fair(), ...cta()].sort((a, b) => a.at - b.at);
