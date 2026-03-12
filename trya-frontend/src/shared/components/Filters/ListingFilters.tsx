"use client";

import {
  Box,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  Button,
} from "@mui/material";
import { SearchButtonIcon } from "@/shared/components/icons/SearchButtonIcon";
import { ImportButton, AddButton } from "@/shared/components/Buttons";

export interface StatusOption {
  value: string;
  label: string;
}

interface ListingFiltersProps {
  searchValue: string;
  statusValue: string;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onSearch: () => void;
  onAction: () => void;
  searchPlaceholder?: string;
  statusOptions: StatusOption[];
  actionType?: "import" | "add";
  actionLabel: string;
}

export function ListingFilters({
  searchValue,
  statusValue,
  onSearchChange,
  onStatusChange,
  onSearch,
  onAction,
  searchPlaceholder = "Buscar...",
  statusOptions,
  actionType = "import",
  actionLabel,
}: ListingFiltersProps) {
  return (
    <Box
      sx={{
        display: "flex",
        gap: 2,
        mb: 3,
        flexDirection: { xs: "column", sm: "row" },
        alignItems: { xs: "stretch", sm: "flex-start" },
      }}
    >
      <TextField
        placeholder={searchPlaceholder}
        value={searchValue}
        onChange={(e) => onSearchChange(e.target.value)}
        onKeyPress={(e) => {
          if (e.key === "Enter") {
            onSearch();
          }
        }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchButtonIcon />
            </InputAdornment>
          ),
        }}
        fullWidth
        variant="outlined"
      />

      <FormControl
        sx={{
          minWidth: { xs: "100%", sm: 200 },
          bgcolor: "white",
        }}
      >
        <Select
          value={statusValue}
          onChange={(e) => onStatusChange(e.target.value)}
          displayEmpty
        >
          <MenuItem value="">Todos os status</MenuItem>
          {statusOptions.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Button
        variant="contained"
        color="primary"
        onClick={onSearch}
        sx={{
          height: 56,
          width: 56,
          minWidth: 56,
          borderRadius: "8px",
          p: 0,
          flexShrink: 0,
        }}
      >
        <SearchButtonIcon />
      </Button>

      {actionType === "import" ? (
        <ImportButton label={actionLabel} onClick={onAction} />
      ) : (
        <AddButton label={actionLabel} onClick={onAction} />
      )}
    </Box>
  );
}
