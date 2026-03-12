"use client";

import { useState, useEffect } from "react";
import { Box, Typography, Tabs, Tab } from "@mui/material";
import { useThemeColors } from "@/shared/hooks/useThemeColors";
import { TopicButton } from "./TopicButton";
import { FAQChatInput } from "./FAQChatInput";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`faq-tabpanel-${index}`}
      aria-labelledby={`faq-tab-${index}`}
      {...other}
      style={{ height: "100%" }}
    >
      {value === index && <Box sx={{ height: "100%" }}>{children}</Box>}
    </div>
  );
}

const FAQ_TOPICS: Record<string, string[]> = {
  geral: [
    "Como acesso meu plano de saúde?",
    "Quais são os horários de atendimento?",
    "Como solicito segunda via da carteirinha?",
    "Preciso de autorização prévia para exames?",
  ],
  triagem: [
    "Os resultados da triagem substituem a consulta médica?",
    "Em quanto tempo recebo o resultado da triagem?",
    "A inteligência artificial tem acesso aos meus dados pessoais?",
    "Como a IA é treinada para realizar as análises médicas?",
  ],
  redes: [
    "Como encontro um médico credenciado?",
    "Posso escolher qualquer médico da rede?",
    "Como verifico se um procedimento está coberto?",
    "O que fazer se não encontrar médico próximo?",
  ],
  atestados: [
    "Como solicito um atestado médico?",
    "Quanto tempo leva para processar um atestado?",
    "Posso acompanhar o status do meu atestado?",
    "Como faço para anexar documentos no atestado?",
  ],
};

interface FAQContentProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onTopicSelect: (topic: string) => void;
  onSendMessage: (message: string) => void;
}

export function FAQContent({
  activeTab,
  onTabChange,
  onTopicSelect,
  onSendMessage,
}: FAQContentProps) {
  const theme = useThemeColors();
  
  const tabs = [
    { value: "geral", label: "Geral" },
    { value: "triagem", label: "Triagem e IA" },
    { value: "redes", label: "Redes credenciadas" },
    { value: "atestados", label: "Atestados" },
  ];

  const getInitialTabIndex = () => {
    const index = tabs.findIndex(tab => tab.value === activeTab);
    return index >= 0 ? index : 1; // Default para "Triagem e IA"
  };

  const [selectedTabIndex, setSelectedTabIndex] = useState(getInitialTabIndex);

  useEffect(() => {
    const index = tabs.findIndex(tab => tab.value === activeTab);
    if (index >= 0) {
      setSelectedTabIndex(index);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setSelectedTabIndex(newValue);
    onTabChange(tabs[newValue].value);
  };

  const getTitle = () => {
    switch (activeTab) {
      case "geral":
        return "Perguntas frequentes - Geral";
      case "triagem":
        return "Perguntas frequentes sobre Triagem e IA";
      case "redes":
        return "Perguntas frequentes sobre Redes Credenciadas";
      case "atestados":
        return "Perguntas frequentes sobre Atestados";
      default:
        return "Perguntas frequentes";
    }
  };

  const topics = FAQ_TOPICS[activeTab] || [];

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        bgcolor: theme.white,
        borderRadius: { xs: "16px", md: "8px" },
        border: { xs: `1px solid ${theme.softBorder}`, md: "none" },
        overflow: "hidden",
      }}
    >
      {/* Tabs */}
      <Box
        sx={{
          borderBottom: `1px solid ${theme.softBorder}`,
          px: { xs: 2, md: 3 },
        }}
      >
        <Tabs
          value={selectedTabIndex}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            "& .MuiTabs-indicator": {
              bgcolor: theme.primary,
              height: "2px",
            },
            "& .MuiTab-root": {
              textTransform: "none",
              fontSize: { xs: "13px", md: "14px" },
              fontFamily: theme.fontFamily,
              fontWeight: 500,
              color: theme.textMuted,
              minHeight: { xs: "48px", md: "56px" },
              px: { xs: 1.5, md: 2 },
              "&.Mui-selected": {
                color: theme.primary,
                fontWeight: 600,
              },
            },
          }}
        >
          {tabs.map((tab) => (
            <Tab key={tab.value} label={tab.label} />
          ))}
        </Tabs>
      </Box>

      {/* Content Area */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Title */}
        <Box
          sx={{
            px: { xs: 2, md: 3 },
            py: { xs: 2, md: 3 },
            borderBottom: `1px solid ${theme.softBorder}`,
          }}
        >
          <Typography
            sx={{
              fontSize: { xs: "18px", md: "20px" },
              fontWeight: 600,
              color: theme.textDark,
              fontFamily: theme.fontFamily,
            }}
          >
            {getTitle()}
          </Typography>
        </Box>

        {/* Topics Section */}
        <Box
          sx={{
            flex: 1,
            overflowY: "auto",
            px: { xs: 2, md: 3 },
            py: { xs: 2, md: 3 },
          }}
        >
          {/* Prompt */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              mb: 3,
            }}
          >
            <Box
              sx={{
                width: { xs: 32, md: 40 },
                height: { xs: 32, md: 40 },
                borderRadius: "50%",
                bgcolor: "#E3F2FD",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Typography
                sx={{
                  fontSize: { xs: "18px", md: "24px" },
                  color: theme.primary,
                  fontWeight: 300,
                }}
              >
                +
              </Typography>
            </Box>
            <Typography
              sx={{
                fontSize: { xs: "13px", md: "14px" },
                color: theme.textMuted,
                fontFamily: theme.fontFamily,
              }}
            >
              Para iniciar, selecione um tópico:
            </Typography>
            <Box sx={{ ml: "auto", display: "flex", alignItems: "center", gap: 0.5 }}>
              <Typography
                sx={{
                  fontSize: "12px",
                  color: theme.textMuted,
                  fontFamily: theme.fontFamily,
                }}
              >
                10:25
              </Typography>
              <Box
                sx={{
                  width: 16,
                  height: 16,
                  borderRadius: "50%",
                  bgcolor: theme.success,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Typography
                  sx={{
                    fontSize: "10px",
                    color: theme.white,
                    fontWeight: 600,
                  }}
                >
                  ✓
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Topics List */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
              mb: 2,
            }}
          >
            <Typography
              sx={{
                fontSize: { xs: "14px", md: "16px" },
                fontWeight: 600,
                color: theme.textDark,
                fontFamily: theme.fontFamily,
                mb: 1,
              }}
            >
              Tópicos
            </Typography>
            {topics.map((topic, index) => (
              <TopicButton
                key={index}
                question={topic}
                onClick={() => onTopicSelect(topic)}
              />
            ))}
          </Box>
        </Box>

        {/* Chat Input */}
        <Box
          sx={{
            borderTop: `1px solid ${theme.softBorder}`,
          }}
        >
          <FAQChatInput onSendMessage={onSendMessage} />
        </Box>
      </Box>
    </Box>
  );
}

