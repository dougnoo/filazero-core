// Barrel export for triagem hooks

// Session management hooks
export { useActiveSession } from "./useActiveSession";
export { useTriageSession } from "./useTriageSession";
export type { UseTriageSessionReturn } from "./useTriageSession";
export { useTriageHistory } from "./useTriageHistory";
export { useTriageValidation } from "./useTriageValidation";

// Chat and communication hooks
export { useTriageSocket } from "./useTriageSocket";
export type { UseTriageSocketOptions, UseTriageSocketReturn } from "./useTriageSocket";

export { useChatMessages, processBackendResponse, mapBackendMessageToMessage, generateWelcomeMessages } from "./useChatMessages";
export type { UseChatMessagesReturn, UseChatMessagesOptions } from "./useChatMessages";

export { useAudioRecording } from "./useAudioRecording";
export type { UseAudioRecordingReturn } from "./useAudioRecording";
