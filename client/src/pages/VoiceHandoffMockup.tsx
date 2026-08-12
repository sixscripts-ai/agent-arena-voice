import { Button } from "@/components/ui/button";
import { ArrowRight, Bot, Check, CircleDotDashed, Database, FileLock2, KeyRound, Mic, ShieldCheck, Sparkles, Volume2, X } from "lucide-react";
import { useState } from "react";

type HandoffState = "ready" | "authorizing" | "dispatched" | "connected";

const stages = [
  {
    key: "authorizing",
    title: "1. Arena verifies ownership",
    detail: "Appwrite confirms Ashton owns battle #AA-291 before any token is issued.",
    icon: ShieldCheck,
  },
  {
    key: "dispatched",
    title: "2. Voice server dispatches Arena Guide",
    detail: "A private context token is attached to Builder job metadata. It never reaches the browser.",
    icon: Bot,
  },
  {
    key: "connected",
    title: "3. Browser joins the room",
    detail: "The browser receives only a five-minute microphone participant token and connects to LiveKit.",
    icon: Mic,
  },
] as const;

function stateRank(state: HandoffState) {
  return ["ready", "authorizing", "dispatched", "connected"].indexOf(state);
}

export default function VoiceHandoffMockup() {
  const [state, setState] = useState<HandoffState>("ready");
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const next = () => {
    if (state === "ready") setState("authorizing");
    else if (state === "authorizing") setState("dispatched");
    else if (state === "dispatched") setState("connected");
    else setState("ready");
  };

  return (
    <main className="min-h-screen bg-[#131313] px-5 py-7 text-[#f5efe4] md:px-10 md:py-10">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-wrap items-start justify-between gap-5 border-b border-white/10 pb-7">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#ed6045]">Testable artifact · not a live room</p>
            <h1 className="mt-3 max-w-2xl font-serif text-4xl leading-none tracking-tight md:text-6xl">Voice session handoff</h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-[#bdb4a8] md:text-base">A visual simulation of the secure path from an Agent Arena battle into an authenticated LiveKit conversation.</p>
          </div>
          <div className="border border-[#ed6045]/40 bg-[#ed6045]/10 px-4 py-3 font-mono text-[10px] uppercase tracking-[0.16em] text-[#f7c4b9]">Mock mode · zero LiveKit runtime</div>
        </header>

        <section className="mt-8 grid gap-px overflow-hidden border border-white/10 bg-white/10 lg:grid-cols-[1.1fr_.9fr]">
          <div className="bg-[#1b1b1b] p-6 md:p-8">
            <div className="flex items-center justify-between border-b border-white/10 pb-5">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#9d9489]">Current battle context</p>
                <h2 className="mt-2 font-serif text-3xl">Prompt-Injection Defense</h2>
              </div>
              <CircleDotDashed className={state === "connected" ? "h-6 w-6 animate-spin text-[#ed6045]" : "h-6 w-6 text-[#827a70]"} />
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {[
                ["Battle", "#AA-291"],
                ["State", state === "connected" ? "Voice live" : "Ready"],
                ["Scope", "Current battle"],
              ].map(([label, value]) => (
                <div key={label} className="border border-white/10 bg-[#161616] p-4">
                  <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#887f73]">{label}</p>
                  <p className="mt-2 text-sm font-medium text-[#f5efe4]">{value}</p>
                </div>
              ))}
            </div>

            <div className="mt-7 space-y-3">
              {stages.map((stage, index) => {
                const complete = stateRank(state) > index + 1;
                const active = stateRank(state) === index + 1;
                const Icon = stage.icon;
                return (
                  <article key={stage.key} className={`flex gap-4 border p-4 transition-colors ${active ? "border-[#ed6045] bg-[#ed6045]/10" : complete ? "border-[#6eab82]/40 bg-[#6eab82]/10" : "border-white/10 bg-[#161616]"}`}>
                    <div className={`grid h-9 w-9 shrink-0 place-items-center rounded-full border ${active ? "border-[#ed6045] text-[#ed6045]" : complete ? "border-[#6eab82] text-[#8ed6a5]" : "border-white/15 text-[#827a70]"}`}>
                      {complete ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold">{stage.title}</h3>
                      <p className="mt-1 text-sm leading-5 text-[#b9b0a4]">{stage.detail}</p>
                    </div>
                  </article>
                );
              })}
            </div>

            <div className="mt-7 flex flex-wrap gap-3">
              <Button onClick={next} className="rounded-none bg-[#ed6045] px-5 hover:bg-[#fa704f]">
                {state === "ready" ? "Test handoff" : state === "connected" ? "Reset simulation" : "Advance handoff"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              {state === "connected" ? <Button variant="outline" onClick={() => setConfirmationOpen(true)} className="rounded-none border-white/20 bg-transparent hover:bg-white hover:text-black"><Sparkles className="mr-2 h-4 w-4" /> Test save confirmation</Button> : null}
            </div>
          </div>

          <aside className="bg-[#eee5d3] p-6 text-[#1d1b18] md:p-8">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#a84731]">What goes where</p>
            <div className="mt-5 space-y-4">
              <div className="border-b border-[#1d1b18]/15 pb-4">
                <div className="flex items-center gap-2 text-sm font-semibold"><Database className="h-4 w-4 text-[#d4482d]" /> Appwrite / Agent Arena</div>
                <p className="mt-2 text-sm leading-6 text-[#625b52]">Canonical user, battle, round, score, session-audit, note, and report metadata. This is the authority that checks ownership.</p>
              </div>
              <div className="border-b border-[#1d1b18]/15 pb-4">
                <div className="flex items-center gap-2 text-sm font-semibold"><FileLock2 className="h-4 w-4 text-[#d4482d]" /> Appwrite Storage</div>
                <p className="mt-2 text-sm leading-6 text-[#625b52]">Voice-note and report file bytes, stored with battle and user ownership metadata—not in the browser or the LLM prompt.</p>
              </div>
              <div className="border-b border-[#1d1b18]/15 pb-4">
                <div className="flex items-center gap-2 text-sm font-semibold"><KeyRound className="h-4 w-4 text-[#d4482d]" /> LiveKit Builder metadata</div>
                <p className="mt-2 text-sm leading-6 text-[#625b52]">Private, short-lived context token for the agent only. The browser never sees this token.</p>
              </div>
              <div>
                <div className="flex items-center gap-2 text-sm font-semibold"><Volume2 className="h-4 w-4 text-[#d4482d]" /> Browser participant token</div>
                <p className="mt-2 text-sm leading-6 text-[#625b52]">A separate five-minute microphone token. It permits joining the assigned room, not reading Appwrite or dispatching tools.</p>
              </div>
            </div>
          </aside>
        </section>

        {confirmationOpen ? (
          <section className="mt-6 border border-[#ed6045]/60 bg-[#2a1b18] p-5 md:flex md:items-center md:justify-between md:gap-6">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#f3a18e]">Confirmation gate</p>
              <h2 className="mt-2 font-serif text-2xl">Save battle #AA-291?</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#dfc7c0]">The tool has prepared the action but has not written anything. A real session creates a two-minute confirmation token bound to this exact action and payload.</p>
            </div>
            <div className="mt-4 flex gap-3 md:mt-0">
              <Button variant="outline" onClick={() => setConfirmationOpen(false)} className="rounded-none border-white/25 bg-transparent text-white hover:bg-white hover:text-black"><X className="mr-2 h-4 w-4" /> Cancel</Button>
              <Button onClick={() => { setConfirmed(true); setConfirmationOpen(false); }} className="rounded-none bg-[#ed6045] hover:bg-[#fa704f]"><Check className="mr-2 h-4 w-4" /> Confirm save</Button>
            </div>
          </section>
        ) : null}

        {confirmed ? <p className="mt-5 border border-[#74b88a]/40 bg-[#23452e] px-4 py-3 text-sm text-[#d5f5de]">Mock result: the action would now pass the confirmation token to the server, recheck Appwrite ownership, save the battle, and record an audit event.</p> : null}
      </div>
    </main>
  );
}
