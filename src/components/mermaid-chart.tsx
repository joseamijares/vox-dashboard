"use client";

import { useEffect, useId, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface MermaidChartProps {
  chart: string;
  className?: string;
  title?: string;
}

/**
 * Client-side Mermaid renderer (dark-first).
 * Lazy-loads mermaid so SSR stays clean.
 */
export function MermaidChart({ chart, className, title }: MermaidChartProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const reactId = useId().replace(/:/g, "");
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function render() {
      if (!hostRef.current) return;
      setError(null);
      setReady(false);
      try {
        const mermaid = (await import("mermaid")).default;
        mermaid.initialize({
          startOnLoad: false,
          theme: "dark",
          securityLevel: "strict",
          fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
          themeVariables: {
            darkMode: true,
            background: "#15181d",
            primaryColor: "#1c2129",
            primaryTextColor: "#f0f2f5",
            primaryBorderColor: "rgba(255,255,255,0.12)",
            lineColor: "#8b929e",
            secondaryColor: "#111418",
            tertiaryColor: "#0b0e11",
            fontSize: "14px",
          },
          flowchart: { curve: "basis", htmlLabels: true, padding: 12 },
          gantt: { fontSize: 12, barHeight: 18, topPadding: 40 },
        });

        const id = `vox-mmd-${reactId}-${Math.random().toString(36).slice(2, 8)}`;
        const { svg } = await mermaid.render(id, chart.trim());
        if (cancelled || !hostRef.current) return;
        hostRef.current.innerHTML = svg;
        const svgEl = hostRef.current.querySelector("svg");
        if (svgEl) {
          svgEl.setAttribute("width", "100%");
          svgEl.removeAttribute("height");
          svgEl.style.maxWidth = "100%";
          svgEl.style.height = "auto";
        }
        setReady(true);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Mermaid render failed");
        }
      }
    }

    render();
    return () => {
      cancelled = true;
    };
  }, [chart, reactId]);

  return (
    <div className={cn("space-y-2", className)}>
      {title && (
        <h3 className="text-sm font-semibold tracking-tight text-foreground">
          {title}
        </h3>
      )}
      <div className="relative overflow-x-auto rounded-xl border border-border bg-card p-3 lg:p-5">
        {!ready && !error && (
          <div className="absolute inset-0 flex items-center justify-center text-xs text-muted-foreground">
            Rendering diagram…
          </div>
        )}
        {error ? (
          <pre className="whitespace-pre-wrap text-xs text-loss font-mono p-2">
            {error}
            {"\n\n"}
            {chart}
          </pre>
        ) : (
          <div
            ref={hostRef}
            className={cn(
              "mermaid-host min-h-[120px] flex justify-center [&_svg]:max-w-full",
              !ready && "opacity-0"
            )}
          />
        )}
      </div>
    </div>
  );
}
