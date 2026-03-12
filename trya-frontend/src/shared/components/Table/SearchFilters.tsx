"use client";

import {
  Box,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import SearchIcon from "@mui/icons-material/Search";
import dayjs, { Dayjs } from "dayjs";

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
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      onSearch();
    }
  };

  // Convert string date to Dayjs for DatePicker
  const dateValueAsDayjs = dateValue ? dayjs(dateValue) : null;

  // Handle DatePicker change and convert back to string
  const handleDatePickerChange = (newValue: Dayjs | null) => {
    onDateChange(newValue ? newValue.format("YYYY-MM-DD") : "");
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
                <SearchIcon sx={{ color: "grey.800" }} />
              </InputAdornment>
            ),
          },
        }}
        sx={{
          flex: 1,
          "& .MuiOutlinedInput-root": {
            bgcolor: "background.paper",
          },
        }}
      />

      <DatePicker
        value={dateValueAsDayjs}
        onChange={handleDatePickerChange}
        label={datePlaceholder}
        slotProps={{
          textField: {
            placeholder: datePlaceholder,
            onKeyDown: handleKeyDown,
            sx: {
              flex: 1,
              bgcolor: "background.paper",
            },
          },
          field: { clearable: true },
        }}
      />

      <FormControl
        sx={{
          flex: 1,
          "& .MuiOutlinedInput-root": {
            bgcolor: "background.paper",
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
              bgcolor: "background.paper",
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
      <Button
        variant="contained"
        color="primary"
        onClick={onSearch}
        sx={{
          width: { xs: "100%", md: 56 },
          height: 56,
          borderRadius: "8px",
          p: 0,
          flexShrink: 0,
        }}
      >
        <SearchIcon
          sx={{ fontSize: 28 }}
        />
      </Button>
    </Box>
  );
}