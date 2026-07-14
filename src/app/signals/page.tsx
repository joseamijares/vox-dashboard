import { PageShell } from "@/components/vox-nav";
import { VoxKpi } from "@/components/vox";
import { typography } from "@/lib/design-system";
import { cn } from "@/lib/utils";
import Link from "next/link";

export const dynamic = "force-dynamic";

/**
 * trade_signals truncated 2026-07-14 (stale June noise, packs failed backtest).
 * New capital ideas live in Outside-Ideas / Screener — not this page.
 */
export default async function SignalsPage() {
  return (
    <PageShell
      title="Signals"
      subtitle="Legacy trade_signals retired. Grades ≠ auto-trade."
    >
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
        <VoxKpi label="trade_signals" value="0" sub="truncated — no USE packs" />
        <VoxKpi label="Policy" value="Hygiene" sub="No auto-deploy" />
        <VoxKpi label="Use instead" value="Outside" sub="Anti-chase ideas" />
      </div>

      <section className="rounded-xl border border-border bg-card p-5 space-y-3">
        <h2 className={typography.subheading}>Where real ideas live</h2>
        <ul className="text-sm space-y-2 text-muted-foreground">
          <li>
            · <strong className="text-foreground">Outside-Ideas</strong> — Obsidian{" "}
            <code className="text-xs">memory/brain/Outside-Ideas-LATEST</code> (not held, anti-chase)
          </li>
          <li>
            · <Link href="/screener" className="text-primary underline-offset-2 hover:underline">Screener</Link>{" "}
            — universe grades as ranking hygiene
          </li>
          <li>
            · <Link href="/portfolio" className="text-primary underline-offset-2 hover:underline">Positions</Link>{" "}
            — book actions (cut / trim / hold)
          </li>
        </ul>
        <p className={cn(typography.caption, "pt-2")}>
          Signal packs backtested poorly (hit rates single-digit / negative avg). Do not size money
          off old trade_signals. Rebuild only if a pack earns USE verdict.
        </p>
      </section>
    </PageShell>
  );
}
