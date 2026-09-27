#!/usr/bin/env python3
"""Synthesize the promo's sound effects and music bed into public/sfx/.

Everything is generated from scratch (numpy only), so there is nothing to
license. Re-run after tweaking: `npm run audio`.
"""
import os
import wave

import numpy as np

SR = 48000
OUT = os.path.join(os.path.dirname(__file__), '..', 'public', 'sfx')
rng = np.random.default_rng(7)


# ── helpers ───────────────────────────────────────────────────────────────────
def t_axis(dur):
    return np.arange(int(dur * SR)) / SR


def env(dur, attack, decay_rate):
    """Linear attack, then exponential decay."""
    t = t_axis(dur)
    a = np.clip(t / max(attack, 1e-4), 0, 1)
    return a * np.exp(-np.maximum(t - attack, 0) * decay_rate)


def sweep(f0, f1, dur, curve=1.0):
    """Phase of a sine gliding from f0 to f1."""
    t = t_axis(dur)
    f = f0 + (f1 - f0) * (t / dur) ** curve
    return 2 * np.pi * np.cumsum(f) / SR


def fft_filter(x, lo=0.0, hi=None):
    """Brick-ish band-pass in the frequency domain, with soft edges."""
    spec = np.fft.rfft(x)
    freqs = np.fft.rfftfreq(len(x), 1 / SR)
    gain = np.ones_like(freqs)
    if lo:
        gain *= 1 / (1 + (lo / np.maximum(freqs, 1)) ** 4)
    if hi:
        gain *= 1 / (1 + (freqs / hi) ** 4)
    return np.fft.irfft(spec * gain, len(x))


def fades(x, fin=0.003, fout=0.01):
    x = x.copy()
    n_in, n_out = int(fin * SR), int(fout * SR)
    if n_in:
        x[:n_in] *= np.linspace(0, 1, n_in)
    if n_out:
        x[-n_out:] *= np.linspace(1, 0, n_out)
    return x


def write(name, x, peak=0.89):
    x = np.asarray(x, dtype=np.float64)
    x = x / (np.max(np.abs(x)) + 1e-9) * peak
    stereo = x if x.ndim == 2 else np.stack([x, x], axis=1)
    data = (np.clip(stereo, -1, 1) * 32767).astype('<i2')
    with wave.open(os.path.join(OUT, f'{name}.wav'), 'wb') as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(data.tobytes())
    print(f'  {name}.wav  {len(stereo) / SR:.2f}s')


def bell(freq, dur, decay, partials=((1, 1.0), (2.01, 0.35), (3.02, 0.12))):
    t = t_axis(dur)
    out = sum(a * np.sin(2 * np.pi * freq * m * t) * np.exp(-t * decay * m) for m, a in partials)
    return fades(out * np.clip(t / 0.002, 0, 1))


# ── sound effects ─────────────────────────────────────────────────────────────
def pop(freq):
    """Soft bubbly pop: a quick downward sine glide."""
    d = 0.14
    return fades(np.sin(sweep(freq * 1.6, freq, d, 0.3)) * env(d, 0.002, 38))


def tick():
    """Keyboard click: band-passed noise burst + tiny body."""
    d = 0.035
    n = fft_filter(rng.standard_normal(int(d * SR)), 1800, 7000) * env(d, 0.0005, 180)
    body = 0.4 * np.sin(2 * np.pi * 260 * t_axis(d)) * env(d, 0.0005, 220)
    return fades(n + body, 0.0005, 0.005)


def whoosh(dur=0.7, lo=300, hi=3500):
    """Filtered noise that swells and falls away."""
    t = t_axis(dur)
    n = fft_filter(rng.standard_normal(len(t)), lo, hi)
    shape = np.sin(np.pi * np.clip(t / dur, 0, 1)) ** 2
    return fades(n * shape, 0.01, 0.05)


def send():
    """Ad leaving a card: short rising swish + light tone."""
    d = 0.32
    sw = whoosh(d, 1200, 7000) * 0.7
    tone = 0.35 * np.sin(sweep(500, 1100, d, 0.6)) * env(d, 0.01, 12)
    return fades(sw + tone)


def land(freq=880):
    """Ad landing: soft bell pluck."""
    return bell(freq, 0.6, 7)


def coin():
    """Hosted click paid out: two quick bright notes."""
    a = bell(1318.5, 0.5, 9)  # E6
    b = bell(1760.0, 0.7, 7)  # A6
    out = np.zeros(int(0.08 * SR) + len(b))
    out[: len(a)] += a
    out[int(0.08 * SR):] += b
    return out


def confirm():
    """Let in: friendly rising major third."""
    a, b = bell(659.3, 0.45, 8), bell(830.6, 0.7, 6)
    out = np.zeros(int(0.1 * SR) + len(b))
    out[: len(a)] += a
    out[int(0.1 * SR):] += b
    return out


def wait():
    """Waiting at the door: one neutral, muted tone repeated."""
    a = bell(523.3, 0.35, 12, ((1, 1.0), (2.0, 0.15)))
    out = np.zeros(int(0.18 * SR) + len(a))
    out[: len(a)] += a
    out[int(0.18 * SR):] += 0.7 * a
    return out


def deny():
    """Turned away: low, buzzy descending pair."""
    def buzz(f, d):
        t = t_axis(d)
        saw = 2 * ((f * t) % 1) - 1
        return fades(fft_filter(saw, 0, 1400) * env(d, 0.005, 9))
    a, b = buzz(196, 0.22), buzz(146.8, 0.45)
    out = np.zeros(int(0.16 * SR) + len(b))
    out[: len(a)] += a
    out[int(0.16 * SR):] += b
    return out


def fill():
    """Score bar filling: soft rising tone."""
    d = 0.8
    t = t_axis(d)
    tone = np.sin(sweep(300, 900, d, 1.4)) + 0.3 * np.sin(2 * sweep(300, 900, d, 1.4))
    shape = np.clip(t / 0.05, 0, 1) * np.clip((d - t) / 0.12, 0, 1)
    return fades(tone * shape * 0.6)


def hit():
    """CTA impact: sub boom + shimmer tail."""
    d = 2.4
    t = t_axis(d)
    boom = np.sin(sweep(110, 42, d, 0.15)) * np.exp(-t * 3.2)
    shimmer = sum(bell(f, d, 1.6) for f in (523.3, 659.3, 784.0, 1046.5)) * 0.18
    air = whoosh(d, 3000, 12000) * np.exp(-t * 2.5) * 0.25
    return fades(boom + shimmer + air, 0.002, 0.2)


# ── music bed ─────────────────────────────────────────────────────────────────
MUSIC_LEN = 30.0
BPM = 120
BEAT = 60 / BPM
# (start s, root midi, chord intervals). One chord per 2 bars (4 s).
CHORDS = [
    (0, 48, (0, 7, 11, 14, 16)),    # Cmaj9
    (4, 45, (0, 7, 10, 14, 15)),    # Am9
    (8, 41, (0, 7, 11, 14, 16)),    # Fmaj9
    (12, 43, (0, 7, 9, 14, 16)),    # G6/9
    (16, 45, (0, 7, 10, 14, 15)),   # Am9   (door check: darker)
    (20, 41, (0, 7, 11, 14, 16)),   # Fmaj9
    (23, 41, (0, 7, 11, 14, 16)),   # Fmaj9 (social proof lift)
    (25, 43, (0, 7, 9, 14, 16)),    # G6/9
    (27, 48, (0, 7, 11, 14, 16)),   # Cmaj9 (resolve on CTA)
]
# Section levels (start s → pad, bass, kick, hat)
SECTIONS = [
    (0, (0.8, 0.0, 0.0, 0.0)),
    (4, (0.9, 0.7, 0.55, 0.0)),
    (9, (0.8, 0.8, 0.7, 0.35)),
    (17, (0.7, 0.6, 0.45, 0.0)),
    (23, (1.0, 0.9, 0.85, 0.45)),
    (27, (1.0, 0.5, 0.0, 0.0)),
]


def mtof(m):
    return 440 * 2 ** ((m - 69) / 12)


def section_curve(idx):
    """Per-sample level for one stem, smoothed at section boundaries."""
    n = int(MUSIC_LEN * SR)
    out = np.zeros(n)
    for i, (start, levels) in enumerate(SECTIONS):
        end = SECTIONS[i + 1][0] if i + 1 < len(SECTIONS) else MUSIC_LEN
        out[int(start * SR):int(end * SR)] = levels[idx]
    k = int(0.25 * SR)
    return np.convolve(out, np.ones(k) / k, mode='same')


def music():
    n = int(MUSIC_LEN * SR)
    t = np.arange(n) / SR
    pad_l, pad_r, bass = np.zeros(n), np.zeros(n), np.zeros(n)

    for i, (start, root, ivs) in enumerate(CHORDS):
        end = CHORDS[i + 1][0] if i + 1 < len(CHORDS) else MUSIC_LEN
        s, e = int(start * SR), min(n, int((end + 1.2) * SR))  # overlap tails
        seg = t[s:e] - start
        length = end - start
        amp = np.clip(seg / 0.6, 0, 1) * np.clip((length + 1.2 - seg) / 1.2, 0, 1)
        for iv in ivs:
            f = mtof(root + 12 + iv)
            for detune, side in ((-0.12, 'l'), (0.12, 'r')):
                ff = f * 2 ** (detune / 12 / 10)
                tone = sum(np.sin(2 * np.pi * ff * k * seg + k) / k ** 1.8 for k in range(1, 6))
                (pad_l if side == 'l' else pad_r)[s:e] += tone * amp
        bass[s:e] += np.sin(2 * np.pi * mtof(root - 12) * seg) * amp

    # Slow breathing on the pad
    lfo = 0.85 + 0.15 * np.sin(2 * np.pi * 0.25 * t)
    pad_l, pad_r = fft_filter(pad_l, 80, 3200) * lfo, fft_filter(pad_r, 80, 3200) * lfo

    kick = np.zeros(n)
    k_len = 0.3
    one_kick = np.sin(sweep(130, 48, k_len, 0.25)) * env(k_len, 0.001, 14)
    hat = np.zeros(n)
    h_len = 0.05
    one_hat = fft_filter(rng.standard_normal(int(h_len * SR)), 7000, None) * env(h_len, 0.0005, 90)
    half_time = (17, 23)
    for b in range(int(MUSIC_LEN / BEAT)):
        at = b * BEAT
        if half_time[0] <= at < half_time[1] and b % 2:
            continue
        s = int(at * SR)
        kick[s:s + len(one_kick)] += one_kick[: n - s]
        hs = int((at + BEAT / 2) * SR)
        if hs < n:
            hat[hs:hs + len(one_hat)] += one_hat[: n - hs]

    pad_lvl, bass_lvl, kick_lvl, hat_lvl = (section_curve(i) for i in range(4))
    mono = 0.55 * bass * bass_lvl + 0.8 * kick * kick_lvl + 0.18 * hat * hat_lvl
    left = 0.22 * pad_l * pad_lvl + mono
    right = 0.22 * pad_r * pad_lvl + mono

    # Fade in/out
    master = np.clip(t / 1.0, 0, 1) * np.clip((MUSIC_LEN - t) / 2.0, 0, 1)
    return np.stack([left * master, right * master], axis=1)


def main():
    os.makedirs(OUT, exist_ok=True)
    print(f'Writing to {os.path.normpath(OUT)}')
    for name, freq in (('pop-1', 520), ('pop-2', 620), ('pop-3', 740)):
        write(name, pop(freq), 0.7)
    for name, freq in (('land-1', 880), ('land-2', 987.8), ('land-3', 1174.7)):
        write(name, land(freq), 0.6)
    write('tick', tick(), 0.6)
    write('whoosh', whoosh(), 0.7)
    write('send', send(), 0.6)
    write('coin', coin(), 0.7)
    write('confirm', confirm(), 0.7)
    write('wait', wait(), 0.6)
    write('deny', deny(), 0.7)
    write('fill', fill(), 0.5)
    write('hit', hit(), 0.89)
    write('music', music(), 0.8)


if __name__ == '__main__':
    main()
