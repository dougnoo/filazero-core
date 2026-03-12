import type { AudioRecording } from "@/shared/types/chat";

/**
 * Pick the best audio MIME type supported by the browser
 */
export function pickAudioMimeType(): string {
  const candidates = [
    "audio/webm;codecs=opus", // Chrome/Edge
    "audio/ogg;codecs=opus", // Firefox
    "audio/mp4", // Safari
  ];

  for (const candidate of candidates) {
    if (
      typeof MediaRecorder !== "undefined" &&
      MediaRecorder.isTypeSupported?.(candidate)
    ) {
      return candidate;
    }
  }

  return ""; // Let the browser choose
}

/**
 * Start recording audio from the user's microphone
 */
export async function startAudioRecording(
  onDataAvailable: (chunks: Blob[]) => void
): Promise<MediaRecorder> {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mimeType = pickAudioMimeType();
    const mediaRecorder = new MediaRecorder(
      stream,
      mimeType ? { mimeType } : undefined
    );

    const audioChunks: Blob[] = [];

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunks.push(event.data);
      }
    };

    mediaRecorder.onstop = () => {
      onDataAvailable(audioChunks);
      stream.getTracks().forEach((track) => track.stop());
    };

    mediaRecorder.start(100); // timeslice in ms
    return mediaRecorder;
  } catch (error) {
    throw new Error(
      "Não foi possível acessar o microfone. Verifique as permissões do navegador."
    );
  }
}

/**
 * Create an AudioRecording object from audio chunks
 */
export function createAudioRecording(
  chunks: Blob[],
  mimeType: string,
  duration: number
): AudioRecording {
  const finalType = mimeType || "audio/webm";
  const audioBlob = new Blob(chunks, { type: finalType });
  const audioUrl = URL.createObjectURL(audioBlob);

  return {
    blob: audioBlob,
    url: audioUrl,
    duration,
  };
}

