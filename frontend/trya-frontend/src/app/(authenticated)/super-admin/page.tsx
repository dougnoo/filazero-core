"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Stack,
  Typography,
} from "@mui/material";
import { tenantService, type Tenant } from "@/app/(authenticated)/admin-rh/beneficiarios/services/tenantService";
import { addTenantToUrl } from "@/shared/utils/tenantUtils";
import { useTenantAssets } from "@/shared/context/TenantThemeProvider";

const SUPER_ADMIN_TENANT_ID_STORAGE_KEY = "selectedTenantId";

export default function SuperAdminPage() {
  const router = useRouter();
  const { tenant: currentTenant } = useTenantAssets();

  const [loading, setLoading] = useState(true);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [selectedTenantId, setSelectedTenantId] = useState<string | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(SUPER_ADMIN_TENANT_ID_STORAGE_KEY);
      if (saved) setSelectedTenantId(saved);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const list = await tenantService.listActive();
        setTenants(list);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const selectedTenant = useMemo(
    () => tenants.find((t) => t.id === selectedTenantId) ?? null,
    [tenants, selectedTenantId],
  );

  const handleSelect = (selectedTenant: Tenant) => {
    try {
      localStorage.setItem(SUPER_ADMIN_TENANT_ID_STORAGE_KEY, selectedTenant.id);
    } catch {
      // ignore
    }
    setSelectedTenantId(selectedTenant.id);

    // Redireciona para uma área existente do app (admin).
    // Mantemos o tenant de tema via query param `tenant` (se existir).
    router.push(addTenantToUrl("/admin", currentTenant));
  };

  return (
    <Box sx={{ maxWidth: 960, mx: "auto", px: 2, py: 4 }}>
      <Stack spacing={2}>
        <Typography variant="h4" fontWeight={700}>
          Super Admin
        </Typography>
        <Typography variant="body1" color="grey.800">
          Selecione uma empresa (tenant) para navegar e administrar os dados. Você
          pode trocar a qualquer momento.
        </Typography>

        {selectedTenant && (
          <Card variant="outlined">
            <CardContent>
              <Typography variant="subtitle2" color="grey.800">
                Tenant selecionado
              </Typography>
              <Typography variant="h6">{selectedTenant.name}</Typography>
              <Typography variant="body2" color="grey.800">
                ID: {selectedTenant.id}
              </Typography>
            </CardContent>
          </Card>
        )}

        <Card variant="outlined">
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Empresas disponíveis
            </Typography>

            {loading ? (
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <CircularProgress size={20} />
                <Typography variant="body2" color="grey.800">
                  Carregando empresas...
                </Typography>
              </Box>
            ) : tenants.length === 0 ? (
              <Typography variant="body2" color="grey.800">
                Nenhuma empresa encontrada (ou você não tem permissão).
              </Typography>
            ) : (
              <Stack spacing={1}>
                {tenants.map((t) => (
                  <Button
                    key={t.id}
                    variant={t.id === selectedTenantId ? "contained" : "outlined"}
                    onClick={() => handleSelect(t)}
                    sx={{ justifyContent: "space-between" }}
                  >
                    <span>{t.name}</span>
                    <span style={{ opacity: 0.8, fontSize: 12 }}>{t.id}</span>
                  </Button>
                ))}
              </Stack>
            )}
          </CardContent>
        </Card>
      </Stack>
    </Box>
  );
}


