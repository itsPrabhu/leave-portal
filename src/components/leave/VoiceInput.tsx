import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff } from "lucide-react";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n/context";

// Minimal Web Speech API types (browser-only)
interface SRResultItem { transcript: string }
interface SRResult { 0: SRResultItem; isFinal: boolean }
interface SRResults { length: number; [i: number]: SRResult }
interface SREvent { results: SRResults; resultIndex: number }

export function VoiceInput({ onTranscript }: { onTranscript: (text: string) => void }) {
  const { lang } = useI18n();
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<{ start: () => void; stop: () => void } | null>(null);

  useEffect(() => {
    const W = window as unknown as { SpeechRecognition?: new () => unknown; webkitSpeechRecognition?: new () => unknown };
    const SR = W.SpeechRecognition ?? W.webkitSpeechRecognition;
    if (!SR) return;
    const rec = new SR() as {
      lang: string; continuous: boolean; interimResults: boolean;
      onresult: (e: SREvent) => void; onend: () => void; onerror: (e: { error: string }) => void;
      start: () => void; stop: () => void;
    };
    rec.lang = lang === "ta" ? "ta-IN" : "en-IN";
    rec.continuous = false;
    rec.interimResults = false;
    rec.onresult = (e) => {
      let text = "";
      for (let i = e.resultIndex; i < e.results.length; i++) text += e.results[i][0].transcript;
      if (text) onTranscript(text.trim());
    };
    rec.onend = () => setListening(false);
    rec.onerror = (e) => { toast.error(`Voice error: ${e.error}`); setListening(false); };
    recognitionRef.current = { start: () => rec.start(), stop: () => rec.stop() };
  }, [lang, onTranscript]);

  const toggle = () => {
    if (!recognitionRef.current) { toast.error("Voice input not supported in this browser"); return; }
    if (listening) { recognitionRef.current.stop(); setListening(false); }
    else { try { recognitionRef.current.start(); setListening(true); } catch { setListening(false); } }
  };

  return (
    <Button type="button" variant={listening ? "destructive" : "outline"} size="sm" onClick={toggle} className="gap-2">
      {listening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
      {listening ? "Listening…" : "Voice input"}
    </Button>
  );
}
