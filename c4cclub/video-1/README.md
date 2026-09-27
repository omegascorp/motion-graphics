# c4c.club — video 1

30s promo (1920×1080, 30fps). Composition id: `C4CPromo`.

```bash
npm install
npm run dev      # Remotion Studio
npm run render   # → out/c4c-promo.mp4
```

## Before rendering

- `public/icon.svg` and `public/wordmark-on-dark.svg` are copied from the c4c.club app (`public/brand/`).
- Member sites render as monogram tiles. To use a real icon, drop it into `public/` and set `icon: '<file>'`
  on that site in `CONFIG.network.sites`.
  (`screenshot-home.png` / `screenshot-dashboard.png` are listed in CONFIG but not used by any scene).
- Brand colours in `src/config.ts` → `CONFIG.brand` are placeholders. Replace `bg`, `accent`, `text`, `muted`.
- The font is DM Sans as a placeholder. Swap the import in `src/fonts.ts`.

## Audio

All sounds are synthesized by `scripts/make-audio.py` (Python 3 + numpy) into `public/sfx/`. They're
original, so there's nothing to license. Run `npm run audio` to regenerate after editing the script.

- `src/audio/cues.ts` builds each cue from the same schedules the scenes use, so retiming a scene in
  CONFIG moves its sounds with it.
- Volumes live in `CONFIG.audio`. To use licensed music instead, drop the file into `public/sfx/` and
  point `CONFIG.audio.music.file` at it.

## Structure

- `src/config.ts`: every timing (seconds, scene-local), position and line of copy.
- `src/network/layout.ts`: the network layout (nodes, curved edges, dense-flow schedule), computed once.
- `src/network/Network.tsx`: renders the network (cards, lines, ads in flight, arrival pulses) for a given camera and frame.
- `src/scenes/*`: one component per scene. `NetworkReveal`, `HowItWorks`, `SocialProof` and `CTA` all render the same `Network`.
