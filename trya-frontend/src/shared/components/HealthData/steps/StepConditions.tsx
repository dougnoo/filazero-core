"use client";

import {
  Box,
  TextField,
  InputAdornment,
  List,
  ListItem,
  ListItemButton,
  Chip,
  CircularProgress,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { useChronicConditionsSearch, ChronicCondition } from "../hooks/useChronicConditionsSearch";

export interface StepConditionsProps {
  selectedConditions: ChronicCondition[];
  onSelect: (condition: ChronicCondition) => void;
  onRemove: (id: string) => void;
}

/**
 * Step 1: Condições crônicas
 * Campo de busca com autocomplete, lista de resultados e chips para itens selecionados.
 * Suporta pré-preenchimento via selectedConditions prop.
 * 
 * Requirements: 4.2, 4.5, 4.7, 4.8, 7.1
 */
export function StepConditions({ selectedConditions, onSelect, onRemove }: StepConditionsProps) {
  const { conditions, isLoading, searchTerm, setSearchTerm, clearResults } = useChronicConditionsSearch();

  const handleSelect = (condition: ChronicCondition) => {
    if (!selectedConditions.find((c) => c.id === condition.id)) {
      onSelect(condition);
    }
    clearResults();
  };

  // Filter out already selected conditions from search results
  const availableConditions = conditions.filter(
    (c) => !selectedConditions.find((selected) => selected.id === c.id)
  );

  return (
    <Box sx={{ width: "100%" }}>
      <TextField
        fullWidth
        placeholder="Buscar condição..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          },
        }}
      />

      {(availableConditions.length > 0 || isLoading) && (
        <Box
          sx={{
            mt: 1,
            border: 1,
            borderColor: "divider",
            borderRadius: 2,
            bgcolor: "background.paper",
            maxHeight: 200,
            overflowY: "auto",
          }}
        >
          {isLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
              <CircularProgress size={24} />
            </Box>
          ) : (
            <List disablePadding>
              {availableConditions.map((condition) => (
                <ListItem key={condition.id} disablePadding>
                  <ListItemButton
                    onClick={() => handleSelect(condition)}
                    sx={{ py: 1.5, px: 2 }}
                  >
                    <Typography variant="body2">{condition.name}</Typography>
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          )}
        </Box>
      )}

      {selectedConditions.length > 0 && (
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 2 }}>
          {selectedConditions.map((condition) => (
            <Chip
              key={condition.id}
              label={condition.name}
              onDelete={() => onRemove(condition.id)}
              color="primary"
              variant="outlined"
            />
          ))}
        </Box>
      )}
    </Box>
  );
}
