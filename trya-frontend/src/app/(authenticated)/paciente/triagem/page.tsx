"use client";

import { Box, CircularProgress, Typography, useTheme, useMediaQuery } from "@mui/material";
import { useMemo, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/shared/hooks/useAuth";
import { usePatientData } from "@/shared/hooks/usePatientData";
import TriageSidebar from "./components/TriageSidebar";
import TriageChat from "./components/TriageChat";
import MobileTabsLayout from "./components/mobile/MobileTabsLayout";
import { Patient, Step } from "./lib/types";
import { useTriageSession, useTriageSocket, useTriageHistory, useTriageValidation } from "./hooks";

export default function TriagemPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const { data: patientApiData, isLoading: isLoadingPatientData, hasError: patientError } = usePatientData();

  const urlSessionId = searchParams.get("session_id");
  const {
    currentSession,
    isLoading: isLoadingSession,
    sessionId,
    shouldConnectSocket,
    loadSession,
    loadActiveOrNew,
    updateSessionFromResponse,
    updateSessionStage,
  } = useTriageSession(urlSessionId);

  const sessionStatus = currentSession?.status ?? null;

  const socket = useTriageSocket({
    sessionId,
    enabled: shouldConnectSocket,
  });

  const { validationStatus, isLoading: isLoadingValidation } = useTriageValidation();

  const {
    history: triageHistory,
    loading: loadingHistory,
    hasMore: hasMoreHistory,
    loadingMore: loadingMoreHistory,
    loadMore: handleLoadMoreHistory,
  } = useTriageHistory();

  const selectedHistoryId = currentSession && currentSession.status !== 'DRAFT' ? currentSession.sessionId : null;

  if (patientError) {
    router.replace("/paciente");
  }

  const patientData: Patient = useMemo(() => {
    
    let startedAt: string | undefined = new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    if (currentSession?.updatedAt) {
      try {
        const date = new Date(currentSession.updatedAt);
        startedAt = date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
      } catch {
        startedAt = undefined;
      }
    }

    return {
      id: patientApiData?.cpf || "",
      name: patientApiData?.name || user?.name || "",
      affiliation: patientApiData?.planName || patientApiData?.tenantName || "",
      status: "Triagem em andamento",
      startedAt,
    };
  }, [patientApiData, user?.name, currentSession?.createdAt, currentSession?.status, currentSession]);

  const stepsData: Step[] = [
    { id: "1", title: "Onboarding", completed: false },
    { id: "2", title: "Sintomas iniciais", completed: false },
    { id: "3", title: "Detalhamento", completed: false },
    { id: "4", title: "Histórico médico", completed: false },
    { id: "5", title: "Recomendação", completed: false },
  ];

  const currentStep = useMemo(() => {
    const stage = currentSession?.currentStage;
    if (!stage) return 0;
    const stageMap: Record<string, number> = {
      onboarding: 1, initial_symptoms: 2, detailing: 3, medical_history: 4, recommendation: 5,
    };
    return stageMap[stage] ?? 0;
  }, [currentSession?.currentStage]);

  const handleNewTriagem = useCallback(() => {
    loadActiveOrNew();
  }, [loadActiveOrNew]);

  const handleNavigateToNetwork = useCallback(() => router.push("/paciente/rede-credenciada"), [router]);

  const handleSelectHistory = useCallback(async (historyId: string) => {
    if (isLoadingSession) return;
    try {
      await loadSession(historyId);
    } catch {
      alert("Erro ao carregar sessão do histórico");
    }
  }, [isLoadingSession, loadSession]);

  const handleSessionIdChange = useCallback((newSessionId: string) => {
    updateSessionFromResponse(newSessionId);
  }, [updateSessionFromResponse]);

  const handleSessionStageChange = useCallback((newStage: string) => {
    updateSessionStage(newStage);
  }, [updateSessionStage]);

  if (isLoadingPatientData) {
    return (
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "calc(100vh - 64px)", bgcolor: "background.default" }}>
        <Box sx={{ textAlign: "center" }}>
          <CircularProgress sx={{ color: "primary.main", mb: 2 }} />
          <Typography sx={{ color: "grey.800", fontSize: "14px" }}>Carregando dados...</Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{
      display: "flex",
      flexDirection: { xs: "column", md: "row" },
      height: '100%',
      minHeight: { md: "calc(100vh - 64px - 48px)" },
      maxHeight: { xs: "calc(100dvh - 64px)", md: "calc(100vh - 64px - 48px)" },
      px: { xs: 1, md: 3 },
      py: { xs: 0.5, md: 0 },
      gap: { xs: 1, md: 3 },
      overflow: "hidden",
      bgcolor: "background.default",
    }}>
      {isMobile ? (
        <MobileTabsLayout
          currentSession={currentSession}
          sessionId={sessionId}
          isLoadingSession={isLoadingSession}
          socket={socket}
          userName={user?.name || ''}
          onNavigateToNetwork={handleNavigateToNetwork}
          onNewTriagem={handleNewTriagem}
          onSessionIdChange={handleSessionIdChange}
          patient={patientData}
          sessionStatus={sessionStatus}
          steps={stepsData}
          currentStep={currentStep}
          onSelectHistory={handleSelectHistory}
          selectedHistoryId={selectedHistoryId}
          validationStatus={validationStatus}
          isLoadingValidation={isLoadingValidation}
          triageHistory={triageHistory}
          loadingHistory={loadingHistory}
          hasMoreHistory={hasMoreHistory}
          loadingMoreHistory={loadingMoreHistory}
          onLoadMoreHistory={handleLoadMoreHistory}
          onSessionStageChange={handleSessionStageChange}
        />
      ) : (
        <>
          <TriageSidebar
            patient={patientData}
            sessionStatus={sessionStatus}
            steps={stepsData}
            currentStep={currentStep}
            onSelectHistory={handleSelectHistory}
            selectedHistoryId={selectedHistoryId}
          />
          <TriageChat
            currentSession={currentSession}
            sessionId={sessionId}
            isLoadingSession={isLoadingSession}
            socket={socket}
            patient={patientData}
            steps={stepsData}
            currentStep={currentStep}
            userName={user?.name || ''}
            onNavigateToNetwork={handleNavigateToNetwork}
            onNewTriagem={handleNewTriagem}
            onSessionIdChange={handleSessionIdChange}
            onSessionStageChange={handleSessionStageChange}
      />
        </>
      )}
    </Box>
  );
}
