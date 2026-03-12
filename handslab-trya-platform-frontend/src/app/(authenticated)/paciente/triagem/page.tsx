"use client";

import { Box, CircularProgress, Typography } from "@mui/material";
import { useRef, useState, useEffect, useMemo } from "react";
import { ChatHeader } from "./components/chat/ChatHeader";
import { ChatMessage } from "./components/chat/ChatMessage";
import { AudioMessage } from "./components/chat/AudioMessage";
import { FileAttachment } from "./components/chat/FileAttachment";
import { ChatInput } from "./components/chat/ChatInput";
import { TriageResultCard } from "./components/chat/TriageResultCard";
import { AudioPreview } from "./components/chat/AudioPreview";
import { theme } from "@/shared/theme";
import { useChat } from "@/shared/hooks/useChat";
import { useAuth } from "@/shared/hooks/useAuth";
import { useThemeColors } from "@/shared/hooks/useThemeColors";
import { api } from "@/shared/services/api";
import { PatientData } from "../components/PatientCard";
import BackButton from "./components/sidebar/BackButton";
import PatientCard from "./components/sidebar/PatientCard";
import Steps from "./components/sidebar/Steps";
import HealthDataCards from "./components/sidebar/HealthDataCards";
import ValidationCard from "./components/sidebar/ValidationCard";
import ConnectDoctorButton from "./components/sidebar/ConnectDoctorButton";
import HistoryList from "./components/sidebar/HistoryList";
import { Patient, Step, HealthData } from "./lib/types";

export default function TriagemPage() {
  const {
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
  } = useChat();

  const { user } = useAuth();
  const themeColors = useThemeColors();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [triageStartTime, setTriageStartTime] = useState<string | null>(null);
  const [patientApiData, setPatientApiData] = useState<PatientData | null>(null);
  const [isLoadingPatientData, setIsLoadingPatientData] = useState(true);
  const [selectedHistoryId, setSelectedHistoryId] = useState<string>('1');

  // Busca dados do paciente da API /me
  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        setIsLoadingPatientData(true);
        const data = await api.get<PatientData>("/api/auth/me", "Erro ao buscar dados do paciente");
        setPatientApiData(data);
      } catch (error) {
        // Em caso de erro, mantém null para usar dados mock
      } finally {
        setIsLoadingPatientData(false);
      }
    };

    fetchPatientData();
  }, []);

  // Processa dados do paciente
  const patientData: Patient = {
    id: patientApiData?.cpf || "1",
    name: patientApiData?.name || user?.name || "Maria Silva Santos",
    affiliation: patientApiData?.planName || patientApiData?.tenantName || "Amil One",
    status: "Triagem em andamento",
    startedAt: triageStartTime || undefined,
  };

  const stepsData: Step[] = [
    { id: "1", title: "Sintomas iniciais", completed: false },
    { id: "2", title: "Detalhamento", completed: false },
    { id: "3", title: "Histórico médico", completed: false },
    { id: "4", title: "Recomendação", completed: false },
  ];

  // Processa dados de saúde do paciente (mesmo formato da tela inicial)
  const processHealthData = (): HealthData => {
    if (!patientApiData) {
      // Dados mock como fallback
      return {
        conditions: ["Hipertensão", "Diabetes tipo 2"],
        meds: ["Losartana 50mg"],
        allergies: ["Penicilina"],
      };
    }

    // Processa alergias - pode ser string ou array
    const allergies = patientApiData.allergies
      ? patientApiData.allergies.trim() !== ""
        ? [patientApiData.allergies]
        : []
      : [];

    // Processa condições crônicas
    const conditions = patientApiData.chronicConditions
      ? patientApiData.chronicConditions.map((c) => c.name)
      : [];

    // Processa medicamentos
    const medications = patientApiData.medications
      ? patientApiData.medications.map((m) => m.name)
      : [];

    return {
      conditions,
      meds: medications,
      allergies,
    };
  };

  const healthData = useMemo(() => processHealthData(), [patientApiData]);

  // Calcular step atual baseado nas mensagens
  const currentStep = useMemo(() => {
    if (messages.length === 0) return 0;
    if (messages.length <= 2) return 0; // Sintomas iniciais
    if (messages.length <= 4) return 1; // Detalhamento
    if (messages.length <= 6) return 2; // Histórico médico
    return 3; // Recomendação
  }, [messages.length]);

  // Atualizar horário de início quando primeira mensagem do usuário é enviada
  useEffect(() => {
    const userMessages = messages.filter(m => m.sender === "user");
    if (userMessages.length > 0 && !triageStartTime) {
      const now = new Date();
      const timeString = now.toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
      setTriageStartTime(timeString);
    }
  }, [messages, triageStartTime]);

  const handleSendMessage = (message: string) => {
    sendMessage(message);
  };

  const handleSendAudio = () => {
    if (audioRecording) {
      sendAudioMessage(audioRecording);
    }
  };

  const handleFileUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    sendFileAttachment(files[0]);
  };



  const handleDownloadReport = () => {
    alert("Baixando resumo da triagem...");
  };

  // Get user's first name for personalized messages
  const getUserFirstName = () => {
    const fullName = patientApiData?.name || user?.name || "";
    if (fullName) {
      return fullName.split(" ")[0];
    }
    return "";
  };

  const userFirstName = getUserFirstName();

  // Mock messages for initial state (remove this when API is ready)
  const displayMessages = messages.length > 0 ? messages : [
    {
      id: "1",
      type: "text" as const,
      content: userFirstName
        ? `Olá, ${userFirstName}! Vamos dar início ao seu atendimento. Antes de começarmos, quero te lembrar que essa é uma triagem rápida para entender como você está se sentindo hoje. Com suas respostas, conseguimos direcionar o melhor atendimento para a sua necessidade.`
        : "Olá! Vamos dar início ao seu atendimento. Antes de começarmos, quero te lembrar que essa é uma triagem rápida para entender como você está se sentindo hoje. Com suas respostas, conseguimos direcionar o melhor atendimento para a sua necessidade.",
      sender: "bot" as const,
      timestamp: "10:25",
    },
    {
      id: "2",
      type: "text" as const,
      content:
        "Me conte um pouco sobre qual é o principal sintoma ou problema que você está sentindo agora?",
      sender: "bot" as const,
      timestamp: "10:25",
    },
  ];

  // Mostra loading enquanto carrega dados do paciente
  if (isLoadingPatientData) {
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "calc(100vh - 64px)",
          bgcolor: theme.background,
        }}
      >
        <Box sx={{ textAlign: "center" }}>
          <CircularProgress 
            sx={{ 
              color: themeColors.primary,
              mb: 2,
            }} 
          />
          <Typography 
            sx={{ 
              color: themeColors.textMuted,
              fontSize: "14px",
              fontFamily: themeColors.fontFamily,
            }}
          >
            Carregando dados...
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        height: { xs: "auto", md: "calc(100vh - 64px - 48px)" }, // 64px header + 48px padding (24px top + 24px bottom)
        minHeight: { xs: "auto", md: "calc(100vh - 64px - 48px)" },
        maxHeight: { xs: "none", md: "calc(100vh - 64px - 48px)" },
        px: { xs: 2, md: 3 },
        py: { xs: 2, md: 0 },
        gap: 3,
        overflow: "hidden",
        bgcolor: theme.background,
      }}
    >
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt,image/*"
        className="hidden"
        style={{ display: "none" }}
        onChange={(e) => handleFileUpload(e.target.files)}
      />

      {/* Sidebar */}
      <Box
        sx={{
          width: { xs: "100%", md: "360px" },
          minWidth: { xs: "100%", md: "360px" },
          maxWidth: { xs: "100%", md: "360px" },
          height: { xs: "auto", md: "100%" },
          maxHeight: { xs: "none", md: "100%" },
          overflowY: { xs: "visible", md: "auto" },
          overflowX: "hidden",
          display: "flex",
          flexDirection: "column",
          gap: 2,
          pr: { xs: 0, md: 1 },
          pb: { xs: 0, md: 2 },
          "&::-webkit-scrollbar": {
            width: "6px",
          },
          "&::-webkit-scrollbar-track": {
            bgcolor: "transparent",
          },
          "&::-webkit-scrollbar-thumb": {
            bgcolor: "#9CA3AF",
            borderRadius: "3px",
            "&:hover": {
              bgcolor: "#6B7280",
            },
          },
        }}
      >
        <BackButton />
        <PatientCard patient={patientData} />
        <Steps steps={stepsData} currentStep={currentStep} />
        <HealthDataCards health={healthData} />
        <ValidationCard />
        <ConnectDoctorButton />
        <HistoryList 
          selectedId={selectedHistoryId}
          onSelect={(id) => setSelectedHistoryId(id)}
        />
      </Box>

      {/* Main Chat Area */}
      <Box
        sx={{
          flex: 1,
          minWidth: 0,
          height: "100%",
          maxHeight: "100%",
          display: "flex",
          flexDirection: "column",
          bgcolor: theme.white,
          borderRadius: "16px",
          boxShadow: "0 12px 32px rgba(10, 58, 58, 0.08)",
          border: `1px solid ${theme.softBorder}`,
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <ChatHeader
          title="Febre e dor de cabeça"
          status={chatClosed ? "completed" : isTyping ? "analyzing" : "waiting"}
        />

        {/* Messages Area */}
        <Box
          sx={{
            flex: 1,
            overflowY: "auto",
            p: 3,
            display: "flex",
            flexDirection: "column",
            gap: 3,
            bgcolor: "#FFFFFF",
          }}
        >
          {/* Triage Result Card */}
          {triageResult && (
            <TriageResultCard
              result={triageResult}
              onNewTriagem={resetConversation}
              onConnectDoctor={handleConnectDoctor}
              onDownload={handleDownloadReport}
            />
          )}

          {/* Messages */}
          {displayMessages.map((message, idx) => {
            const userName = user?.name || patientApiData?.name || "";
            if (message.type === "text") {
              return (
                <ChatMessage
                  key={message.id}
                  message={message.content}
                  sender={message.sender}
                  timestamp={message.timestamp}
                  userName={message.sender === "user" ? userName : undefined}
                  isTyping={isTyping && idx === displayMessages.length - 1 && message.sender === "bot"}
                />
              );
            } else if (message.type === "audio") {
              return (
                <AudioMessage
                  key={message.id}
                  messageId={message.id}
                  duration={message.duration || "00:00"}
                  timestamp={message.timestamp}
                  sender={message.sender}
                  userName={message.sender === "user" ? userName : undefined}
                  audioUrl={message.audioUrl}
                  transcription={message.transcription}
                  onTranscribe={transcribeAudioMessage}
                />
              );
            } else if (message.type === "file") {
              return (
                <FileAttachment
                  key={message.id}
                  fileName={message.content}
                  fileSize={message.fileSize || ""}
                  timestamp={message.timestamp}
                  sender={message.sender}
                  userName={message.sender === "user" ? userName : undefined}
                  fileType={message.fileType}
                  fileUrl={message.fileUrl}
                />
              );
            }
            return null;
          })}

          {/* Typing Indicator */}
          {isTyping && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  bgcolor: "rgba(190, 225, 235, 0.5)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <span>🤖</span>
              </Box>
              <Box
                sx={{
                  bgcolor: "rgba(190, 225, 235, 0.5)",
                  borderRadius: "12px",
                  p: 2,
                  display: "flex",
                  gap: 0.5,
                }}
              >
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    bgcolor: "rgba(4, 22, 22, 1)",
                    animation: "bounce 1.4s infinite ease-in-out both",
                    "@keyframes bounce": {
                      "0%, 80%, 100%": { transform: "scale(0)" },
                      "40%": { transform: "scale(1)" },
                    },
                  }}
                />
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    bgcolor: "rgba(4, 22, 22, 1)",
                    animation: "bounce 1.4s infinite ease-in-out both",
                    animationDelay: "0.16s",
                    "@keyframes bounce": {
                      "0%, 80%, 100%": { transform: "scale(0)" },
                      "40%": { transform: "scale(1)" },
                    },
                  }}
                />
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    bgcolor: "rgba(4, 22, 22, 1)",
                    animation: "bounce 1.4s infinite ease-in-out both",
                    animationDelay: "0.32s",
                    "@keyframes bounce": {
                      "0%, 80%, 100%": { transform: "scale(0)" },
                      "40%": { transform: "scale(1)" },
                    },
                  }}
                />
              </Box>
            </Box>
          )}
        </Box>

        {/* Input Area */}
        {!chatClosed && (
          <Box sx={{ borderTop: `1px solid ${theme.softBorder}`, p: 2 }}>
            <AudioPreview
              isRecording={isRecording}
              recordingTime={recordingTime}
              audioRecording={audioRecording}
              onStop={stopRecording}
              onSend={handleSendAudio}
              onDelete={deleteAudioRecording}
            />
            <ChatInput
              onSendMessage={handleSendMessage}
              onAttachFile={() => fileInputRef.current?.click()}
              onRecordAudio={isRecording ? stopRecording : startRecording}
            />
          </Box>
        )}

        {/* Actions when chat is closed */}
        {chatClosed && !triageResult && (
          <Box
            sx={{
              borderTop: `1px solid ${theme.softBorder}`,
              p: 2,
              display: "flex",
              gap: 2,
            }}
          >
            <Box
              component="button"
              onClick={resetConversation}
              sx={{
                flex: 1,
                bgcolor: themeColors.primary,
                color: themeColors.secondary,
                fontSize: "14px",
                textTransform: "none",
                borderRadius: "8px",
                fontWeight: 500,
                py: 1.5,
                border: "none",
                cursor: "pointer",
                "&:hover": { opacity: 0.9 },
              }}
            >
              Nova Triagem
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
}

