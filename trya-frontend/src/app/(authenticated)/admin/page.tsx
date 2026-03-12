"use client";

import { Box } from "@mui/material";
import { HeroBanner } from "./components/HeroBanner";
import { FeatureCard } from "./components/Card";
import { buildAssetUrl } from "@/shared/theme/createTenantTheme";

export default function AdminHomePage() {
  return (
    <Box component="main" sx={{ gap: 3, display: 'flex', flexDirection: 'column' }} px={{ xs: 2, md: 0 }}>
      <HeroBanner />

      <Box
        sx={{
          width: "100%",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <Box
          component="section"
          sx={{
            maxWidth: 1200,
            width: "100%",
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
            },
            justifyContent: "stretch",
            justifyItems: "stretch",
            gap: { xs: 2, md: 3 },
          }}
        >
          {/* Card 1 - Personalização */}
          <FeatureCard
            title="Personalização"
            description="Gerencie cores primárias, secundárias e elementos visuais para adaptar o ambiente às suas preferências."
            iconUrl={buildAssetUrl('theme/admin/icons/personalizacao.png')}
            href="/admin/configuracoes"
            actionLabel="Personalizar"
          />

          {/* Card 2 - Rede Credenciada */}
          <FeatureCard
            title="Rede Credenciada"
            description="Importe novas redes credenciadas por tipo de operadora, mantendo informações consistentes para cada empresa."
            iconUrl={buildAssetUrl('theme/admin/icons/rede-credenciada.png')}
            href="/admin/rede-credenciada"
            actionLabel="Importar"
          />

          {/* Card 3 - Sinistros */}
          <FeatureCard
            title="Sinistros"
            description="Envie uma planilha de sinistros para que esses dados sejam considerados na seleção da rede credenciada."
            iconUrl={buildAssetUrl('theme/admin/icons/sinistros.png')}
            href="/admin/sinistros"
            actionLabel="Importar"
          />

          {/* Card 4 - Atualizar termos */}
          <FeatureCard
            title="Atualizar termos"
            description="Gerencie versões dos Termos de Uso e da Política de Privacidade."
            iconUrl={buildAssetUrl('theme/admin/icons/atualizar-termos.png')}
            href="/super-admin/termos/listagem"
            actionLabel="Gerenciar termos"
          />
        </Box>
      </Box>
    </Box>
  );
}

