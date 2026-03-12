"use client";

import { ReactNode } from "react";
import { Box, Button, Paper, Typography } from "@mui/material";
import { useRouter } from "next/navigation";
import BackButton from "@/shared/components/BackButton";
import { useTenantAssets } from "@/shared/context/TenantThemeProvider";
import { getUrlWithTenant } from "@/shared/utils/tenantUtils";
import type { FamilyMember } from "@/app/(authenticated)/paciente/gestao-familiar/documentos/types/document.types";

type FamilyTab = "dashboard" | "timeline" | "documentos" | "insights";

interface FamilyManagementLayoutProps {
  activeTab: FamilyTab;
  members: FamilyMember[];
  selectedMemberId: string;
  onSelectMember: (memberId: string) => void;
  children: ReactNode;
}

const TAB_ITEMS: Array<{ key: FamilyTab; label: string; route: string }> = [
  { key: "dashboard", label: "Dashboard", route: "/paciente/gestao-familiar" },
  { key: "timeline", label: "Timeline", route: "/paciente/gestao-familiar/timeline" },
  { key: "documentos", label: "Documentos", route: "/paciente/gestao-familiar/documentos" },
  { key: "insights", label: "Insights", route: "/paciente/gestao-familiar/insights" },
];

function getMemberRoleLabel(type: string) {
  switch (type) {
    case "SELF":
      return "Eu";
    case "SPOUSE":
      return "Cônjuge";
    case "CHILD":
      return "Filho(a)";
    case "STEPCHILD":
      return "Enteado(a)";
    default:
      return type;
  }
}

export function FamilyManagementLayout({
  activeTab,
  members,
  selectedMemberId,
  onSelectMember,
  children,
}: FamilyManagementLayoutProps) {
  const router = useRouter();
  const { tenant } = useTenantAssets();

  const handleNavigate = (route: string) => {
    router.push(getUrlWithTenant(route, tenant));
  };

  return (
    <Box
      sx={{
        px: { xs: 2, md: 3 },
        py: 2,
        display: "grid",
        gridTemplateColumns: { xs: "1fr", lg: "260px 1fr" },
        gap: 3,
      }}
    >
      <Box>
        <BackButton />
        <Paper
          sx={{
            mt: 2,
            p: 2,
            borderRadius: "10px",
            border: "1px solid #E6EEF0",
            bgcolor: "#F9FCFD",
          }}
        >
          <Typography sx={{ fontSize: 13, fontWeight: 700, mb: 1.5 }}>
            Membros da família
          </Typography>

          <Button
            fullWidth
            onClick={() => members[0] && onSelectMember(members[0].id)}
            sx={{
              justifyContent: "flex-start",
              textTransform: "none",
              borderRadius: "8px",
              mb: 1,
              px: 1.5,
              py: 1.1,
              border: "1px solid #DCE9ED",
              color: "#0E1F24",
            }}
          >
            <Box sx={{ textAlign: "left" }}>
              <Typography sx={{ fontSize: 12.5, fontWeight: 700 }}>
                Visão geral da família
              </Typography>
              <Typography sx={{ fontSize: 11, color: "#5E6D72" }}>
                {members.length} membro(s) cadastrado(s)
              </Typography>
            </Box>
          </Button>

          {members.map((member) => {
            const selected = selectedMemberId === member.id;
            return (
              <Button
                key={member.id}
                fullWidth
                onClick={() => onSelectMember(member.id)}
                sx={{
                  justifyContent: "space-between",
                  textTransform: "none",
                  borderRadius: "8px",
                  mb: 1,
                  px: 1.5,
                  py: 1.1,
                  border: selected ? "1px solid #B9DDE8" : "1px solid #E5EEF1",
                  bgcolor: selected ? "#DDF2F8" : "#FFFFFF",
                  color: "#0E1F24",
                }}
              >
                <Box sx={{ textAlign: "left" }}>
                  <Typography sx={{ fontSize: 12.5, fontWeight: 700 }}>
                    {member.name}
                  </Typography>
                  <Typography sx={{ fontSize: 11, color: "#5E6D72" }}>
                    {getMemberRoleLabel(member.type)}
                  </Typography>
                </Box>
                <Typography sx={{ color: "#4D5F65" }}>{">"}</Typography>
              </Button>
            );
          })}
        </Paper>
      </Box>

      <Box>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: { xs: 1, md: 2.5 },
            borderBottom: "1px solid #D9E4E8",
            mb: 2,
            overflowX: "auto",
            whiteSpace: "nowrap",
          }}
        >
          {TAB_ITEMS.map((tab) => {
            const selected = tab.key === activeTab;
            return (
              <Button
                key={tab.key}
                onClick={() => handleNavigate(tab.route)}
                sx={{
                  minWidth: "fit-content",
                  px: 0.5,
                  py: 1.2,
                  borderRadius: 0,
                  textTransform: "none",
                  fontSize: 12,
                  color: selected ? "#092C35" : "#6A7B80",
                  fontWeight: selected ? 700 : 500,
                  borderBottom: selected
                    ? "2px solid #0C4B5B"
                    : "2px solid transparent",
                }}
              >
                {tab.label}
              </Button>
            );
          })}
        </Box>

        {children}
      </Box>
    </Box>
  );
}
