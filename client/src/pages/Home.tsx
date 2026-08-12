import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { AudioLines, FileAudio, FileText, Loader2, ShieldCheck, Trash2, Upload, Waves } from "lucide-react";
import { ChangeEvent, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

const MAX_FILE_BYTES = 8 * 1024 * 1024;
const acceptedTypes = ["text/plain", "text/markdown", "application/json", "application/pdf", "audio/mpeg", "audio/ogg", "audio/wav", "audio/webm", "audio/x-wav"];

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function fileIcon(mimeType: string) {
  return mimeType.startsWith("audio/") ? FileAudio : FileText;
}

async function toBase64(file: File) {
  const bytes = new Uint8Array(await file.arrayBuffer());
  let binary = "";
  const chunkSize = 0x8000;
  for (let start = 0; start < bytes.length; start += chunkSize) {
    binary += String.fromCharCode.apply(null, Array.from(bytes.subarray(start, start + chunkSize)));
  }
  return btoa(binary);
}

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [category, setCategory] = useState<"reference" | "voice-note" | "transcript">("reference");
  const inputRef = useRef<HTMLInputElement>(null);
  const utils = trpc.useUtils();
  const filesQuery = trpc.voiceFiles.list.useQuery(undefined, { enabled: isAuthenticated });
  const uploadMutation = trpc.voiceFiles.upload.useMutation({
    onSuccess: async () => {
      await utils.voiceFiles.list.invalidate();
      toast.success("File added to your private library.");
    },
    onError: error => toast.error(error.message),
  });
  const removeMutation = trpc.voiceFiles.remove.useMutation({
    onSuccess: async () => {
      await utils.voiceFiles.list.invalidate();
      toast.success("File reference removed from your library.");
    },
    onError: error => toast.error(error.message),
  });

  const counts = useMemo(() => {
    const files = filesQuery.data ?? [];
    return {
      files: files.length,
      audio: files.filter(file => file.mimeType.startsWith("audio/")).length,
      references: files.filter(file => file.category === "reference").length,
    };
  }, [filesQuery.data]);

  async function onFileSelected(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!acceptedTypes.includes(file.type)) {
      toast.error("Choose a supported note, PDF, JSON, or audio file.");
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      toast.error("Files must be 8 MB or smaller.");
      return;
    }
    try {
      uploadMutation.mutate({
        fileName: file.name,
        mimeType: file.type,
        contentBase64: await toBase64(file),
        category,
      });
    } catch {
      toast.error("The selected file could not be prepared for upload.");
    }
  }

  return (
    <DashboardLayout>
      <div className="min-h-[calc(100vh-2rem)] overflow-hidden bg-[#151515] text-[#f4eee3]">
        <input ref={inputRef} type="file" className="sr-only" onChange={onFileSelected} accept={acceptedTypes.join(",")} />
        <section className="relative isolate overflow-hidden border-b border-white/10 px-6 py-10 md:px-10 md:py-14">
          <img src="/manus-storage/agent-arena-voice-hero_7b69e257.png" alt="" className="absolute inset-0 -z-20 h-full w-full object-cover opacity-45" />
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#151515] via-[#151515]/90 to-[#151515]/50" />
          <div className="max-w-5xl">
            <div className="mb-6 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.25em] text-[#ec6145]">
              <span className="h-2 w-2 animate-pulse rounded-full bg-[#ec6145]" /> Private analysis channel
            </div>
            <h1 className="max-w-3xl font-serif text-4xl leading-[0.98] tracking-tight text-[#f4eee3] md:text-6xl">Talk through the evidence.</h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-[#c7beb0] md:text-lg">Store the approved notes, transcripts, and voice references that support your Agent Arena conversations. Files remain in your own authenticated library and are not automatically shared with a voice agent.</p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button onClick={() => inputRef.current?.click()} disabled={!isAuthenticated || uploadMutation.isPending} className="h-11 rounded-none bg-[#e94b2e] px-5 text-sm font-semibold text-white hover:bg-[#f56346]">
                {uploadMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                Add a private file
              </Button>
              <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-[#a79d90]">Up to 8 MB · Audio, PDF, notes, JSON</span>
            </div>
          </div>
        </section>

        <section className="grid gap-px bg-white/10 lg:grid-cols-[0.78fr_1.22fr]">
          <div className="bg-[#1b1b1b] px-6 py-8 md:px-10">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#a79d90]">Signal inventory</p>
              <Waves className="h-5 w-5 text-[#e94b2e]" />
            </div>
            <div className="grid grid-cols-3 gap-3 py-7">
              {[
                [counts.files, "files"],
                [counts.audio, "audio"],
                [counts.references, "references"],
              ].map(([value, label]) => (
                <div key={String(label)}>
                  <p className="font-serif text-3xl text-[#f4eee3]">{value}</p>
                  <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-[#8f877c]">{label}</p>
                </div>
              ))}
            </div>
            <div className="border-y border-white/10 py-5">
              <label className="mb-3 block font-mono text-[10px] uppercase tracking-[0.16em] text-[#a79d90]">File role</label>
              <select value={category} onChange={event => setCategory(event.target.value as typeof category)} className="w-full rounded-none border border-white/15 bg-transparent px-3 py-3 text-sm text-[#f4eee3] outline-none focus:border-[#e94b2e]">
                <option className="bg-[#1b1b1b]" value="reference">Reference evidence</option>
                <option className="bg-[#1b1b1b]" value="voice-note">Voice note</option>
                <option className="bg-[#1b1b1b]" value="transcript">Transcript</option>
              </select>
            </div>
            <div className="mt-6 flex gap-3 text-sm leading-6 text-[#b9b0a4]">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#e94b2e]" />
              <p>Files are uploaded only when you choose them. The voice agent receives nothing from this library unless a future, explicit sharing flow is built.</p>
            </div>
          </div>

          <div className="bg-[#efe7d6] px-6 py-8 text-[#1b1b1b] md:px-10">
            <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[#1b1b1b]/15 pb-4">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#9a3e29]">Owned files</p>
                <h2 className="mt-2 font-serif text-3xl tracking-tight">Your evidence library</h2>
              </div>
              <p className="max-w-xs text-sm leading-5 text-[#625b52]">Keep sensitive information out of uploads. Removing an item removes it from this library and its future use.</p>
            </div>

            <div className="mt-3 divide-y divide-[#1b1b1b]/10">
              {filesQuery.isLoading ? (
                <div className="flex items-center gap-3 py-10 text-sm text-[#625b52]"><Loader2 className="h-4 w-4 animate-spin" /> Loading your library…</div>
              ) : filesQuery.data?.length ? filesQuery.data.map(file => {
                const Icon = fileIcon(file.mimeType);
                return (
                  <article key={file.id} className="group flex items-center gap-4 py-5">
                    <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-[#1b1b1b]/15 bg-[#f7f1e7]"><Icon className="h-5 w-5 text-[#e94b2e]" /></div>
                    <div className="min-w-0 flex-1">
                      <a href={file.storageUrl} target="_blank" rel="noreferrer" className="block truncate font-medium hover:text-[#c63d25] hover:underline">{file.originalName}</a>
                      <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.12em] text-[#786f64]">{file.category.replace("-", " ")} · {formatBytes(file.sizeBytes)} · {new Date(file.createdAt).toLocaleDateString()}</p>
                    </div>
                    <Button variant="ghost" size="icon" aria-label={`Remove ${file.originalName}`} disabled={removeMutation.isPending} onClick={() => removeMutation.mutate({ fileId: file.id })} className="shrink-0 rounded-full text-[#625b52] hover:bg-[#e94b2e] hover:text-white"><Trash2 className="h-4 w-4" /></Button>
                  </article>
                );
              }) : (
                <div className="py-16">
                  <AudioLines className="h-8 w-8 text-[#e94b2e]" />
                  <h3 className="mt-5 font-serif text-2xl">No evidence stored yet.</h3>
                  <p className="mt-2 max-w-sm text-sm leading-6 text-[#625b52]">Add a transcript, a short audio reference, or a document you want available to your private analysis workflow.</p>
                  <Button variant="outline" onClick={() => inputRef.current?.click()} disabled={!isAuthenticated || uploadMutation.isPending} className="mt-6 rounded-none border-[#1b1b1b]/25 bg-transparent hover:bg-[#1b1b1b] hover:text-[#f4eee3]"><Upload className="mr-2 h-4 w-4" /> Add first file</Button>
                </div>
              )}
            </div>
            {filesQuery.isError ? <p className="mt-6 text-sm text-[#b42318]">Your library could not be loaded. Refresh the page and try again.</p> : null}
          </div>
        </section>
        <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 px-6 py-4 font-mono text-[10px] uppercase tracking-[0.15em] text-[#847c71] md:px-10">
          <span>Signed in as {user?.name || "private user"}</span>
          <span>Storage is managed securely; URLs are not published in the interface.</span>
        </footer>
      </div>
    </DashboardLayout>
  );
}
