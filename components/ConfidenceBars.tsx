import { CLASS_LABEL, type VesselClass } from "@/lib/clips";
import { cn } from "@/lib/utils";

export default function ConfidenceBars({
  confidence,
  trueClass,
  predictedClass,
}: {
  confidence: Record<VesselClass, number>;
  trueClass: VesselClass;
  predictedClass: VesselClass;
}) {
  const entries = (Object.entries(confidence) as [VesselClass, number][]).sort((a, b) => b[1] - a[1]);

  return (
    <div className="space-y-2.5">
      {entries.map(([cls, value]) => {
        const isPrediction = cls === predictedClass;
        const isTruth = cls === trueClass;
        return (
          <div key={cls}>
            <div className="flex items-baseline justify-between mb-1">
              <span
                className={cn(
                  "font-mono text-[11px] uppercase tracking-wide flex items-center gap-1.5",
                  isPrediction ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {CLASS_LABEL[cls]}
                {isTruth && (
                  <span className="text-primary text-[9px] border border-primary/40 px-1 rounded-sm">
                    GROUND TRUTH
                  </span>
                )}
              </span>
              <span className="font-mono text-[11px] tabular-nums text-muted-foreground">
                {(value * 100).toFixed(1)}%
              </span>
            </div>
            <div className="h-1.5 bg-muted overflow-hidden">
              <div
                className={cn("h-full", isPrediction ? "bg-primary" : "bg-foreground/25")}
                style={{ width: `${value * 100}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
