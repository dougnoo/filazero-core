import { useState, useCallback, useRef, useEffect } from "react";
import type {
  Message,
  TriageResult,
  AudioRecording,
} from "@/shared/types/chat";
import {
  callChatAPI,
  callChatAPIWithAudio,
  parseTriageResult,
  getOrCreateSessionId,
  fileToBase64,
  validateFile,
  getAudioFormat,
  generateUUID,
  blobToBase64,
} from "@/shared/services/chatService";
import {
  startAudioRecording,
  createAudioRecording,
} from "@/shared/services/audioService";
import { io, Socket } from "socket.io-client";

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [triageResult, setTriageResult] = useState<TriageResult | null>(null);
  const [chatClosed, setChatClosed] = useState(false);

  // conexão com IA via Socket.IO
  const socketRef = useRef<Socket | null>(null);
  const sessionIdRef = useRef<string>(getOrCreateSessionId());

  // Get token from localStorage for WebSocket authentication
  const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;

  // Audio recording states
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioRecording, setAudioRecording] = useState<AudioRecording | null>(
    null
  );

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);

  // se quiser manter fallback/mock, deixe true/false aqui
  const isMockMode = false;

  // ---- MOCK (mantido, caso queira usar em dev) ----
  const MOCK_RESPONSES: Message[] = [
    {
      id: "mock-1",
      type: "text",
      content:
        "Certo, vamos começar. Pode me contar há quanto tempo os sintomas apareceram?",
      sender: "bot",
      timestamp: "10:25",
    },
    {
      id: "mock-2",
      type: "text",
      content:
        "Entendi. Você mediu a temperatura ou pressão recentemente? Se sim, quais foram os valores?",
      sender: "bot",
      timestamp: "10:26",
    },
    {
      id: "mock-3",
      type: "text",
      content:
        "Obrigado pelas informações! Vou analisar e em instantes apresento uma recomendação inicial.",
      sender: "bot",
      timestamp: "10:27",
    },
  ];

  const mockIndexRef = useRef(0);

  const getNextMockMessage = useCallback((): Message => {
    const response =
      MOCK_RESPONSES[mockIndexRef.current % MOCK_RESPONSES.length] ??
      MOCK_RESPONSES[MOCK_RESPONSES.length - 1];

    mockIndexRef.current += 1;

    return {
      ...response,
      id: `${response.id}-${mockIndexRef.current}`,
      timestamp: new Date().toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
  }, [MOCK_RESPONSES]);

  const scheduleMockResponse = useCallback(() => {
    setTimeout(() => {
      const aiMessage = getNextMockMessage();
      setMessages((prev) => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1500);
  }, [getNextMockMessage]);

  // ---- CONEXÃO SOCKET.IO (equivalente ao connectSocket do HTML) ----
  useEffect(() => {
    if (!token) return;
  
    // base da API (sem /chat)
    const baseUrl =
      process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000";
  
    // garante que termina com /chat, sem barra duplicada
    const socketUrl = `${baseUrl.replace(/\/$/, "")}/chat`;
  
    const cleanToken = token.replace("Bearer ", "");
  
    const socket = io(socketUrl, {
      path: "/socket.io",
      extraHeaders: {
        Authorization: `Bearer ${cleanToken}`,
      },
      query: {
        token: cleanToken,
      },
      transports: ["websocket"],
    });
  
    socketRef.current = socket;
  
    socket.on("connect", () => {
      console.log("✅ Socket conectado em", socketUrl);
    });
  
    socket.on("disconnect", () => {
      console.log("❌ Socket desconectado");
    });
  
    socket.on("connect_error", (error) => {
      console.error("Connection error:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          type: "text",
          content: `Erro de conexão com o servidor de triagem: ${error.message}`,
          sender: "bot",
          timestamp: new Date().toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);
    });
  
    socket.on("exception", (error: { message: string; status?: string }) => {
      console.error("Exception:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          type: "text",
          content: `Erro no processamento da IA: ${error.message}`,
          sender: "bot",
          timestamp: new Date().toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);
    });
  
    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [token]);
  

  // ---- ENVIO DE MENSAGEM DE TEXTO (usa o socket.emit 'message') ----
  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || chatClosed) return;
  
      const userMessage: Message = {
        id: Date.now().toString(),
        type: "text",
        content: text,
        sender: "user",
        timestamp: new Date().toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
  
      setMessages((prev) => [...prev, userMessage]);
      setIsTyping(true);
  
      // mock (se quiser usar)
      if (isMockMode) {
        scheduleMockResponse();
        return;
      }
  
      // ✅ agora: se não tiver socket, não tenta HTTP
      if (!socketRef.current || !socketRef.current.connected) {
        setIsTyping(false);
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            type: "text",
            content:
              "Não consegui conectar ao servidor de triagem. Verifique seu token ou a URL de API.",
            sender: "bot",
            timestamp: new Date().toLocaleTimeString("pt-BR", {
              hour: "2-digit",
              minute: "2-digit",
            }),
          },
        ]);
        return;
      }
  
      const socket = socketRef.current;
  
      socket.emit(
        "message",
        {
          message: text,
          session_id: sessionIdRef.current,
        },
        (response: {
          message?: string;
          session_id?: string;
          is_complete?: boolean;
          transcribed_text?: string;
          status?: string;
          error?: string;
        }) => {
          console.log("Server response:", response);

          // Handle error response
          if (response?.status === "error" || response?.error) {
            setMessages((prev) => [
              ...prev,
              {
                id: (Date.now() + 1).toString(),
                type: "text",
                content: response.error || response.message || "Erro ao processar mensagem",
                sender: "bot",
                timestamp: new Date().toLocaleTimeString("pt-BR", {
                  hour: "2-digit",
                  minute: "2-digit",
                }),
              },
            ]);
            setIsTyping(false);
            return;
          }

          if (!response || !response.message) {
            setMessages((prev) => [
              ...prev,
              {
                id: (Date.now() + 1).toString(),
                type: "text",
                content:
                  "Recebi uma resposta vazia ou inválida do servidor de triagem.",
                sender: "bot",
                timestamp: new Date().toLocaleTimeString("pt-BR", {
                  hour: "2-digit",
                  minute: "2-digit",
                }),
              },
            ]);
            setIsTyping(false);
            return;
          }

          // Update session_id if provided
          if (response.session_id) {
            sessionIdRef.current = response.session_id;
            try {
              localStorage.setItem("triage_session_id", response.session_id);
            } catch {
              // Ignore localStorage errors
            }
          }

          const aiText = response.message;

          const aiMessage: Message = {
            id: (Date.now() + 1).toString(),
            type: "text",
            content: aiText,
            sender: "bot",
            timestamp: new Date().toLocaleTimeString("pt-BR", {
              hour: "2-digit",
              minute: "2-digit",
            }),
          };

          setMessages((prev) => [...prev, aiMessage]);

          const result = parseTriageResult(aiText);
          if (result || response.is_complete) {
            if (result) setTriageResult(result);
            setChatClosed(true);
          }

          setIsTyping(false);
        }
      );
    },
    [chatClosed, isMockMode, scheduleMockResponse]
  );
  

  // ---- GRAVAÇÃO DE ÁUDIO (mantido igual) ----
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

  const sendAudioMessage = useCallback(
    async (recording: AudioRecording) => {
      if (!recording || chatClosed) return;

      const { blob } = recording;
      const chatUrl = URL.createObjectURL(blob);
      const rawMime = (blob.type || "audio/webm").split(";")[0];
      const fileExt = rawMime.split("/")[1] || "webm";
      const audioFormat = getAudioFormat(blob.type || "audio/webm");

      const userMessage: Message = {
        id: Date.now().toString(),
        type: "audio",
        content: `audio_${Date.now()}.${fileExt}`,
        sender: "user",
        timestamp: new Date().toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        fileSize: `${(blob.size / 1024).toFixed(2)} KB`,
        duration: `${Math.floor(recording.duration / 60)}:${String(
          recording.duration % 60
        ).padStart(2, "0")}`,
        audioUrl: chatUrl,
        audioMimeType: blob.type || "audio/webm",
      };

      setMessages((prev) => [...prev, userMessage]);
      setIsTyping(true);

      if (isMockMode) {
        scheduleMockResponse();
        setAudioRecording(null);
        URL.revokeObjectURL(recording.url);
        return;
      }

      // ✅ agora: usar Socket.io para enviar áudio
      if (!socketRef.current || !socketRef.current.connected) {
        setIsTyping(false);
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            type: "text",
            content:
              "Não consegui conectar ao servidor de triagem. Verifique seu token ou a URL de API.",
            sender: "bot",
            timestamp: new Date().toLocaleTimeString("pt-BR", {
              hour: "2-digit",
              minute: "2-digit",
            }),
          },
        ]);
        setAudioRecording(null);
        URL.revokeObjectURL(recording.url);
        return;
      }

      try {
        // Convert audio blob to base64
        const audioBase64 = await blobToBase64(blob);

        const socket = socketRef.current;

        socket.emit(
          "message",
          {
            session_id: sessionIdRef.current,
            audio: audioBase64,
            audio_format: audioFormat,
            // Optional: include a message along with audio
            // message: "Enviei um áudio descrevendo meus sintomas.",
          },
          (response: {
            message?: string;
            session_id?: string;
            is_complete?: boolean;
            transcribed_text?: string;
            status?: string;
            error?: string;
          }) => {
            console.log("Server response (audio):", response);

            // Handle error response
            if (response?.status === "error" || response?.error) {
              setMessages((prev) => [
                ...prev,
                {
                  id: (Date.now() + 1).toString(),
                  type: "text",
                  content: response.error || response.message || "Erro ao processar áudio",
                  sender: "bot",
                  timestamp: new Date().toLocaleTimeString("pt-BR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  }),
                },
              ]);
              setIsTyping(false);
              setAudioRecording(null);
              URL.revokeObjectURL(recording.url);
              return;
            }

            if (!response || !response.message) {
              setMessages((prev) => [
                ...prev,
                {
                  id: (Date.now() + 1).toString(),
                  type: "text",
                  content: "Recebi uma resposta vazia do servidor de triagem.",
                  sender: "bot",
                  timestamp: new Date().toLocaleTimeString("pt-BR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  }),
                },
              ]);
              setIsTyping(false);
              setAudioRecording(null);
              URL.revokeObjectURL(recording.url);
              return;
            }

            // Update session_id if provided
            if (response.session_id) {
              sessionIdRef.current = response.session_id;
              try {
                localStorage.setItem("triage_session_id", response.session_id);
              } catch {
                // Ignore localStorage errors
              }
            }

            // Update user message with transcribed text if available
            if (response.transcribed_text) {
              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === userMessage.id
                    ? { ...msg, transcription: response.transcribed_text }
                    : msg
                )
              );
            }

            const aiText = response.message;

            const aiMessage: Message = {
              id: (Date.now() + 1).toString(),
              type: "text",
              content: aiText,
              sender: "bot",
              timestamp: new Date().toLocaleTimeString("pt-BR", {
                hour: "2-digit",
                minute: "2-digit",
              }),
            };

            setMessages((prev) => [...prev, aiMessage]);

            const result = parseTriageResult(aiText);
            if (result || response.is_complete) {
              if (result) setTriageResult(result);
              setChatClosed(true);
            }

            setIsTyping(false);
            setAudioRecording(null);
            URL.revokeObjectURL(recording.url);
          }
        );
      } catch (error) {
        const err = error as Error;
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: "text",
          content: err?.message || "Não consegui processar o áudio agora.",
          sender: "bot",
          timestamp: new Date().toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        };
        setMessages((prev) => [...prev, errorMessage]);
        setIsTyping(false);
        setAudioRecording(null);
        URL.revokeObjectURL(recording.url);
      }
    },
    [chatClosed, isMockMode, scheduleMockResponse]
  );

  const transcribeAudioMessage = useCallback(
    async (messageId: string) => {
      const targetMessage = messages.find(
        (message) => message.id === messageId && message.audioUrl
      );

      if (!targetMessage?.audioUrl) {
        throw new Error("Áudio indisponível para transcrição.");
      }

      const response = await fetch(targetMessage.audioUrl);
      if (!response.ok) {
        throw new Error("Falha ao carregar o áudio para transcrição.");
      }

      const audioBlob = await response.blob();
      const transcription = await callChatAPIWithAudio(
        audioBlob,
        "Transcreva fielmente o áudio enviado, respondendo apenas com a transcrição do que foi dito."
      );

      setMessages((prev) =>
        prev.map((message) =>
          message.id === messageId
            ? {
                ...message,
                transcription,
              }
            : message
        )
      );

      return transcription;
    },
    [messages]
  );

  const deleteAudioRecording = useCallback(() => {
    if (audioRecording) {
      URL.revokeObjectURL(audioRecording.url);
      setAudioRecording(null);
    }
  }, [audioRecording]);

  const sendFileAttachment = useCallback(
    async (file: File) => {
      if (chatClosed) return;

      // Validate file
      const validation = validateFile(file);
      if (!validation.valid) {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            type: "text",
            content: validation.error || "Arquivo inválido",
            sender: "bot",
            timestamp: new Date().toLocaleTimeString("pt-BR", {
              hour: "2-digit",
              minute: "2-digit",
            }),
          },
        ]);
        return;
      }

      // Create preview URL for images
      const isImage = file.type.startsWith("image/");
      const fileUrl = isImage ? URL.createObjectURL(file) : undefined;

      const userMessage: Message = {
        id: Date.now().toString(),
        type: "file",
        content: file.name,
        sender: "user",
        timestamp: new Date().toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        fileSize: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
        fileType: file.type,
        fileUrl: fileUrl,
      };

      setMessages((prev) => [...prev, userMessage]);
      setIsTyping(true);

      if (isMockMode) {
        scheduleMockResponse();
        return;
      }

      // ✅ agora: usar Socket.io para enviar arquivos
      if (!socketRef.current || !socketRef.current.connected) {
        setIsTyping(false);
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            type: "text",
            content:
              "Não consegui conectar ao servidor de triagem. Verifique seu token ou a URL de API.",
            sender: "bot",
            timestamp: new Date().toLocaleTimeString("pt-BR", {
              hour: "2-digit",
              minute: "2-digit",
            }),
          },
        ]);
        return;
      }

      try {
        // Convert file to base64 (without data: prefix)
        const fileBase64 = await fileToBase64(file);

        const socket = socketRef.current;

        socket.emit(
          "message",
          {
            session_id: sessionIdRef.current,
            files: [
              {
                data: fileBase64,
                type: file.type,
                name: file.name,
              },
            ],
            // Optional: include a message along with file
            // message: `Acabei de anexar "${file.name}". Considere isso e me oriente.`,
          },
          (response: {
            message?: string;
            session_id?: string;
            is_complete?: boolean;
            status?: string;
            error?: string;
          }) => {
            console.log("Server response (file):", response);

            // Handle error response
            if (response?.status === "error" || response?.error) {
              setMessages((prev) => [
                ...prev,
                {
                  id: (Date.now() + 1).toString(),
                  type: "text",
                  content: response.error || response.message || "Erro ao processar arquivo",
                  sender: "bot",
                  timestamp: new Date().toLocaleTimeString("pt-BR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  }),
                },
              ]);
              setIsTyping(false);
              return;
            }

            if (!response || !response.message) {
              setMessages((prev) => [
                ...prev,
                {
                  id: (Date.now() + 1).toString(),
                  type: "text",
                  content: "Recebi uma resposta vazia do servidor de triagem.",
                  sender: "bot",
                  timestamp: new Date().toLocaleTimeString("pt-BR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  }),
                },
              ]);
              setIsTyping(false);
              return;
            }

            // Update session_id if provided
            if (response.session_id) {
              sessionIdRef.current = response.session_id;
              try {
                localStorage.setItem("triage_session_id", response.session_id);
              } catch {
                // Ignore localStorage errors
              }
            }

            const aiText = response.message;

            const aiMessage: Message = {
              id: (Date.now() + 1).toString(),
              type: "text",
              content: aiText,
              sender: "bot",
              timestamp: new Date().toLocaleTimeString("pt-BR", {
                hour: "2-digit",
                minute: "2-digit",
              }),
            };

            setMessages((prev) => [...prev, aiMessage]);

            const result = parseTriageResult(aiText);
            if (result || response.is_complete) {
              if (result) setTriageResult(result);
              setChatClosed(true);
            }

            setIsTyping(false);
          }
        );
      } catch (error) {
        const err = error as Error;
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: "text",
          content: err?.message || "Não consegui processar o anexo agora.",
          sender: "bot",
          timestamp: new Date().toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        };
        setMessages((prev) => [...prev, errorMessage]);
        setIsTyping(false);
      }
    },
    [chatClosed, isMockMode, scheduleMockResponse]
  );

  const resetConversation = useCallback(() => {
    setMessages((prev) => {
      prev.forEach((message) => {
        if (message.audioUrl?.startsWith("blob:")) {
          try {
            URL.revokeObjectURL(message.audioUrl);
          } catch {
            // Ignore revoke errors
          }
        }
      });
      return [];
    });
    setIsTyping(false);
    setTriageResult(null);
    setChatClosed(false);
    setAudioRecording(null);
    setIsRecording(false);
    setRecordingTime(0);
    // Generate new session ID for new conversation
    sessionIdRef.current = generateUUID();
    try {
      localStorage.setItem("triage_session_id", sessionIdRef.current);
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
      if (audioRecording) {
        URL.revokeObjectURL(audioRecording.url);
      }
      messages.forEach((message) => {
        if (message.audioUrl?.startsWith("blob:")) {
          try {
            URL.revokeObjectURL(message.audioUrl);
          } catch {
            // Ignore revoke errors
          }
        }
      });
    };
  }, [audioRecording, messages]);

  return {
    messages,
    isTyping,
    triageResult,
    chatClosed,
    isRecording,
    recordingTime,
    audioRecording,
    sendMessage,
    startRecording,
    stopRecording,
    sendAudioMessage,
    deleteAudioRecording,
    sendFileAttachment,
    resetConversation,
    transcribeAudioMessage,
  };
}
