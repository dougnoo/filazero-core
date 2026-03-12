"use client";

import { Box, Button } from "@mui/material";
import { useRef, useState, useEffect, useCallback } from "react";
import { ChatHeader } from "./chat/ChatHeader";
import { ChatInput } from "./chat/ChatInput";
import { MessageRenderer } from "./chat/MessageRenderer";
import { AudioPreview } from "./chat/AudioPreview";
import { MessageSkeleton } from "./chat/MessageSkeleton";
import { BotAvatarIcon } from "@/shared/components";
import type { Message, BackendResponse, AudioRecording } from "@/shared/types/chat";
import { MESSAGE_SEND_STATUS } from "@/shared/types/chat";
import type { Patient, Step } from "../lib/types";
import type { TriageSessionResponse } from "../services/triageHistoryService";
import type { UseTriageSocketReturn } from "../hooks/useTriageSocket";
import { useAudioRecording, useChatMessages, processBackendResponse } from "../hooks";
import { fileToBase64, validateFile, getAudioFormat, blobToBase64 } from "@/shared/services/chatService";
import { Replay } from "@mui/icons-material";

export interface TriageChatProps {
  currentSession: TriageSessionResponse | null;
  sessionId: string;
  isLoadingSession: boolean;
  socket: UseTriageSocketReturn;
  patient: Patient;
  steps: Step[];
  currentStep: number;
  userName: string;
  onNavigateToNetwork: () => void;
  onNewTriagem: () => void;
  onSessionIdChange: (sessionId: string) => void;
  onSessionStageChange: (stage: string) => void;
}

export function TriageChat({
  currentSession,
  sessionId,
  isLoadingSession,
  socket,
  patient,
  steps,
  currentStep,
  userName,
  onNavigateToNetwork,
  onNewTriagem,
  onSessionIdChange,
  onSessionStageChange,
}: TriageChatProps) {
  const sessionStatus = currentSession?.status ?? null;
  const loadedMessages = currentSession?.messages ?? [];
  const chatTitle = currentSession?.summary ?? "Novo chat";
  const doctorAttachments = currentSession?.doctorAttachments;
  const doctorName = currentSession?.doctorName;
  
  const {
    messages,
    pendingMessages,
    setMessages,
    addMessage,
    updateMessageStatus,
    addToPendingMessages,
    removeFromPendingMessages,
    loadSessionMessages,
    resetMessages,
  } = useChatMessages({ userName });

  const {
    isRecording,
    recordingTime,
    audioRecording,
    startRecording,
    stopRecording,
    deleteAudioRecording,
  } = useAudioRecording();

  const { socketRef, isConnected, isTyping, setIsTyping } = socket;

  const [chatClosed, setChatClosed] = useState(sessionStatus === 'COMPLETED' || sessionStatus === 'PENDING');

  const prevSessionIdRef = useRef<string>(sessionId);
  const prevIsConnectedRef = useRef<boolean>(false);
  const hasLoadedMessagesRef = useRef(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const hasAutoScrolledRef = useRef(false);

  useEffect(() => {
    if (sessionStatus === 'COMPLETED' || sessionStatus === 'PENDING') {
      setChatClosed(true);
    } else if (sessionStatus === 'DRAFT' || sessionStatus === null) {
      setChatClosed(false);
    }
  }, [sessionStatus]);

  useEffect(() => {
    const sessionChanged = prevSessionIdRef.current !== sessionId;
    prevSessionIdRef.current = sessionId;

    if (sessionChanged) {
      hasLoadedMessagesRef.current = false;
      resetMessages();
      hasAutoScrolledRef.current = false;
    }

    if (!isLoadingSession && loadedMessages.length > 0 && !hasLoadedMessagesRef.current) {
      hasLoadedMessagesRef.current = true;
      loadSessionMessages(loadedMessages, sessionId, doctorAttachments, doctorName);
    }
  }, [sessionId, isLoadingSession, loadedMessages, doctorAttachments, doctorName, loadSessionMessages, resetMessages]);

  const handleMessageResponse = useCallback(
    (response: BackendResponse, messageId: string, originalMessage?: Message) => {
      if (response?.status === "error" || response?.error) {
        updateMessageStatus(messageId, MESSAGE_SEND_STATUS.ERROR);
        if (originalMessage) {
          addToPendingMessages({ ...originalMessage, sendStatus: MESSAGE_SEND_STATUS.ERROR });
        }
        setIsTyping(false);
        return;
      }

      const hasMessages = response?.messages && Array.isArray(response.messages) && response.messages.length > 0;
      const hasLegacyMessage = response?.message;

      if (!response || (!hasMessages && !hasLegacyMessage)) {
        updateMessageStatus(messageId, MESSAGE_SEND_STATUS.ERROR);
        if (originalMessage) {
          addToPendingMessages({ ...originalMessage, sendStatus: MESSAGE_SEND_STATUS.ERROR });
        }
        setIsTyping(false);
        return;
      }

      updateMessageStatus(messageId, MESSAGE_SEND_STATUS.DELIVERED);

      if (response.session_id) {
        onSessionIdChange(response.session_id);
      }

      if (response.current_stage) {
        onSessionStageChange(response.current_stage);
      }

      const processedMessages = processBackendResponse(response);
      setMessages((prev) => [...prev, ...processedMessages]);

      if (response.is_complete) {
        setChatClosed(true);
      }

      setIsTyping(false);
    },
    [updateMessageStatus, addToPendingMessages, onSessionIdChange, onSessionStageChange, setMessages, setIsTyping]
  );

  // Retry pending messages when connection is restored
  useEffect(() => {
    const wasDisconnected = !prevIsConnectedRef.current;
    const isNowConnected = isConnected;
    prevIsConnectedRef.current = isConnected;

    if (wasDisconnected && isNowConnected && pendingMessages.length > 0) {
      const pendingTextMessages = pendingMessages.filter((msg) => msg.type === "text");
      pendingTextMessages.forEach((pendingMsg, index) => {
        setTimeout(() => {
          if (socketRef.current?.connected) {
            removeFromPendingMessages(pendingMsg.id);
            updateMessageStatus(pendingMsg.id, MESSAGE_SEND_STATUS.SENDING);
            setIsTyping(true);
            socketRef.current.emit(
              "message",
              { message: pendingMsg.content, session_id: sessionId },
              (response: BackendResponse) => {
                handleMessageResponse(response, pendingMsg.id, pendingMsg);
              }
            );
          }
        }, index * 500);
      });
    }
  }, [isConnected, pendingMessages, sessionId, socketRef, removeFromPendingMessages, updateMessageStatus, handleMessageResponse, setIsTyping]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || chatClosed) return;

    const messageId = Date.now().toString();
    const userMessage: Message = {
      id: messageId,
      type: "text",
      content: text,
      sender: "user",
      timestamp: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
      sendStatus: MESSAGE_SEND_STATUS.SENDING,
    };

    addMessage(userMessage);
    setIsTyping(true);

    if (!socketRef.current || !socketRef.current.connected) {
      setIsTyping(false);
      updateMessageStatus(messageId, MESSAGE_SEND_STATUS.ERROR);
      addToPendingMessages({ ...userMessage, sendStatus: MESSAGE_SEND_STATUS.ERROR });
      return;
    }

    socketRef.current.emit(
      "message",
      { message: text, session_id: sessionId },
      (response: BackendResponse) => {
        handleMessageResponse(response, messageId, userMessage);
      }
    );
  }, [chatClosed, sessionId, addMessage, updateMessageStatus, addToPendingMessages, handleMessageResponse, socketRef, setIsTyping]);

  const sendAudioMessage = useCallback(async (recording: AudioRecording) => {
    if (!recording || chatClosed) return;

    const { blob } = recording;
    const chatUrl = URL.createObjectURL(blob);
    const rawMime = (blob.type || "audio/webm").split(";")[0];
    const fileExt = rawMime.split("/")[1] || "webm";
    const audioFormat = getAudioFormat(blob.type || "audio/webm");

    const messageId = Date.now().toString();
    const userMessage: Message = {
      id: messageId,
      type: "audio",
      content: `audio_${Date.now()}.${fileExt}`,
      sender: "user",
      timestamp: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
      fileSize: `${(blob.size / 1024).toFixed(2)} KB`,
      duration: `${Math.floor(recording.duration / 60)}:${String(recording.duration % 60).padStart(2, "0")}`,
      audioUrl: chatUrl,
      audioMimeType: blob.type || "audio/webm",
      sendStatus: MESSAGE_SEND_STATUS.SENDING,
    };

    addMessage(userMessage);
    setIsTyping(true);

    if (!socketRef.current || !socketRef.current.connected) {
      setIsTyping(false);
      updateMessageStatus(messageId, MESSAGE_SEND_STATUS.ERROR);
      addToPendingMessages({ ...userMessage, sendStatus: MESSAGE_SEND_STATUS.ERROR });
      deleteAudioRecording();
      URL.revokeObjectURL(recording.url);
      return;
    }

    try {
      const audioBase64 = await blobToBase64(blob);
      
      socketRef.current.emit(
        "message",
        { message: "", session_id: sessionId, audio: audioBase64, audio_format: audioFormat },
        (response: BackendResponse & { transcribed_text?: string }) => {
          if (response?.status === "error" || response?.error) {
            updateMessageStatus(messageId, MESSAGE_SEND_STATUS.ERROR);
            addToPendingMessages({ ...userMessage, sendStatus: MESSAGE_SEND_STATUS.ERROR });
            setIsTyping(false);
            deleteAudioRecording();
            URL.revokeObjectURL(recording.url);
            return;
          }

          const hasMessages = response?.messages && Array.isArray(response.messages) && response.messages.length > 0;
          const hasLegacyMessage = response?.message;

          if (!response || (!hasMessages && !hasLegacyMessage)) {
            updateMessageStatus(messageId, MESSAGE_SEND_STATUS.ERROR);
            addToPendingMessages({ ...userMessage, sendStatus: MESSAGE_SEND_STATUS.ERROR });
            setIsTyping(false);
            deleteAudioRecording();
            URL.revokeObjectURL(recording.url);
            return;
          }

          updateMessageStatus(messageId, MESSAGE_SEND_STATUS.DELIVERED);

          if (response.session_id) onSessionIdChange(response.session_id);

          if (response.current_stage) {
            onSessionStageChange(response.current_stage);
          }

          if (response.transcribed_text) {
            setMessages((prev) =>
              prev.map((msg) => msg.id === messageId ? { ...msg, transcription: response.transcribed_text } : msg)
            );
          }

          const processedMessages = processBackendResponse(response);
          setMessages((prev) => [...prev, ...processedMessages]);

          if (response.is_complete) {
            setChatClosed(true);
          }

          setIsTyping(false);
          deleteAudioRecording();
          URL.revokeObjectURL(recording.url);
        }
      );
    } catch {
      updateMessageStatus(messageId, MESSAGE_SEND_STATUS.ERROR);
      addToPendingMessages({ ...userMessage, sendStatus: MESSAGE_SEND_STATUS.ERROR });
      setIsTyping(false);
      deleteAudioRecording();
      URL.revokeObjectURL(recording.url);
    }
  }, [chatClosed, sessionId, addMessage, updateMessageStatus, addToPendingMessages, onSessionIdChange, onSessionStageChange, setMessages, deleteAudioRecording, socketRef, setIsTyping]);

  const sendFileAttachment = useCallback(async (file: File) => {
    if (chatClosed) return;

    const validation = validateFile(file);
    if (!validation.valid) {
      addMessage({
        id: Date.now().toString(),
        type: "text",
        content: validation.error || "Arquivo inválido",
        sender: "bot",
        timestamp: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
      });
      return;
    }

    const isImage = file.type.startsWith("image/");
    const fileUrl = isImage ? URL.createObjectURL(file) : undefined;

    const messageId = Date.now().toString();
    const userMessage: Message = {
      id: messageId,
      type: "file",
      content: file.name,
      sender: "user",
      timestamp: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
      fileSize: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
      fileType: file.type,
      fileUrl: fileUrl,
      sendStatus: MESSAGE_SEND_STATUS.SENDING,
    };

    addMessage(userMessage);
    setIsTyping(true);

    if (!socketRef.current || !socketRef.current.connected) {
      setIsTyping(false);
      updateMessageStatus(messageId, MESSAGE_SEND_STATUS.ERROR);
      addToPendingMessages({ ...userMessage, sendStatus: MESSAGE_SEND_STATUS.ERROR });
      return;
    }

    try {
      const fileBase64 = await fileToBase64(file);

      socketRef.current.emit(
        "message",
        { message: "", session_id: sessionId, files: [{ data: fileBase64, type: file.type, name: file.name }] },
        (response: BackendResponse) => {
          if (response?.status === "error" || response?.error) {
            updateMessageStatus(messageId, MESSAGE_SEND_STATUS.ERROR);
            addToPendingMessages({ ...userMessage, sendStatus: MESSAGE_SEND_STATUS.ERROR });
            setIsTyping(false);
            return;
          }

          const hasMessages = response?.messages && Array.isArray(response.messages) && response.messages.length > 0;
          const hasLegacyMessage = response?.message;

          if (!response || (!hasMessages && !hasLegacyMessage)) {
            updateMessageStatus(messageId, MESSAGE_SEND_STATUS.ERROR);
            addToPendingMessages({ ...userMessage, sendStatus: MESSAGE_SEND_STATUS.ERROR });
            setIsTyping(false);
            return;
          }

          updateMessageStatus(messageId, MESSAGE_SEND_STATUS.DELIVERED);

          if (response.session_id) onSessionIdChange(response.session_id);

          if (response.current_stage) {
            onSessionStageChange(response.current_stage);
          }

          const processedMessages = processBackendResponse(response);
          setMessages((prev) => [...prev, ...processedMessages]);

          if (response.is_complete) {
            setChatClosed(true);
          }

          setIsTyping(false);
        }
      );
    } catch {
      updateMessageStatus(messageId, MESSAGE_SEND_STATUS.ERROR);
      addToPendingMessages({ ...userMessage, sendStatus: MESSAGE_SEND_STATUS.ERROR });
      setIsTyping(false);
    }
  }, [chatClosed, sessionId, addMessage, updateMessageStatus, addToPendingMessages, onSessionIdChange, onSessionStageChange, setMessages, socketRef, setIsTyping]);

  const handleSendMessage = (message: string) => sendMessage(message);
  const handleSendAudio = () => { if (audioRecording) sendAudioMessage(audioRecording); };
  const handleFileUpload = (files: FileList | null) => { if (files && files.length > 0) sendFileAttachment(files[0]); };

  const handleInteractiveResponse = useCallback((value: string | string[]) => {
    const responseText = Array.isArray(value) ? value.join(", ") : value;
    sendMessage(responseText);
  }, [sendMessage]);

  useEffect(() => {
    const el = messagesEndRef.current;
    if (!el) return;

    const behavior: ScrollBehavior = hasAutoScrolledRef.current ? "smooth" : "auto";
    requestAnimationFrame(() => {
      el.scrollIntoView({ behavior, block: "end" });
      hasAutoScrolledRef.current = true;
    });
  }, [messages.length, isTyping]);

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt,image/*"
        className="hidden"
        style={{ display: "none" }}
        onChange={(e) => handleFileUpload(e.target.files)}
      />

      <Box
        sx={{
          flex: 1,
          minWidth: 0,
          minHeight: 0,
          height: "100%",
          display: "flex",
          flexDirection: "column",
          bgcolor: "background.paper",
          borderRadius: { xs: "12px", md: "16px" },
          boxShadow: "0 12px 32px rgba(10, 58, 58, 0.08)",
          border: 1,
          borderColor: "divider",
          overflow: "hidden",
        }}
      >
        <ChatHeader
          title={chatTitle}
          status={chatClosed ? "completed" : isTyping ? "analyzing" : "waiting"}
          steps={steps}
          currentStep={currentStep}
          patient={patient}
        />

        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            overflowY: "auto",
            p: { xs: 2, md: 3 },
            display: "flex",
            flexDirection: "column",
            gap: { xs: 2, md: 3 },
            bgcolor: "#FFFFFF",
          }}
        >
          {isLoadingSession && <MessageSkeleton count={5} />}

          {!isLoadingSession &&
            messages.map((message) => (
              <MessageRenderer
                key={message.id}
                message={message}
                onResponse={handleInteractiveResponse}
                disabled={chatClosed || isTyping}
                userName={message.sender === "user" ? userName : undefined}
              />
            ))}

          {isTyping && !chatClosed && isConnected && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <BotAvatarIcon />
              </Box>
              <Box
                sx={{
                  bgcolor: "secondary.light",
                  borderRadius: "12px",
                  p: 2,
                  display: "flex",
                  gap: 0.5,
                }}
              >                             
                {[0, 0.16, 0.32].map((delay, i) => (
                  <Box
                    key={i}
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      bgcolor: "primary.main",
                      animation: "bounce 1.4s infinite ease-in-out both",
                      animationDelay: `${delay}s`,
                      "@keyframes bounce": {
                        "0%, 80%, 100%": { transform: "scale(0)" },
                        "40%": { transform: "scale(1)" },
                      },
                    }}
                  />
                ))}
              </Box>
            </Box>
          )}

          {chatClosed && (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", py: 4 }}>
              <Button variant="contained" onClick={onNewTriagem} startIcon={<Replay />}>
                Fazer nova triagem
              </Button>
            </Box>
          )}

          <Box ref={messagesEndRef} sx={{ height: 1 }} />
        </Box>

        <Box sx={{ borderTop: 1, borderColor: "divider", p: 2, flexShrink: 0 }}>
          {!chatClosed && (
            <AudioPreview
              isRecording={isRecording}
              recordingTime={recordingTime}
              audioRecording={audioRecording}
              onStop={stopRecording}
              onSend={handleSendAudio}
              onDelete={deleteAudioRecording}
            />
          )}
          <ChatInput
            onSendMessage={handleSendMessage}
            onAttachFile={() => fileInputRef.current?.click()}
            onRecordAudio={isRecording ? stopRecording : startRecording}
            isConnected={isConnected}
            disabled={chatClosed || isTyping}
            isTyping={isTyping}
          />
        </Box>
      </Box>
    </>
  );
}

export default TriageChat;
