export type ImportStatus = "processing" | "completed" | "failed";

export const IMPORT_STATUS_LABEL_MAP: Record<ImportStatus, string> = {
  completed: "Completo",
  failed: "Falha",
  processing: "Processando",
};

export const DEFAULT_IMPORT_STATUS_COLOR_MAP: Record<
  ImportStatus,
  { color: string; bgColor: string }
> = {
  completed: { color: "#041616", bgColor: "#BCDF84" },
  failed: { color: "#041616", bgColor: "#FECACA" },
  processing: { color: "#041616", bgColor: "#E5E7EB" },
};

export const CLAIMS_IMPORT_STATUS_COLOR_MAP: Record<
  ImportStatus,
  { color: string; bgColor: string }
> = {
  ...DEFAULT_IMPORT_STATUS_COLOR_MAP,
  processing: { color: "#041616", bgColor: "#BEE1EB" },
  failed: { color: "#041616", bgColor: "#F17A66" },
};
