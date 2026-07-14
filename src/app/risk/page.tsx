import { PageShell } from "@/components/vox-nav";
import { VoxBadge, VoxKpi } from "@/components/vox";
import { getPositions, getPortfolioSectorComparison } from "@/lib/db";
import { fmtCurrency } from "@/lib/format";
import { typography } from "@/lib/design-system";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const CRYPTO = new Set([
  "BTC", "ETH", "SOL", "XRP", "DOGE", "ADA", "BNB", "TRX", "HBAR", "BONK",
  "AVAX", "DOT", "LINK", "SHIB", "PENGU", "MORPHO", "VANA", "VAULTA",
]);

export default async function RiskPage() {
  let positions: any[] = [];
  let sectors: any[] = [];
  try {
    positions = await getPositions();
    sectors = await getPortfolioSectorComparison();
  } catch {
    /* empty */
  }

  const aum = positions.reduce(
    (s, p) => s + Number(p.live_value || p.value || 0),
    0
  );
  const sorted = [...positions].sort(
    (a, b) => Number(b.live_value || b.value || 0) - Number(a.live_value || a.value || 0)
  );
  const top5 = sorted.slice(0, 5);
  const top5Pct =
    aum > 0
      ? (top5.reduce((s, p) => s + Number(p.live_value || p.value || 0), 0) / aum) *
        100
      : 0;
  const cryptoVal = positions
    .filter((p) => CRYPTO.has(String(p.ticker || "").toUpperCase()) || /crypto/i.test(p.sector || ""))
    .reduce((s, p) => s + Number(p.live_value || p.value || 0), 0);
  const cryptoPct = aum > 0 ? (cryptoVal / aum) * 100 : 0;
  const tech = sectors.find((s) => /tech/i.test(s.sector || ""));
  const techPct = tech ? Number(tech.portfolio_weight || tech.weight_pct || 0) : 0;
  const energy = sectors.find((s) => /energy/i.test(s.sector || ""));
  const energyPct = energy ? Number(energy.portfolio_weight || energy.weight_pct || 0) : 0;
  const weak = sorted.filter((p) => Number(p.grade || 0) > 0 && Number(p.grade) < 45);
  const weakVal = weak.reduce((s, p) => s + Number(p.live_value || p.value || 0), 0);

  return (
    <PageShell
      title="Risk"
      subtitle="Concentration & structure — not VaR cosplay. Grades = hygiene."
    >
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <VoxKpi label="AUM" value={fmtCurrency(aum)} />
        <VoxKpi
          label="Top 5"
          value={`${top5Pct.toFixed(1)}%`}
          sub={top5Pct > 40 ? "High concentration" : "OK"}
        />
        <VoxKpi
          label="Crypto"
          value={`${cryptoPct.toFixed(1)}%`}
          sub={cryptoPct > 10 ? "Over target ~8%" : "Near target"}
        />
        <VoxKpi
          label="Tech sector"
          value={`${techPct.toFixed(1)}%`}
          sub={techPct > 35 ? "Elevated" : "OK"}
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-4 mb-6">
        <section className="rounded-xl border border-border bg-card p-4">
          <h2 className={cn(typography.subheading, "mb-3")}>Structural gaps</h2>
          <ul className="space-y-2 text-sm">
            <li className="flex justify-between">
              <span className="text-muted-foreground">Energy sleeve</span>
              <span className={cn(typography.mono, energyPct < 1 ? "text-amber-400" : "")}>
                {energyPct.toFixed(1)}% {energyPct < 1 ? "— underweight vs oil shock" : ""}
              </span>
            </li>
            <li className="flex justify-between">
              <span className="text-muted-foreground">Crypto vs ~8% target</span>
              <span className={typography.mono}>
                {cryptoPct.toFixed(1)}% ({cryptoPct > 8 ? "trim core/alts" : "OK"})
              </span>
            </li>
            <li className="flex justify-between">
              <span className="text-muted-foreground">Weak grades (&lt;45)</span>
              <span className={typography.mono}>
                {weak.length} · {fmtCurrency(weakVal)}
              </span>
            </li>
          </ul>
        </section>

        <section className="rounded-xl border border-border bg-card p-4">
          <h2 className={cn(typography.subheading, "mb-3")}>Top 5 names</h2>
          <div className="space-y-2">
            {top5.map((p) => {
              const v = Number(p.live_value || p.value || 0);
              const w = aum > 0 ? (v / aum) * 100 : 0;
              return (
                <div key={p.ticker} className="flex items-center gap-2 text-sm">
                  <span className="w-14 font-medium">{p.ticker}</span>
                  <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full bg-primary/70 rounded-full"
                      style={{ width: `${Math.min(w * 4, 100)}%` }}
                    />
                  </div>
                  <span className={cn(typography.mono, "w-14 text-right text-muted-foreground")}>
                    {w.toFixed(1)}%
                  </span>
                  <VoxBadge grade={Number(p.grade || 0)} />
                </div>
              );
            })}
          </div>
        </section>
      </div>

      <section className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="px-4 py-3 border-b border-border">
          <h2 className={typography.subheading}>Weak / cleanup candidates (hygiene)</h2>
          <p className={typography.caption}>Not auto-sell. Multi-broker never a sell reason.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-muted-foreground">
                <th className="px-3 py-2 font-medium">Ticker</th>
                <th className="px-3 py-2 font-medium text-right">Value</th>
                <th className="px-3 py-2 font-medium text-right">W%</th>
                <th className="px-3 py-2 font-medium">Grade</th>
                <th className="px-3 py-2 font-medium">Sector</th>
              </tr>
            </thead>
            <tbody>
              {weak.slice(0, 20).map((p) => {
                const v = Number(p.live_value || p.value || 0);
                const w = aum > 0 ? (v / aum) * 100 : 0;
                return (
                  <tr key={p.ticker} className="border-b border-border/50">
                    <td className="px-3 py-2 font-medium">{p.ticker}</td>
                    <td className={cn("px-3 py-2 text-right", typography.mono)}>
                      {fmtCurrency(v)}
                    </td>
                    <td className={cn("px-3 py-2 text-right", typography.mono)}>
                      {w.toFixed(2)}%
                    </td>
                    <td className="px-3 py-2">
                      <VoxBadge grade={Number(p.grade || 0)} />
                    </td>
                    <td className="px-3 py-2 text-muted-foreground">{p.sector || "—"}</td>
                  </tr>
                );
              })}
              {weak.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-3 py-6 text-center text-muted-foreground">
                    No weak-grade positions
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </PageShell>
  );
}
