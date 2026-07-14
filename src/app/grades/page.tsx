import { PageShell } from "@/components/vox-nav";
import { VoxBadge, VoxKpi } from "@/components/vox";
import { VoxCard, VoxCardContent, VoxCardHeader, VoxCardTitle } from "@/components/vox-card";
import { getVoxGrades } from "@/lib/db";
import { fmtCurrency } from "@/lib/format";
import { typography } from "@/lib/design-system";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

interface Grade {
  ticker: string;
  name: string;
  vox_grade: number;
  previous_grade: number;
  action: string;
  current_price: number;
  stop_loss: number;
  entry_point: number;
  position_value: number;
  shares: number;
  technical_score: number;
  fundamental_score: number;
  macro_score: number;
  sector_score: number;
  weather_score: number;
  sentiment_score: number;
  catalysts: string;
}

export default async function GradesPage() {
  const grades = (await getVoxGrades()) as Grade[];
  const held = grades.filter((g) => (g.position_value || 0) > 0 || (g.shares || 0) > 0);
  const opps = grades.filter(
    (g) => (g.position_value || 0) === 0 && (g.action === "BUY" || g.vox_grade >= 65)
  );
  const weak = held
    .filter((g) => (g.vox_grade || 0) < 45)
    .sort((a, b) => a.vox_grade - b.vox_grade)
    .slice(0, 12);
  const strong = held
    .filter((g) => (g.vox_grade || 0) >= 65)
    .sort((a, b) => b.vox_grade - a.vox_grade)
    .slice(0, 12);
  const avg =
    held.length > 0
      ? Math.round(
          held.reduce((s, g) => s + (g.vox_grade || 0), 0) / held.length
        )
      : 0;

  return (
    <PageShell
      title="Grades"
      subtitle="Latest-per-ticker layers · portfolio-first"
    >
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <VoxKpi label="Held graded" value={held.length} />
        <VoxKpi label="Avg held grade" value={avg || "—"} />
        <VoxKpi label="Strong (≥65)" value={strong.length} />
        <VoxKpi label="Weak (<45)" value={weak.length} />
      </div>

      <div className="grid lg:grid-cols-2 gap-4 mb-6">
        <div className="vox-surface p-4">
          <div className={cn(typography.label, "mb-3")}>Strong held</div>
          <ul className="space-y-2">
            {strong.map((g) => (
              <li
                key={g.ticker}
                className="flex items-center justify-between gap-2 text-sm"
              >
                <span className="font-mono font-semibold">{g.ticker}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground font-mono">
                    T{Math.round(g.technical_score || 0)}/F
                    {Math.round(g.fundamental_score || 0)}
                  </span>
                  <VoxBadge grade={g.vox_grade}>{g.vox_grade}</VoxBadge>
                </div>
              </li>
            ))}
            {!strong.length && (
              <li className="text-sm text-muted-foreground">None</li>
            )}
          </ul>
        </div>
        <div className="vox-surface p-4">
          <div className={cn(typography.label, "mb-3")}>Weak held</div>
          <ul className="space-y-2">
            {weak.map((g) => (
              <li
                key={g.ticker}
                className="flex items-center justify-between gap-2 text-sm"
              >
                <span className="font-mono font-semibold">{g.ticker}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground font-mono tabular-nums">
                    {fmtCurrency(g.position_value || 0)}
                  </span>
                  <VoxBadge grade={g.vox_grade}>{g.vox_grade}</VoxBadge>
                </div>
              </li>
            ))}
            {!weak.length && (
              <li className="text-sm text-muted-foreground">None material</li>
            )}
          </ul>
        </div>
      </div>

      <div className="vox-surface overflow-x-auto mb-6">
        <div className="px-4 pt-4 pb-2">
          <div className={typography.label}>Held book (layers)</div>
        </div>
        <table className="vox-table w-full min-w-[720px]">
          <thead>
            <tr>
              <th className="text-left px-4 py-2">Ticker</th>
              <th className="text-right px-4 py-2">Grade</th>
              <th className="text-left px-4 py-2">Action</th>
              <th className="text-right px-4 py-2">Value</th>
              <th className="text-right px-4 py-2">T</th>
              <th className="text-right px-4 py-2">F</th>
              <th className="text-right px-4 py-2">M</th>
              <th className="text-right px-4 py-2">Se</th>
            </tr>
          </thead>
          <tbody>
            {held
              .sort((a, b) => (b.position_value || 0) - (a.position_value || 0))
              .slice(0, 80)
              .map((g) => (
                <tr key={g.ticker}>
                  <td className="px-4 py-2 font-mono font-semibold text-sm">
                    {g.ticker}
                  </td>
                  <td className="px-4 py-2 text-right">
                    <VoxBadge grade={g.vox_grade}>{g.vox_grade}</VoxBadge>
                  </td>
                  <td className="px-4 py-2 text-xs text-muted-foreground">
                    {g.action || "—"}
                  </td>
                  <td className="px-4 py-2 text-right font-mono text-sm tabular-nums">
                    {fmtCurrency(g.position_value || 0)}
                  </td>
                  <td className="px-4 py-2 text-right font-mono text-xs text-muted-foreground">
                    {Math.round(g.technical_score || 0)}
                  </td>
                  <td className="px-4 py-2 text-right font-mono text-xs text-muted-foreground">
                    {Math.round(g.fundamental_score || 0)}
                  </td>
                  <td className="px-4 py-2 text-right font-mono text-xs text-muted-foreground">
                    {Math.round(g.macro_score || 0)}
                  </td>
                  <td className="px-4 py-2 text-right font-mono text-xs text-muted-foreground">
                    {Math.round(g.sentiment_score || 0)}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <div className="mb-2">
        <div className={cn(typography.label, "mb-3")}>
          Opportunities not held (top)
        </div>
        <div className="grid md:grid-cols-3 gap-3">
          {opps.slice(0, 9).map((g) => (
            <VoxCard key={g.ticker}>
              <VoxCardHeader>
                <VoxCardTitle>
                  <span className="font-mono">{g.ticker}</span>
                </VoxCardTitle>
                <VoxBadge grade={g.vox_grade}>{g.vox_grade}</VoxBadge>
              </VoxCardHeader>
              <VoxCardContent>
                <p className="text-xs text-muted-foreground truncate">
                  {g.name}
                </p>
                <p className="text-xs font-mono text-muted-foreground mt-2">
                  T{Math.round(g.technical_score || 0)} F
                  {Math.round(g.fundamental_score || 0)} M
                  {Math.round(g.macro_score || 0)} Se
                  {Math.round(g.sentiment_score || 0)}
                </p>
              </VoxCardContent>
            </VoxCard>
          ))}
          {!opps.length && (
            <p className="text-sm text-muted-foreground">No open opportunities</p>
          )}
        </div>
      </div>
    </PageShell>
  );
}
