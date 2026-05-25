"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Sidebar } from "@/components/sidebar";
import { useState } from "react";
import { Search, Brain, BookOpen, Database, TrendingUp } from "lucide-react";

// Simulated RAG responses — in production this would call the Python backend
const RAG_KNOWLEDGE_BASE = [
  {
    id: "vault_001",
    source: "obsidian",
    title: "NVDA Position Thesis",
    text: "NVDA grade 78/100 STRONG BUY. AI demand remains insatiable. Data center revenue growing 93% YoY. Blackwell architecture ramping. Earnings May 28 expected beat. Position: 41 shares across GBM Main ($9,011). Unrealized P&L +$7,482 (+489%).",
    tags: ["NVDA", "semiconductor", "AI", "earnings"]
  },
  {
    id: "vault_002",
    source: "obsidian",
    title: "JMIA Mistake Analysis",
    text: "JMIA grade 22/100 SELL. Bought without grade check at $21.50. Now $6.97. Loss: $1,800. Lesson: Always run grade before entry. African e-commerce facing logistics headwinds. Exit immediately.",
    tags: ["JMIA", "mistake", "SELL"]
  },
  {
    id: "grade_001",
    source: "grades",
    title: "CRWD Grade Analysis",
    text: "CRWD grade 65/HOLD. Technical: Strong uptrend above 50-day. Fundamental: Revenue growth 33% YoY. Sentiment: Positive on cybersecurity demand. Valuation: Rich at 25x sales. Action: HOLD current position.",
    tags: ["CRWD", "cybersecurity", "HOLD"]
  },
  {
    id: "journal_001",
    source: "journal",
    title: "Trade: CEG Buy May 10",
    text: "Bought 25 CEG @ $285. Nuclear energy thesis. Grade 71. Government supporting SMR development. Target $350. Stop $250. Rationale: Energy independence executive order accelerates approvals.",
    tags: ["CEG", "nuclear", "BUY", "energy"]
  },
  {
    id: "pos_001",
    source: "portfolio",
    title: "BTC Position",
    text: "BTC: 0.11 BTC @ $108,000 avg. Value: $11,761. Grade 68/HOLD. Crypto allocation: 6.0% of portfolio (under 10% limit). ETF inflows strong. Halving supply shock. Target: $150K. Stop: $85K.",
    tags: ["BTC", "crypto", "HOLD"]
  },
  {
    id: "council_001",
    source: "council",
    title: "LLM Council: Tech Sector",
    text: "Council consensus (4/5 models): Tech sector overvalued short-term but structurally sound long-term. NVDA, MSFT, GOOGL rated BUY. AAPL rated HOLD due to China exposure. Avoid speculative AI names.",
    tags: ["tech", "LLM", "consensus", "sector"]
  }
];

function searchRAG(query: string): typeof RAG_KNOWLEDGE_BASE {
  const q = query.toLowerCase();
  return RAG_KNOWLEDGE_BASE.filter(doc => 
    doc.text.toLowerCase().includes(q) ||
    doc.title.toLowerCase().includes(q) ||
    doc.tags.some(t => t.toLowerCase().includes(q))
  ).sort((a, b) => {
    // Exact ticker match gets priority
    const aExact = a.tags.some(t => t.toLowerCase() === q);
    const bExact = b.tags.some(t => t.toLowerCase() === q);
    if (aExact && !bExact) return -1;
    if (bExact && !aExact) return 1;
    return 0;
  });
}

export default function RAGPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<typeof RAG_KNOWLEDGE_BASE>([]);
  const [searched, setSearched] = useState(false);

  const handleSearch = () => {
    if (!query.trim()) return;
    setResults(searchRAG(query));
    setSearched(true);
  };

  const sourceColors: Record<string, string> = {
    obsidian: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    grades: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    journal: "bg-green-500/20 text-green-400 border-green-500/30",
    portfolio: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    council: "bg-red-500/20 text-red-400 border-red-500/30",
  };

  const sourceIcons: Record<string, React.ElementType> = {
    obsidian: BookOpen,
    grades: TrendingUp,
    journal: Database,
    portfolio: Database,
    council: Brain,
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="lg:ml-64 p-4 lg:p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight">RAG Intelligence</h1>
          <p className="text-muted-foreground text-sm">
            Ask anything about your portfolio — AI searches all knowledge
          </p>
        </div>

        {/* Search */}
        <Card className="vox-card mb-8">
          <CardContent className="p-6">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Ask about any ticker, trade, thesis, or strategy..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="pl-10"
                />
              </div>
              <Button onClick={handleSearch}>
                <Brain className="h-4 w-4 mr-2" />
                Search
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              Try: "Why did I buy NVDA?" · "Show me losing trades" · "What did the Council say?" · "JMIA thesis"
            </p>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Vault Files", value: "119", icon: BookOpen },
            { label: "Positions", value: "1,344", icon: Database },
            { label: "Grades", value: "30+", icon: TrendingUp },
            { label: "Council Notes", value: "25", icon: Brain },
          ].map((stat) => (
            <Card key={stat.label} className="vox-card">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                    <p className="text-xl font-bold font-mono">{stat.value}</p>
                  </div>
                  <stat.icon className="h-6 w-6 text-primary" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Results */}
        {searched && (
          <div>
            <h2 className="text-lg font-semibold mb-4">
              Results for "{query}" ({results.length} found)
            </h2>
            
            {results.length === 0 ? (
              <Card className="vox-card">
                <CardContent className="p-8 text-center">
                  <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    No results found. Try a different query or the RAG system may need indexing.
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Run: python3 vox_rag_system.py init
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {results.map((doc) => {
                  const Icon = sourceIcons[doc.source] || BookOpen;
                  return (
                    <Card key={doc.id} className="vox-card">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-sm">
                          <Icon className="h-4 w-4" />
                          {doc.title}
                          <Badge variant="outline" className={`ml-auto text-xs ${sourceColors[doc.source] || ""}`}>
                            {doc.source}
                          </Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-3">{doc.text}</p>
                        <div className="flex flex-wrap gap-1">
                          {doc.tags.map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
