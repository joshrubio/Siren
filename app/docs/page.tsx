const SECTIONS = [
  {
    id: "what",
    title: "What this is — and isn't",
    body: (
      <>
        <p>
          Siren is an <strong className="text-foreground">interpretation layer</strong> over the
          output of a real audio classifier, not a machine-learning research project. The
          classifier itself is a fairly ordinary SVM trained on a small, real dataset — the point
          of this tool is what happens <em>after</em> the model makes a prediction: can you see
          why it made that call, how confident it really was, and where it tends to be wrong.
        </p>
        <p>
          Nothing here is live or production infrastructure. Every spectrogram, prediction, and
          metric was computed once, offline, by a Python script, and shipped as static files — see
          the pipeline below.
        </p>
      </>
    ),
  },
  {
    id: "pipeline",
    title: "The pipeline: audio file to prediction",
    body: (
      <ol className="list-decimal list-inside space-y-2">
        <li>
          <strong className="text-foreground">Source audio</strong> — 24 real recordings from{" "}
          <a
            href="https://github.com/irfankamboh/DeepShip"
            target="_blank"
            rel="noreferrer"
            className="text-primary underline underline-offset-2"
          >
            DeepShip
          </a>
          , 6 per vessel class (Cargo, Tanker, Passenger, Tug), recorded in the Strait of Georgia.
        </li>
        <li>
          <strong className="text-foreground">Windowing</strong> — each recording is sliced into
          6-second windows (overlapping only on training files, to get more data without touching
          the test set).
        </li>
        <li>
          <strong className="text-foreground">Spectrogram + features</strong> — per window: a mel
          spectrogram (rendered with the magma colormap) for the visual, and a feature vector —
          MFCCs, delta-MFCCs, spectral centroid/bandwidth/rolloff/zero-crossing/contrast — for the
          classifier.
        </li>
        <li>
          <strong className="text-foreground">Classification</strong> — an SVM (RBF kernel),
          chosen over a Random Forest after comparing both on the real held-out test set.
        </li>
        <li>
          <strong className="text-foreground">Evaluation</strong> — the train/test split is done
          at the <em>recording</em> level, not the window level, so no recording contributes
          windows to both sides — see <a href="/model" className="text-primary underline underline-offset-2">Model</a> for why that matters.
        </li>
      </ol>
    ),
  },
  {
    id: "explore",
    title: "Reading the Explore section",
    body: (
      <ul className="list-disc list-inside space-y-2">
        <li>
          <strong className="text-foreground">Filters</strong> (top of the list) — narrow by
          vessel class, restrict to the held-out test split (windows the model never trained on),
          or show only windows the model got wrong.
        </li>
        <li>
          <strong className="text-foreground">The spectrogram</strong> — time runs left to right,
          frequency runs bottom (low) to top (high), and brightness is energy at that
          frequency/time. The magma colormap (dark purple → orange → yellow) is the audio-analysis
          domain standard, the same one tools like iZotope RX use — it&apos;s not decorative.
        </li>
        <li>
          <strong className="text-foreground">Confidence bars</strong> — the classifier&apos;s own
          output: one probability per class, always summing to 100%. The ground-truth class is
          labeled; when it isn&apos;t the top bar, that&apos;s a misclassification.
        </li>
        <li>
          <strong className="text-foreground">Frequency-band energy</strong> — a coarser, 3-band
          summary (low/mid/high) of the same spectrogram, useful for a quick read of whether a
          sound is bass-heavy (most vessel engine noise) or has real high-frequency content.
        </li>
      </ul>
    ),
  },
  {
    id: "model",
    title: "Reading the Model section",
    body: (
      <ul className="list-disc list-inside space-y-2">
        <li>
          <strong className="text-foreground">Test accuracy</strong> — computed only on the
          held-out recordings, never seen during training. This is the honest number, not a
          training-set score.
        </li>
        <li>
          <strong className="text-foreground">Per-class precision/recall/F1</strong> — accuracy
          alone hides a lot; a class can have 0% recall even while overall accuracy looks
          reasonable, which is exactly what happens with Tanker here.
        </li>
        <li>
          <strong className="text-foreground">Confusion matrix</strong> — rows are the true class,
          columns are what the model predicted. The diagonal is correct predictions; anything
          off-diagonal is a specific confusion (e.g. a real Tanker window predicted as Cargo).
        </li>
      </ul>
    ),
  },
];

export default function DocsPage() {
  return (
    <main className="flex-1 overflow-y-auto">
      <div className="max-w-3xl mx-auto px-6 py-10">
        <h1 className="font-mono text-sm uppercase tracking-[0.2em] mb-2">Docs</h1>
        <p className="text-sm text-muted-foreground mb-10 max-w-xl">
          A short guide to what Siren does, how it was built, and how to read what&apos;s on screen.
        </p>

        <nav className="mb-10 border border-border/60 p-3">
          <p className="font-mono text-[9px] uppercase tracking-wide text-muted-foreground mb-2">
            On this page
          </p>
          <ul className="space-y-1">
            {SECTIONS.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`} className="text-xs text-primary hover:underline">
                  {s.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="space-y-10">
          {SECTIONS.map((s) => (
            <section key={s.id} id={s.id} className="scroll-mt-16">
              <h2 className="text-base font-medium mb-3">{s.title}</h2>
              <div className="text-sm text-muted-foreground leading-relaxed space-y-3">
                {s.body}
              </div>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
