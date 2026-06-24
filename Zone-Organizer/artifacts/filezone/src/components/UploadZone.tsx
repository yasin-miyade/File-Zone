import { useState, useCallback, useRef } from "react";
import { Upload, X, File, FileText, Image } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface UploadZoneProps {
  accept?: string;
  multiple?: boolean;
  onFiles: (files: File[]) => void;
  files: File[];
  onRemove: (index: number) => void;
  label?: string;
  sublabel?: string;
}

function FileIcon({ file }: { file: File }) {
  if (file.type.startsWith("image/")) return <Image className="h-5 w-5 text-blue-500" />;
  if (file.type === "application/pdf") return <FileText className="h-5 w-5 text-red-500" />;
  return <File className="h-5 w-5 text-muted-foreground" />;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function UploadZone({ accept, multiple = false, onFiles, files, onRemove, label, sublabel }: UploadZoneProps) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const dropped = Array.from(e.dataTransfer.files);
    onFiles(multiple ? dropped : [dropped[0]]);
  }, [multiple, onFiles]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files ?? []);
    onFiles(multiple ? selected : [selected[0]]);
    if (inputRef.current) inputRef.current.value = "";
  }, [multiple, onFiles]);

  return (
    <div className="space-y-4">
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        data-testid="upload-zone"
        className={cn(
          "relative border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-200",
          dragging ? "border-primary bg-primary/5 scale-[1.01]" : "border-border hover:border-primary/50 hover:bg-accent/50"
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleChange}
          className="hidden"
        />
        <div className="flex flex-col items-center gap-3">
          <div className={cn(
            "p-4 rounded-full transition-colors",
            dragging ? "bg-primary/10" : "bg-muted"
          )}>
            <Upload className={cn("h-7 w-7", dragging ? "text-primary" : "text-muted-foreground")} />
          </div>
          <div>
            <p className="font-semibold text-foreground">
              {label ?? "Drop your file here, or click to browse"}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {sublabel ?? (accept ? `Accepts: ${accept}` : "All file types supported")}
            </p>
          </div>
        </div>
      </div>

      {files.length > 0 && (
        <ul className="space-y-2">
          {files.map((file, i) => (
            <li key={i} className="flex items-center gap-3 p-3 rounded-lg bg-card border" data-testid={`file-item-${i}`}>
              <FileIcon file={file} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{file.name}</p>
                <p className="text-xs text-muted-foreground">{formatBytes(file.size)}</p>
              </div>
              <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={(e) => { e.stopPropagation(); onRemove(i); }}>
                <X className="h-3.5 w-3.5" />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
