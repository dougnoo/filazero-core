"use client";

import { useEffect, useState } from "react";
import { Box, Paper, Typography } from "@mui/material";
import { FamilyManagementLayout } from "@/app/(authenticated)/paciente/components/FamilyManagementLayout";
import { documentService } from "../documentos/services/documentService";
import type { FamilyMember } from "../documentos/types/document.types";

const insightBlocks = [
  {
    title: "Tendências e comparações",
    description:
      "Compare indicadores de saúde entre os membros da família e identifique sinais de atenção.",
    bg: "#E8F6EC",
  },
  {
    title: "Recomendações personalizadas",
    description:
      "Sugestões com base nos dados registrados para apoiar prevenção e acompanhamento contínuo.",
    bg: "#E9F3FB",
  },
  {
    title: "Lembretes inteligentes",
    description:
      "Alertas sobre rotina de exames, vacinação e acompanhamentos recorrentes.",
    bg: "#F6F2D8",
  },
];

export default function InsightsPage() {
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [selectedMemberId, setSelectedMemberId] = useState("");

  useEffect(() => {
    const loadMembers = async () => {
      try {
        const response = await documentService.getMembers();
        setMembers(response.members);
        if (response.members[0]) {
          setSelectedMemberId(response.members[0].id);
        }
      } catch (err) {
        console.error("Erro ao carregar membros", err);
      }
    };
    loadMembers();
  }, []);

  return (
    <FamilyManagementLayout
      activeTab="insights"
      members={members}
      selectedMemberId={selectedMemberId}
      onSelectMember={setSelectedMemberId}
    >
      <Box sx={{ display: "grid", gap: 1.5 }}>
        {insightBlocks.map((item) => (
          <Paper
            key={item.title}
            sx={{ p: 2, borderRadius: "10px", bgcolor: item.bg, border: "1px solid #DDE8EB" }}
          >
            <Typography sx={{ fontSize: 13, fontWeight: 700, mb: 0.5 }}>
              {item.title}
            </Typography>
            <Typography sx={{ fontSize: 12, color: "#3D4E53" }}>
              {item.description}
            </Typography>
          </Paper>
        ))}
      </Box>
    </FamilyManagementLayout>
  );
}
