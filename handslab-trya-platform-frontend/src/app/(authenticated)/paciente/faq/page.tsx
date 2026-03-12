"use client";

import { useEffect, useState } from "react";
import { Box } from "@mui/material";
import { FAQContent } from "./components/FAQContent";
import { FAQSidebar } from "./components/FAQSidebar";
import { PatientData } from "../components/PatientCard";
import { api } from "@/shared/services/api";

export default function FAQPage() {
  const [activeTab, setActiveTab] = useState("triagem");
  const [patientData, setPatientData] = useState<PatientData | null>(null);
  const [isLoadingPatientData, setIsLoadingPatientData] = useState(true);

  // Busca dados do paciente da API /me
  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        setIsLoadingPatientData(true);
        const data = await api.get<PatientData>("/api/auth/me", "Erro ao buscar dados do paciente");
        setPatientData(data);
      } catch {
        // Em caso de erro, mantém null para mostrar dados vazios
      } finally {
        setIsLoadingPatientData(false);
      }
    };

    fetchPatientData();
  }, []);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  const handleTopicSelect = (topic: string) => {
    console.log("Tópico selecionado:", topic);
    handleSendMessage(topic);
  };

  const handleSendMessage = (message: string) => {
    console.log("Mensagem enviada:", message);
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", lg: "row" },
        gap: { xs: 3, md: 3, lg: 4 },
        width: "100%",
        height: { xs: "auto", lg: "calc(100vh - 64px)" },
        minHeight: 0,
        maxHeight: { xs: "none", lg: "calc(100vh - 64px)" },
        px: { xs: 2, sm: 3 },
      }}
    >
      {/* Sidebar */}
      <FAQSidebar
        patientData={patientData}
        isLoadingPatientData={isLoadingPatientData}
      />

      {/* Main Content */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          height: { xs: "auto", lg: "calc(100vh - 64px)" },
          minHeight: 0,
        }}
      >
        <FAQContent
          activeTab={activeTab}
          onTabChange={handleTabChange}
          onTopicSelect={handleTopicSelect}
          onSendMessage={handleSendMessage}
        />
      </Box>
    </Box>
  );
}

