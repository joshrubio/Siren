import { cn } from "@/lib/utils";

const BAND_LABEL = { low: "LOW · <500Hz", mid: "MID · 0.5-4kHz", high: "HIGH · >4kHz" } as const;

export default function Waveband({
  bandEnergy,
  className,
}: {
  bandEnergy: { low: number; mid: number; high: number };
  className?: string;
}) {
  return (
    <div className={cn("space-y-2", className)}>
      {(Object.keys(BAND_LABEL) as (keyof typeof BAND_LABEL)[]).map((band) => (
        <div key={band} className="flex items-center gap-3">
          <span className="font-mono text-[10px] uppercase tracking-wide text-muted-foreground w-24 shrink-0">
            {BAND_LABEL[band]}
          </span>
          <div className="flex-1 h-1.5 bg-muted overflow-hidden">
            <div
              className="h-full bg-primary"
              style={{ width: `${Math.round(bandEnergy[band] * 100)}%` }}
            />
          </div>
          <span className="font-mono text-[10px] text-muted-foreground w-9 text-right">
            {Math.round(bandEnergy[band] * 100)}%
          </span>
        </div>
      ))}
    </div>
  );
}
