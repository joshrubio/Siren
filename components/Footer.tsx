"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Footer() {
  const pathname = usePathname();
  if (pathname === "/login") return null;

  return (
    <footer className="shrink-0 border-t px-5 py-3 flex flex-wrap items-center justify-between gap-2">
      <p className="font-mono text-[10px] text-muted-foreground/70">
        Siren — an interpretation layer over a real classifier, not an ML research project.
      </p>
      <div className="flex items-center gap-4 font-mono text-[10px] text-muted-foreground/70">
        <a
          href="https://github.com/irfankamboh/DeepShip"
          target="_blank"
          rel="noreferrer"
          className="hover:text-foreground transition-colors"
        >
          Data: DeepShip
        </a>
        <a
          href="https://github.com/joshrubio/Siren"
          target="_blank"
          rel="noreferrer"
          className="hover:text-foreground transition-colors"
        >
          Source
        </a>
        <Link href="/docs" className="hover:text-foreground transition-colors">
          Docs
        </Link>
      </div>
    </footer>
  );
}
