"use client";

import { ListingFilters, type StatusOption } from "@/shared/components/Filters";
import { TermStatus } from "../services/termsListingService";

interface TermsListingFiltersProps {
  searchValue: string;
  statusValue: TermStatus | "";
  onSearchChange: (value: string) => void;
  onStatusChange: (value: TermStatus | "") => void;
  onSearch: () => void;
  onImport: () => void;
  searchPlaceholder?: string;
  importButtonLabel?: string;
}

const statusOptions: StatusOption[] = [
  { value: TermStatus.COMPLETO, label: "Completo" },
  { value: TermStatus.FALHA, label: "Falha" },
  { value: TermStatus.PENDENTE, label: "Pendente" },
];

export function TermsListingFilters({
  searchValue,
  statusValue,
  onSearchChange,
  onStatusChange,
  onSearch,
  onImport,
  searchPlaceholder = "Buscar por versão ou usuário",
  importButtonLabel = "Importar termo de uso",
}: TermsListingFiltersProps) {
  return (
    <ListingFilters
      searchValue={searchValue}
      statusValue={statusValue}
      onSearchChange={onSearchChange}
      onStatusChange={(value) => onStatusChange(value as TermStatus | "")}
      onSearch={onSearch}
      onAction={onImport}
      searchPlaceholder={searchPlaceholder}
      statusOptions={statusOptions}
      actionType="import"
      actionLabel={importButtonLabel}
    />
  );
}
