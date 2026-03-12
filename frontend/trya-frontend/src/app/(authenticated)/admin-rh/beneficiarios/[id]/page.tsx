"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Box,
  Typography,
  Paper,
  IconButton,
  CircularProgress,
  Alert,
  Chip,
  Snackbar,
} from "@mui/material";
import { beneficiaryService } from "../services/beneficiaryService";
import type { Beneficiary, BeneficiaryDependent } from "../types/beneficiary";
import { BeneficiaryModal } from "../form-components";
import { tenantService } from "../services/tenantService";
import { healthOperatorService } from "../services/healthOperatorService";

const BackIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M19.2858 10H0.714355" stroke="#4A6060" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M5.71436 5L0.714355 10L5.71436 15" stroke="#4A6060" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const EditIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g clipPath="url(#clip0_edit)">
      <path d="M0.642944 17.3571H14.7858" stroke="currentColor" strokeWidth="0.75" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8.35714 12.8571L4.5 13.5514L5.14286 9.64286L13.7957 1.01572C13.9152 0.895211 14.0574 0.799561 14.2141 0.734287C14.3708 0.669013 15.5388 0.635406 14.7086 0.635406C14.8783 0.635406 15.0464 0.669013 15.203 0.734287C15.3597 0.799561 15.5019 0.895211 15.6214 1.01572L16.9843 2.37858C17.1048 2.4981 17.2004 2.6403 17.2657 2.79698C17.331 2.95365 17.3646 3.1217 17.3646 3.29143C17.3646 3.46116 17.331 3.62921 17.2657 3.78589C17.2004 3.94256 17.1048 4.08477 16.9843 4.20429L8.35714 12.8571Z" stroke="currentColor" strokeWidth="0.75" strokeLinecap="round" strokeLinejoin="round" />
    </g>
    <defs>
      <clipPath id="clip0_edit"><rect width="18" height="18" fill="white" /></clipPath>
    </defs>
  </svg>
);

function formatDate(dateString?: string | Date | null): string {
  if (!dateString) return "-";
  const str = typeof dateString === "string" ? dateString : dateString.toISOString();
  if (str.includes("T")) {
    const [datePart] = str.split("T");
    const [year, month, day] = datePart.split("-");
    return `${day}/${month}/${year}`;
  }
  if (str.includes("-")) {
    const [year, month, day] = str.split("-");
    return `${day}/${month}/${year}`;
  }
  return str;
}

function formatCPF(cpf?: string | null): string {
  if (!cpf) return "-";
  const clean = cpf.replace(/\D/g, "");
  if (clean.length === 11) {
    return clean.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  }
  return cpf;
}

function formatGender(gender?: string | null): string {
  if (!gender) return "-";
  if (gender === "M" || gender === "Masculino") return "Masculino";
  if (gender === "F" || gender === "Feminino") return "Feminino";
  return gender;
}

interface InfoFieldProps {
  label: string;
  value: string;
}

function InfoField({ label, value }: InfoFieldProps) {
  return (
    <Box>
      <Typography sx={{ fontSize: "16px", fontWeight: 400, lineHeight: "26px", mb: 0.5 }}>
        {label}
      </Typography>
      <Typography sx={{ fontWeight: 600, fontSize: "16px" }}>
        {value}
      </Typography>
    </Box>
  );
}

interface DependentCardProps {
  dependent: BeneficiaryDependent;
  onEdit: (dep: BeneficiaryDependent) => void;
}

function DependentCard({ dependent, onEdit }: DependentCardProps) {
  return (
    <Box
      sx={{
        bgcolor: "#F0F4F4",
        borderRadius: "8px",
        p: 2.5,
        position: "relative",
      }}
    >
      <IconButton
        size="small"
        onClick={() => onEdit(dependent)}
        sx={{ position: "absolute", top: 12, right: 12 }}
      >
        <EditIcon />
      </IconButton>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
          gap: 2,
        }}
      >
        <InfoField label="Nome completo:" value={dependent.name} />
        <InfoField label="CPF:" value={formatCPF(dependent.cpf)} />
        <InfoField label="Data de nascimento:" value={formatDate(dependent.birthDate)} />
        <InfoField label="Gênero" value={formatGender(dependent.gender)} />
        <InfoField label="Matrícula" value={dependent.memberId || "-"} />
        <InfoField label="Tipo" value={dependent.type || "-"} />
      </Box>
    </Box>
  );
}

export default function BeneficiaryDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [beneficiary, setBeneficiary] = useState<Beneficiary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDependent, setEditingDependent] = useState<BeneficiaryDependent | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [companies, setCompanies] = useState<Array<{ id: string; name: string }>>([]);
  const [healthOperators, setHealthOperators] = useState<Array<{ id: string; name: string }>>([]);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);
    beneficiaryService.getById(id)
      .then(setBeneficiary)
      .catch((err) => setError(err instanceof Error ? err.message : "Erro ao carregar dados"))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    Promise.all([tenantService.listActive(), healthOperatorService.list()])
      .then(([tenants, operators]) => {
        setCompanies(tenants.map((t) => ({ id: t.id, name: t.name })));
        setHealthOperators(operators.map((o) => ({ id: o.id, name: o.name })));
      })
      .catch(() => {});
  }, []);

  const handleOpenEditModal = () => {
    setEditingDependent(null);
    setIsModalOpen(true);
  };

  const handleEditDependent = (dep: BeneficiaryDependent) => {
    // Monta um Beneficiary parcial para o modal de edição
    const depAsBeneficiary: Beneficiary = {
      id: dep.id,
      name: dep.name,
      cpf: dep.cpf || "",
      email: dep.email || "",
      active: dep.isActive,
      dateOfBirth: typeof dep.birthDate === "string" ? dep.birthDate : dep.birthDate?.toISOString?.()?.split("T")[0] || "",
      gender: dep.gender as any,
      memberId: dep.memberId || "",
      type: dep.type,
    };
    setEditingDependent(dep);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingDependent(null);
  };

  const handleSaveBeneficiary = async (data: Partial<Beneficiary>) => {
    const targetId = editingDependent ? editingDependent.id : id;
    if (!targetId) return;

    try {
      let birthDate = data.dateOfBirth;
      if (birthDate) {
        const date = new Date(birthDate);
        if (!isNaN(date.getTime())) {
          birthDate = date.toISOString().split("T")[0];
        }
      }

      const updateData = {
        name: data.name,
        birthDate,
        gender: data.gender,
        memberId: (data as any).memberId,
        dependentType: data.beneficiaryType,
      };

      await beneficiaryService.update(targetId, updateData);
      const updated = await beneficiaryService.getById(id);
      setBeneficiary(updated);
      setSuccessMessage("Beneficiário atualizado com sucesso!");
      setTimeout(() => handleCloseModal(), 100);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro ao atualizar beneficiário";
      setErrorMessage(message);
      throw err;
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !beneficiary) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error || "Beneficiário não encontrado"}</Alert>
      </Box>
    );
  }

  // Monta o beneficiário para o modal de edição (titular ou dependente)
  const beneficiaryForModal: Beneficiary = editingDependent
    ? {
        id: editingDependent.id,
        name: editingDependent.name,
        cpf: editingDependent.cpf || "",
        email: editingDependent.email || "",
        active: editingDependent.isActive,
        dateOfBirth: typeof editingDependent.birthDate === "string"
          ? editingDependent.birthDate
          : (editingDependent.birthDate as Date)?.toISOString?.()?.split("T")[0] || "",
        gender: editingDependent.gender as any,
        memberId: editingDependent.memberId || "",
      }
    : beneficiary;

  const hasDependents = beneficiary.dependents && beneficiary.dependents.length > 0;

  return (
    <Box sx={{ width: "100%", minHeight: "100vh", py: 4, px: { xs: 2, sm: 3, md: 4 } }}>
      <Box sx={{ maxWidth: "1200px", mx: "auto" }}>
        <Paper sx={{ borderRadius: "12px", boxShadow: "0px 1px 3px rgba(0,0,0,0.1)", overflow: "hidden" }}>
          {/* Header */}
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", px: 3, py: 2.5, borderBottom: "1px solid #E5E7EB" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <IconButton
                onClick={() => router.back()}
                sx={{ width: 40, height: 40, borderRadius: "8px", border: "1px solid #D4DEDE", color: "#4A6060" }}
              >
                <BackIcon />
              </IconButton>
              <Typography sx={{ fontWeight: 700, fontSize: "24px" }}>
                {beneficiary.name}
              </Typography>
            </Box>
            <Chip
              label={beneficiary.active ? "Ativo" : "Inativo"}
              color={beneficiary.active ? "success" : "default"}
            />
          </Box>

          {/* Dados gerais */}
          <Box sx={{ p: 3 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
              <Typography sx={{ fontWeight: 600, fontSize: "18px" }}>
                Dados gerais do beneficiário
              </Typography>
              <IconButton size="small" onClick={handleOpenEditModal}>
                <EditIcon />
              </IconButton>
            </Box>

            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" }, gap: 3 }}>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <InfoField label="Nome completo:" value={beneficiary.name} />
                <InfoField label="Gênero" value={formatGender(beneficiary.gender)} />
                <InfoField label="Empresa vinculada:" value={companies.find((c) => c.id === beneficiary.tenantId)?.name || "-"} />
              </Box>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <InfoField label="CPF:" value={formatCPF(beneficiary.cpf)} />
                <InfoField label="Matrícula" value={beneficiary.memberId || "-"} />
                <InfoField label="Operadora:" value={beneficiary.operatorName || "-"} />
              </Box>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <InfoField label="Data de nascimento:" value={formatDate(beneficiary.dateOfBirth)} />
                <InfoField label="Tipo" value={beneficiary.type || "-"} />
                <InfoField label="Plano de saúde:" value={beneficiary.planName || "-"} />
              </Box>
            </Box>
          </Box>

          {/* Dependentes */}
          {hasDependents && (
            <Box sx={{ px: 3, pb: 3 }}>
              <Typography sx={{ fontWeight: 600, fontSize: "18px", mb: 2 }}>
                Dependentes vinculados
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {beneficiary.dependents!.map((dep) => (
                  <DependentCard key={dep.id} dependent={dep} onEdit={handleEditDependent} />
                ))}
              </Box>
            </Box>
          )}
        </Paper>
      </Box>

      <BeneficiaryModal
        open={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSaveBeneficiary}
        beneficiary={beneficiaryForModal}
        mode="edit"
        companies={companies}
        healthOperators={healthOperators}
      />

      <Snackbar open={!!successMessage} autoHideDuration={4000} onClose={() => setSuccessMessage(null)} anchorOrigin={{ vertical: "top", horizontal: "center" }}>
        <Alert onClose={() => setSuccessMessage(null)} severity="success" sx={{ width: "100%" }}>
          {successMessage}
        </Alert>
      </Snackbar>

      <Snackbar open={!!errorMessage} autoHideDuration={6000} onClose={() => setErrorMessage(null)} anchorOrigin={{ vertical: "top", horizontal: "center" }}>
        <Alert onClose={() => setErrorMessage(null)} severity="error" sx={{ width: "100%" }}>
          {errorMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}
