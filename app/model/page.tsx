import { CLASS_LABEL, metrics } from "@/lib/clips";
import ConfusionMatrix from "@/components/ConfusionMatrix";

export default function ModelPage() {
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-3xl mx-auto px-6 py-10 space-y-10">
        <div>
          <h1 className="font-mono text-sm uppercase tracking-[0.2em] mb-2">Model</h1>
          <p className="text-sm text-muted-foreground max-w-xl">
            An SVM (RBF kernel) trained on MFCC, delta-MFCC, and spectral-shape features extracted
            from real underwater vessel recordings —{" "}
            <a
              href="https://github.com/irfankamboh/DeepShip"
              target="_blank"
              rel="noreferrer"
              className="text-primary underline underline-offset-2"
            >
              DeepShip
            </a>
            , 24 recordings across 4 vessel classes. This is not a production-grade classifier, and
            it isn&apos;t trying to be — Siren is the interpretation layer on top of whatever a
            model like this outputs, honest about where it works and where it doesn&apos;t.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-px bg-border border border-border">
          <Stat label="Test accuracy" value={`${(metrics.testAccuracy * 100).toFixed(1)}%`} />
          <Stat label="Train windows" value={metrics.nTrainWindows.toString()} />
          <Stat label="Test windows" value={metrics.nTestWindows.toString()} />
        </div>

        <div>
          <h2 className="font-mono text-[11px] uppercase tracking-wide text-muted-foreground mb-4">
            Per-class performance (held-out test set)
          </h2>
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b">
                <th className="text-left font-mono text-[10px] uppercase text-muted-foreground py-2">
                  Class
                </th>
                <th className="text-right font-mono text-[10px] uppercase text-muted-foreground py-2">
                  Precision
                </th>
                <th className="text-right font-mono text-[10px] uppercase text-muted-foreground py-2">
                  Recall
                </th>
                <th className="text-right font-mono text-[10px] uppercase text-muted-foreground py-2">
                  F1
                </th>
              </tr>
            </thead>
            <tbody>
              {metrics.classes.map((cls) => {
                const m = metrics.perClass[cls];
                return (
                  <tr key={cls} className="border-b border-border/60">
                    <td className="py-2 font-mono text-xs uppercase">{CLASS_LABEL[cls]}</td>
                    <td className="py-2 font-mono text-xs text-right tabular-nums">{m.precision.toFixed(2)}</td>
                    <td className="py-2 font-mono text-xs text-right tabular-nums">{m.recall.toFixed(2)}</td>
                    <td className="py-2 font-mono text-xs text-right tabular-nums">{m.f1.toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div>
          <h2 className="font-mono text-[11px] uppercase tracking-wide text-muted-foreground mb-4">
            Confusion matrix
          </h2>
          <ConfusionMatrix classes={metrics.classes} matrix={metrics.confusionMatrix} />
        </div>

        <div className="border-t pt-6 space-y-3">
          <h2 className="font-mono text-[11px] uppercase tracking-wide text-muted-foreground">
            Why Tanker shows 0% recall
          </h2>
          <p className="text-sm text-muted-foreground max-w-xl">
            {metrics.note} With only 2-5 training recordings per class, the model sees too little
            vessel-to-vessel variation to generalize — the held-out Tanker test recording simply
            doesn&apos;t sound like the Tanker clips it trained on, and gets pulled toward Cargo
            instead (both are large, slow diesel hulls with overlapping low-frequency signatures).
            This is a known, documented limitation of small underwater acoustic datasets, not a bug
            in the pipeline — see e.g. the{" "}
            <a
              href="https://arxiv.org/abs/2609.13659"
              target="_blank"
              rel="noreferrer"
              className="text-primary underline underline-offset-2"
            >
              UniqueShip
            </a>{" "}
            paper on data leakage in acoustic ship-classification benchmarks, which this
            project&apos;s file-level train/test split was deliberately designed to avoid.
          </p>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-background p-4">
      <p className="font-mono text-[10px] uppercase tracking-wide text-muted-foreground mb-1">{label}</p>
      <p className="font-mono text-2xl tabular-nums">{value}</p>
    </div>
  );
}
