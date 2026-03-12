"use client";

import { useState, useCallback, useMemo } from "react";
import {
  Box,
  Typography,
  Chip,
  Collapse,
  IconButton,
  Tooltip,
  Button,
  Skeleton,
  useMediaQuery,
} from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import { HeartMonitorIcon, PillsIcon, AllergyIcon } from "./icons";
import { HealthDataDialog } from "./HealthDataDialog";
import { usePatientData } from "@/shared/hooks/usePatientData";
import type { ChronicCondition } from "./hooks/useChronicConditionsSearch";
import type { Medication } from "./hooks/useMedicationsSearch";
import { useCollapsibleOnMobile } from "@/shared/hooks/useCollapsibleOnMobile";

export interface HealthDataCardProps {
  showEmptyState?: boolean;
  collapsible?: boolean;
  className?: string;
}

export function HealthDataCard({
  showEmptyState = true,
  collapsible = true,
  className,
}: HealthDataCardProps) {
  const { expanded, handleToggle, isContentVisible } = useCollapsibleOnMobile({
    collapsible,
  });
  const [dialogOpen, setDialogOpen] = useState(false);
    const isMobile = useMediaQuery((theme) => theme.breakpoints.down("sm"));

  const { data: patientData, isLoading, refetch } = usePatientData();

  const conditions = useMemo(
    () => patientData?.chronicConditions?.map((c) => c.name) ?? [],
    [patientData?.chronicConditions]
  );

  const medications = useMemo(
    () => patientData?.medications?.map((m) => m.name) ?? [],
    [patientData?.medications]
  );

  const allergies = useMemo(() => {
    if (!patientData?.allergies || patientData.allergies.trim() === "") {
      return [];
    }
    return [patientData.allergies];
  }, [patientData?.allergies]);

  const hasHealthData = conditions.length > 0 || medications.length > 0 || allergies.length > 0;

  const initialDialogData = useMemo(() => {
    const transformedConditions: ChronicCondition[] = conditions.map((name, index) => ({
      id: `condition-${index}`,
      name,
    }));

    const transformedMedications: Medication[] = medications.map((name, index) => ({
      id: `medication-${index}`,
      name,
      activePrinciple: "",
    }));

    return {
      conditions: transformedConditions,
      medications: transformedMedications,
      allergies: allergies.join(", "),
    };
  }, [conditions, medications, allergies]);

  const handleOpenDialog = useCallback(() => {
    setDialogOpen(true);
  }, []);

  const handleCloseDialog = useCallback(() => {
    setDialogOpen(false);
  }, []);

  const handleDialogSuccess = useCallback(() => {
    refetch();
  }, [refetch]);

  const sections = [
    {
      icon: <HeartMonitorIcon sx={{ fontSize: 20, color: "primary.main" }} />,
      title: "Condições pré-existentes",
      items: conditions,
    },
    {
      icon: <PillsIcon sx={{ fontSize: 20, color: "primary.main" }} />,
      title: "Medicamentos em uso",
      items: medications,
    },
    {
      icon: <AllergyIcon sx={{ fontSize: 20, color: "primary.main" }} />,
      title: "Alergias",
      items: allergies,
    },
  ];

  if (isLoading) {
    return (
      <Box
        className={className}
        sx={{
          width: "100%",
          bgcolor: "background.paper",
          borderRadius: { xs: "16px", md: "8px" },
          border: { xs: 1, md: "none" },
          borderColor: { xs: "divider", md: "transparent" },
          boxShadow: "0 8px 20px rgba(0, 0, 0, 0.03)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Box sx={{ p: { xs: "16px 20px", md: "12px 24px 0 24px" } }}>
          <Skeleton variant="text" width={120} height={24} />
        </Box>
        <Box sx={{ width: "100%", height: "1px", bgcolor: "divider" }} />
        <Box sx={{ p: { xs: "20px", md: "24px" } }}>
          <Skeleton variant="rectangular" height={100} sx={{ borderRadius: 1 }} />
        </Box>
      </Box>
    );
  }

  if (showEmptyState && !hasHealthData) {
    return (
      <>
        <Box
          className={className}
          sx={{
            width: "100%",
            bgcolor: "background.paper",
            borderRadius: { xs: "16px", md: "8px" },
            border: { xs: 1, md: "none" },
            borderColor: { xs: "divider", md: "transparent" },
            boxShadow: "0 8px 20px rgba(0, 0, 0, 0.03)",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Box
            sx={{
              p: { xs: "16px 20px", md: "12px 24px 0 24px" },
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Typography
              sx={{
                fontSize: { xs: "15px", md: "14px" },
                fontWeight: 600,
                lineHeight: "24px",
                letterSpacing: "-0.4px",
                pb: { xs: 0, md: "12px" },
              }}
            >
              Dados de saúde
            </Typography>
          </Box>

          <Box sx={{ width: "100%", height: "1px", bgcolor: "divider" }} />

          <Box
            sx={{
              p: { xs: "20px", md: "24px" },
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 2,
              textAlign: "center",
            }}
          >
            <Typography sx={{ color: "text.secondary", fontSize: "14px", lineHeight: 1.5 }}>
              Preencha seus dados de saúde para que possamos oferecer um atendimento mais personalizado e seguro.
            </Typography>
            <Button variant="contained" color="primary" onClick={handleOpenDialog} sx={{ mt: 1 }}>
              Preencher dados de saúde
            </Button>
          </Box>
        </Box>

        <HealthDataDialog open={dialogOpen} onClose={handleCloseDialog} onSuccess={handleDialogSuccess} />
      </>
    );
  }

  return (
    <>
      <Box
        className={className}
        sx={{
          width: "100%",
          bgcolor: "background.paper",
          borderRadius: { xs: "16px", md: "8px" },
          border: { xs: 1, md: "none" },
          borderColor: { xs: "divider", md: "transparent" },
          boxShadow: "0 8px 20px rgba(0, 0, 0, 0.03)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Box
          onClick={handleToggle}
          sx={{
            p: { xs: "16px 20px", md: "12px 24px 0 24px" },
            cursor: collapsible && isMobile ? "pointer" : "default",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Typography
            sx={{
              fontSize: { xs: "15px", md: "14px" },
              fontWeight: 600,
              lineHeight: "24px",
              letterSpacing: "-0.4px",
              pb: { xs: 0, md: "12px" },
            }}
          >
            Dados de saúde
          </Typography>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1, pb: { xs: 0, md: "12px" } }}>
            <Tooltip title="Atualizar dados de saúde" arrow>
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenDialog();
                }}
                sx={{ color: "text.secondary", "&:hover": { color: "primary.main" } }}
                aria-label="Atualizar dados de saúde"
              >
                <EditOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>

            {collapsible && (
              <Box sx={{ display: { xs: "flex", lg: "none" } }}>
                <IconButton
                  size="small"
                  sx={{
                    transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
                    transition: "transform 0.3s ease",
                  }}
                >
                  <KeyboardArrowDownIcon sx={{ color: "grey.600" }} />
                </IconButton>
              </Box>
            )}
          </Box>
        </Box>

        <Collapse in={isContentVisible} timeout="auto">
          <Box sx={{ width: "100%", height: "1px", bgcolor: "divider" }} />

          <Box
            sx={{
              p: { xs: "20px", md: "24px 24px 24px 24px" },
              display: "flex",
              flexDirection: "column",
              gap: { xs: "20px", md: "24px" },
            }}
          >
            {sections.map((section, sectionIndex) => (
              <Box key={sectionIndex} sx={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  {section.icon}
                  <Typography sx={{ color: "grey.800", fontSize: "14px" }}>{section.title}</Typography>
                </Box>

                {section.items.length > 0 ? (
                  <Box sx={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    {section.items.map((item, itemIndex) => (
                      <Chip key={itemIndex} label={item} color="secondary" variant="filled" />
                    ))}
                  </Box>
                ) : (
                  <Typography sx={{ color: "grey.800", fontSize: "13px", fontStyle: "italic" }}>
                    Nenhum registro
                  </Typography>
                )}
              </Box>
            ))}
          </Box>
        </Collapse>
      </Box>

      <HealthDataDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        initialData={initialDialogData}
        onSuccess={handleDialogSuccess}
      />
    </>
  );
}
