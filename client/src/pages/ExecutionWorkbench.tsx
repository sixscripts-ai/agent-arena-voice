import { Button } from "@/components/ui/button";
import { Check, ChevronRight, Circle, Code2, FileCode2, FileText, Headphones, PanelRight, Play, RotateCcw, ShieldCheck, TerminalSquare, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";

type RunStatus = "ready" | "running" | "completed";
type ArtifactTab = "source" | "tests" | "diff";

const source = `export function normalizePolicy(input: PolicyInput) {
  const allowed = new Set(["read", "write", "execute"]);
  const actions = input.actions.filter(action => allowed.has(action));

  return {
    target: input.target.trim(),
    actions,
    enforceOwnership: true,
  };
}`;

const tests = `✓ rejects unknown action types
✓ preserves the requested target
✓ requires an ownership check before execute
○ returns a stable audit payload`;

const diff = `@@ normalizePolicy
- actions: input.actions
 actions: input.actions.filter(action => allowed.has(action))
 enforceOwnership: true`;

const baseEvents = [
  { time: "00:00", kind: "CONFIG", text: "Run fixture loaded", tone: "muted" },
  { time: "00:01", kind: "POLICY", text: "Sandbox policy verified", tone: "pass" },
  { time: "00:03", kind: "ARTIFACT", text: "solution.ts opened", tone: "muted" },
];

export default function ExecutionWorkbench() {
  const [status, setStatus] = useState<RunStatus>("ready");
  const [tab, setTab] = useState<ArtifactTab>("source");
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [events, setEvents] = useState(baseEvents);

  useEffect(() => {
    if (status !== "running") return;
    const timer = window.setTimeout(() => {
      setEvents(current => [...current, { time: "00:08", kind: "TEST", text: "3 passed · 1 pending", tone: "pass" }, { time: "00:09", kind: "JUDGE", text: "Evidence ready for review", tone: "focus" }]);
      setStatus("completed");
    }, 1100);
    return () => window.clearTimeout(timer);
  }, [status]);

  const content = useMemo(() => tab === "source" ? source : tab === "tests" ? tests : diff, [tab]);
  const hasEvidence = status === "completed";

  function runPrototype() {
    if (status === "running") return;
    setEvents([...baseEvents, { time: "00:05", kind: "EXEC", text: "Running selected artifact", tone: "focus" }]);
    setStatus("running");
  }

  function resetPrototype() {
    setStatus("ready");
    setEvents(baseEvents);
    setTab("source");
  }

  return (
    <main className="min-h-screen bg-[#11110f] font-sans text-[#e8e6de] selection:bg-[#2a5cff] selection:text-white">
      <header className="flex h-14 items-center justify-between border-b border-[#3a3932] bg-[#171714] px-4 md:px-6">
        <div className="flex min-w-0 items-center gap-4"><Link href="/" className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-[#e8e6de]">Agent Arena</Link><span className="hidden h-4 w-px bg-[#3a3932] sm:block" /><span className="truncate font-mono text-[10px] uppercase tracking-[0.16em] text-[#9b9a91]">Execution Workbench <span className="text-[#d1a251]">/ prototype</span></span></div>
        <div className="flex items-center gap-2"><span className="hidden font-mono text-[10px] text-[#9b9a91] sm:inline">run_local_001</span><span className={`inline-flex items-center gap-2 border px-2 py-1 font-mono text-[9px] uppercase tracking-[0.14em] ${status === "completed" ? "border-[#5d8352] text-[#a6d391]" : status === "running" ? "border-[#5572d1] text-[#91b2ff]" : "border-[#5b5a52] text-[#b2b0a5]"}`}><Circle className={`h-1.5 w-1.5 fill-current ${status === "running" ? "animate-pulse" : ""}`} />{status}</span></div>
      </header>

      <section className="grid min-h-[calc(100vh-3.5rem)] grid-cols-1 xl:grid-cols-[280px_minmax(0,1fr)_320px]">
        <aside className="border-b border-[#3a3932] bg-[#171714] xl:border-b-0 xl:border-r">
          <div className="border-b border-[#3a3932] p-5"><p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#9b9a91]">Task</p><h1 className="mt-3 text-xl font-semibold leading-6 tracking-tight">Enforce policy actions before execution.</h1><p className="mt-3 text-sm leading-5 text-[#bcbab0]">A code-defense fixture. The artifact must deny unknown actions and preserve the requested target.</p></div>
          <div className="space-y-5 p-5">
            <div><p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#9b9a91]">Constraints</p><ul className="mt-3 space-y-2 text-sm text-[#d5d3c9]"><li className="flex gap-2"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#83b272]" />Ownership must be explicit</li><li className="flex gap-2"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#83b272]" />No unbounded action list</li><li className="flex gap-2"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#83b272]" />Audit-safe output</li></ul></div>
            <div className="border-y border-[#3a3932] py-5"><p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#9b9a91]">Run configuration</p><dl className="mt-3 space-y-2 text-xs"><div className="flex justify-between gap-4"><dt className="text-[#9b9a91]">Builder</dt><dd className="text-right">Code Agent A</dd></div><div className="flex justify-between gap-4"><dt className="text-[#9b9a91]">Guard</dt><dd className="text-right">Policy Judge</dd></div><div className="flex justify-between gap-4"><dt className="text-[#9b9a91]">Budget</dt><dd className="text-right">12 tool calls</dd></div></dl></div>
            <div className="grid grid-cols-2 gap-2"><Button onClick={runPrototype} disabled={status === "running"} className="rounded-none bg-[#e8e6de] text-[#171714] hover:bg-white"><Play className="mr-2 h-4 w-4" />Run</Button><Button onClick={resetPrototype} variant="outline" className="rounded-none border-[#55544d] bg-transparent text-[#e8e6de] hover:bg-[#252521] hover:text-white"><RotateCcw className="mr-2 h-4 w-4" />Reset</Button></div>
            <p className="font-mono text-[9px] leading-4 text-[#74736c]">Prototype fixture only. This control does not create a sandbox or call a model.</p>
          </div>
        </aside>

        <section className="min-w-0 border-b border-[#3a3932] bg-[#11110f] xl:border-b-0 xl:border-r">
          <div className="flex h-11 items-center justify-between border-b border-[#3a3932] px-4"><div className="flex h-full items-end gap-4"><span className="pb-3 font-mono text-[10px] uppercase tracking-[0.16em] text-[#9b9a91]">Read &amp; Write Fixture</span>{(["source", "tests", "diff"] as ArtifactTab[]).map(item => <button key={item} onClick={() => setTab(item)} className={`h-full border-b-2 px-1 pt-1 font-mono text-[10px] uppercase tracking-[0.14em] ${tab === item ? "border-[#d1a251] text-[#f1d08d]" : "border-transparent text-[#89877f] hover:text-[#e8e6de]"}`}>{item}</button>)}</div><span className="font-mono text-[9px] text-[#74736c]">fixture / policy-defense</span></div>
          <div className="grid min-h-[calc(100%-2.75rem)] grid-cols-[150px_minmax(0,1fr)]">
            <nav className="border-r border-[#3a3932] bg-[#151512] p-3"><p className="mb-3 font-mono text-[9px] uppercase tracking-[0.16em] text-[#74736c]">Files</p><button onClick={() => setTab("source")} className={`flex w-full items-center gap-2 px-2 py-2 text-left text-xs ${tab === "source" ? "bg-[#292823] text-[#f0eee6]" : "text-[#a7a49a] hover:bg-[#22211d]"}`}><FileCode2 className="h-3.5 w-3.5 text-[#8da8ff]" />solution.ts</button><button onClick={() => setTab("tests")} className={`mt-1 flex w-full items-center gap-2 px-2 py-2 text-left text-xs ${tab === "tests" ? "bg-[#292823] text-[#f0eee6]" : "text-[#a7a49a] hover:bg-[#22211d]"}`}><TerminalSquare className="h-3.5 w-3.5 text-[#83b272]" />policy.test</button><button onClick={() => setTab("diff")} className={`mt-1 flex w-full items-center gap-2 px-2 py-2 text-left text-xs ${tab === "diff" ? "bg-[#292823] text-[#f0eee6]" : "text-[#a7a49a] hover:bg-[#22211d]"}`}><FileText className="h-3.5 w-3.5 text-[#d1a251]" />change.diff</button></nav>
            <div className="min-w-0 overflow-auto p-5"><div className="mb-4 flex items-center justify-between"><div className="flex items-center gap-2 text-xs text-[#bcbab0]"><Code2 className="h-4 w-4 text-[#d1a251]" />{tab === "source" ? "solution.ts" : tab === "tests" ? "policy.test" : "change.diff"}</div><span className="font-mono text-[9px] text-[#74736c]">writable fixture prototype</span></div><pre className={`overflow-x-auto whitespace-pre rounded-none border border-[#36352f] bg-[#0c0c0b] p-5 font-mono text-[12px] leading-6 ${tab === "diff" ? "text-[#e1d4bd]" : "text-[#d6d5ce]"}`}>{content}</pre></div>
          </div>
        </section>

        <aside className="bg-[#171714]">
          <div className="border-b border-[#3a3932] p-4"><div className="flex items-center justify-between"><p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#9b9a91]">Execution trace</p><span className="font-mono text-[9px] text-[#74736c]">{events.length} events</span></div><div className="mt-4 space-y-3">{events.map((event, index) => <div key={`${event.time}-${index}`} className="grid grid-cols-[38px_48px_minmax(0,1fr)] gap-2 font-mono text-[10px]"><span className="text-[#74736c]">{event.time}</span><span className={event.tone === "pass" ? "text-[#a6d391]" : event.tone === "focus" ? "text-[#9db6ff]" : "text-[#b6b3a8]"}>{event.kind}</span><span className="truncate text-[#d5d3c9]">{event.text}</span></div>)}</div></div>
          <div className="border-b border-[#3a3932] p-4"><div className="flex items-center justify-between"><p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#9b9a91]">Judge evidence</p><PanelRight className="h-4 w-4 text-[#9b9a91]" /></div>{hasEvidence ? <div className="mt-4"><div className="flex items-center gap-2 text-sm text-[#a6d391]"><Check className="h-4 w-4" />Evidence ready</div><p className="mt-2 text-sm leading-5 text-[#cbc8be]">The selected action list is constrained before execution. Review the source and pending test before accepting a verdict.</p><button onClick={() => setTab("source")} className="mt-4 inline-flex items-center gap-1 text-xs text-[#f1d08d] hover:text-[#ffe0a6]">Open cited artifact <ChevronRight className="h-3.5 w-3.5" /></button></div> : <p className="mt-3 text-sm leading-5 text-[#88867d]">No evidence yet. Run the fixture to produce a reviewable trace.</p>}</div>
          <div className="p-4"><div className="flex items-center justify-between"><div><p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#9b9a91]">Voice dock</p><p className="mt-1 text-xs text-[#848177]">Explain the active evidence.</p></div><Button size="icon" onClick={() => setVoiceOpen(!voiceOpen)} className={`h-8 w-8 rounded-none ${voiceOpen ? "bg-[#d1a251] text-[#211b10] hover:bg-[#e3bd6d]" : "bg-[#282720] text-[#d8d4ca] hover:bg-[#35342c]"}`}><Headphones className="h-4 w-4" /></Button></div>{voiceOpen ? <div className="mt-3 border border-[#4a483e] bg-[#121210] p-3 text-xs leading-5 text-[#cbc8be]"><div className="mb-2 flex items-center justify-between font-mono text-[9px] uppercase tracking-[0.14em] text-[#f1d08d]"><span>Voice session</span><button onClick={() => setVoiceOpen(false)} aria-label="Close Voice dock"><X className="h-3.5 w-3.5" /></button></div>Ask why the constraint matters, or request a cited summary after evidence is ready. This prototype does not open a LiveKit room.</div> : null}</div>
        </aside>
      </section>
    </main>
  );
}
