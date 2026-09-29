# c4c.club — video 2: invite founders

30s explainer for the referral program (1920×1080, 30fps). Composition id: `C4CReferral`.

```bash
npm install
npm run dev      # Remotion Studio
npm run render   # → out/c4c-referral.mp4
```

## Story

1. **Hook**: "Know a founder with a project?"
2. **Link**: the dashboard's invite panel. The cursor copies the link and it flies to the friend (Kiln).
3. **Join**: Kiln starts with 50 welcome credits plus the 25-credit invite bonus.
4. **Reward**: +20 for you once their ad has spent 10 credits, +50 once their site has earned 10 hosting ads.
5. **Fair play**: only clicks with members outside your invite circle count, and only after review.
6. **CTA**: "Earn up to 70 credits per founder you invite."

The numbers live in `CONFIG.referral` and mirror the app's `src/lib/domain/constants.ts`
(`SIGNUP_BONUS_CREDITS`, `REFERRAL_*`). If the program changes, update them there; the copy is built from them.

## Structure

Shares video-1's building blocks (copied, not linked): brand tokens, fonts, `Backdrop`, `SceneShell`,
`CreditCoin`, `KineticWords`, and the synthesized sound kit in `public/sfx/` (`npm run audio` regenerates it).

- `src/config.ts`: every timing (seconds, scene-local), position and line of copy.
- `src/components/SceneShell.tsx`: adds a `push` entrance next to video-1's `iris`, configured in `CONFIG.transitions`.
- `src/scenes/*`: one component per scene. Each exports its beat times for `src/audio/cues.ts`.
