# c4c.club — video 1

30s promo (1920×1080, 30fps). Composition id: `C4CPromo`.

```bash
npm install
npm run dev      # Remotion Studio
npm run render   # → out/c4c-promo.mp4
```

## Before rendering

- Drop the assets into `public/`: `icon.svg`, `wordmark-on-dark.svg`, `icon-1.png` … `icon-6.png`
  (`screenshot-home.png` / `screenshot-dashboard.png` are listed in CONFIG but not used by any scene).
- Brand colours in `src/config.ts` → `CONFIG.brand` are placeholders. Replace `bg`, `accent`, `text`, `muted`.
- The font is DM Sans as a placeholder. Swap the import in `src/fonts.ts`.

## Structure

- `src/config.ts`: every timing (seconds, scene-local), position and line of copy.
- `src/network/layout.ts`: the network layout (nodes, curved edges, dense-flow schedule), computed once.
- `src/network/Network.tsx`: renders the network (cards, lines, ads in flight, arrival pulses) for a given camera and frame.
- `src/scenes/*`: one component per scene. `NetworkReveal`, `HowItWorks`, `SocialProof` and `CTA` all render the same `Network`.
