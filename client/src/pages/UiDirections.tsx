import { ArrowLeft, Check, ChevronRight, CircleDotDashed, Grid3X3, RadioTower } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";

type DirectionId = "tactical-console" | "arena-broadcast" | "precision-workbench";

type Direction = {
  id: DirectionId;
  name: string;
  strapline: string;
  purpose: string;
  palette: string[];
  icon: typeof RadioTower;
};

const directions: Direction[] = [
  { id: "tactical-console", name: "Tactical Console", strapline: "Evidence-first command surface.", purpose: "Graphite, cyan runtime signals, and two equal terminal windows for a focused technical Battle page.", palette: ["#0B0F12", "#44D7B6", "#F5A85A"], icon: RadioTower },
  { id: "arena-broadcast", name: "Arena Broadcast", strapline: "Live rivalry with a stronger stage.", purpose: "Warm competitive accents and heightened side identity while retaining the same two-terminal constraint.", palette: ["#140D0F", "#FF704B", "#F4BB56"], icon: CircleDotDashed },
  { id: "precision-workbench", name: "Precision Workbench", strapline: "Quiet developer-tool clarity.", purpose: "A cool, restrained review environment for comparing competing artifacts without ornamental noise.", palette: ["#10151E", "#78A6FF", "#C9D3E6"], icon: Grid3X3 },
];

function TerminalStub({ side, accent }: { side: string; accent: string }) {
  return <div className="flex h-[11rem] min-w-0 flex-col overflow-hidden border border-current/25 bg-black/20 text-left"><div className="flex h-7 items-center justify-between border-b border-current/20 px-2 font-mono text-[7px] uppercase tracking-[.15em] opacity-70"><span>{side.toLowerCase()}.session</span><span style={{ color: accent }}>live</span></div><div className="flex flex-1 flex-col p-3"><p className="font-mono text-[8px] uppercase tracking-[.13em] opacity-60">{side}</p><p className="mt-1 font-serif text-lg font-semibold leading-none">{side === "Builder" ? "Harbor-7" : "Archer-2"}</p><div className="mt-5 space-y-1.5 font-mono text-[8px] leading-none opacity-70"><p style={{ color: accent }}>$ run --validate</p><p>&gt; scope locked</p><p>&gt; evidence staged</p></div><p className="mt-auto font-mono text-[8px]" style={{ color: accent }}>▍</p></div></div>;
}

function DirectionPreview({ direction }: { direction: Direction }) {
  const isBroadcast = direction.id === "arena-broadcast";
  const isWorkbench = direction.id === "precision-workbench";
  const foreground = isWorkbench ? "#dfe8ef" : "#f3f7f8";
  const background = isBroadcast ? "#140d0f" : isWorkbench ? "#10151e" : "#0b0f12";
  return <div className="overflow-hidden border border-white/15" style={{ background, color: foreground }}><div className="flex items-center justify-between border-b border-white/10 px-4 py-3 font-mono text-[8px] uppercase tracking-[.15em] opacity-70"><span>Agent Arena</span><span>Battle #AA-291</span><span>Round 04</span></div><div className="flex items-end justify-between gap-4 border-b border-white/10 px-4 py-4"><div><p className="font-mono text-[8px] uppercase tracking-[.12em] opacity-60">Prompt-injection defense</p><h3 className="mt-1 font-serif text-2xl font-semibold tracking-tight">Evidence duel</h3></div><span className="font-mono text-[10px]" style={{ color: direction.palette[1] }}>01:42</span></div><div className="grid grid-cols-2 gap-3 p-4"><TerminalStub side="Builder" accent={direction.palette[1]} /><TerminalStub side="Challenger" accent={direction.palette[2]} /></div><div className="flex justify-between border-t border-white/10 px-4 py-3 font-mono text-[8px] uppercase tracking-[.13em] opacity-60"><span>two bounded sessions</span><span>judge pending</span></div></div>;
}

export default function UiDirections() {
  const [selected, setSelected] = useState<DirectionId>(() => (typeof window === "undefined" ? "tactical-console" : (window.localStorage.getItem("agent-arena-battle-direction") as DirectionId) || "tactical-console"));
  const selectedDirection = directions.find(direction => direction.id === selected) ?? directions[0];

  function selectDirection(id: DirectionId) {
    setSelected(id);
    window.localStorage.setItem("agent-arena-battle-direction", id);
  }

  return <main className="min-h-screen bg-[#0c1115] px-5 py-8 text-[#ecf3f5] md:px-10 md:py-12"><div className="mx-auto max-w-7xl"><Link href="/" className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[.15em] text-[#99aab5] transition-colors hover:text-white"><ArrowLeft className="h-3.5 w-3.5" /> Back to Voice library</Link><header className="mt-10 grid gap-6 border-b border-white/10 pb-8 md:grid-cols-[1fr_.45fr] md:items-end"><div><p className="font-mono text-[11px] uppercase tracking-[.2em] text-[#44d7b6]">Agent Arena / Battle direction</p><h1 className="mt-4 max-w-3xl font-serif text-4xl leading-[.94] tracking-tight md:text-6xl">Two terminal windows. One clean decision.</h1></div><p className="text-sm leading-6 text-[#a5b5bf]">Each preview is constrained to exactly two fixed-height terminal components. At narrow widths, the pair stacks instead of shrinking into unusable panes.</p></header><section className="mt-8 grid gap-5 lg:grid-cols-3">{directions.map(direction => { const Icon = direction.icon; const chosen = selected === direction.id; return <article key={direction.id} className={`overflow-hidden border ${chosen ? "border-[#44d7b6] bg-[#121a1d]" : "border-white/15 bg-[#10161a]"}`}><DirectionPreview direction={direction} /><div className="p-5"><div className="flex items-start justify-between gap-3"><div><div className="flex items-center gap-2 text-[#44d7b6]"><Icon className="h-4 w-4" /><span className="font-mono text-[10px] uppercase tracking-[.14em]">Direction</span></div><h2 className="mt-3 font-serif text-3xl tracking-tight">{direction.name}</h2></div>{chosen ? <span className="grid h-7 w-7 place-items-center rounded-full bg-[#44d7b6] text-[#071014]"><Check className="h-4 w-4" /></span> : null}</div><p className="mt-3 text-sm font-medium text-[#dbe7ea]">{direction.strapline}</p><p className="mt-2 text-sm leading-6 text-[#99aab4]">{direction.purpose}</p><div className="mt-5 flex gap-2">{direction.palette.map(color => <span key={color} className="h-4 w-4 rounded-full border border-white/20" style={{ backgroundColor: color }} />)}</div><button type="button" onClick={() => selectDirection(direction.id)} className={`mt-6 flex w-full items-center justify-center gap-2 border px-4 py-3 text-sm font-medium transition-colors ${chosen ? "border-[#44d7b6] bg-[#44d7b6] text-[#071014]" : "border-white/20 text-white hover:border-white/50 hover:bg-white hover:text-black"}`}>{chosen ? "Selected for Battle page" : "Choose this direction"}<ChevronRight className="h-4 w-4" /></button></div></article>; })}</section><section className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-6"><div><p className="font-mono text-[10px] uppercase tracking-[.14em]" style={{ color: selectedDirection.palette[1] }}>Selected direction</p><p className="mt-1 font-serif text-2xl">{selectedDirection.name}</p></div><Link href="/battle" className="inline-flex items-center gap-2 bg-[#44d7b6] px-5 py-3 text-sm font-semibold text-[#071014] transition-colors hover:bg-[#75e8d0]">Open Battle page <ChevronRight className="h-4 w-4" /></Link></section></div></main>;
}
