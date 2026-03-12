import type { ChatAPIRequest, ChatAPIResponse } from "@/shared/types/chat";

const TIMEOUT_MS = 120000; // 2 minutes
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

/**
 * Generate a UUID v4
 */
export function generateUUID(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for older browsers
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Get or create a unique session ID for the chat (UUID format)
 */
export function getOrCreateSessionId(): string {
  try {
    const key = "triage_session_id";
    let sid = localStorage.getItem(key);
    if (!sid) {
      sid = generateUUID();
      localStorage.setItem(key, sid);
    }
    return sid;
  } catch {
    return generateUUID();
  }
}

/**
 * Convert Blob to base64 string (without data: prefix)
 */
export async function blobToBase64(blob: Blob): Promise<string> {
  const ab = await blob.arrayBuffer();
  const bytes = new Uint8Array(ab);
  let binary = "";
  const CHUNK = 0x8000; // Avoid stack overflow
  for (let i = 0; i < bytes.length; i += CHUNK) {
    binary += String.fromCharCode.apply(
      null,
      Array.from(bytes.subarray(i, i + CHUNK))
    );
  }
  return btoa(binary);
}

/**
 * Convert File to base64 string (without data: prefix)
 * Used for sending files via Socket.io
 */
export async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Remove data:...;base64, prefix if present
      const base64 = result.includes(",") ? result.split(",")[1] : result;
      resolve(base64);
    };
    reader.onerror = () => reject(new Error("Erro ao ler arquivo"));
    reader.readAsDataURL(file);
  });
}

/**
 * Validate file size and type
 */
export function validateFile(file: File): { valid: boolean; error?: string } {
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `Arquivo muito grande. Tamanho máximo: ${MAX_FILE_SIZE / 1024 / 1024}MB`,
    };
  }

  // Check file type
  const allowedTypes = [
    "application/pdf",
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
  ];

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: "Tipo de arquivo não suportado. Use PDF ou imagens (JPG, PNG, GIF, WEBP)",
    };
  }

  return { valid: true };
}

/**
 * Get audio format from MIME type
 */
export function getAudioFormat(mimeType: string): string {
  if (mimeType.includes("webm")) return "webm";
  if (mimeType.includes("ogg")) return "ogg";
  if (mimeType.includes("mp4")) return "mp4";
  if (mimeType.includes("wav")) return "wav";
  return "webm"; // default
}

/**
 * Call the generative API with text message
 */
export async function callChatAPI(message: string): Promise<string> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    // Use backend URL from environment or default to localhost:3000
    const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000";
    const res = await fetch(`${apiUrl}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message,
        model:
          process.env.NEXT_PUBLIC_AI_MODEL_ID ??
          "anthropic.claude-3-5-sonnet-20241022-v2:0",
        // ✅ usar o mesmo nome que o backend/socket espera
        session_id: getOrCreateSessionId(),
      } as ChatAPIRequest),
      signal: controller.signal,
    });

    const json: ChatAPIResponse = await res.json().catch(() => ({}));

    if (!res.ok) {
      const errText =
        json?.error ||
        json?.message ||
        `Falha ao chamar serviço de IA (HTTP ${res.status})`;
      throw new Error(errText);
    }

    const text =
      json?.data?.answer ??
      json?.answer ??
      json?.text ??
      json?.message ??
      "";

    if (!text) {
      throw new Error("Resposta vazia da IA (formato inesperado).");
    }

    return text;
  } catch (e) {
    const error = e as Error;
    if (error?.name === "AbortError") {
      throw new Error("Tempo de processamento excedido pela IA.");
    }
    throw e;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Call the generative API with audio data
 */
export async function callChatAPIWithAudio(
  blob: Blob,
  message: string
): Promise<string> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const base64 = await blobToBase64(blob);

    // Use backend URL from environment or default to localhost:3000
    const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000";
    const res = await fetch(`${apiUrl}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        message,
        model:
          process.env.NEXT_PUBLIC_AI_MODEL_ID ??
          "anthropic.claude-3-5-sonnet-20241022-v2:0",
        // ✅ mesmo campo de sessão que o backend usa
        session_id: getOrCreateSessionId(),
        audioData: base64,
        audioMimeType: blob.type || "audio/webm",
      } as ChatAPIRequest),
    });

    const json: ChatAPIResponse = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(
        json?.error ||
        json?.message ||
        `HTTP ${res.status}`
      );
    }

    const text =
      json?.data?.answer ??
      json?.answer ??
      json?.text ??
      json?.message ??
      "";

    if (!text) {
      throw new Error("Resposta vazia da IA (formato inesperado).");
    }

    return text;
  } catch (e) {
    const error = e as Error;
    if (error?.name === "AbortError") {
      throw new Error("Tempo de processamento excedido pela IA.");
    }
    throw e;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Parse triage result from AI response text
 */
export function parseTriageResult(text: string): {
  protocolo: string;
  classificacao: string;
  prioridade?: string;
  tempo_espera_estimado?: string;
  recomendacoes?: string[];
  observacoes?: string;
  status?: string;
  timestamp?: string;
} | null {
  // Try to find JSON embedded in the text
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const raw = JSON.parse(jsonMatch[0]);
      if (raw?.protocolo || raw?.classificacao) {
        return {
          protocolo: String(raw.protocolo ?? ""),
          classificacao: String(raw.classificacao ?? "").toUpperCase(),
          prioridade: raw.prioridade,
          tempo_espera_estimado: raw.tempo_espera_estimado,
          recomendacoes: Array.isArray(raw.recomendacoes)
            ? raw.recomendacoes
            : undefined,
          observacoes: raw.observacoes,
          status: raw.status,
          timestamp: raw.timestamp ?? new Date().toISOString(),
        };
      }
    }
  } catch {
    // Continue to text pattern matching
  }

  // Fallback: text pattern matching
  if (!/triagem conclu[íi]da/i.test(text)) return null;

  const get = (re: RegExp) => re.exec(text)?.[1]?.trim();

  const protocolo = get(/Protocolo:\s*([A-Z0-9\-]+)/i) ?? "";
  const classificacao = (
    get(/Classifica[cç][aã]o:\s*([A-ZÇÃÉÍÓÚ\-]+)/i) ?? ""
  ).toUpperCase();
  const status = get(/Status:\s*([A-Z_]+)/i);
  const tempo = get(/tempo[_ ]?espera[_ ]?estimado[:\s]*([^\.\n]+)/i);

  return {
    protocolo,
    classificacao,
    status,
    tempo_espera_estimado: tempo,
    timestamp: new Date().toISOString(),
  };
}
