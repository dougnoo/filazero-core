"use client";

import { useState, useEffect } from "react";
import {
  Box,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  InputAdornment,
  IconButton,
} from "@mui/material";
import type { Beneficiary } from "../types/beneficiary";
import { healthPlanService } from "../services/healthPlanService";

interface BeneficiaryFormProps {
  beneficiary?: Beneficiary | null;
  onSubmit: (data: Partial<Beneficiary>) => void;
  companies?: Array<{ id: string; name: string }>;
  healthOperators?: Array<{ id: string; name: string }>;
  mode?: "add" | "edit";
}

export default function BeneficiaryForm({
  beneficiary,
  onSubmit,
  companies = [],
  healthOperators = [],
  mode = "add",
}: BeneficiaryFormProps) {
  const [formData, setFormData] = useState<Partial<Beneficiary>>({
    name: beneficiary?.name || "",
    cpf: beneficiary?.cpf || "",
    dateOfBirth: beneficiary?.dateOfBirth || "",
    email: beneficiary?.email || "",
    phone: beneficiary?.phone || "",
    planId: beneficiary?.planId || "",
    tenantId: beneficiary?.tenantId || "",
  });

  const [operatorId, setOperatorId] = useState<string>("");
  const [healthPlans, setHealthPlans] = useState<Array<{ id: string; name: string }>>([]);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

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
        email: beneficiary.email || "",
        phone: beneficiary.phone || "",
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
        email: "",
        phone: "",
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
        const plans = await healthPlanService.list(operatorId);
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

  const validateEmail = (email: string): boolean => {
    // Regex mais robusta para validação de email
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    return emailRegex.test(email);
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Limpa o erro do campo quando o usuário começa a digitar
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleBlur = (field: string) => {
    // Validação em tempo real quando o campo perde o foco
    if (field === "email" && formData.email) {
      if (!validateEmail(formData.email)) {
        setErrors((prev) => ({
          ...prev,
          email: "E-mail inválido",
        }));
      }
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

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

    if (!formData.email?.trim()) {
      newErrors.email = "E-mail é obrigatório";
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "E-mail inválido";
    }

    if (!formData.tenantId?.trim()) {
      newErrors.tenantId = "Empresa é obrigatória";
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

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 11) {
      return numbers
        .replace(/(\d{2})(\d)/, "($1) $2")
        .replace(/(\d{5})(\d)/, "$1-$2");
    }
    return value;
  };

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
        required
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
          required
          placeholder="CPF"
          inputProps={{ maxLength: 14 }}
          sx={{
            flex: 1,
            "& .MuiOutlinedInput-root": {
              borderRadius: "8px",
            },
          }}
        />
        <TextField
          fullWidth
          type="date"
          label="Data de nascimento"
          value={formData.dateOfBirth}
          onChange={(e) => handleChange("dateOfBirth", e.target.value)}
          error={!!errors.dateOfBirth}
          helperText={errors.dateOfBirth}
          required
          slotProps={{
            inputLabel: { shrink: true },
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    edge="end"
                    onClick={(e) => {
                      e.preventDefault();
                      const input = e.currentTarget.closest(".MuiOutlinedInput-root")?.querySelector("input[type='date']") as HTMLInputElement;
                      if (input) {
                        if (typeof input.showPicker === "function") {
                          input.showPicker();
                        } else {
                          input.click();
                        }
                      }
                    }}
                  >
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <g clipPath="url(#clip0_5161_367)">
                        <path
                          d="M2.57146 4.28571C2.11681 4.28571 1.68077 4.46632 1.35928 4.78781C1.03779 5.1093 0.857178 5.54533 0.857178 5.99999V21.4286C0.857178 21.8832 1.03779 22.3193 1.35928 22.6407C1.68077 22.9622 2.11681 23.1428 2.57146 23.1428H21.4286C21.8833 23.1428 22.3193 22.9622 22.6408 22.6407C22.9623 22.3193 23.1429 21.8832 23.1429 21.4286V5.99999C23.1429 5.54533 22.9623 5.1093 22.6408 4.78781C22.3193 4.46632 21.8833 4.28571 21.4286 4.28571H18"
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M0.857178 11.1429H23.1429"
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M6 0.857147V7.71429"
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M18 0.857147V7.71429"
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M6 4.28571H14.5714"
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </g>
                      <defs>
                        <clipPath id="clip0_5161_367">
                          <rect width="24" height="24" fill="white" />
                        </clipPath>
                      </defs>
                    </svg>
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
          sx={{
            flex: 1,
            "& .MuiOutlinedInput-root": {
              borderRadius: "8px",
            },
            // Oculta o ícone nativo do input date
            "& input[type='date']::-webkit-calendar-picker-indicator": {
              display: "none",
            },
            "& input[type='date']::-webkit-inner-spin-button": {
              display: "none",
            },
          }}
        />
      </Box>

      {/* E-mail */}
      <TextField
        fullWidth
        type="email"
        label="E-mail"
        value={formData.email}
        onChange={(e) => handleChange("email", e.target.value)}
        onBlur={() => handleBlur("email")}
        error={!!errors.email}
        helperText={errors.email}
        required
        placeholder="E-mail"
        sx={{
          "& .MuiOutlinedInput-root": {
            borderRadius: "8px",
          },
        }}
      />

      {/* Telefone e Empresa vinculada */}
      <Box sx={{ display: "flex", gap: 2 }}>
        <TextField
          fullWidth
          label="Telefone"
          value={formData.phone}
          onChange={(e) => handleChange("phone", formatPhone(e.target.value))}
          placeholder="Telefone"
          inputProps={{ maxLength: 15 }}
          sx={{
            flex: 1,
            "& .MuiOutlinedInput-root": {
              borderRadius: "8px",
            },
          }}
        />
        <FormControl
          fullWidth
          error={!!errors.tenantId}
          required
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

      {/* Operadora vinculada */}
      <FormControl
        fullWidth
        error={!!errors.operatorId}
        required
        sx={{
          "& .MuiOutlinedInput-root": {
            borderRadius: "8px",
          },
        }}
      >
        <InputLabel>Operadora vinculada</InputLabel>
        <Select
          value={operatorId && healthOperators.some(op => op.id === operatorId) ? operatorId : ""}
          onChange={(e) => {
            setOperatorId(e.target.value);
            // Limpa o erro quando seleciona uma operadora
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
          <Box
            component="span"
            sx={{
              color: "#d32f2f",
              fontSize: "0.75rem",
              mt: "3px",
              mx: "14px",
            }}
          >
            {errors.operatorId}
          </Box>
        )}
      </FormControl>

      {/* Plano de saúde */}
      <FormControl
        fullWidth
        error={!!errors.planId}
        required
        disabled={!operatorId || loadingPlans}
        sx={{
          "& .MuiOutlinedInput-root": {
            borderRadius: "8px",
          },
        }}
      >
        <InputLabel>Plano vinculado</InputLabel>
        <Select
          value={formData.planId && healthPlans.some(plan => plan.id === formData.planId) ? formData.planId : ""}
          onChange={(e) => handleChange("planId", e.target.value)}
          label="Plano vinculado"
        >
          {loadingPlans ? (
            <MenuItem value="" disabled>
              Carregando planos...
            </MenuItem>
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
          <Box
            component="span"
            sx={{
              color: "#d32f2f",
              fontSize: "0.75rem",
              mt: "3px",
              mx: "14px",
            }}
          >
            {errors.planId}
          </Box>
        )}
      </FormControl>
    </Box>
  );
}

