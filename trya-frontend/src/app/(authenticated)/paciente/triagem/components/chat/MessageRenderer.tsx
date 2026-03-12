"use client";

import { useCallback } from "react";
import { Box, Avatar, Tooltip, useTheme } from "@mui/material";
import { Message, MESSAGE_STYLES } from "@/shared/types/chat";
import { BotAvatarIcon } from "@/shared/components";
import { ChatMessage } from "./ChatMessage";
import { AudioMessageContent } from "./inputs/AudioMessageContent";
import { FileAttachmentContent } from "./inputs/FileAttachmentContent";
import { ScaleInput, SingleChoiceInput, MultipleChoiceInput, ExamContent } from "./inputs";
import { SummaryCard } from "./inputs/SummaryCard";
import { EmergencyAlert } from "./inputs/EmergencyAlert";
import { SearchMedicalServiceButton } from "./inputs/SearchMedicalServiceButton";
import { TelemedicineOption } from "./inputs/TelemedicineOption";
import { downloadSummary } from "../../lib/printSummary";

interface MessageRendererProps {
  message: Message;
  onResponse: (value: string | string[]) => void;
  disabled?: boolean;
  userName?: string;
}

export function MessageRenderer({
  message,
  onResponse,
  disabled = false,
  userName,
}: MessageRendererProps) {
  const theme = useTheme();
  const { type, style, content, timestamp, sender, options, summaryPresentation, specialty, isAnswered, userResponse, attachments } = message;

  const getDisplayName = () => {
    if (sender === "bot") return "Trya AI";
    if (sender === "doctor" && message.doctorName) return message.doctorName;
    if (sender === "user" && userName) return userName;
    return "";
  };

  const getUserInitials = () => {
    if (sender === "user" && userName) {
      return userName.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
    }
    if (sender === "doctor" && message.doctorName) {
      return message.doctorName.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
    }
    return "U";
  };

  const getAvatarConfig = () => {
    if (sender === "bot") {
      return {
        content: <BotAvatarIcon />,
        bgcolor: "transparent",
        color: theme.palette.text.primary,
        borderColor: "transparent",
        isCustomSvg: true,
      };
    }
    if (sender === "doctor") {
      return {
        content: getUserInitials(),
        bgcolor: theme.palette.background.paper,
        color: theme.palette.primary.main,
        borderColor: theme.palette.primary.main,
        isCustomSvg: false,
      };
    }
    return {
      content: getUserInitials(),
      bgcolor: theme.palette.action.hover,
      color: theme.palette.primary.main,
      borderColor: "transparent",
      isCustomSvg: false,
    };
  };

  const handleScaleSelect = useCallback((value: number) => {
    onResponse(String(value));
  }, [onResponse]);

  const handleSingleSelect = useCallback((optionText: string) => {
    onResponse(optionText);
  }, [onResponse]);

  const handleMultipleConfirm = useCallback((values: string[]) => {
    onResponse(values);
  }, [onResponse]);

  const handleSummaryDownload = useCallback(() => {
    if (summaryPresentation) {
      downloadSummary(summaryPresentation);
    }
  }, [summaryPresentation]);

  const avatarConfig = getAvatarConfig();
  const isUserMessage = sender === "user";

  const renderMessageContent = () => {
    // Handle message types first (audio, file)
    if (type === "audio") {
      return (
        <AudioMessageContent
          timestamp={timestamp}
          audioUrl={message.audioUrl}
          transcription={message.transcription}
        />
      );
    }

    if (type === "file") {
      return (
        <FileAttachmentContent
          fileName={content}
          fileSize={message.fileSize || ""}
          timestamp={timestamp}
          fileType={message.fileType}
          fileUrl={message.fileUrl}
        />
      );
    }

    // Handle styles for text messages
    switch (style) {
      case MESSAGE_STYLES.SCALE:
        return (
          <ScaleInput
            content={content}
            timestamp={timestamp}
            onSelect={handleScaleSelect}
            disabled={disabled || isAnswered}
            selectedValue={typeof userResponse === "number" ? userResponse : undefined}
          />
        );

      case MESSAGE_STYLES.SINGLE:
        return (
          <SingleChoiceInput
            content={content}
            timestamp={timestamp}
            options={options}
            onSelect={handleSingleSelect}
            disabled={disabled || isAnswered}
            selectedValue={typeof userResponse === "string" ? userResponse : undefined}
          />
        );

      case MESSAGE_STYLES.MULTIPLE:
        return (
          <MultipleChoiceInput
            content={content}
            options={options ?? []}
            timestamp={timestamp}
            onConfirm={handleMultipleConfirm}
            disabled={disabled || isAnswered}
            selectedValues={Array.isArray(userResponse) ? userResponse : undefined}
          />
        );

      case MESSAGE_STYLES.SUMMARY:
        if (summaryPresentation) {
          return (
            <SummaryCard
              summaryPresentation={summaryPresentation}
              timestamp={timestamp}
              onDownload={handleSummaryDownload}
            />
          );
        }
        return <ChatMessage message={content} sender={sender} timestamp={timestamp} />;

      case MESSAGE_STYLES.EMERGENCY:
        return (
          <EmergencyAlert
            content={content}
            timestamp={timestamp}
          />
        );

      case MESSAGE_STYLES.EXAM:
        return (
          <ExamContent
            content={content}
            timestamp={timestamp}
            attachments={attachments}
          />
        );

      case MESSAGE_STYLES.SEARCH_MEDICAL_SERVICE:
        return (
          <SearchMedicalServiceButton
            content={content}
            specialty={specialty}
            timestamp={timestamp}
          />
        );

      case MESSAGE_STYLES.TELEMEDICINE:
        return <TelemedicineOption content={content} timestamp={timestamp} />;

      default:
        return <ChatMessage message={content} sender={sender} timestamp={timestamp} />;
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        gap: { xs: 1.5, md: 2 },
        flexDirection: isUserMessage ? "row-reverse" : "row",
        alignItems: "flex-start",
      }}
    >
      <Tooltip title={getDisplayName()} arrow placement="top">
        <Avatar
          sx={{
            width: { xs: 32, md: 40 },
            height: { xs: 32, md: 40 },
            bgcolor: avatarConfig.bgcolor,
            color: avatarConfig.color,
            fontSize: { xs: "12px", md: "14px" },
            fontWeight: 600,
            border: sender !== "user" && !avatarConfig.isCustomSvg ? 1 : 0,
            borderColor: avatarConfig.borderColor,
            flexShrink: 0,
            overflow: avatarConfig.isCustomSvg ? "visible" : "hidden",
            "& svg": avatarConfig.isCustomSvg ? {
              width: { xs: 32, md: 40 },
              height: { xs: 32, md: 40 },
            } : {},
          }}
        >
          {avatarConfig.content}
        </Avatar>
      </Tooltip>

      <Box
        sx={{
          maxWidth: { xs: "calc(100% - 44px)", md: "600px" },
          display: "flex",
          flexDirection: "column",
          alignItems: isUserMessage ? "flex-end" : "flex-start",
          gap: 1,
        }}
      >
        {renderMessageContent()}
      </Box>
    </Box>
  );
}
