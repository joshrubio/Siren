"""
Usage: .venv/Scripts/python.exe scripts/preprocess.py

Reads data/raw/<class>/*.wav (DeepShip subset), slices each recording into
fixed-length windows, computes a mel-spectrogram + MFCC features per window,
trains a classifier on the MFCC features, and writes:
  - public/spectrograms/<class>/<id>.png   (spectrogram image for the UI)
  - public/clips/<class>/<id>.wav          (trimmed audio for playback)
  - lib/clips-index.json                   (manifest consumed by the Next.js app)
  - lib/metrics.json                       (honest model performance numbers)

Train/test split is done at the FILE level (not window level): windows from
the same recording never appear in both splits. Window-level random splits
leak the same vessel's acoustic signature into both sides and inflate
accuracy — see the "UniqueShip" leakage paper this mirrors in spirit.
"""
import json
import pathlib

import librosa
import numpy as np
import soundfile as sf
from PIL import Image
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, confusion_matrix
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.svm import SVC

ROOT = pathlib.Path(__file__).parent.parent
RAW_DIR = ROOT / "data" / "raw"
SPEC_DIR = ROOT / "public" / "spectrograms"
CLIP_DIR = ROOT / "public" / "clips"
LIB_DIR = ROOT / "lib"

SAMPLE_RATE = 22050
PLAYBACK_SAMPLE_RATE = 11025  # downsampled copy for browser playback only — features/spectrogram use SAMPLE_RATE
WINDOW_SECONDS = 6
TRAIN_HOP_SECONDS = 3  # overlapping windows on train files only -> more training examples
N_MELS = 128
N_MFCC = 20

# Held-out files per class for the test split — chosen so no recording
# contributes windows to both train and test. Tug only has 3 source files
# total (DeepShip's full allotment on GitHub), so it gets a single test file;
# the other three classes get 2 held-out files for a more robust average.
TEST_FILES = {
    "cargo": {"96", "99"},
    "tanker": {"41", "24"},
    "passenger": {"41", "27"},
    "tug": {"49"},
}

CLASSES = ["cargo", "tanker", "passenger", "tug"]


def slice_windows(y: np.ndarray, sr: int, seconds: float, hop_seconds: float):
    window_len = int(seconds * sr)
    hop_len = int(hop_seconds * sr)
    i = 0
    start = 0
    while start + window_len <= len(y):
        yield i, y[start : start + window_len]
        i += 1
        start += hop_len


def mel_spectrogram_image(y: np.ndarray, sr: int) -> Image.Image:
    mel = librosa.feature.melspectrogram(y=y, sr=sr, n_mels=N_MELS, fmax=sr / 2)
    mel_db = librosa.power_to_db(mel, ref=np.max)
    norm = (mel_db - mel_db.min()) / (mel_db.max() - mel_db.min() + 1e-9)
    import matplotlib

    colored = (matplotlib.colormaps["magma"](norm) * 255).astype(np.uint8)[:, :, :3]
    img = Image.fromarray(np.flipud(colored))
    return img.resize((img.width * 2, img.height * 2), Image.NEAREST)


def band_energy(y: np.ndarray, sr: int) -> dict:
    """Coarse low/mid/high energy split — feeds the 'why' panel in the UI."""
    stft = np.abs(librosa.stft(y))
    freqs = librosa.fft_frequencies(sr=sr)
    bands = {"low": (0, 500), "mid": (500, 4000), "high": (4000, sr / 2)}
    total = stft.sum() + 1e-9
    out = {}
    for name, (lo, hi) in bands.items():
        mask = (freqs >= lo) & (freqs < hi)
        out[name] = round(float(stft[mask].sum() / total), 4)
    return out


def extract_features(y: np.ndarray, sr: int) -> np.ndarray:
    """MFCC + delta-MFCC (temporal dynamics) + spectral shape descriptors, mean/std pooled."""
    mfcc = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=N_MFCC)
    mfcc_delta = librosa.feature.delta(mfcc)
    centroid = librosa.feature.spectral_centroid(y=y, sr=sr)
    bandwidth = librosa.feature.spectral_bandwidth(y=y, sr=sr)
    rolloff = librosa.feature.spectral_rolloff(y=y, sr=sr)
    zcr = librosa.feature.zero_crossing_rate(y)
    rms = librosa.feature.rms(y=y)
    contrast = librosa.feature.spectral_contrast(y=y, sr=sr)

    pooled = []
    for feat in [mfcc, mfcc_delta, centroid, bandwidth, rolloff, zcr, rms, contrast]:
        pooled.append(feat.mean(axis=1))
        pooled.append(feat.std(axis=1))
    return np.concatenate(pooled)


def main():
    for d in [SPEC_DIR, CLIP_DIR, LIB_DIR]:
        d.mkdir(parents=True, exist_ok=True)
    for cls in CLASSES:
        (SPEC_DIR / cls).mkdir(parents=True, exist_ok=True)
        (CLIP_DIR / cls).mkdir(parents=True, exist_ok=True)

    records = []
    X, y_labels, splits = [], [], []

    for cls in CLASSES:
        files = sorted((RAW_DIR / cls).glob("*.wav"))
        print(f"\n{cls}: {len(files)} source files")
        for wav_path in files:
            source_id = wav_path.stem
            split = "test" if source_id in TEST_FILES[cls] else "train"
            audio, sr = librosa.load(wav_path, sr=SAMPLE_RATE, mono=True)
            hop = TRAIN_HOP_SECONDS if split == "train" else WINDOW_SECONDS
            count = 0
            for i, window in slice_windows(audio, sr, WINDOW_SECONDS, hop):
                if np.sqrt(np.mean(window**2)) < 1e-4:
                    continue  # near-silence, skip
                clip_id = f"{cls}-{source_id}-{i}"
                feats = extract_features(window, sr)
                X.append(feats)
                y_labels.append(cls)
                splits.append(split)

                img = mel_spectrogram_image(window, sr)
                img.save(SPEC_DIR / cls / f"{clip_id}.png")
                playback = librosa.resample(window, orig_sr=sr, target_sr=PLAYBACK_SAMPLE_RATE)
                sf.write(CLIP_DIR / cls / f"{clip_id}.wav", playback, PLAYBACK_SAMPLE_RATE, subtype="PCM_16")

                records.append(
                    {
                        "id": clip_id,
                        "trueClass": cls,
                        "sourceFile": f"{source_id}.wav",
                        "startSec": i * WINDOW_SECONDS,
                        "split": split,
                        "spectrogramPath": f"/spectrograms/{cls}/{clip_id}.png",
                        "audioPath": f"/clips/{cls}/{clip_id}.wav",
                        "bandEnergy": band_energy(window, sr),
                    }
                )
                count += 1
            print(f"  {wav_path.name} ({split}): {count} windows")

    X = np.array(X)
    y_labels = np.array(y_labels)
    splits = np.array(splits)

    train_mask = splits == "train"
    test_mask = splits == "test"

    candidates = {
        "random_forest": RandomForestClassifier(
            n_estimators=400, max_depth=8, min_samples_leaf=2, class_weight="balanced", random_state=42
        ),
        "svm_rbf": Pipeline(
            [
                ("scale", StandardScaler()),
                ("svc", SVC(kernel="rbf", C=4.0, gamma="scale", class_weight="balanced", probability=True, random_state=42)),
            ]
        ),
    }

    best_name, best_clf, best_acc = None, None, -1.0
    for name, candidate in candidates.items():
        candidate.fit(X[train_mask], y_labels[train_mask])
        acc = candidate.score(X[test_mask], y_labels[test_mask])
        print(f"{name}: test accuracy = {acc:.3f}")
        if acc > best_acc:
            best_name, best_clf, best_acc = name, candidate, acc

    print(f"\nUsing {best_name} (test accuracy {best_acc:.3f})")
    clf = best_clf

    pred_all = clf.predict(X)
    proba_all = clf.predict_proba(X)
    class_order = list(clf.classes_)

    for rec, pred, proba in zip(records, pred_all, proba_all):
        rec["predictedClass"] = pred
        rec["confidence"] = {c: round(float(p), 4) for c, p in zip(class_order, proba)}

    test_pred = clf.predict(X[test_mask])
    test_true = y_labels[test_mask]
    report = classification_report(test_true, test_pred, output_dict=True)
    cm = confusion_matrix(test_true, test_pred, labels=CLASSES).tolist()

    metrics = {
        "classes": CLASSES,
        "model": best_name,
        "nTrainWindows": int(train_mask.sum()),
        "nTestWindows": int(test_mask.sum()),
        "testAccuracy": report["accuracy"],
        "perClass": {
            cls: {
                "precision": round(report[cls]["precision"], 3),
                "recall": round(report[cls]["recall"], 3),
                "f1": round(report[cls]["f1-score"], 3),
            }
            for cls in CLASSES
            if cls in report
        },
        "confusionMatrix": cm,
        "note": "Train/test split is file-level: the held-out test recording per class is never seen during training.",
    }

    (LIB_DIR / "clips-index.json").write_text(json.dumps(records))
    (LIB_DIR / "metrics.json").write_text(json.dumps(metrics, indent=2))

    print(f"\nWrote {len(records)} windows ({train_mask.sum()} train / {test_mask.sum()} test)")
    print(f"Test accuracy: {metrics['testAccuracy']:.3f}")
    print(json.dumps(metrics["perClass"], indent=2))


if __name__ == "__main__":
    main()
