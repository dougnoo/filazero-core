"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Box, Typography, MenuItem } from "@mui/material";
import { usePlatformAuth } from "@/shared/hooks/usePlatformAuth";
import { AppHeader } from "@/layout/shared/AppHeader";
import { PageContainer } from "@/layout/shared/PageContainer";

export default function PlatformAuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isLoading, user, logout } = usePlatformAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/medico/login");
    }
  }, [isLoading, isAuthenticated, router]);

  const handleLogout = () => {
    logout();
    router.push("/medico/login");
  };

  if (isLoading) {
    return (
      <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", bgcolor: "background.default" }}>
        <Box sx={{ textAlign: "center" }}>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <Typography sx={{   }}>Verificando autenticação...</Typography>
        </Box>
      </Box>
    );
  }

  if (!isAuthenticated) return null;

  const userName = user?.name ?? "Médico";
  const userEmail = user?.email ?? "E-mail não disponível";
  const avatarInitials = user?.name
    ? user.name.split(" ").filter(Boolean).slice(0, 2).map((word) => word[0]?.toUpperCase()).join("") || "MD"
    : "MD";

  const additionalMenuItems = [
    <MenuItem key="perfil" onClick={() => router.push("/medico/perfil")} sx={{ py: 1.5, px: 2, fontSize: "14px" }}>
      Meu Perfil
    </MenuItem>
  ];

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <AppHeader
        userName={userName}
        userEmail={userEmail}
        avatarInitials={avatarInitials}
        profilePictureUrl={user?.profilePictureUrl}
        onLogout={handleLogout}
        onLogoClick={() => {
          const firstSegment = pathname.split("/").filter(Boolean)[0];
          router.push(firstSegment ? `/${firstSegment}` : "/");
        }}
        additionalMenuItems={additionalMenuItems}
      />
      <PageContainer>{children}</PageContainer>
    </Box>
  );
}
