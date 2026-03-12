"use client";

import {
  Box,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import { useThemeColors } from "@/shared/hooks/useThemeColors";

interface SearchFiltersProps {
  searchValue: string;
  dateValue: string;
  statusValue: string;
  statusOptions: Array<{ value: string; label: string }>;
  onSearchChange: (value: string) => void;
  onDateChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onSearch: () => void;
  searchPlaceholder?: string;
  datePlaceholder?: string;
  statusPlaceholder?: string;
  // Optional urgency filter props
  urgencyValue?: string;
  urgencyOptions?: Array<{ value: string; label: string }>;
  onUrgencyChange?: (value: string) => void;
  urgencyPlaceholder?: string;
}

export function SearchFilters({
  searchValue,
  dateValue,
  statusValue,
  statusOptions,
  onSearchChange,
  onDateChange,
  onStatusChange,
  onSearch,
  searchPlaceholder = "Buscar por nome",
  datePlaceholder = "Filtrar por data",
  statusPlaceholder = "Filtrar por status",
  urgencyValue,
  urgencyOptions,
  onUrgencyChange,
  urgencyPlaceholder = "Filtrar por criticidade",
}: SearchFiltersProps) {
  const theme = useThemeColors();

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      onSearch();
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        gap: 2,
        alignItems: { xs: "stretch", md: "center" },
      }}
    >
      <TextField
        placeholder={searchPlaceholder}
        value={searchValue}
        onChange={(e) => onSearchChange(e.target.value)}
        onKeyDown={handleKeyDown}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: theme.textMuted }} />
              </InputAdornment>
            ),
          },
        }}
        sx={{
          flex: 1,
          "& .MuiOutlinedInput-root": {
            bgcolor: theme.backgroundSoft,
          },
        }}
      />

      <TextField
        placeholder={datePlaceholder}
        value={dateValue}
        onChange={(e) => onDateChange(e.target.value)}
        onKeyDown={handleKeyDown}
        type="date"
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <CalendarTodayIcon sx={{ color: theme.textMuted }} />
              </InputAdornment>
            ),
          },
        }}
        sx={{
          flex: 1,
          "& .MuiOutlinedInput-root": {
            bgcolor: theme.backgroundSoft,
          },
        }}
      />

      <FormControl
        sx={{
          flex: 1,
          "& .MuiOutlinedInput-root": {
            bgcolor: theme.backgroundSoft,
          },
        }}
      >
        <InputLabel>{statusPlaceholder}</InputLabel>
        <Select
          value={statusValue}
          onChange={(e) => onStatusChange(e.target.value)}
          label={statusPlaceholder}
        >
          <MenuItem value="">Todos</MenuItem>
          {statusOptions.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {urgencyOptions && onUrgencyChange && (
        <FormControl
          sx={{
            flex: 1,
            "& .MuiOutlinedInput-root": {
              bgcolor: theme.backgroundSoft,
            },
          }}
        >
          <InputLabel>{urgencyPlaceholder}</InputLabel>
          <Select
            value={urgencyValue || ""}
            onChange={(e) => onUrgencyChange(e.target.value)}
            label={urgencyPlaceholder}
          >
            <MenuItem value="">Todos</MenuItem>
            {urgencyOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}

      <IconButton
        onClick={onSearch}
        sx={{
          bgcolor: theme.primary,
          color: "white",
          "&:hover": {
            bgcolor: theme.primary,
            opacity: 0.9,
          },
          width: { xs: "100%", md: 48 },
          height: 48,
        }}
      >
        <SearchIcon />
      </IconButton>
    </Box>
  );
}