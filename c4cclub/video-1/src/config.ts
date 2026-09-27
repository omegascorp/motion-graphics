// ─────────────────────────────────────────────────────────────────────────────
// CONFIG — every timing (seconds, scene-local), position and line of copy.
// Scenes and components read from here; nothing is hardcoded downstream.
// ─────────────────────────────────────────────────────────────────────────────

const FPS = 30;

/** Seconds → frames. */
export const sec = (s: number) => Math.round(s * FPS);

export const CONFIG = {
	video: {id: 'C4CPromo', width: 1920, height: 1080, fps: FPS, durationInSeconds: 30},

	// Brand placeholders — the brief left these as [#HEX]. Swap in the real values.
	// Font is loaded in src/fonts.ts (swap the @remotion/google-fonts import there).
	brand: {
		bg: '#101217',
		accent: '#FF7A45',
		text: '#F5F1EA',
		muted: '#8C919C',
		// Derived UI tones
		black: '#000000',
		surface: '#191C23',
		surfaceHi: '#222631',
		line: '#2D323D',
		doorBg: '#07080B',
		adBg: '#F5F1EA',
		adText: '#15171C',
		green: '#3DD68C',
		amber: '#F5B544',
		red: '#FF5C5C',
	},

	motion: {
		// "Things arriving" spring. No overshoot-heavy bounce: damping ~14.
		spring: {damping: 14, stiffness: 120, mass: 0.9},
	},

	assets: {
		icon: 'icon.svg',
		wordmark: 'wordmark-on-dark.svg',
		screenshotHome: 'screenshot-home.png',
		screenshotDashboard: 'screenshot-dashboard.png',
	},

	yourApp: {
		label: 'Your app',
		name: 'Brewlog',
		domain: 'brewlog.app',
		url: 'https://brewlog.app',
		ad: 'Dial in every espresso.',
		snippet: '<script src="c4c.club/host.js">',
		iconColors: {tile: '#6B4226', ink: '#F4E3CF'},
	},

	network: {
		center: {x: 960, y: 540},
		ring: {rx: 520, ry: 330},
		card: {w: 210, h: 150},
		youCard: {w: 250, h: 176},
		adCard: {maxW: 400},
		curvature: 0.14, // control-point offset as a fraction of edge length
		// angle: degrees, 0 = right, 90 = down. radius: multiplier on ring.
		// icon: a file in public/ (e.g. 'icon-1.png'), or null → monogram tile.
		sites: [
			{id: 's1', angle: -150, radius: 1, nudge: [-10, 14], icon: null, monogram: 'P', monogramColor: '#E0655A', name: 'Pagecraft', domain: 'pagecraft.io', ad: 'Landing pages in an afternoon.'},
			{id: 's2', angle: -88, radius: 1, nudge: [18, 0], icon: null, monogram: 'T', monogramColor: '#2FA37A', name: 'Tallyho', domain: 'tallyho.app', ad: 'Invoices that chase themselves.'},
			{id: 's3', angle: -28, radius: 1, nudge: [8, 22], icon: null, monogram: 'M', monogramColor: '#3A9BD9', name: 'Mapnook', domain: 'mapnook.co', ad: 'Maps for tiny shops.'},
			{id: 's4', angle: 32, radius: 1, nudge: [-6, -8], icon: null, monogram: 'Q', monogramColor: '#C9852E', name: 'Quillbox', domain: 'quillbox.so', ad: "A newsletter you'll send."},
			{id: 's5', angle: 92, radius: 1, nudge: [-24, 0], icon: null, monogram: 'S', monogramColor: '#5DAA3C', name: 'Sprout', domain: 'sprout.fyi', ad: 'A CRM for CRM haters.'},
			{id: 's6', angle: 148, radius: 1, nudge: [12, -16], icon: null, monogram: 'L', monogramColor: '#D5578E', name: 'Loopdesk', domain: 'loopdesk.dev', ad: 'Standups, minus the meeting.'},
			// Extra members that join in the social-proof scene
			{id: 's7', angle: 180, radius: 1.46, nudge: [0, -30], icon: null, monogram: 'K', monogramColor: '#6C8CFF', name: 'Kiln', domain: 'kiln.studio', ad: 'Pottery class bookings, sorted.'},
			{id: 's8', angle: 0, radius: 1.46, nudge: [0, 26], icon: null, monogram: 'N', monogramColor: '#B07CFF', name: 'Nimbus', domain: 'nimbus.page', ad: 'Notes that write back.'},
		],
		// Edges by node id ('you' = the center card). Order = draw order.
		baseEdges: [
			['you', 's1'], ['you', 's2'], ['you', 's3'], ['you', 's4'], ['you', 's5'], ['you', 's6'],
			['s1', 's2'], ['s2', 's3'], ['s3', 's4'], ['s4', 's5'], ['s5', 's6'], ['s6', 's1'],
		],
		extraEdges: [
			['s7', 's1'], ['s7', 's6'], ['s7', 'you'], ['s8', 's3'], ['s8', 's4'], ['s8', 'you'],
		],
		pulse: {rise: 0.1, fall: 0.55, ringScale: 1.3, ringOpacity: 0.5, cardScale: 0.06},
		flightExit: 0.2, // shrink-in at the target
	},

	scenes: {
		hook: {
			start: 0,
			duration: 4,
			line1: "We'll show your ad first.",
			line2: 'Return the favor later.',
			wordsAt: 0.35,
			wordStagger: 0.28,
			line2At: 2.55,
			line2Fade: 0.5,
			fadeOutAt: 3.6, // after the 0.5s hold
			fadeOutDur: 0.35,
		},

		network: {
			start: 4,
			duration: 5,
			camera: {fromScale: 2.6, toScale: 1, pullDur: 2.0},
			youAt: 0.1,
			ringAt: 0.45,
			ringStagger: 0.12,
			linesAt: 1.3,
			lineStagger: 0.1,
			lineDraw: 0.6,
			caption: 'Indie founders. One shared ad network.',
			captionAt: 3.1,
		},

		how: {
			start: 9,
			duration: 8,
			camera: {scale: 0.74, x: 360, y: 10, moveDur: 0.8},
			panel: {x: 120, top: 150, width: 680},
			steps: [
				{n: '1', title: 'Add your app', body: '', start: 0, dur: 2.6},
				{n: '2', title: 'Your ad goes live', body: "It shows up on other members' sites.", start: 2.6, dur: 2.7},
				{n: '3', title: 'Host to keep it running', body: 'Paste one snippet. Every click on an ad you host earns 80% back.', start: 5.3, dur: 2.7},
			],
			stepExit: 0.25,
			step1: {typeAt: 0.45, charEvery: 0.045, populateAt: 1.5, inputLabel: 'Your app URL'},
			step2: {targets: ['s1', 's3', 's5'], at: 0.35, stagger: 0.3, flightDur: 1.0},
			step3: {snippetAt: 0.15, sources: ['s2', 's6', 's4'], at: 0.65, stagger: 0.28, flightDur: 0.8, gainLabel: '+80%'},
			counter: {
				start: 50,
				costPerImpression: 1,
				gainPerClick: 0.8,
				unit: 'credits',
				labelFree: 'on the house',
				labelHosting: 'earned back by hosting',
				top: 800,
			},
		},

		bouncer: {
			start: 17,
			duration: 6,
			headline: 'A club only works if nobody games it.',
			kicker: 'Door check',
			panel: {w: 1320, h: 720},
			panelAt: 0,
			headlineAt: 0.2,
			rowsAt: 0.9,
			rowStagger: 0.5,
			fillDelay: 0.25,
			fillDur: 0.8,
			shakeDur: 0.35,
			shakePx: 2,
			dimDur: 0.4,
			dimTo: 0.4,
			rows: [
				{flag: '🇺🇸', label: 'Visitor from the US', score: 5, status: 'Let in', tone: 'green', rejected: false},
				{flag: '🇮🇳', label: 'Visitor from India', score: 45, status: 'Waiting at the door', tone: 'amber', rejected: false},
				{flag: '🪞', label: "The ad's own owner", score: 100, status: 'Turned away', tone: 'red', rejected: true},
			],
		},

		social: {
			start: 23,
			duration: 4,
			camera: {fromScale: 0.95, toScale: 0.86, y: -30},
			extrasAt: 0,
			extraStagger: 0.15,
			edgesAt: 0.25,
			lineStagger: 0.08,
			lineDraw: 0.5,
			caption: 'Founders promoting founders.',
			captionAt: 0.7,
			flights: {seed: 7, count: 46, from: 0, to: 6.4, minDur: 0.85, maxDur: 1.25, extrasFrom: 0.8},
		},

		cta: {
			start: 27,
			duration: 3,
			camera: {toScale: 0.74},
			recedeDur: 0.9,
			blurTo: 14,
			dimTo: 0.35,
			wordmarkAt: 0.2,
			wordmarkWidth: 560,
			taglineAt: 0.4,
			tagline: 'Your first ad is on the house.',
			buttonAt: 0.6,
			button: 'Launch your free ad',
			urlAt: 0.75,
			url: 'c4c.club',
		},
	},
} as const;

export type Tone = 'green' | 'amber' | 'red';
