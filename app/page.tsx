import Link from "next/link";
import { AudioLines, ScanLine, Tags, Compass, LineChart, BookOpen } from "lucide-react";
import { metrics } from "@/lib/clips";
import { cn } from "@/lib/utils";
import HeroGraph from "@/components/HeroGraph";

const STEPS = [
  {
    icon: AudioLines,
    title: "1. Real audio in",
    body: "24 real recordings from DeepShip — Cargo, Tanker, Passenger, Tug — sliced into 6s windows.",
  },
  {
    icon: ScanLine,
    title: "2. Spectrogram + features",
    body: "Each window becomes a mel spectrogram plus MFCC / spectral-shape features, computed with librosa.",
  },
  {
    icon: Tags,
    title: "3. Classification",
    body: "An SVM trained on those features predicts a class with per-class confidence — the model's raw output.",
  },
];

const ENTRIES = [
  {
    href: "/explore",
    icon: Compass,
    title: "Explore",
    body: "Browse every classified window — filter by class, by held-out test, by misclassified-only — and inspect the spectrogram, playback, confidence, and frequency bands behind each prediction.",
  },
  {
    href: "/model",
    icon: LineChart,
    title: "Model",
    body: "The honest numbers: real test accuracy, a confusion matrix, and a plain explanation of exactly where and why this classifier fails.",
  },
  {
    href: "/docs",
    icon: BookOpen,
    title: "Docs",
    body: "What Siren is (and isn't), how to read a spectrogram or a confidence bar, and the full pipeline from audio file to prediction.",
  },
];

export default function OverviewPage() {
  return (
    <main className="flex-1 overflow-y-auto">
      <div className="relative border-b border-border/60 overflow-hidden">
        <HeroGraph />
        <div className="relative max-w-5xl mx-auto px-6 py-14 lg:py-20 lg:min-h-[560px] flex items-center">
          <div className="max-w-lg">
            <p
              className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary mb-3 animate-fade-in-up"
            >
              Acoustic Classification Terminal
            </p>
            <h1
              className="font-mono text-4xl lg:text-5xl tracking-tight mb-4 animate-fade-in-up"
              style={{ animationDelay: "0.06s" }}
            >
              Siren
            </h1>
            <p
              className="text-sm text-muted-foreground max-w-lg leading-relaxed animate-fade-in-up"
              style={{ animationDelay: "0.12s" }}
            >
              An interpretation layer over a real underwater vessel-noise classifier — not a
              machine-learning engineering project. The model is genuinely imperfect, and this
              tool is built to show you exactly where, and why, rather than hide it.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-border border border-border mb-12">
          <Stat label="Test accuracy" value={`${(metrics.testAccuracy * 100).toFixed(1)}%`} />
          <Stat label="Vessel classes" value={String(metrics.classes.length)} />
          <Stat label="Real recordings" value="24" caption="DeepShip" />
          <Stat label="Windows analyzed" value={String(metrics.nTrainWindows + metrics.nTestWindows)} />
        </div>

        <section className="mb-12">
          <h2 className="font-mono text-[11px] uppercase tracking-wide text-muted-foreground mb-4">
            How this works
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {STEPS.map((step) => (
              <div key={step.title} className="border border-border/60 p-4">
                <step.icon className="size-4 text-primary mb-3" />
                <p className="text-sm font-medium mb-1">{step.title}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{step.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="font-mono text-[11px] uppercase tracking-wide text-muted-foreground mb-4">
            Where to go
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {ENTRIES.map((entry, i) => (
              <Link
                key={entry.href}
                href={entry.href}
                className={cn(
                  "border p-4 hover:bg-accent/40 transition-colors",
                  i === 0 ? "border-primary/50 bg-primary/[0.04]" : "border-border/60 hover:border-primary/50"
                )}
              >
                <div className="flex items-center justify-between mb-3">
                  <entry.icon className="size-4 text-primary" />
                  {i === 0 && (
                    <span className="font-mono text-[9px] uppercase tracking-wide text-primary border border-primary/40 px-1 rounded-sm">
                      Start here
                    </span>
                  )}
                </div>
                <p className="text-sm font-medium mb-1">{entry.title}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{entry.body}</p>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

function Stat({ label, value, caption }: { label: string; value: string; caption?: string }) {
  return (
    <div className="bg-background p-4">
      <p className="font-mono text-[9px] uppercase tracking-wide text-muted-foreground mb-1">{label}</p>
      <p className="font-mono text-xl tabular-nums">{value}</p>
      {caption && <p className="font-mono text-[9px] text-muted-foreground/60 mt-0.5">{caption}</p>}
    </div>
  );
}
