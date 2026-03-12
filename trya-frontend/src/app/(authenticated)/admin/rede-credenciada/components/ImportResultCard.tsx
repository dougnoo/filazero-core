"use client";

import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Divider,
  Alert,
  AlertTitle,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Collapse,
  IconButton,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import { useState } from "react";
import type { ImportResult } from "../services/networkImportService";

interface ImportResultCardProps {
  result: ImportResult;
}

export function ImportResultCard({ result }: ImportResultCardProps) {
  const [showErrors, setShowErrors] = useState(false);

  const isSuccess = result.status === "completed" && result.errorRows === 0;
  const isPartialSuccess = result.status === "completed" && result.errorRows > 0;
  const isFailed = result.status === "failed";

  return (
    <Card variant="outlined">
      <CardContent>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
          {isSuccess && <CheckCircleIcon color="success" fontSize="large" />}
          {isPartialSuccess && <ErrorIcon color="warning" fontSize="large" />}
          {isFailed && <ErrorIcon color="error" fontSize="large" />}

          <Box>
            <Typography variant="h6">
              {isSuccess && "Importação concluída com sucesso"}
              {isPartialSuccess && "Importação concluída com erros"}
              {isFailed && "Falha na importação"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Arquivo: {result.filename}
            </Typography>
          </Box>

          <Chip
            label={result.operatorEnabled ? "Operadora habilitada" : "Status mantido"}
            color={result.operatorEnabled ? "success" : "default"}
            size="small"
            sx={{ ml: "auto" }}
          />
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(4, 1fr)" },
            gap: 2,
          }}
        >
          <Box>
            <Typography variant="caption" color="text.secondary">
              Total de linhas
            </Typography>
            <Typography variant="h5">{result.totalRows}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Processadas com sucesso
            </Typography>
            <Typography variant="h5" color="success.main">
              {result.successRows}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Erros
            </Typography>
            <Typography
              variant="h5"
              color={result.errorRows > 0 ? "error.main" : "text.primary"}
            >
              {result.errorRows}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Novos prestadores
            </Typography>
            <Typography variant="h5">{result.newProviders}</Typography>
          </Box>
        </Box>

        <Box sx={{ mt: 2, display: "flex", gap: 2, flexWrap: "wrap" }}>
          <Chip
            label={`${result.newLocations} novas localizações`}
            size="small"
            variant="outlined"
          />
          <Chip
            label={`${result.updatedProviders} prestadores atualizados`}
            size="small"
            variant="outlined"
          />
          <Chip
            label={`${result.newServices} novos serviços`}
            size="small"
            variant="outlined"
          />
        </Box>

        {result.errors.length > 0 && (
          <Box sx={{ mt: 3 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                cursor: "pointer",
              }}
              onClick={() => setShowErrors(!showErrors)}
            >
              <Typography variant="subtitle2" color="error">
                {result.errors.length} erro(s) encontrado(s)
              </Typography>
              <IconButton size="small">
                {showErrors ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            </Box>

            <Collapse in={showErrors}>
              <TableContainer component={Paper} variant="outlined" sx={{ mt: 1 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Linha</TableCell>
                      <TableCell>Coluna</TableCell>
                      <TableCell>Motivo</TableCell>
                      <TableCell>Sugestão</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {result.errors.slice(0, 50).map((error, index) => (
                      <TableRow key={index}>
                        <TableCell>{error.rowNumber}</TableCell>
                        <TableCell>{error.columnName || "-"}</TableCell>
                        <TableCell>{error.reason}</TableCell>
                        <TableCell>{error.suggestion || "-"}</TableCell>
                      </TableRow>
                    ))}
                    {result.errors.length > 50 && (
                      <TableRow>
                        <TableCell colSpan={4}>
                          <Typography variant="caption" color="text.secondary">
                            ... e mais {result.errors.length - 50} erros
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Collapse>
          </Box>
        )}

        {result.errorMessage && (
          <Alert severity="error" sx={{ mt: 2 }}>
            <AlertTitle>Erro</AlertTitle>
            {result.errorMessage}
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
