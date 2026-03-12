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
import { useMedicationsSearch, Medication } from "../hooks/useMedicationsSearch";

export interface StepMedicationsProps {
  selectedMedications: Medication[];
  onSelect: (medication: Medication) => void;
  onRemove: (id: string) => void;
}

/**
 * Step 2: Medicamentos em uso
 * Campo de busca com autocomplete, lista de resultados e chips para itens selecionados.
 * Suporta pré-preenchimento via selectedMedications prop.
 * 
 * Requirements: 4.3, 4.6, 4.7, 4.8, 7.2
 */
export function StepMedications({ selectedMedications, onSelect, onRemove }: StepMedicationsProps) {
  const { medications, isLoading, searchTerm, setSearchTerm, clearResults } = useMedicationsSearch();

  const handleSelect = (medication: Medication) => {
    if (!selectedMedications.find((m) => m.id === medication.id)) {
      onSelect(medication);
    }
    clearResults();
  };

  // Filter out already selected medications from search results
  const availableMedications = medications.filter(
    (m) => !selectedMedications.find((selected) => selected.id === m.id)
  );

  return (
    <Box sx={{ width: "100%" }}>
      <TextField
        fullWidth
        placeholder="Buscar medicamento..."
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

      {(availableMedications.length > 0 || isLoading) && (
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
              {availableMedications.map((medication) => (
                <ListItem key={medication.id} disablePadding>
                  <ListItemButton
                    onClick={() => handleSelect(medication)}
                    sx={{ py: 1.5, px: 2 }}
                  >
                    <Box>
                      <Typography variant="body2">{medication.name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {medication.activePrinciple}
                      </Typography>
                    </Box>
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          )}
        </Box>
      )}

      {selectedMedications.length > 0 && (
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 2 }}>
          {selectedMedications.map((medication) => (
            <Chip
              key={medication.id}
              label={medication.name}
              onDelete={() => onRemove(medication.id)}
              color="primary"
              variant="outlined"
            />
          ))}
        </Box>
      )}
    </Box>
  );
}
