"use client";

import { useState, useEffect } from "react";
import {
  Box,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs, { Dayjs } from "dayjs";
import type { Beneficiary, BeneficiaryType, BeneficiaryGender } from "../types/beneficiary";
import { healthPlanService } from "../services/healthPlanService";

interface BeneficiaryFormProps {
  beneficiary?: Beneficiary | null;
  onSubmit: (data: Partial<Beneficiary>) => void;
  companies?: Array<{ id: string; name: string }>;
  healthOperators?: Array<{ id: string; name: string }>;
  mode?: "add" | "edit";
  hasImportFile?: boolean;
}

export default function BeneficiaryForm({
  beneficiary,
  onSubmit,
  companies = [],
  healthOperators = [],
  mode = "add",
  hasImportFile = false,
}: BeneficiaryFormProps) {
  const [formData, setFormData] = useState<Partial<Beneficiary>>({
    name: beneficiary?.name || "",
    cpf: beneficiary?.cpf || "",
    dateOfBirth: beneficiary?.dateOfBirth || "",
    gender: beneficiary?.gender || undefined,
    memberId: beneficiary?.memberId || "",
    beneficiaryType: beneficiary?.beneficiaryType || undefined,
    planId: beneficiary?.planId || "",
    tenantId: beneficiary?.tenantId || "",
  });

  const [operatorId, setOperatorId] = useState<string>("");
  const [healthPlans, setHealthPlans] = useState<Array<{ id: string; name: string }>>([]);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [hasUserInput, setHasUserInput] = useState(false);

  // Função para formatar CPF
  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 11) {
      return numbers
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    }
    return value;
  };

  // Quando o beneficiário muda (modo edição), atualiza o formData e carrega operadora/plano
  useEffect(() => {
    if (beneficiary) {
      // Formata CPF se necessário
      let formattedCpf = beneficiary.cpf || "";
      if (formattedCpf && !formattedCpf.includes(".")) {
        formattedCpf = formatCPF(formattedCpf);
      }
      
      setFormData({
        name: beneficiary.name || "",
        cpf: formattedCpf,
        dateOfBirth: beneficiary.dateOfBirth || "",
        gender: beneficiary.gender || undefined,
        memberId: beneficiary.memberId || "",
        beneficiaryType: beneficiary.beneficiaryType || undefined,
        planId: "", // Será definido depois que os planos carregarem
        tenantId: beneficiary.tenantId || "",
      });

      // Se o beneficiário tem operatorId, verifica se existe na lista antes de usar
      // Caso contrário, tenta encontrar pelo operatorName
      if (beneficiary.operatorId) {
        const operatorExists = healthOperators.some(
          (op) => op.id === beneficiary.operatorId
        );
        if (operatorExists) {
          setOperatorId(beneficiary.operatorId);
        } else if (healthOperators.length > 0) {
          // Se não encontrou pelo ID, tenta pelo nome
          const operator = healthOperators.find(
            (op) => op.name === beneficiary.operatorName
          );
          if (operator) {
            setOperatorId(operator.id);
          }
        }
      } else if (beneficiary.operatorName && healthOperators.length > 0) {
        const operator = healthOperators.find(
          (op) => op.name === beneficiary.operatorName
        );
        if (operator) {
          setOperatorId(operator.id);
        }
      }
    } else {
      // Limpa os dados quando não há beneficiário
      setFormData({
        name: "",
        cpf: "",
        dateOfBirth: "",
        gender: undefined,
        memberId: "",
        beneficiaryType: undefined,
        planId: "",
        tenantId: "",
      });
      setOperatorId("");
      setHealthPlans([]);
    }
  }, [beneficiary, healthOperators]);

  // Busca planos quando uma operadora é selecionada
  useEffect(() => {
    const loadPlans = async () => {
      if (!operatorId) {
        setHealthPlans([]);
        setFormData((prev) => ({ ...prev, planId: "" }));
        return;
      }

      try {
        setLoadingPlans(true);
        console.log("[BeneficiaryForm] Carregando planos para operadora:", operatorId);
        const plans = await healthPlanService.list(operatorId);
        console.log("[BeneficiaryForm] Planos recebidos:", plans);
        const planOptions = plans.map((plan) => ({
          id: plan.id,
          name: plan.name,
        }));
        setHealthPlans(planOptions);
        
        // Se o beneficiário já tem um planId e ele está na lista de planos, mantém selecionado
        const beneficiaryPlanId = beneficiary?.planId;
        if (beneficiaryPlanId) {
          const planExists = planOptions.some((plan) => plan.id === beneficiaryPlanId);
          if (planExists) {
            setFormData((prev) => ({ ...prev, planId: beneficiaryPlanId }));
          } else {
            setFormData((prev) => ({ ...prev, planId: "" }));
          }
        } else {
          setFormData((prev) => ({ ...prev, planId: "" }));
        }
      } catch (error) {
        setHealthPlans([]);
        setFormData((prev) => ({ ...prev, planId: "" }));
      } finally {
        setLoadingPlans(false);
      }
    };

    loadPlans();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [operatorId]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Mark that user has started filling the form
    if (value && value.trim()) {
      setHasUserInput(true);
    }
    // Limpa o erro do campo quando o usuário começa a digitar
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Skip validation if in add mode with import file and no user input
    if (mode === "add" && hasImportFile && !hasUserInput) {
      return true;
    }

    if (!formData.name?.trim()) {
      newErrors.name = "Nome é obrigatório";
    }

    if (!formData.cpf?.trim()) {
      newErrors.cpf = "CPF é obrigatório";
    } else {
      // Remove formatação para validar
      const cleanCpf = formData.cpf.replace(/\D/g, "");
      // Valida se tem 11 dígitos
      if (cleanCpf.length !== 11) {
        newErrors.cpf = "CPF inválido";
      }
    }

    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = "Data de nascimento é obrigatória";
    }

    if (!formData.memberId?.trim()) {
      newErrors.memberId = "Matrícula é obrigatória";
    }

    if (!formData.tenantId?.trim()) {
      newErrors.tenantId = "Empresa é obrigatória";
    }

    if (!formData.beneficiaryType) {
      newErrors.beneficiaryType = "Tipo é obrigatório";
    }

    // No modo de edição, operadora e plano não são obrigatórios
    if (mode === "add") {
      if (!operatorId?.trim()) {
        newErrors.operatorId = "Operadora é obrigatória";
      }

      if (!formData.planId?.trim()) {
        newErrors.planId = "Plano de saúde é obrigatório";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const isFieldRequired = mode === "edit" || !hasImportFile || hasUserInput;

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 3,
      }}
    >
      {/* Nome completo */}
      <TextField
        fullWidth
        label="Nome completo"
        value={formData.name}
        onChange={(e) => handleChange("name", e.target.value)}
        error={!!errors.name}
        helperText={errors.name}
        required={isFieldRequired}
        placeholder="Nome completo"
        sx={{
          "& .MuiOutlinedInput-root": {
            borderRadius: "8px",
          },
        }}
      />

      {/* CPF e Data de nascimento */}
      <Box sx={{ display: "flex", gap: 2 }}>
        <TextField
          fullWidth
          label="CPF"
          value={formData.cpf}
          onChange={(e) => handleChange("cpf", formatCPF(e.target.value))}
          error={!!errors.cpf}
          helperText={errors.cpf}
          required={isFieldRequired}
          placeholder="CPF"
          disabled={mode === "edit"}
          slotProps={{
            htmlInput: { maxLength: 14 }
          }}
          sx={{
            flex: 1,
            "& .MuiOutlinedInput-root": {
              borderRadius: "8px",
            },
          }}
        />
        <DatePicker
          value={formData.dateOfBirth ? dayjs(formData.dateOfBirth) : null}
          onChange={(newValue) => {
            handleChange("dateOfBirth", newValue ? dayjs(newValue).format("YYYY-MM-DD") : "");
          }}
          label="Data de nascimento"
          maxDate={dayjs()}
          slotProps={{
            textField: {
              fullWidth: true,
              required: isFieldRequired,
              error: !!errors.dateOfBirth,
              helperText: errors.dateOfBirth,
              sx: {
                flex: 1,
                "& .MuiOutlinedInput-root": {
                  borderRadius: "8px",
                },
              },
            },
          }}
        />
      </Box>

      {/* Gênero e Matrícula */}
      <Box sx={{ display: "flex", gap: 2 }}>
        <FormControl
          fullWidth
          sx={{
            flex: 1,
            "& .MuiOutlinedInput-root": {
              borderRadius: "8px",
            },
          }}
        >
          <InputLabel>Gênero</InputLabel>
          <Select
            value={formData.gender || ""}
            onChange={(e) => handleChange("gender", e.target.value as BeneficiaryGender)}
            label="Gênero"
          >
            <MenuItem value="M">Masculino</MenuItem>
            <MenuItem value="F">Feminino</MenuItem>
          </Select>
        </FormControl>
        <TextField
          fullWidth
          label="Matrícula"
          value={formData.memberId || ""}
          onChange={(e) => handleChange("memberId", e.target.value)}
          error={!!errors.memberId}
          helperText={errors.memberId}
          required={isFieldRequired}
          placeholder="Matrícula"
          sx={{
            flex: 1,
            "& .MuiOutlinedInput-root": {
              borderRadius: "8px",
            },
          }}
        />
      </Box>

      {/* Tipo e Empresa vinculada */}
      <Box sx={{ display: "flex", gap: 2 }}>
        <FormControl
          fullWidth
          error={!!errors.beneficiaryType}
          required={isFieldRequired}
          sx={{
            flex: 1,
            "& .MuiOutlinedInput-root": {
              borderRadius: "8px",
            },
          }}
        >
          <InputLabel>Tipo</InputLabel>
          <Select
            value={formData.beneficiaryType || ""}
            onChange={(e) => handleChange("beneficiaryType", e.target.value as BeneficiaryType)}
            label="Tipo"
          >
            <MenuItem value="SELF">Titular</MenuItem>
            <MenuItem value="SPOUSE">Cônjuge</MenuItem>
            <MenuItem value="CHILD">Filho/Filha</MenuItem>
            <MenuItem value="STEPCHILD">Enteado(a)</MenuItem>
          </Select>
          {errors.beneficiaryType && (
            <Box
              component="span"
              sx={{
                color: "#d32f2f",
                fontSize: "0.75rem",
                mt: "3px",
                mx: "14px",
              }}
            >
              {errors.beneficiaryType}
            </Box>
          )}
        </FormControl>
        <FormControl
          fullWidth
          error={!!errors.tenantId}
          required={isFieldRequired}
          sx={{
            flex: 1,
            "& .MuiOutlinedInput-root": {
              borderRadius: "8px",
            },
          }}
        >
          <InputLabel>Empresa vinculada</InputLabel>
          <Select
            value={formData.tenantId && companies.some(comp => comp.id === formData.tenantId) ? formData.tenantId : ""}
            onChange={(e) => handleChange("tenantId", e.target.value)}
            label="Empresa vinculada"
          >
            {companies.length === 0 ? (
              <MenuItem value="">Nenhuma empresa disponível</MenuItem>
            ) : (
              companies.map((company) => (
                <MenuItem key={company.id} value={company.id}>
                  {company.name}
                </MenuItem>
              ))
            )}
          </Select>
          {errors.tenantId && (
            <Box
              component="span"
              sx={{
                color: "#d32f2f",
                fontSize: "0.75rem",
                mt: "3px",
                mx: "14px",
              }}
            >
              {errors.tenantId}
            </Box>
          )}
        </FormControl>
      </Box>

      {/* Operadora e Plano de saúde */}
      <Box sx={{ display: "flex", gap: 2 }}>
        <FormControl
          fullWidth
          error={!!errors.operatorId}
          required={isFieldRequired && mode === "add"}
          sx={{
            flex: 1,
            "& .MuiOutlinedInput-root": { borderRadius: "8px" },
          }}
        >
          <InputLabel>Operadora vinculada</InputLabel>
          <Select
            value={operatorId && healthOperators.some(op => op.id === operatorId) ? operatorId : ""}
            onChange={(e) => {
              setOperatorId(e.target.value);
              setHasUserInput(true);
              if (errors.operatorId) {
                setErrors((prev) => {
                  const newErrors = { ...prev };
                  delete newErrors.operatorId;
                  return newErrors;
                });
              }
            }}
            label="Operadora vinculada"
          >
            {healthOperators.length === 0 ? (
              <MenuItem value="">Nenhuma operadora disponível</MenuItem>
            ) : (
              healthOperators.map((operator) => (
                <MenuItem key={operator.id} value={operator.id}>
                  {operator.name}
                </MenuItem>
              ))
            )}
          </Select>
          {errors.operatorId && (
            <Box component="span" sx={{ color: "#d32f2f", fontSize: "0.75rem", mt: "3px", mx: "14px" }}>
              {errors.operatorId}
            </Box>
          )}
        </FormControl>

        <FormControl
          fullWidth
          error={!!errors.planId}
          required={isFieldRequired && mode === "add"}
          disabled={!operatorId || loadingPlans}
          sx={{
            flex: 1,
            "& .MuiOutlinedInput-root": { borderRadius: "8px" },
          }}
        >
          <InputLabel>Plano vinculado</InputLabel>
          <Select
            value={formData.planId && healthPlans.some(plan => plan.id === formData.planId) ? formData.planId : ""}
            onChange={(e) => handleChange("planId", e.target.value)}
            label="Plano vinculado"
          >
            {loadingPlans ? (
              <MenuItem value="" disabled>Carregando planos...</MenuItem>
            ) : healthPlans.length === 0 ? (
              <MenuItem value="" disabled>
                {operatorId ? "Nenhum plano disponível" : "Selecione uma operadora primeiro"}
              </MenuItem>
            ) : (
              healthPlans.map((plan) => (
                <MenuItem key={plan.id} value={plan.id}>
                  {plan.name}
                </MenuItem>
              ))
            )}
          </Select>
          {errors.planId && (
            <Box component="span" sx={{ color: "#d32f2f", fontSize: "0.75rem", mt: "3px", mx: "14px" }}>
              {errors.planId}
            </Box>
          )}
        </FormControl>
      </Box>
    </Box>
  );
}

