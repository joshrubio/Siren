"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { CLASS_LABEL, isCorrect, type Clip, type VesselClass } from "@/lib/clips";
import { cn } from "@/lib/utils";
import ConfidenceBars from "@/components/ConfidenceBars";
import Waveband from "@/components/Waveband";

const CLASSES: VesselClass[] = ["cargo", "tanker", "passenger", "tug"];

export default function Explorer({ clips }: { clips: Clip[] }) {
  const [classFilter, setClassFilter] = useState<VesselClass | "all">("all");
  const [onlyMisclassified, setOnlyMisclassified] = useState(false);
  const [onlyTest, setOnlyTest] = useState(true);
  const [selectedId, setSelectedId] = useState<string>(clips[0]?.id ?? "");

  const filtered = useMemo(() => {
    return clips.filter((c) => {
      if (classFilter !== "all" && c.trueClass !== classFilter) return false;
      if (onlyMisclassified && isCorrect(c)) return false;
      if (onlyTest && c.split !== "test") return false;
      return true;
    });
  }, [clips, classFilter, onlyMisclassified, onlyTest]);

  const selected = clips.find((c) => c.id === selectedId) ?? filtered[0];

  return (
    <div className="flex-1 min-h-0 flex">
      <aside className="w-[360px] shrink-0 border-r flex flex-col min-h-0">
        <div className="p-3 border-b space-y-2">
          <div className="flex flex-wrap gap-1">
            <FilterChip active={classFilter === "all"} onClick={() => setClassFilter("all")}>
              All
            </FilterChip>
            {CLASSES.map((cls) => (
              <FilterChip key={cls} active={classFilter === cls} onClick={() => setClassFilter(cls)}>
                {CLASS_LABEL[cls]}
              </FilterChip>
            ))}
          </div>
          <div className="flex items-center gap-3 pt-1">
            <ToggleChip active={onlyTest} onClick={() => setOnlyTest((v) => !v)}>
              Held-out test only
            </ToggleChip>
            <ToggleChip active={onlyMisclassified} onClick={() => setOnlyMisclassified((v) => !v)}>
              Misclassified only
            </ToggleChip>
          </div>
          <p className="font-mono text-[10px] text-muted-foreground">
            {filtered.length} window{filtered.length === 1 ? "" : "s"}
          </p>
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto">
          {filtered.map((clip) => (
            <button
              key={clip.id}
              onClick={() => setSelectedId(clip.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2 border-b text-left hover:bg-accent/60 transition-colors",
                selectedId === clip.id && "bg-accent"
              )}
            >
              <div className="relative size-10 shrink-0 overflow-hidden border border-border/60">
                <Image src={clip.spectrogramPath} alt="" fill className="object-cover" unoptimized />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-[11px] uppercase truncate">{CLASS_LABEL[clip.trueClass]}</span>
                  <span
                    className={cn(
                      "font-mono text-[9px] uppercase px-1 rounded-sm shrink-0",
                      isCorrect(clip) ? "text-primary border border-primary/40" : "text-destructive border border-destructive/40"
                    )}
                  >
                    {isCorrect(clip) ? "match" : "miss"}
                  </span>
                </div>
                <p className="font-mono text-[10px] text-muted-foreground truncate">
                  pred: {CLASS_LABEL[clip.predictedClass]} · {(clip.confidence[clip.predictedClass] * 100).toFixed(0)}%
                </p>
              </div>
            </button>
          ))}
          {filtered.length === 0 && (
            <p className="p-4 text-xs text-muted-foreground font-mono">No windows match these filters.</p>
          )}
        </div>
      </aside>

      <section className="flex-1 min-w-0 overflow-y-auto">
        {selected ? <ClipDetail clip={selected} /> : null}
      </section>
    </div>
  );
}

function ClipDetail({ clip }: { clip: Clip }) {
  return (
    <div className="p-6 max-w-3xl space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <h2 className="font-mono text-sm uppercase tracking-wide">{clip.id}</h2>
          <span className="font-mono text-[10px] text-muted-foreground uppercase border px-1 rounded-sm">
            {clip.split}
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          Source recording <span className="font-mono">{clip.sourceFile}</span> · window starting at{" "}
          {clip.startSec}s · true class{" "}
          <span className="text-foreground font-medium">{CLASS_LABEL[clip.trueClass]}</span>
        </p>
      </div>

      <div className="border border-border/60">
        <Image
          src={clip.spectrogramPath}
          alt={`Mel spectrogram of ${clip.id}`}
          width={640}
          height={256}
          className="w-full h-auto"
          unoptimized
        />
      </div>

      <audio controls src={clip.audioPath} className="w-full h-9" />

      <div>
        <h3 className="font-mono text-[11px] uppercase tracking-wide text-muted-foreground mb-3">
          Classifier confidence
        </h3>
        <ConfidenceBars
          confidence={clip.confidence}
          trueClass={clip.trueClass}
          predictedClass={clip.predictedClass}
        />
      </div>

      <div>
        <h3 className="font-mono text-[11px] uppercase tracking-wide text-muted-foreground mb-3">
          Frequency-band energy
        </h3>
        <Waveband bandEnergy={clip.bandEnergy} />
      </div>
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "font-mono text-[10px] uppercase tracking-wide px-2 py-1 rounded-sm border transition-colors",
        active
          ? "bg-primary text-primary-foreground border-primary"
          : "text-muted-foreground border-border hover:text-foreground hover:bg-accent/60"
      )}
    >
      {children}
    </button>
  );
}

function ToggleChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button onClick={onClick} className="flex items-center gap-1.5 group">
      <span
        className={cn(
          "size-3 border rounded-sm flex items-center justify-center transition-colors",
          active ? "bg-primary border-primary" : "border-border group-hover:border-foreground/40"
        )}
      >
        {active && <span className="size-1.5 bg-primary-foreground rounded-xs" />}
      </span>
      <span className="font-mono text-[10px] text-muted-foreground group-hover:text-foreground">{children}</span>
    </button>
  );
}
