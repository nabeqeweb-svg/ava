import { useEffect, useRef, useState } from "react";
import { Pause, Play, Square, Trash2 } from "lucide-react";
import {
  MAX_CHARS,
  SAMPLES,
  VOICES,
  WELCOME,
  faDigits,
  normalizeFa,
  type VoiceId,
} from "@/lib/persian";

type Prefs = { voice: VoiceId; speed: number };

const DEFAULT_PREFS: Prefs = { voice: "fa-IR-DilaraNeural", speed: 1 };

export function AvaApp() {
  const [text, setText] = useState(WELCOME);
  const [prefs, setPrefs] = useState<Prefs>(DEFAULT_PREFS);
  const [status, setStatus] = useState<"idle" | "loading" | "playing" | "paused">("idle");
  const [error, setError] = useState("");
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    try {
      const d = localStorage.getItem("ava.draft");
      if (d) setText(d);
      const p = localStorage.getItem("ava.prefs");
      if (p) setPrefs({ ...DEFAULT_PREFS, ...JSON.parse(p) });
    } catch {}
  }, []);

  useEffect(() => {
    localStorage.setItem("ava.draft", text);
  }, [text]);

  useEffect(() => {
    localStorage.setItem("ava.prefs", JSON.stringify(prefs));
  }, [prefs]);

  const overLimit = text.length > MAX_CHARS;

  async function play() {
    if (overLimit || !text.trim()) return;
    setError("");
    setStatus("loading");
    try {
      const res = await fetch("/api/speak", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          text: normalizeFa(text),
          voice: prefs.voice,
        }),
      });
      if (!res.ok) throw new Error("خطا در دریافت صدا");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      if (audioRef.current) {
        audioRef.current.pause();
        URL.revokeObjectURL(audioRef.current.src);
      }
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onended = () => setStatus("idle");
      audio.onpause = () => { if (!audio.ended) setStatus("paused"); };
      audio.onplay = () => setStatus("playing");
      await audio.play();
    } catch (e) {
      setError(e instanceof Error ? e.message : "خطا");
      setStatus("idle");
    }
  }

  function stop() {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setStatus("idle");
  }

  function togglePause() {
    const a = audioRef.current;
    if (!a) return;
    if (a.paused) a.play();
    else a.pause();
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-3xl flex-col gap-6 p-4 sm:p-8" dir="rtl">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">آوا</h1>
        <p className="text-sm text-zinc-400">متن‌به‌گفتار فارسی</p>
      </header>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={8}
        className="w-full resize-y rounded-xl border border-zinc-800 bg-zinc-950 p-4 text-base leading-relaxed outline-none focus:border-zinc-600"
        placeholder="متن فارسی خود را بنویسید..."
      />

      <div className="flex flex-wrap items-center gap-3 text-sm text-zinc-400">
        <span className={overLimit ? "text-red-400" : ""}>
          {faDigits(String(text.length))} / {faDigits(String(MAX_CHARS))}
        </span>
        <select
          value={prefs.voice}
          onChange={(e) => setPrefs((p) => ({ ...p, voice: e.target.value as VoiceId }))}
          className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5"
        >
          {VOICES.map((v) => (
            <option key={v.id} value={v.id}>
              {v.name} — {v.hint}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-wrap gap-2">
        {(status === "idle" || status === "paused") && (
          <button
            onClick={status === "paused" ? togglePause : play}
            disabled={overLimit || !text.trim()}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 font-medium text-white hover:bg-emerald-500 disabled:opacity-40"
          >
            <Play className="h-4 w-4" /> پخش
          </button>
        )}
        {status === "playing" && (
          <button onClick={togglePause} className="inline-flex items-center gap-2 rounded-xl bg-amber-600 px-5 py-2.5 font-medium text-white">
            <Pause className="h-4 w-4" /> مکث
          </button>
        )}
        {status === "loading" && (
          <button disabled className="inline-flex items-center gap-2 rounded-xl bg-zinc-700 px-5 py-2.5">در حال آماده‌سازی...</button>
        )}
        <button onClick={stop} className="inline-flex items-center gap-2 rounded-xl border border-zinc-700 px-4 py-2.5 hover:bg-zinc-900">
          <Square className="h-4 w-4" /> توقف
        </button>
        <button onClick={() => setText("")} className="inline-flex items-center gap-2 rounded-xl border border-zinc-700 px-4 py-2.5 hover:bg-zinc-900">
          <Trash2 className="h-4 w-4" /> پاک کردن
        </button>
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <section className="space-y-2">
        <h2 className="text-sm font-medium text-zinc-400">نمونه‌ها</h2>
        <div className="flex flex-wrap gap-2">
          {SAMPLES.map((s) => (
            <button key={s.title} onClick={() => setText(s.text)} className="rounded-lg border border-zinc-800 px-3 py-1.5 text-sm hover:bg-zinc-900">
              {s.title}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
