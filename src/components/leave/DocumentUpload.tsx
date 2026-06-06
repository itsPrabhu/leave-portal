import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, X, FileText } from "lucide-react";
import type { LeaveDocument } from "@/types";

export function DocumentUpload({ value, onChange }: { value: LeaveDocument[]; onChange: (docs: LeaveDocument[]) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  const handle = async (files: FileList | null) => {
    if (!files) return;
    setBusy(true);
    const next: LeaveDocument[] = [...value];
    for (const f of Array.from(files)) {
      if (f.size > 5 * 1024 * 1024) continue;
      const dataUrl = await new Promise<string>((res) => {
        const r = new FileReader();
        r.onload = () => res(String(r.result));
        r.readAsDataURL(f);
      });
      next.push({ id: `doc-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, name: f.name, size: f.size, type: f.type, dataUrl });
    }
    onChange(next);
    setBusy(false);
  };

  return (
    <div className="space-y-2">
      <input ref={inputRef} type="file" multiple className="hidden" onChange={(e) => handle(e.target.files)} accept="image/*,application/pdf" />
      <Button type="button" variant="outline" onClick={() => inputRef.current?.click()} disabled={busy} className="gap-2">
        <Upload className="h-4 w-4" /> {busy ? "Uploading…" : "Upload documents"}
      </Button>
      {value.length > 0 && (
        <ul className="space-y-1.5">
          {value.map((d) => (
            <li key={d.id} className="flex items-center justify-between rounded-md border bg-muted/30 px-3 py-2 text-sm">
              <span className="flex items-center gap-2 truncate"><FileText className="h-4 w-4 text-muted-foreground" /> <span className="truncate">{d.name}</span> <span className="text-xs text-muted-foreground">({Math.round(d.size / 1024)} KB)</span></span>
              <button type="button" onClick={() => onChange(value.filter((x) => x.id !== d.id))} className="text-muted-foreground hover:text-destructive"><X className="h-4 w-4" /></button>
            </li>
          ))}
        </ul>
      )}
      <p className="text-xs text-muted-foreground">Max 5 MB per file. Images and PDFs only.</p>
    </div>
  );
}
