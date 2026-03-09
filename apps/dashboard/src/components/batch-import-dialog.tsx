"use client";

import { useCallback, useState } from "react";
import { Upload, FileUp, AlertCircle, CheckCircle2 } from "lucide-react";
import { API_URL } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface RowError {
  row: number;
  field: string;
  message: string;
}

interface ImportResult {
  created: number;
  errors: RowError[];
}

type ImportState = "idle" | "preview" | "uploading" | "success" | "error";

function parseCsvPreview(content: string): string[][] {
  const lines = content.split(/\r?\n/).filter((l) => l.trim() !== "");
  return lines.slice(0, 6).map((line) => {
    const fields: string[] = [];
    let current = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i]!;
      if (inQuotes) {
        if (ch === '"') {
          if (i + 1 < line.length && line[i + 1] === '"') {
            current += '"';
            i++;
          } else {
            inQuotes = false;
          }
        } else {
          current += ch;
        }
      } else if (ch === '"') {
        inQuotes = true;
      } else if (ch === ",") {
        fields.push(current.trim());
        current = "";
      } else {
        current += ch;
      }
    }
    fields.push(current.trim());
    return fields;
  });
}

interface BatchImportDialogProps {
  onImportComplete?: () => void;
}

export function BatchImportDialog({
  onImportComplete,
}: BatchImportDialogProps) {
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<ImportState>("idle");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string[][]>([]);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function reset() {
    setState("idle");
    setFile(null);
    setPreview([]);
    setResult(null);
    setErrorMessage(null);
  }

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) reset();
  }

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selected = e.target.files?.[0];
      if (!selected) return;

      if (!selected.name.endsWith(".csv")) {
        setErrorMessage("Please select a .csv file");
        setState("error");
        return;
      }

      setFile(selected);
      setErrorMessage(null);

      const reader = new FileReader();
      reader.onload = () => {
        const content = reader.result as string;
        if (!content.trim()) {
          setErrorMessage("File is empty");
          setState("error");
          return;
        }
        const rows = parseCsvPreview(content);
        setPreview(rows);
        setState("preview");
      };
      reader.readAsText(selected);

      // Reset the input so re-selecting the same file triggers onChange
      e.target.value = "";
    },
    [],
  );

  const handleImport = useCallback(async () => {
    if (!file) return;

    setState("uploading");
    setErrorMessage(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`${API_URL}/products/batch-import?partial=true`, {
        method: "POST",
        body: formData,
        credentials: "include",
        headers: {
          "X-Galileo-Client": "dashboard",
        },
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error?.message ?? "Import failed");
      }

      const data = await res.json();
      setResult(data.data);
      setState("success");
      onImportComplete?.();
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Import failed");
      setState("error");
    }
  }, [file, onImportComplete]);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <FileUp className="mr-1 size-4" />
          Import CSV
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Import Products from CSV</DialogTitle>
          <DialogDescription>
            Upload a CSV file with columns: name, gtin, serialNumber, category,
            description, materials
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          {/* File picker */}
          {(state === "idle" || state === "error") && !result && (
            <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed p-8">
              <Upload className="size-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Select a CSV file to import products
              </p>
              <Button variant="outline" size="sm" asChild>
                <label className="cursor-pointer">
                  Choose file
                  <input
                    type="file"
                    accept=".csv"
                    className="hidden"
                    onChange={handleFileSelect}
                  />
                </label>
              </Button>
              {errorMessage && (
                <div className="flex items-center gap-2 text-sm text-destructive">
                  <AlertCircle className="size-4" />
                  {errorMessage}
                </div>
              )}
            </div>
          )}

          {/* Preview */}
          {state === "preview" && preview.length > 0 && (
            <>
              <p className="text-sm text-muted-foreground">
                Preview of <strong>{file?.name}</strong> (first{" "}
                {Math.min(5, preview.length - 1)} data rows):
              </p>
              <div className="max-h-64 overflow-auto rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {preview[0]?.map((h, i) => (
                        <TableHead key={i}>{h}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {preview.slice(1).map((row, i) => (
                      <TableRow key={i}>
                        {row.map((cell, j) => (
                          <TableCell key={j} className="text-xs">
                            {cell}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={reset}>
                  Cancel
                </Button>
                <Button onClick={handleImport}>Import</Button>
              </div>
            </>
          )}

          {/* Uploading */}
          {state === "uploading" && (
            <div className="flex flex-col items-center gap-3 py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              <p className="text-sm text-muted-foreground">
                Importing products...
              </p>
            </div>
          )}

          {/* Success */}
          {state === "success" && result && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="size-5 text-green-500" />
                <span>
                  <strong>{result.created}</strong> product
                  {result.created !== 1 ? "s" : ""} created successfully
                </span>
              </div>

              {result.errors.length > 0 && (
                <>
                  <p className="text-sm text-destructive">
                    {result.errors.length} error
                    {result.errors.length !== 1 ? "s" : ""}:
                  </p>
                  <div className="max-h-48 overflow-auto rounded-lg border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Row</TableHead>
                          <TableHead>Field</TableHead>
                          <TableHead>Error</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {result.errors.map((err, i) => (
                          <TableRow key={i}>
                            <TableCell>{err.row}</TableCell>
                            <TableCell>{err.field}</TableCell>
                            <TableCell className="text-xs text-destructive">
                              {err.message}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </>
              )}

              <div className="flex justify-end">
                <Button onClick={() => handleOpenChange(false)}>Done</Button>
              </div>
            </div>
          )}

          {/* Error state with result */}
          {state === "error" && errorMessage && !file && (
            <div className="flex items-center gap-2 text-sm text-destructive">
              <AlertCircle className="size-4" />
              {errorMessage}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
