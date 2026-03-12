"use client";

import { useCallback, useState } from "react";
import { Box } from "@mui/material";
import { FAQContent } from "@/app/(authenticated)/paciente/faq/components/FAQContent";
import { faqService } from "@/shared/services/faqService";
import { tabToCategoryMap, type FaqChatMessage } from "@/shared/types/faq";

export interface FaqConversationProps {
  initialTab?: string;
}

export function FaqConversation({ initialTab = "triagem" }: FaqConversationProps) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [messages, setMessages] = useState<FaqChatMessage[]>([]);
  const [isLoadingResponse, setIsLoadingResponse] = useState(false);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    // Limpar mensagens ao trocar de aba
    setMessages([]);
  };

  const sendMessageToFaq = useCallback(
    async (message: string) => {
      const category = tabToCategoryMap[activeTab];
      if (!category) return;

      const userMessage: FaqChatMessage = {
        id: `user-${Date.now()}`,
        type: "user",
        content: message,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMessage]);

      setIsLoadingResponse(true);
      try {
        const response = await faqService.ask({
          message,
          category,
        });

        const assistantMessage: FaqChatMessage = {
          id: `assistant-${Date.now()}`,
          type: "assistant",
          content: response.answer,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } catch (error) {
        console.error("Erro ao enviar pergunta:", error);
        const errorMessage: FaqChatMessage = {
          id: `error-${Date.now()}`,
          type: "assistant",
          content:
            "Desculpe, ocorreu um erro ao processar sua pergunta. Por favor, tente novamente.",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      } finally {
        setIsLoadingResponse(false);
      }
    },
    [activeTab],
  );

  return (
    <Box sx={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
      <FAQContent
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onTopicSelect={sendMessageToFaq}
        onSendMessage={sendMessageToFaq}
        messages={messages}
        isLoadingResponse={isLoadingResponse}
      />
    </Box>
  );
}


