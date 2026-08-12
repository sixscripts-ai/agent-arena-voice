import { Button } from "@/components/ui/button";
import { ArrowLeft, Check, ChevronRight, CircleDotDashed, Grid3X3, RadioTower } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";
import { toast } from "sonner";

type DirectionId = "arena-frequency" | "precision-grid" | "match-broadcast";

type Direction = {
  id: DirectionId;
  name: string;
  strapline: string;
  purpose: string;
  palette: string[];
  bestFor: string;
  preview: string;
  icon: typeof RadioTower;
};

const directions: Direction[] = [
  {
    id: "arena-frequency",
    name: "Arena Frequency",
    strapline: "Evidence console with controlled signal.",
    purpose: "Graphite surfaces, cyan runtime signals, and fixed evidence readers make dense battle state feel focused rather than noisy.",
    palette: ["#0B0C0E", "#1FD5F9", "#F2F4F7"],
    bestFor: "A technical, dark-mode primary experience with LiveKit Voice as a natural extension.",
    preview: "/manus-storage/agent-arena-preview-arena-frequency_41b2d4a3.png",
    icon: RadioTower,
  },
  {
    id: "precision-grid",
    name: "Precision Grid",
    strapline: "Research-grade clarity, editorial restraint.",
    purpose: "Warm light surfaces, modular evidence grids, and blue decision points prioritize formats, comparisons, and judge provenance.",
    palette: ["#F7F6F2", "#002CF2", "#161616"],
    bestFor: "A credible research product where readable artifacts and static comparison matter more than runtime drama.",
    preview: "/manus-storage/agent-arena-preview-precision-grid_bbddac1c.png",
    icon: Grid3X3,
  },
  {
    id: "match-broadcast",
    name: "Match Broadcast",
    strapline: "Live rivalry, grounded evidence.",
    purpose: "A cinematic phase rail, match clock, and judge desk bring competitive momentum to the active battle without using synthetic activity.",
    palette: ["#090B12", "#E94B2E", "#D8B56A"],
    bestFor: "A compelling live-battle front door, especially for new users and shareable match views.",
    preview: "/manus-storage/agent-arena-preview-match-broadcast_dd285202.png",
    icon: CircleDotDashed,
  },
];

function DirectionFallback({ direction }: { direction: Direction }) {
  const isLight = direction.id === "precision-grid";
  return (
    <div className={`relative h-full overflow-hidden p-4 ${isLight ? "bg-[#f7f6f2] text-[#151515]" : "bg-[#0b0c0e] text-[#f4f6f8]"}`}>
      <div className="absolute inset-0 opacity-20" style={{ backgroundImage: isLight ? "linear-gradient(#192135 1px,transparent 1px),linear-gradient(90deg,#192135 1px,transparent 1px)" : "linear-gradient(#1fd5f9 1px,transparent 1px),linear-gradient(90deg,#1fd5f9 1px,transparent 1px)", backgroundSize: "28px 28px" }} />
      <div className="relative flex h-full flex-col">
        <div className="flex items-center justify-between text-[8px] font-semibold uppercase tracking-[0.18em] opacity-70"><span>Agent Arena</span><span>Live / active</span></div>
        <div className="mt-4 grid flex-1 grid-cols-[0.55fr_1fr] gap-3">
          <div className="rounded border border-current/20 p-3">
            <p className="text-[8px] uppercase tracking-[0.16em] opacity-60">Battle Runtime</p>
            <div className="mt-4 space-y-2">
              {["Acquire context", "Generate artifact", "Evaluate evidence", "Judge decision"].map((phase, index) => <div key={phase} className="flex items-center gap-2 text-[9px]"><span className="grid h-4 w-4 place-items-center rounded-full border border-current/30 text-[7px]">0{index + 1}</span><span>{phase}</span></div>)}
            </div>
          </div>
          <div className="rounded border border-current/25 bg-black/10 p-3">
            <div className="flex justify-between text-[8px] uppercase tracking-[0.16em] opacity-70"><span>Builder</span><span>Challenger</span></div>
            <div className="mt-5 grid grid-cols-2 gap-2"><div className="h-16 rounded border border-current/20" /><div className="h-16 rounded border border-current/20" /></div>
            <div className="mt-3 h-12 rounded border border-current/20 p-2 text-[8px] opacity-75">Evidence inspector · artifact v3</div>
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between rounded border border-current/20 px-3 py-2 text-[8px] uppercase tracking-[0.14em]"><span>Judge signal</span><span style={{ color: direction.palette[1] }}>Round 04</span></div>
      </div>
    </div>
  );
}

export default function UiDirections() {
  const [selected, setSelected] = useState<DirectionId | null>(() => (typeof window === "undefined" ? null : (window.localStorage.getItem("agent-arena-ui-direction") as DirectionId | null)));
  const [failedImages, setFailedImages] = useState<Set<DirectionId>>(new Set());

  function selectDirection(id: DirectionId) {
    setSelected(id);
    window.localStorage.setItem("agent-arena-ui-direction", id);
    toast.success(`${directions.find(direction => direction.id === id)?.name} saved as your local UI preference.`);
  }

  return (
    <main className="min-h-screen bg-[#0a0b0d] px-5 py-8 text-[#edf0f2] md:px-10 md:py-12">
      <div className="mx-auto max-w-7xl">
        <Link href="/" className="inline-flex items-center gap-2 text-xs font-medium text-[#98a2b3] transition-colors hover:text-white"><ArrowLeft className="h-4 w-4" /> Back to Voice library</Link>
        <div className="mt-12 max-w-3xl">
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#1fd5f9]">Agent Arena / Design decision</p>
          <h1 className="mt-4 font-serif text-4xl leading-[0.95] tracking-tight md:text-6xl">Choose the visual language for observable agent competition.</h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-[#aeb8c3]">Each direction keeps the same product mechanics: bounded evidence, explicit phases, real runtime status, and judge provenance. Choose a primary system; hybridizing after selection is easy.</p>
        </div>

        <section className="mt-12 grid gap-6 lg:grid-cols-3">
          {directions.map(direction => {
            const Icon = direction.icon;
            const chosen = selected === direction.id;
            return (
              <article key={direction.id} className={`overflow-hidden border transition-all ${chosen ? "border-[#1fd5f9] bg-[#13161a] shadow-[0_0_0_1px_rgba(31,213,249,.25)]" : "border-white/15 bg-[#121417] hover:border-white/35"}`}>
                <div className="aspect-[16/10] overflow-hidden">
                  {failedImages.has(direction.id) ? <DirectionFallback direction={direction} /> : <img src={direction.preview} alt={`${direction.name} conceptual screen preview`} className="h-full w-full object-cover" onError={() => setFailedImages(current => new Set(current).add(direction.id))} />}
                </div>
                <div className="p-6">
                  <div className="flex items-start justify-between gap-4"><div><div className="flex items-center gap-2 text-[#1fd5f9]"><Icon className="h-4 w-4" /><span className="font-mono text-[10px] uppercase tracking-[0.18em]">Direction</span></div><h2 className="mt-3 font-serif text-3xl tracking-tight">{direction.name}</h2></div>{chosen ? <span className="grid h-7 w-7 place-items-center rounded-full bg-[#1fd5f9] text-[#071014]"><Check className="h-4 w-4" /></span> : null}</div>
                  <p className="mt-3 text-sm font-medium text-[#dbe4ec]">{direction.strapline}</p>
                  <p className="mt-3 text-sm leading-6 text-[#9da8b5]">{direction.purpose}</p>
                  <div className="mt-5 flex gap-2">{direction.palette.map(color => <span key={color} title={color} className="h-5 w-5 rounded-full border border-white/20" style={{ background: color }} />)}</div>
                  <p className="mt-5 border-t border-white/10 pt-4 text-xs leading-5 text-[#7f8a96]"><strong className="font-medium text-[#bcc6d1]">Best for:</strong> {direction.bestFor}</p>
                  <Button onClick={() => selectDirection(direction.id)} variant={chosen ? "secondary" : "outline"} className="mt-6 w-full rounded-none border-white/20 bg-transparent text-white hover:bg-white hover:text-black">{chosen ? "Selected locally" : "Choose this direction"}<ChevronRight className="ml-2 h-4 w-4" /></Button>
                </div>
              </article>
            );
          })}
        </section>
      </div>
    </main>
  );
}
