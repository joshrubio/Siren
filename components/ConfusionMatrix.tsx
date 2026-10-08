import { Fragment } from "react";
import { CLASS_LABEL, type VesselClass } from "@/lib/clips";

export default function ConfusionMatrix({
  classes,
  matrix,
}: {
  classes: VesselClass[];
  matrix: number[][];
}) {
  const max = Math.max(...matrix.flat());

  return (
    <div className="inline-block">
      <div
        className="grid gap-px bg-border"
        style={{ gridTemplateColumns: `100px repeat(${classes.length}, 72px)` }}
      >
        <div />
        {classes.map((cls) => (
          <div key={cls} className="bg-background p-2 text-center">
            <span className="font-mono text-[9px] uppercase text-muted-foreground">{CLASS_LABEL[cls]}</span>
          </div>
        ))}
        {matrix.map((row, i) => (
          <Fragment key={`row-${classes[i]}`}>
            <div className="bg-background p-2 flex items-center justify-end">
              <span className="font-mono text-[9px] uppercase text-muted-foreground text-right">
                {CLASS_LABEL[classes[i]]}
              </span>
            </div>
            {row.map((value, j) => {
              const intensity = max > 0 ? value / max : 0;
              const isDiagonal = i === j;
              return (
                <div
                  key={`${i}-${j}`}
                  className="bg-background p-2 flex items-center justify-center"
                  style={{
                    backgroundColor: isDiagonal
                      ? `color-mix(in oklch, var(--primary) ${intensity * 85}%, var(--background))`
                      : `color-mix(in oklch, var(--destructive) ${intensity * 60}%, var(--background))`,
                  }}
                >
                  <span className="font-mono text-xs tabular-nums">{value}</span>
                </div>
              );
            })}
          </Fragment>
        ))}
      </div>
      <p className="font-mono text-[9px] text-muted-foreground mt-2 flex gap-4">
        <span>rows = ground truth</span>
        <span>columns = predicted</span>
      </p>
    </div>
  );
}
