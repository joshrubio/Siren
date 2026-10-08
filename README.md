# Siren

Named for the mythological sirens, known for their song — a fit for *acoustic* signatures. An
interpretation layer over a real underwater vessel-noise classifier: spectrograms, per-class
confidence, and a frequency-band breakdown for every window, plus an honest accounting of where
the model works and where it doesn't. Built as a standalone portfolio project.

This project is deliberately **not** trying to be a underwater-acoustics ML project. It's the
UX/interpretation layer on top of whatever a classifier like this outputs — the same discipline
as [Janus](https://github.com/joshrubio/Janus)'s RAG assistant, applied to a different kind of
model output.

## What's real here

- **Audio**: 24 real recordings from [DeepShip](https://github.com/irfankamboh/DeepShip) (Jalkanen
  et al.), 6 per vessel class — Cargo, Tanker, Passenger, Tug — recorded in the Strait of Georgia,
  2016-2018.
- **Features**: MFCCs, delta-MFCCs, and spectral-shape descriptors (centroid, bandwidth, rolloff,
  zero-crossing rate, contrast), extracted with `librosa`.
- **Model**: an SVM (RBF kernel), chosen over Random Forest after comparing both on the held-out
  test set. 56.6% test accuracy across 4 classes (vs. ~25% random) — a real number, not a
  cherry-picked one.
- **Evaluation**: the train/test split is done at the *recording* level, not the window level —
  no recording contributes windows to both sides. Window-level random splits leak a vessel's
  acoustic signature across the split and inflate accuracy; this project's split was designed
  specifically to avoid that (see the `/model` page for why, and the
  [UniqueShip paper](https://arxiv.org/abs/2609.13659) this mirrors in spirit).

Everything — spectrograms, classifier predictions, confidence scores, playback clips — is
precomputed once by `scripts/preprocess.py` and shipped as static assets. No live inference, no
database: the corpus is small enough that this is the right-sized choice, same reasoning as
Janus's in-process RAG retrieval over a small doc set.

## Stack

Next.js 16 (App Router, Cache Components) · TypeScript · Tailwind v4 · shadcn/ui (`@base-ui/react`)
for the app; Python (`librosa`, `scikit-learn`) for the offline preprocessing pipeline.

## Identity

Benchmarked against real audio-analysis tool UIs (iZotope RX's spectral editor, sonar waterfall
displays) rather than reskinned from Janus or Siegfried: near-black background, a cyan accent used
only for functional signals, IBM Plex Sans/Mono, and a tighter instrument-panel radius —
deliberately different register from Janus's warm serif/amber identity.

## Running it locally

```bash
npm install
npm run dev
```

To regenerate the spectrograms, clips, and classifier metrics from scratch (requires the raw audio
under `data/raw/<class>/*.wav` — see `scripts/preprocess.py` for the DeepShip subset used):

```bash
python -m venv .venv
.venv/Scripts/pip install librosa scikit-learn numpy soundfile pillow matplotlib
.venv/Scripts/python scripts/preprocess.py
```
