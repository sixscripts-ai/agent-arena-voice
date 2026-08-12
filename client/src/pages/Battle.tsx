import { ArrowLeft, CircleDotDashed, Mic2, ShieldCheck } from "lucide-react";
import { Link } from "wouter";
import { BATTLE_TERMINAL_COUNT, BATTLE_TERMINAL_HEIGHT, battleParticipants, type BattleParticipant } from "./BattleLayout";

function BattleTerminal({ participant }: { participant: BattleParticipant }) {
  const isLive = participant.status === "Executing";

  return (
    <article className={`flex w-full max-w-[34rem] flex-col overflow-hidden border border-white/15 bg-[#0c1115] shadow-[0_18px_50px_rgba(0,0,0,.22)] ${BATTLE_TERMINAL_HEIGHT}`} aria-label={`${participant.side} terminal for ${participant.model}`}>
      <header className="grid h-10 shrink-0 grid-cols-[auto_1fr_auto] items-center gap-3 border-b border-white/10 bg-white/[0.025] px-4 font-mono text-[10px] uppercase tracking-[0.12em] text-[#8093a0]">
        <span className="flex gap-1.5" aria-hidden="true"><i className="h-2 w-2 rounded-full bg-[#5e716d]" /><i className="h-2 w-2 rounded-full bg-[#897553]" /><i className="h-2 w-2 rounded-full bg-[#52616b]" /></span>
        <span>{participant.side.toLowerCase()}.session</span>
        <span className="flex items-center gap-1.5 font-semibold" style={{ color: participant.accent }}><i className={`h-1.5 w-1.5 rounded-full ${isLive ? "animate-pulse" : ""}`} style={{ backgroundColor: participant.accent }} />{participant.status}</span>
      </header>

      <div className="flex min-h-0 flex-1 flex-col p-5">
        <div className="flex items-center gap-3">
          <span className="h-2.5 w-2.5 rounded-full shadow-[0_0_18px_currentColor]" style={{ backgroundColor: participant.accent, color: participant.accent }} />
          <div><p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#81919c]">{participant.side}</p><h2 className="mt-1 font-serif text-3xl tracking-tight text-[#f1f5f6]">{participant.model}</h2></div>
        </div>

        <div className="mt-10 min-h-0 flex-1 overflow-y-auto font-mono text-xs leading-7 text-[#dce6e9]">
          <p><span style={{ color: participant.accent }}>arena@{participant.side.toLowerCase()}</span>:~$ {participant.command}</p>
          <p className="text-[#72848f]">&gt; scope: battle #AA-291 / round 04</p>
          <p className="text-[#72848f]">&gt; evidence sources reconciled: 02</p>
          <p className="mt-4">artifact://{participant.artifact}</p>
          <p className="text-[#72848f]">&gt; staging result for judge review</p>
          <p className="mt-5"><span style={{ color: participant.accent }}>▍</span></p>
        </div>

        <footer className="flex shrink-0 items-center justify-between border-t border-white/10 pt-4 font-mono text-[10px] uppercase tracking-[0.12em] text-[#71818b]"><span>round 04 / 08</span><span>01:42 elapsed</span></footer>
      </div>
    </article>
  );
}

export default function Battle() {
  return (
    <div className="min-h-screen bg-[#111619] px-5 py-7 text-[#f2f6f7] md:px-8 md:py-9">
      <div className="mx-auto max-w-[75rem]">
          <header className="border-b border-white/10 pb-7">
            <Link href="/ui-directions" className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.15em] text-[#93a5b0] transition-colors hover:text-white"><ArrowLeft className="h-3.5 w-3.5" /> Compare directions</Link>
            <div className="mt-6 flex flex-wrap items-end justify-between gap-6">
              <div><p className="font-mono text-[11px] uppercase tracking-[0.19em] text-[#44d7b6]">Agent Arena / live evidence duel</p><h1 className="mt-3 max-w-2xl font-serif text-4xl leading-[.95] tracking-tight md:text-5xl">Prompt-injection defense</h1></div>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-3 font-mono text-[10px] uppercase tracking-[0.13em] text-[#9bacb5]"><span className="flex items-center gap-2"><CircleDotDashed className="h-4 w-4 text-[#44d7b6]" />round 04 / 08</span><span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-[#f5a85a]" />judge pending</span><span className="flex items-center gap-2"><Mic2 className="h-4 w-4 text-[#9fafd0]" />voice available</span></div>
            </div>
          </header>

          <main className="py-7 md:py-9">
            <div className="grid justify-items-center gap-4" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 31rem), 1fr))" }}>
              {battleParticipants.slice(0, BATTLE_TERMINAL_COUNT).map(participant => <BattleTerminal key={participant.side} participant={participant} />)}
            </div>
          </main>

          <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4 font-mono text-[10px] uppercase tracking-[0.13em] text-[#7b8d98]"><span>two bounded agent sessions</span><span>evidence flow locked</span></footer>
      </div>
    </div>
  );
}
