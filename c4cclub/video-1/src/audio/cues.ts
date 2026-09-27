// Sound cues — every one is derived from the same schedule the visuals use,
// so retiming a scene in CONFIG moves its sounds with it. Frames are global.
import {CONFIG, sec} from '../config';
import {rowTimes} from '../scenes/Bouncer';
import {INBOUND, OUTBOUND, POPULATE_AT, SNIPPET_AT} from '../scenes/HowItWorks';
import {edgeEnter, nodeEnter} from '../scenes/NetworkReveal';
import {extraEnter} from '../scenes/SocialProof';
import {SOCIAL_FLIGHTS} from '../network/layout';

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
const land = (at: number, i: number, sound: Sound = 'land') => cue(at, sound, `land-${variant(i)}`);
const whooshInto = (sceneStart: number) => cue(sec(sceneStart - A.whooshLead), 'whoosh');

const hook = (): Cue[] => {
	const S = SC.hook;
	const words = S.line1.split(' ').map((_, i) => pop(sec(S.wordsAt + i * S.wordStagger), i, 0.8));
	return [...words, land(sec(S.line2At), 2)];
};

const network = (): Cue[] => {
	const o = sec(SC.network.start);
	const cards = Object.values(nodeEnter).map((at, i) => pop(o + at, i));
	const firstLine = Math.min(...Object.values(edgeEnter));
	return [whooshInto(SC.network.start), ...cards, cue(o + firstLine, 'fill', 'fill', 0.8)];
};

const how = (): Cue[] => {
	const S = SC.how;
	const o = sec(S.start);
	const perChar = sec(1) * S.step1.charEvery;
	const typeStart = sec(S.steps[0].start + S.step1.typeAt);
	const typing = [...CONFIG.yourApp.url].map((_, k) => cue(o + typeStart + Math.ceil((k + 1) * perChar), 'tick'));
	const steps = S.steps.map((st, i) => pop(o + sec(st.start), i, 1.2));
	const out = OUTBOUND.flatMap((f, i) => [cue(o + f.start, 'send'), land(o + f.start + f.dur, i)]);
	const inbound = INBOUND.flatMap((f) => [cue(o + f.start, 'send'), cue(o + f.start + f.dur, 'coin')]);
	return [
		whooshInto(S.start),
		...steps,
		...typing,
		cue(o + POPULATE_AT, 'confirm', 'confirm', 0.8),
		pop(o + SNIPPET_AT, 1),
		...out,
		...inbound,
	];
};

const bouncer = (): Cue[] => {
	const S = SC.bouncer;
	const o = sec(S.start);
	const statusSound = {green: 'confirm', amber: 'wait', red: 'deny'} as const;
	const rows = S.rows.flatMap((row, i) => {
		const t = rowTimes(i);
		const status = statusSound[row.tone];
		return [pop(o + t.inAt, i), cue(o + t.fillAt, 'fill'), cue(o + t.statusAt, status)];
	});
	return [whooshInto(S.start), ...rows];
};

const social = (): Cue[] => {
	const S = SC.social;
	const o = sec(S.start);
	const extras = Object.values(extraEnter).map((at, i) => pop(o + at, i));
	const flow = SOCIAL_FLIGHTS.filter((f) => o + f.start + f.dur < sec(A.flowUntil)).map((f, i) =>
		land(o + f.start + f.dur, i, 'flow'),
	);
	return [whooshInto(S.start), ...extras, ...flow];
};

const cta = (): Cue[] => {
	const S = SC.cta;
	const o = sec(S.start);
	return [whooshInto(S.start), cue(o + sec(S.wordmarkAt), 'hit'), pop(o + sec(S.buttonAt), 0, 1.3)];
};

export const CUES: Cue[] = [...hook(), ...network(), ...how(), ...bouncer(), ...social(), ...cta()].sort(
	(a, b) => a.at - b.at,
);
