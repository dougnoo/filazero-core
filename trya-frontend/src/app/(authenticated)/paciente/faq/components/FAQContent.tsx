"use client";

import { useState, useEffect, useRef } from "react";
import { Box, Typography, Tabs, Tab, CircularProgress } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { TopicButton } from "./TopicButton";
import { FAQChatInput } from "./FAQChatInput";
import { faqService } from "@/shared/services/faqService";
import { tabToCategoryMap, type FaqChatMessage } from "@/shared/types/faq";

interface FAQContentProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onTopicSelect: (topic: string) => void;
  onSendMessage: (message: string) => void;
  messages: FaqChatMessage[];
  isLoadingResponse: boolean;
}

export function FAQContent({
  activeTab,
  onTabChange,
  onTopicSelect,
  onSendMessage,
  messages,
  isLoadingResponse,
}: FAQContentProps) {
  const theme = useTheme();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const tabs = [
    { value: "geral", label: "Geral" },
    { value: "triagem", label: "Triagem e IA" },
    { value: "redes", label: "Redes credenciadas" },
    { value: "atestados", label: "Atestados" },
  ];

  const getInitialTabIndex = () => {
    const index = tabs.findIndex((tab) => tab.value === activeTab);
    return index >= 0 ? index : 1; // Default para "Triagem e IA"
  };

  const [selectedTabIndex, setSelectedTabIndex] = useState(getInitialTabIndex);
  const [topics, setTopics] = useState<string[]>([]);
  const [isLoadingTopics, setIsLoadingTopics] = useState(false);

  // Buscar tópicos da API quando a aba mudar
  useEffect(() => {
    const fetchTopics = async () => {
      const category = tabToCategoryMap[activeTab];
      if (!category) return;

      setIsLoadingTopics(true);
      try {
        const response = await faqService.listTopics(category);
        setTopics(response.topics.map((t) => t.title));
      } catch (error) {
        console.error("Erro ao buscar tópicos:", error);
        setTopics([]);
      } finally {
        setIsLoadingTopics(false);
      }
    };

    fetchTopics();
  }, [activeTab]);

  useEffect(() => {
    const index = tabs.findIndex((tab) => tab.value === activeTab);
    if (index >= 0) {
      setSelectedTabIndex(index);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // Scroll para o final quando novas mensagens chegarem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const hasMessages = messages.length > 0;

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        bgcolor: 'background.paper',
        borderRadius: { xs: "16px", md: "8px" },
        border: { xs: `1px solid`, md: "none" },
        borderColor: { xs: 'divider', md: 'transparent' },
        overflow: "hidden",
      }}
    >
      {/* Tabs */}
      <Box
        sx={{
          borderBottom: `1px solid`,
          borderColor: 'divider',
          px: { xs: 2, md: 3 },
        }}
      >
        <Tabs
          value={selectedTabIndex}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
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
            borderBottom: `1px solid`,
            borderColor: 'divider',
          }}
        >
          <Typography
            sx={{
              fontSize: { xs: "18px", md: "20px" },
              fontWeight: 600,
               
            }}
          >
            {getTitle()}
          </Typography>
        </Box>

        {/* Topics/Messages Section */}
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
                bgcolor: "primary.light",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Typography
                sx={{
                  fontSize: { xs: "18px", md: "24px" },
                  color: 'primary.main',
                  fontWeight: 300,
                }}
              >
                +
              </Typography>
            </Box>
            <Typography
              sx={{
                fontSize: { xs: "13px", md: "14px" },
                color: 'grey.800',
                 
              }}
            >
              {hasMessages
                ? "Continue a conversa ou selecione outro tópico:"
                : "Para iniciar, selecione um tópico:"}
            </Typography>
          </Box>

          {/* Topics List */}
          {!hasMessages && (
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
                   
                  mb: 1,
                }}
              >
                Tópicos
              </Typography>
              {isLoadingTopics ? (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    py: 4,
                  }}
                >
                  <CircularProgress size={32} color="primary" />
                </Box>
              ) : topics.length === 0 ? (
                <Typography
                  sx={{
                    fontSize: "14px",
                    color: 'grey.800',
                    py: 2,
                  }}
                >
                  Nenhum tópico disponível para esta categoria.
                </Typography>
              ) : (
                topics.map((topic, index) => (
                  <TopicButton
                    key={index}
                    question={topic}
                    onClick={() => onTopicSelect(topic)}
                  />
                ))
              )}
            </Box>
          )}

          {/* Messages */}
          {hasMessages && (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 2,
                mb: 2,
              }}
            >
              {messages.map((message) => (
                <Box
                  key={message.id}
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems:
                      message.type === "user" ? "flex-end" : "flex-start",
                  }}
                >
                  <Box
                    sx={{
                      maxWidth: "80%",
                      px: 2,
                      py: 1.5,
                      borderRadius: "12px",
                      bgcolor:
                        message.type === "user" ? 'primary.main' : "#F5F5F5",
                      color: message.type === "user" ? 'primary.contrastText' : 'text.primary',
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: "14px",
                         
                        whiteSpace: "pre-wrap",
                      }}
                    >
                      {message.content}
                    </Typography>
                  </Box>
                  <Typography
                    sx={{
                      fontSize: "11px",
                      color: 'grey.800',
                       
                      mt: 0.5,
                      px: 1,
                    }}
                  >
                    {formatTime(message.timestamp)}
                  </Typography>
                </Box>
              ))}

              {/* Loading indicator */}
              {isLoadingResponse && (
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    px: 2,
                    py: 1.5,
                  }}
                >
                  <CircularProgress size={16} sx={{ color: 'primary.main' }} />
                  <Typography
                    sx={{
                      fontSize: "14px",
                      color: 'grey.800',
                       
                    }}
                  >
                    Processando resposta...
                  </Typography>
                </Box>
              )}

              <div ref={messagesEndRef} />
            </Box>
          )}
        </Box>

        {/* Chat Input */}
        <Box
          sx={{
            borderTop: `1px solid`,
            borderColor: 'divider',
          }}
        >
          <FAQChatInput onSendMessage={onSendMessage} disabled={isLoadingResponse} />
        </Box>
      </Box>
    </Box>
  );
}
