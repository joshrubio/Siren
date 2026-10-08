import { Suspense } from "react";
import { enterTerminal } from "./actions";

async function LoginForm({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const from = typeof params.from === "string" ? params.from : "/";

  return (
    <form action={enterTerminal} className="w-full max-w-sm">
      <input type="hidden" name="from" value={from} />
      <label className="block mb-4">
        <span className="font-mono text-[10px] uppercase tracking-wide text-muted-foreground">
          Operator ID
        </span>
        <input
          name="operator"
          placeholder="e.g. SIREN-07"
          autoFocus
          className="mt-1.5 w-full h-9 bg-input border border-border rounded-sm px-2.5 font-mono text-sm outline-none focus:border-primary"
        />
      </label>
      <button
        type="submit"
        className="w-full h-9 bg-primary text-primary-foreground font-mono text-xs uppercase tracking-wide rounded-sm hover:bg-primary/85 transition-colors"
      >
        Authenticate
      </button>
      <p className="mt-4 text-[10px] text-muted-foreground/70 leading-relaxed">
        Demo access gate — any input (or none) is accepted. This is a portfolio project; there is
        no real authentication, and nothing here is a production system.
      </p>
    </form>
  );
}

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  return (
    <main className="flex-1 flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 font-mono text-sm tracking-[0.2em] uppercase">
            <span className="size-1.5 rounded-full bg-primary animate-pulse" />
            Siren
          </div>
          <p className="mt-2 font-mono text-[10px] uppercase tracking-wide text-muted-foreground">
            Acoustic Classification Terminal
          </p>
        </div>
        <Suspense fallback={<div className="h-36" />}>
          <LoginForm searchParams={searchParams} />
        </Suspense>
      </div>
    </main>
  );
}
