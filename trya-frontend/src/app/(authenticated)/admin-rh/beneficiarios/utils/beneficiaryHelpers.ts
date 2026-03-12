import type { Beneficiary, BeneficiaryWithStatus } from "../types/beneficiary";
import { VALIDATION_PATTERNS } from "../constants/beneficiary.constants";

/**
 * Helpers e utilitários para trabalhar com beneficiários
 */

/**
 * Formata CPF: 12345678900 -> 123.456.789-00
 */
export function formatCPF(cpf: string): string {
  const cleaned = cpf.replace(/\D/g, "");
  
  if (cleaned.length !== 11) {
    return cpf;
  }
  
  return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
}

/**
 * Remove formatação do CPF: 123.456.789-00 -> 12345678900
 */
export function unformatCPF(cpf: string): string {
  return cpf.replace(/\D/g, "");
}

/**
 * Valida CPF (verifica dígitos verificadores)
 */
export function validateCPF(cpf: string): boolean {
  const cleaned = unformatCPF(cpf);
  
  if (!VALIDATION_PATTERNS.CPF.test(cleaned)) {
    return false;
  }
  
  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1{10}$/.test(cleaned)) {
    return false;
  }
  
  // Validação dos dígitos verificadores
  let sum = 0;
  let remainder;
  
  for (let i = 1; i <= 9; i++) {
    sum += parseInt(cleaned.substring(i - 1, i)) * (11 - i);
  }
  
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleaned.substring(9, 10))) return false;
  
  sum = 0;
  for (let i = 1; i <= 10; i++) {
    sum += parseInt(cleaned.substring(i - 1, i)) * (12 - i);
  }
  
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleaned.substring(10, 11))) return false;
  
  return true;
}

/**
 * Formata telefone: 11999999999 -> (11) 99999-9999
 */
export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, "");
  
  if (cleaned.length === 11) {
    return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  }
  
  if (cleaned.length === 10) {
    return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
  }
  
  return phone;
}

/**
 * Remove formatação do telefone
 */
export function unformatPhone(phone: string): string {
  return phone.replace(/\D/g, "");
}

/**
 * Formata data ISO para formato brasileiro: 2024-01-15 -> 15/01/2024
 */
export function formatDate(dateString: string): string {
  if (!dateString) return "";
  
  const date = new Date(dateString);
  
  if (isNaN(date.getTime())) {
    return dateString;
  }
  
  return date.toLocaleDateString("pt-BR");
}

/**
 * Formata data e hora para formato brasileiro
 */
export function formatDateTime(dateString: string): string {
  if (!dateString) return "";
  
  const date = new Date(dateString);
  
  if (isNaN(date.getTime())) {
    return dateString;
  }
  
  return date.toLocaleString("pt-BR");
}

/**
 * Valida e-mail
 */
export function validateEmail(email: string): boolean {
  return VALIDATION_PATTERNS.EMAIL.test(email);
}

/**
 * Extrai iniciais do nome: "João Silva" -> "JS"
 */
export function getInitials(name: string): string {
  const parts = name.trim().split(" ").filter(Boolean);
  
  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Adiciona propriedades computadas ao beneficiário
 */
export function enrichBeneficiary(
  beneficiary: Beneficiary
): BeneficiaryWithStatus {
  return {
    ...beneficiary,
    statusLabel: beneficiary.active ? "Ativo" : "Inativo",
    statusColor: beneficiary.active ? "success" : "default",
  };
}

/**
 * Filtra lista de beneficiários localmente (útil para busca offline)
 */
export function filterBeneficiaries(
  beneficiaries: Beneficiary[],
  searchTerm: string
): Beneficiary[] {
  if (!searchTerm.trim()) {
    return beneficiaries;
  }
  
  const term = searchTerm.toLowerCase();
  
  return beneficiaries.filter((b) => {
    return (
      b.name.toLowerCase().includes(term) ||
      b.email.toLowerCase().includes(term) ||
      unformatCPF(b.cpf).includes(unformatCPF(term))
    );
  });
}

/**
 * Ordena lista de beneficiários
 */
export function sortBeneficiaries(
  beneficiaries: Beneficiary[],
  sortBy: string
): Beneficiary[] {
  const isDesc = sortBy.startsWith("-");
  const field = isDesc ? sortBy.substring(1) : sortBy;
  
  return [...beneficiaries].sort((a, b) => {
    const aValueRaw = a[field as keyof Beneficiary];
    const bValueRaw = b[field as keyof Beneficiary];
    
    // Tratamento para datas
    if (field === "createdAt" || field === "updatedAt") {
      const aTime = new Date(aValueRaw as string).getTime();
      const bTime = new Date(bValueRaw as string).getTime();
      return isDesc ? bTime - aTime : aTime - bTime;
    }
    
    // Ignora campos complexos (address)
    if (typeof aValueRaw === "object" || typeof bValueRaw === "object") {
      return 0;
    }
    
    // Converte para string para comparação
    const aValue = String(aValueRaw ?? "").toLowerCase();
    const bValue = String(bValueRaw ?? "").toLowerCase();
    
    if (aValue < bValue) return isDesc ? 1 : -1;
    if (aValue > bValue) return isDesc ? -1 : 1;
    return 0;
  });
}

/**
 * Calcula idade a partir da data de nascimento
 */
export function calculateAge(dateOfBirth: string): number {
  const birth = new Date(dateOfBirth);
  const today = new Date();
  
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
}

/**
 * Gera cor de avatar baseada no nome (para avatares sem foto)
 */
export function getAvatarColor(name: string): string {
  const colors = [
    "#F44336", "#E91E63", "#9C27B0", "#673AB7",
    "#3F51B5", "#2196F3", "#03A9F4", "#00BCD4",
    "#009688", "#4CAF50", "#8BC34A", "#CDDC39",
    "#FF9800", "#FF5722", "#795548", "#607D8B",
  ];
  
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  return colors[Math.abs(hash) % colors.length];
}

/**
 * Mascara CPF parcialmente: 123.456.789-00 -> ***.456.789-**
 */
export function maskCPF(cpf: string): string {
  const formatted = formatCPF(cpf);
  return formatted.replace(/(\d{3})\.(\d{3})\.(\d{3})-(\d{2})/, "***.$2.$3-**");
}

/**
 * Mascara e-mail parcialmente: joao@example.com -> j***@example.com
 */
export function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  
  if (!domain) return email;
  
  const maskedLocal = local[0] + "***" + (local.length > 1 ? local[local.length - 1] : "");
  return `${maskedLocal}@${domain}`;
}

/**
 * Converte lista de beneficiários para CSV
 */
export function convertToCSV(beneficiaries: Beneficiary[]): string {
  const headers = ["Nome", "CPF", "E-mail", "Telefone", "Status", "Data de Cadastro"];
  const rows = beneficiaries.map((b) => [
    b.name,
    formatCPF(b.cpf),
    b.email,
    b.phone || "-",
    b.active ? "Ativo" : "Inativo",
    formatDate(b.createdAt || ""),
  ]);
  
  const csvContent = [
    headers.join(","),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
  ].join("\n");
  
  return csvContent;
}

/**
 * Faz download de arquivo CSV
 */
export function downloadCSV(csvContent: string, filename: string): void {
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

/**
 * Debounce function para otimizar buscas
 */
export function debounce<T extends (...args: never[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

