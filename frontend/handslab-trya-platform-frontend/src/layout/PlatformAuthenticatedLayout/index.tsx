"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Box, Typography, MenuItem } from "@mui/material";
import { useThemeColors } from "@/shared/hooks/useThemeColors";
import { usePlatformAuth } from "@/shared/hooks/usePlatformAuth";
import { AppHeader } from "@/layout/shared/AppHeader";
import { UserMenu } from "@/layout/shared/UserMenu";
import { PageContainer } from "@/layout/shared/PageContainer";

export default function PlatformAuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, isLoading, user, logout } = usePlatformAuth();
  const themeColors = useThemeColors();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  // Check authentication and redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/medico/login");
    }
  }, [isLoading, isAuthenticated, router]);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleMenuClose();
    router.push("/medico/login");
  };

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: themeColors.background,
        }}
      >
        <Box sx={{ textAlign: "center" }}>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <Typography sx={{ color: themeColors.textDark }}>
            Verificando autenticação...
          </Typography>
        </Box>
      </Box>
    );
  }

  // If not authenticated, don't render anything (will redirect)
  if (!isAuthenticated) {
    return null;
  }

  const userName = user?.name ?? "Médico";
  const userEmail = user?.email ?? "E-mail não disponível";
  const avatarInitials = user?.name
    ? user.name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((word) => word[0]?.toUpperCase())
        .join("") || "MD"
    : "MD";

  // Platform theme colors (uses dynamic theme from useThemeColors)
  const platformThemeColors = {
    primary: themeColors.primary,
    textDark: themeColors.textDark,
    background: themeColors.background,
    border: themeColors.softBorder,
    avatarBackground: themeColors.avatarBackground,
  };

  // Additional menu item for profile
  const dropdownAdditionalItems = (
    <MenuItem
      onClick={() => {
        handleMenuClose();
        router.push("/medico/perfil");
      }}
      sx={{
        py: 1.5,
        px: 2,
        fontSize: "14px",
        "&:hover": {
          backgroundColor: "rgba(0, 0, 0, 0.04)",
        },
      }}
    >
      Meu Perfil
    </MenuItem>
  );

  // Additional menu items for drawer (mobile)
  const drawerAdditionalItems = (
    <Box
      onClick={() => {
        router.push("/medico/perfil");
      }}
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        px: 2,
        py: 1.5,
        borderRadius: "8px",
        cursor: "pointer",
        backgroundColor: "transparent",
        transition: "background-color 0.2s",
        "&:hover": {
          backgroundColor: "rgba(0, 0, 0, 0.04)",
        },
      }}
    >
      <Typography
        sx={{
          color: themeColors.textDark,
          fontSize: "14px",
          fontWeight: 400,
          fontFamily: "Chivo, sans-serif",
        }}
      >
        Meu Perfil
      </Typography>
    </Box>
  );

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: themeColors.background }}>
      <AppHeader
        userName={userName}
        userEmail={userEmail}
        avatarInitials={avatarInitials}
        profilePictureUrl={user?.profilePictureUrl}
        showOnlineChip={false}
        onLogout={handleLogout}
        onMenuOpen={handleMenuOpen}
        themeColors={platformThemeColors}
        additionalMenuItems={drawerAdditionalItems}
        userMenu={
          <UserMenu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            userName={userName}
            userEmail={userEmail}
            onLogout={handleLogout}
            additionalItems={dropdownAdditionalItems}
          />
        }
      />

      <PageContainer>{children}</PageContainer>
    </Box>
  );
}
