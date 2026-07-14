import { PageShell } from "@/components/vox-nav";
import { VoxKpi } from "@/components/vox";
import { getPortfolioSectorComparison } from "@/lib/db";
import { fmtCurrency } from "@/lib/format";
import { typography } from "@/lib/design-system";
import { cn } from "@/lib/utils";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function SectorsPage() {
  const sectors = await getPortfolioSectorComparison();
  const total = sectors.reduce(
    (s, r) => s + Number(r.portfolio_value || 0),
    0
  );
  const max = Math.max(
    ...sectors.map((r) => Number(r.portfolio_value || 0)),
    1
  );

  return (
    <PageShell
      title="Sectors"
      subtitle="Book exposure map · compound with SectorMap in Obsidian"
      actions={
        <Link
          href="/screener"
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          Open screener →
        </Link>
      }
    >
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
        <VoxKpi label="Sectors" value={sectors.length} />
        <VoxKpi label="Mapped AUM" value={fmtCurrency(total)} />
        <VoxKpi
          label="Top sector"
          value={sectors[0]?.sector || "—"}
          sub={
            sectors[0]
              ? `${((Number(sectors[0].portfolio_value) / Math.max(total, 1)) * 100).toFixed(1)}%`
              : undefined
          }
        />
      </div>

      <div className="vox-surface p-4 mb-6">
        <div className={cn(typography.label, "mb-4")}>Weight bars</div>
        <div className="space-y-3">
          {sectors.map((s) => {
            const val = Number(s.portfolio_value || 0);
            const w = total > 0 ? (val / total) * 100 : 0;
            return (
              <div key={s.sector}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium text-foreground">{s.sector}</span>
                  <span className="font-mono text-muted-foreground tabular-nums">
                    {w.toFixed(1)}% · {fmtCurrency(val)} · n=
                    {s.portfolio_count}
                    {s.portfolio_avg_grade != null
                      ? ` · g${s.portfolio_avg_grade}`
                      : ""}
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-grade-buy/80"
                    style={{ width: `${Math.max(3, (val / max) * 100)}%` }}
                  />
                </div>
              </div>
            );
          })}
          {!sectors.length && (
            <p className="text-sm text-muted-foreground">No sector data</p>
          )}
        </div>
      </div>

      <div className="vox-surface overflow-x-auto">
        <table className="vox-table w-full min-w-[520px]">
          <thead>
            <tr>
              <th className="text-left px-4 py-3">Sector</th>
              <th className="text-right px-4 py-3">Value</th>
              <th className="text-right px-4 py-3">W%</th>
              <th className="text-right px-4 py-3">Names</th>
              <th className="text-right px-4 py-3">Avg grade</th>
            </tr>
          </thead>
          <tbody>
            {sectors.map((s) => {
              const val = Number(s.portfolio_value || 0);
              const w = total > 0 ? (val / total) * 100 : 0;
              return (
                <tr key={s.sector}>
                  <td className="px-4 py-2.5 font-medium">{s.sector}</td>
                  <td className="px-4 py-2.5 text-right font-mono tabular-nums">
                    {fmtCurrency(val)}
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono text-muted-foreground tabular-nums">
                    {w.toFixed(1)}%
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono tabular-nums">
                    {s.portfolio_count}
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono tabular-nums">
                    {s.portfolio_avg_grade ?? "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </PageShell>
  );
}
