"use client";

import { PageShell } from "@/components/vox-nav";
import { MermaidChart } from "@/components/mermaid-chart";
import { VoxKpi } from "@/components/vox";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  allowlistCrons,
  architectureMeta,
  hardRules,
  mermaidDiagrams,
  modelRouting,
  neverReenable,
  pipelines,
  type CronJob,
} from "@/lib/architecture";
import { typography } from "@/lib/design-system";
import { cn } from "@/lib/utils";
import {
  Network,
  Clock,
  GitBranch,
  Layers,
  Shield,
  Server,
} from "lucide-react";
import { useMemo, useState } from "react";

const categoryLabel: Record<CronJob["category"], string> = {
  decision: "Decision",
  context: "Context",
  pricing: "Pricing",
  fund: "Fund",
  hygiene: "Hygiene",
  meta: "Meta",
  soft: "Soft",
};

function deliverBadge(d: CronJob["deliver"]) {
  if (d === "origin")
    return (
      <Badge
        variant="outline"
        className="bg-grade-core-soft text-grade-core border-grade-core/30"
      >
        Telegram
      </Badge>
    );
  return (
    <Badge variant="outline" className="text-muted-foreground">
      Local
    </Badge>
  );
}

export default function ArchitecturePage() {
  const [filter, setFilter] = useState<"all" | CronJob["category"]>("all");

  const crons = useMemo(() => {
    if (filter === "all") return allowlistCrons;
    return allowlistCrons.filter((c) => c.category === filter);
  }, [filter]);

  const tgCount = allowlistCrons.filter((c) => c.deliver === "origin").length;
  const categories = [
    "all",
    "decision",
    "context",
    "pricing",
    "fund",
    "hygiene",
    "soft",
    "meta",
  ] as const;

  return (
    <PageShell
      title="Architecture"
      subtitle={`${architectureMeta.product} · ${architectureMeta.phase} · updated ${architectureMeta.updated}`}
      actions={
        <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
          <Network className="h-4 w-4 text-primary" />
          control tower
        </div>
      }
    >
      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        <VoxKpi
          label="Allowlist crons"
          value={allowlistCrons.length}
          sub="Phase 4 survival set"
        />
        <VoxKpi
          label="Telegram surfaces"
          value={tgCount}
          sub="Ops + Breaking only"
        />
        <VoxKpi label="Pipelines"
          value={pipelines.length}
          sub="Decision · price · hygiene"
        />
        <VoxKpi
          label="Decision SSOT"
          value="Ops Card"
          sub={architectureMeta.decisionSsot}
        />
      </div>

      {/* Mandate blurb */}
      <section className="mb-8 rounded-xl border border-border bg-card p-4 lg:p-5">
        <div className="flex items-start gap-3">
          <Shield className="h-4 w-4 mt-0.5 text-primary shrink-0" />
          <div className="space-y-1">
            <p className={typography.subheading}>Product truth</p>
            <p className="text-sm text-muted-foreground">
              {architectureMeta.mandate}. Honest book + structure + hygiene +
              one decision surface — not a day-trading edge engine.
            </p>
            <p className="text-xs font-mono text-muted-foreground pt-1">
              scripts {architectureMeta.workdirs.scripts} · dashboard{" "}
              {architectureMeta.workdirs.dashboard} · obsidian{" "}
              {architectureMeta.workdirs.obsidian}
            </p>
          </div>
        </div>
      </section>

      {/* Diagrams */}
      <section className="mb-10 space-y-8">
        <div className="flex items-center gap-2">
          <GitBranch className="h-4 w-4 text-primary" />
          <h2 className={typography.heading}>System maps</h2>
        </div>

        <MermaidChart
          title="1 · End-to-end control tower"
          chart={mermaidDiagrams.systemFlow}
        />
        <MermaidChart
          title="2 · Daily cadence (CT weekdays)"
          chart={mermaidDiagrams.dailyCadence}
        />
        <div className="grid lg:grid-cols-2 gap-6">
          <MermaidChart
            title="3 · Model routing"
            chart={mermaidDiagrams.modelRouting}
          />
          <MermaidChart
            title="4 · Decision Object gates"
            chart={mermaidDiagrams.decisionObject}
          />
        </div>
        <MermaidChart
          title="5 · Data · storage · surfaces"
          chart={mermaidDiagrams.dataStorage}
        />
      </section>

      {/* Pipelines */}
      <section className="mb-10 space-y-4">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-primary" />
          <h2 className={typography.heading}>Pipelines</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          {pipelines.map((p) => (
            <Card key={p.id} className="vox-card border-border">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base">{p.name}</CardTitle>
                  {p.ssot ? (
                    <Badge className="bg-grade-core-soft text-grade-core border-0">
                      SSOT
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-muted-foreground">
                      Support
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{p.purpose}</p>
              </CardHeader>
              <CardContent className="space-y-3">
                <ol className="space-y-1.5 text-sm">
                  {p.steps.map((s, i) => (
                    <li key={s} className="flex gap-2">
                      <span className="font-mono text-[10px] text-muted-foreground w-4 shrink-0 pt-0.5">
                        {i + 1}.
                      </span>
                      <span className="text-foreground/90">{s}</span>
                    </li>
                  ))}
                </ol>
                <p className="text-xs font-mono text-muted-foreground border-t border-border pt-2">
                  Surface · {p.surface}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Model table */}
      <section className="mb-10 space-y-4">
        <div className="flex items-center gap-2">
          <Server className="h-4 w-4 text-primary" />
          <h2 className={typography.heading}>Model routing</h2>
        </div>
        <Card className="vox-card border-border overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="p-3 text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
                      Role
                    </th>
                    <th className="p-3 text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
                      Model
                    </th>
                    <th className="p-3 text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
                      Path
                    </th>
                    <th className="p-3 text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
                      Note
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {modelRouting.map((r) => (
                    <tr
                      key={r.role}
                      className="border-b border-border/50 hover:bg-muted/30"
                    >
                      <td className="p-3 font-medium">{r.role}</td>
                      <td className="p-3 font-mono text-xs">{r.model}</td>
                      <td className="p-3 text-muted-foreground text-xs">
                        {r.path}
                      </td>
                      <td className="p-3 text-muted-foreground text-xs">
                        {r.note}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Crons allowlist */}
      <section className="mb-10 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            <h2 className={typography.heading}>Cron allowlist</h2>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {categories.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setFilter(c)}
                className={cn(
                  "px-2.5 py-1 rounded-md text-xs font-medium transition-colors",
                  filter === c
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:bg-muted/50"
                )}
              >
                {c === "all" ? "All" : categoryLabel[c]}
              </button>
            ))}
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          Phase 4 survival set ({allowlistCrons.length}). Anything else enabled
          is a zombie. Full runtime status still on{" "}
          <a href="/crons" className="text-primary hover:underline">
            Crons
          </a>
          .
        </p>
        <Card className="vox-card border-border overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="p-3 text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
                      Job
                    </th>
                    <th className="p-3 text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
                      When
                    </th>
                    <th className="p-3 text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
                      Category
                    </th>
                    <th className="p-3 text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
                      Deliver
                    </th>
                    <th className="p-3 text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
                      Feeds
                    </th>
                    <th className="p-3 text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
                      Script
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {crons.map((job) => (
                    <tr
                      key={job.name}
                      className="border-b border-border/50 hover:bg-muted/30"
                    >
                      <td className="p-3 font-mono text-xs font-semibold">
                        {job.name}
                      </td>
                      <td className="p-3 text-xs text-muted-foreground whitespace-nowrap">
                        {job.scheduleHuman}
                      </td>
                      <td className="p-3">
                        <Badge variant="outline" className="text-xs">
                          {categoryLabel[job.category]}
                        </Badge>
                      </td>
                      <td className="p-3">{deliverBadge(job.deliver)}</td>
                      <td className="p-3 text-xs text-muted-foreground">
                        {job.feeds}
                      </td>
                      <td className="p-3 font-mono text-[10px] text-muted-foreground max-w-[200px] truncate">
                        {job.script}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Hard rules + never list */}
      <section className="grid lg:grid-cols-2 gap-4 mb-6">
        <Card className="vox-card border-border">
          <CardHeader>
            <CardTitle className="text-base">Hard rules</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {hardRules.map((r) => (
                <li key={r} className="flex gap-2">
                  <span className="text-grade-core shrink-0">✓</span>
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
        <Card className="vox-card border-border">
          <CardHeader>
            <CardTitle className="text-base">Never re-enable</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground mb-3">
              Survival treats these as zombies if enabled again (councils,
              master-data, claude top10, etc.).
            </p>
            <ul className="space-y-1.5">
              {neverReenable.map((n) => (
                <li
                  key={n}
                  className="font-mono text-xs text-loss/90 bg-loss-soft/30 rounded px-2 py-1"
                >
                  {n}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </section>

      <p className="text-[11px] text-muted-foreground font-mono">
        Source: allowlist = vox_cron_survival.py · product truth = vox skill /
        AGENTS.md · this page is documentation, not a live scheduler.
      </p>
    </PageShell>
  );
}
