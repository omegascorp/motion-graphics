// Network layout — computed once at module load and shared by every scene
// that shows the network, so the video reads as one continuous system.
import {CONFIG, sec} from '../config';

export type NodeId = string;

type Site = (typeof CONFIG.network.sites)[number];

export type NetNode = {
	id: NodeId;
	x: number;
	y: number;
	w: number;
	h: number;
	isYou: boolean;
	site: Site | null;
};

export type Edge = {
	key: string;
	a: NodeId;
	b: NodeId;
	p0: {x: number; y: number};
	c: {x: number; y: number};
	p1: {x: number; y: number};
	d: string;
	length: number;
	extra: boolean;
};

/** `tone` colours the comet trail: brand light for ads, warm pop for paid-out clicks. */
export type Flight = {from: NodeId; to: NodeId; start: number; dur: number; tone?: 'brand' | 'pop'};

export const edgeKey = (a: NodeId, b: NodeId) => [a, b].sort().join('~');

const quad = (p0: number, c: number, p1: number, t: number) =>
	(1 - t) * (1 - t) * p0 + 2 * (1 - t) * t * c + t * t * p1;

const build = () => {
	const {center, ring, card, youCard, curvature, sites, baseEdges, extraEdges} = CONFIG.network;

	const nodes: Record<NodeId, NetNode> = {
		you: {id: 'you', x: center.x, y: center.y, w: youCard.w, h: youCard.h, isYou: true, site: null},
	};
	for (const s of sites) {
		const rad = (s.angle * Math.PI) / 180;
		nodes[s.id] = {
			id: s.id,
			x: center.x + Math.cos(rad) * ring.rx * s.radius + s.nudge[0],
			y: center.y + Math.sin(rad) * ring.ry * s.radius + s.nudge[1],
			w: card.w,
			h: card.h,
			isYou: false,
			site: s,
		};
	}

	const makeEdge = ([u, v]: readonly [string, string], i: number, extra: boolean): Edge => {
		// Canonical orientation so a line and every ad travelling on it share one curve.
		const [a, b] = [u, v].sort();
		const p0 = {x: nodes[a].x, y: nodes[a].y};
		const p1 = {x: nodes[b].x, y: nodes[b].y};
		const dx = p1.x - p0.x;
		const dy = p1.y - p0.y;
		const len = Math.hypot(dx, dy);
		const m = {x: (p0.x + p1.x) / 2, y: (p0.y + p1.y) / 2};
		let n = {x: -dy / len, y: dx / len};
		// Bow outward from the centre; spokes (no clear outward side) alternate.
		const out = (m.x - center.x) * n.x + (m.y - center.y) * n.y;
		const sign = Math.abs(out) > 20 ? Math.sign(out) : i % 2 === 0 ? 1 : -1;
		n = {x: n.x * sign, y: n.y * sign};
		const c = {x: m.x + n.x * len * curvature, y: m.y + n.y * len * curvature};

		let length = 0;
		let prev = p0;
		for (let k = 1; k <= 40; k++) {
			const t = k / 40;
			const p = {x: quad(p0.x, c.x, p1.x, t), y: quad(p0.y, c.y, p1.y, t)};
			length += Math.hypot(p.x - prev.x, p.y - prev.y);
			prev = p;
		}
		return {
			key: edgeKey(a, b),
			a,
			b,
			p0,
			c,
			p1,
			d: `M ${p0.x} ${p0.y} Q ${c.x} ${c.y} ${p1.x} ${p1.y}`,
			length,
			extra,
		};
	};

	const edges = [
		...baseEdges.map((e, i) => makeEdge(e, i, false)),
		...extraEdges.map((e, i) => makeEdge(e, i + baseEdges.length, true)),
	];
	const edgeByKey = Object.fromEntries(edges.map((e) => [e.key, e]));

	return {nodes, edges, edgeByKey};
};

export const NETWORK = build();

export const BASE_NODES: NodeId[] = ['you', 's1', 's2', 's3', 's4', 's5', 's6'];
export const ALL_NODES: NodeId[] = ['you', ...CONFIG.network.sites.map((s) => s.id)];
export const EXTRA_NODES: NodeId[] = ALL_NODES.filter((id) => !BASE_NODES.includes(id));

/** Point on the edge between `from` and `to` at progress t (0 = from, 1 = to). */
/** The edge a flight travels on, and whether it runs against the edge's a → b orientation. */
export const edgeOfFlight = (from: NodeId, to: NodeId) => {
	const e = NETWORK.edgeByKey[edgeKey(from, to)];
	if (!e) throw new Error(`No edge between ${from} and ${to}`);
	return {edge: e, reversed: e.a !== from};
};

export const pointOnFlight = (from: NodeId, to: NodeId, t: number) => {
	const e = NETWORK.edgeByKey[edgeKey(from, to)];
	if (!e) throw new Error(`No edge between ${from} and ${to}`);
	const u = e.a === from ? t : 1 - t;
	return {x: quad(e.p0.x, e.c.x, e.p1.x, u), y: quad(e.p0.y, e.c.y, e.p1.y, u)};
};

export const adFor = (id: NodeId) =>
	id === 'you' ? CONFIG.yourApp.ad : NETWORK.nodes[id].site?.ad ?? '';

// Deterministic PRNG so the dense flow is identical on every render.
const mulberry32 = (seed: number) => () => {
	seed |= 0;
	seed = (seed + 0x6d2b79f5) | 0;
	let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
	t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
	return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

/** Dense ad traffic for the social-proof scene (continues under the CTA). Frames are social-scene local. */
export const SOCIAL_FLIGHTS: Flight[] = (() => {
	const f = CONFIG.scenes.social.flights;
	const rand = mulberry32(f.seed);
	const out: Flight[] = [];
	const span = f.to - f.from;
	for (let i = 0; i < f.count; i++) {
		const startS = f.from + (span * i) / f.count + rand() * 0.08;
		const pool = NETWORK.edges.filter((e) => !e.extra || startS >= f.extrasFrom);
		const e = pool[Math.floor(rand() * pool.length)];
		const forward = rand() > 0.5;
		out.push({
			from: forward ? e.a : e.b,
			to: forward ? e.b : e.a,
			start: sec(startS),
			dur: sec(f.minDur + rand() * (f.maxDur - f.minDur)),
		});
	}
	return out;
})();
