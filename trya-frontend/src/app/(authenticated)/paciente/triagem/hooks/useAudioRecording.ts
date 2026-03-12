import { useState, useCallback, useRef, useEffect } from "react";
import type { AudioRecording } from "@/shared/types/chat";
import {
  startAudioRecording,
  createAudioRecording,
} from "@/shared/services/audioService";

/**
 * Return type for useAudioRecording hook
 */
export interface UseAudioRecordingReturn {
  isRecording: boolean;
  recordingTime: number;
  audioRecording: AudioRecording | null;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  deleteAudioRecording: () => void;
}

/**
 * Hook that manages audio recording state and operations.
 * Handles MediaRecorder lifecycle, recording time tracking, and cleanup.
 *
 * @returns Audio recording state and control functions
 */
export function useAudioRecording(): UseAudioRecordingReturn {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioRecording, setAudioRecording] = useState<AudioRecording | null>(
    null
  );

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Starts audio recording by requesting microphone access
   */
  const startRecording = useCallback(async () => {
    try {
      const recorder = await startAudioRecording((chunks) => {
        const recording = createAudioRecording(
          chunks,
          recorder.mimeType,
          recordingTime
        );
        setAudioRecording(recording);
      });

      mediaRecorderRef.current = recorder;
      setIsRecording(true);
      setRecordingTime(0);

      recordingTimerRef.current = setInterval(() => {
        setRecordingTime((t) => t + 1);
      }, 1000);
    } catch (error) {
      const err = error as Error;
      alert(err.message);
    }
  }, [recordingTime]);

  /**
   * Stops the current recording
   */
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);

      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
    }
  }, [isRecording]);

  /**
   * Deletes the current audio recording and revokes blob URL
   */
  const deleteAudioRecording = useCallback(() => {
    if (audioRecording) {
      URL.revokeObjectURL(audioRecording.url);
      setAudioRecording(null);
    }
  }, [audioRecording]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
      if (audioRecording) {
        URL.revokeObjectURL(audioRecording.url);
      }
    };
  }, [audioRecording]);

  return {
    isRecording,
    recordingTime,
    audioRecording,
    startRecording,
    stopRecording,
    deleteAudioRecording,
  };
}

export default useAudioRecording;
