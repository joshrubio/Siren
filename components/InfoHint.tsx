"use client";

import { CircleHelp } from "lucide-react";

export default function InfoHint({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="relative inline-flex group/hint align-middle ml-1.5"
      onClick={(e) => e.stopPropagation()}
    >
      <CircleHelp className="size-3 text-muted-foreground/50 group-hover/hint:text-primary transition-colors cursor-help" />
      <span
        role="tooltip"
        className="pointer-events-none absolute left-1/2 bottom-full z-40 mb-2 w-56 -translate-x-1/2 rounded-sm border bg-popover px-2.5 py-2 text-[11px] font-sans normal-case tracking-normal text-popover-foreground leading-relaxed opacity-0 shadow-lg transition-opacity group-hover/hint:opacity-100 group-focus-within/hint:opacity-100"
      >
        {children}
      </span>
    </span>
  );
}
