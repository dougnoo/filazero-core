import { useState, useCallback, useMemo } from "react";
import type {
  Message,
  BackendMessage,
  BackendResponse,
  MessageStyle,
  MessageSendStatus,
  SummaryPresentation,
  BackendSummaryPresentation,
  DoctorAttachment,
  MessageAttachment,
} from "@/shared/types/chat";
import type { TriageSessionMessage } from "@/app/(authenticated)/paciente/triagem/services/triageHistoryService";

export interface UseChatMessagesOptions {
  userName?: string;
}

export interface UseChatMessagesReturn {
  messages: Message[];
  pendingMessages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  addMessage: (message: Message) => void;
  updateMessageStatus: (messageId: string, status: MessageSendStatus) => void;
  addToPendingMessages: (message: Message) => void;
  removeFromPendingMessages: (messageId: string) => void;
  processBackendResponse: (response: BackendResponse) => Message[];
  loadSessionMessages: (
    sessionMessages: TriageSessionMessage[],
    sessionId: string,
    doctorAttachments?: DoctorAttachment[],
    doctorName?: string
  ) => void;
  resetMessages: () => void;
}

function mapSummaryPresentation(sp: BackendSummaryPresentation): SummaryPresentation {
  return {
    patient: {
      name: sp.patient?.name || "",
      priority: sp.patient?.priority || "",
      clinicalDescription: sp.patient?.clinical_description || "",
    },
    symptoms: sp.symptoms || [],
    medications: sp.medications || [],
    activeHistory: sp.active_history,
    criticalAlerts: sp.critical_alert ? [sp.critical_alert] : undefined,
  };
}

export function mapBackendMessageToMessage(backendMessage: BackendMessage, index: number): Message {
  let formattedTimestamp = "";
  if (backendMessage.timestamp) {
    try {
      const date = new Date(backendMessage.timestamp);
      formattedTimestamp = date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    } catch {
      formattedTimestamp = new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    }
  } else {
    formattedTimestamp = new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  }

  let mappedSummaryPresentation: SummaryPresentation | undefined = undefined;
  if (backendMessage.summaryPresentation?.patient) {
    mappedSummaryPresentation = mapSummaryPresentation(backendMessage.summaryPresentation);
  }

  // Determine sender based on message type
  let sender: "bot" | "user" | "doctor" = "bot";
  if (backendMessage.type === "DoctorMessage") {
    sender = "doctor";
  } else if (backendMessage.type === "HumanMessage") {
    sender = "user";
  }

  return {
    id: `${Date.now()}-${index}`,
    type: "text",
    content: backendMessage.content || "",
    sender,
    timestamp: formattedTimestamp,
    style: backendMessage.style,
    options: backendMessage.options,
    summaryPresentation: mappedSummaryPresentation,
    specialty: backendMessage.specialty,
    phase: backendMessage.phase,
    attachments: backendMessage.attachments,
  };
}

export function processBackendResponse(response: BackendResponse): Message[] {
  if (response.messages && Array.isArray(response.messages) && response.messages.length > 0) {
    return response.messages.map((backendMsg, index) => mapBackendMessageToMessage(backendMsg, index));
  }

  if (response.message) {
    return [{
      id: `${Date.now()}-legacy`,
      type: "text",
      content: response.message,
      sender: "bot",
      timestamp: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
      style: null,
    }];
  }

  return [];
}

export function generateWelcomeMessages(userName?: string): Message[] {
  const firstName = userName?.split(" ")[0] || "";
  const greeting = firstName ? `Olá, ${firstName}!` : "Olá!";
  const timestamp = new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

  return [
    {
      id: "welcome-1",
      type: "text" as const,
      content: `${greeting} Vamos dar início ao seu atendimento. Antes de começarmos, quero te lembrar que essa é uma triagem rápida para entender como você está se sentindo hoje. Com suas respostas, conseguimos direcionar o melhor atendimento para a sua necessidade.`,
      sender: "bot" as const,
      timestamp,
    },
    {
      id: "welcome-2",
      type: "text" as const,
      content: "Me conte um pouco sobre qual é o principal sintoma ou problema que você está sentindo agora?",
      sender: "bot" as const,
      timestamp,
    },
  ];
}

export function useChatMessages(options: UseChatMessagesOptions = {}): UseChatMessagesReturn {
  const { userName } = options;
  
  const welcomeMessages = useMemo(() => generateWelcomeMessages(userName), [userName]);
  
  const [internalMessages, setInternalMessages] = useState<Message[]>([]);
  const [pendingMessages, setPendingMessages] = useState<Message[]>([]);
  
  // Always prepend welcome messages to all chats
  const messages = useMemo(() => {
    return [...welcomeMessages, ...internalMessages];
  }, [welcomeMessages, internalMessages]);

  const addMessage = useCallback((message: Message) => {
    setInternalMessages((prev) => [...prev, message]);
  }, []);

  const updateMessageStatus = useCallback((messageId: string, status: MessageSendStatus) => {
    setInternalMessages((prev) =>
      prev.map((msg) => (msg.id === messageId ? { ...msg, sendStatus: status } : msg))
    );
  }, []);

  const addToPendingMessages = useCallback((message: Message) => {
    setPendingMessages((prev) => [...prev, message]);
  }, []);

  const removeFromPendingMessages = useCallback((messageId: string) => {
    setPendingMessages((prev) => prev.filter((msg) => msg.id !== messageId));
  }, []);

  const loadSessionMessages = useCallback(
    (
      sessionMessages: TriageSessionMessage[],
      sessionId: string,
      doctorAttachments?: DoctorAttachment[],
      doctorName?: string
    ) => {
      if (!sessionMessages || !Array.isArray(sessionMessages)) {
        return;
      }

      const loadedMessages: Message[] = sessionMessages.map((msg, index) => {
        const isLastProfessionalMessage = msg.type === "DoctorMessage" && index === sessionMessages.length - 1;

        let formattedTimestamp = "";
        if (msg.timestamp) {
          try {
            const date = new Date(msg.timestamp);
            formattedTimestamp = date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
          } catch {
            formattedTimestamp = "";
          }
        }

        let sender: "bot" | "user" | "doctor";
        if (msg.type === "HumanMessage") {
          sender = "user";
        } else if (msg.type === "DoctorMessage") {
          sender = "doctor";
        } else {
          sender = "bot";
        }

        const messageStyle = msg.style ||
          (msg.type !== "HumanMessage" && msg.type !== "DoctorMessage" && msg.type !== "AIMessage"
            ? (msg.type as MessageStyle)
            : null);

        let mappedSummaryPresentation: SummaryPresentation | undefined = undefined;
        if (msg.summaryPresentation?.patient) {
          mappedSummaryPresentation = mapSummaryPresentation(msg.summaryPresentation);
        }

        const isInteractiveStyle = messageStyle === "scale" || messageStyle === "single" || messageStyle === "multiple";
        const nextMessage = sessionMessages[index + 1];
        const isAnswered = isInteractiveStyle && nextMessage?.type === "HumanMessage";

        let userResponse: string | number | string[] | undefined = undefined;
        if (isAnswered && nextMessage) {
          const responseContent = nextMessage.content.trim();

          if (messageStyle === "scale") {
            const parsed = parseInt(responseContent, 10);
            userResponse = !isNaN(parsed) ? parsed : responseContent;
          } else if (messageStyle === "multiple") {
            if (msg.options && msg.options.length > 0) {
              const matchedOptions = msg.options.filter((opt) =>
                responseContent.toLowerCase().includes(opt.toLowerCase())
              );
              userResponse = matchedOptions.length > 0 ? matchedOptions : [responseContent];
            } else {
              userResponse = [responseContent];
            }
          } else {
            userResponse = responseContent;
          }
        }

        return {
          id: `loaded-${index}`,
          type: "text" as const,
          content: msg.content,
          sender,
          timestamp: formattedTimestamp,
          style: messageStyle as MessageStyle | null | undefined,
          options: msg.options,
          summaryPresentation: mappedSummaryPresentation,
          specialty: msg.specialty,
          phase: msg.phase,
          isAnswered,
          userResponse,
          attachments: msg.attachments as MessageAttachment[] | undefined,
          ...(sender === "doctor" && doctorName ? { doctorName } : {}),
          ...(isLastProfessionalMessage && doctorAttachments && doctorAttachments.length > 0
            ? { doctorAttachments }
            : {}),
        };
      });

      setInternalMessages(loadedMessages);
    },
    []
  );

  const resetMessages = useCallback(() => {
    setInternalMessages((prev) => {
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
    setPendingMessages([]);
  }, []);

  const setMessages: React.Dispatch<React.SetStateAction<Message[]>> = useCallback(
    (action) => {
      setInternalMessages(action);
    },
    []
  );

  return {
    messages,
    pendingMessages,
    setMessages,
    addMessage,
    updateMessageStatus,
    addToPendingMessages,
    removeFromPendingMessages,
    processBackendResponse,
    loadSessionMessages,
    resetMessages,
  };
}

export default useChatMessages;
