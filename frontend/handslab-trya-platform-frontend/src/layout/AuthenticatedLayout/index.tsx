"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Box, Typography, MenuItem, Divider } from "@mui/material";
import DynamicSVG from "@/shared/components/DynamicSVG";
import { theme } from "@/shared/theme";
import { authService, type UserProfile } from "@/shared/services/authService";
import { isRole, type RoleSlug, RoleEnum } from "@/shared/role";
import { useGlobalThemeContext } from "@/shared/context/GlobalThemeContext";
import { useThemeColors } from "@/shared/hooks/useThemeColors";
import { AppHeader } from "@/layout/shared/AppHeader";
import { UserMenu } from "@/layout/shared/UserMenu";
import { PageContainer } from "@/layout/shared/PageContainer";

const DEFAULT_ROLE: RoleSlug = RoleEnum.Paciente;
const ROLE_ALIASES: Record<string, RoleSlug> = {
  admin: RoleEnum.AdminRh,
  superadmin: RoleEnum.SuperAdmin,
  "super-admin": RoleEnum.SuperAdmin,
};

const resolveRole = (
  pathname: string,
  searchParams: URLSearchParams | null
): RoleSlug => {
  const segments = pathname.split("/").filter(Boolean);

  for (const segment of segments) {
    const normalized = segment.toLowerCase();
    if (isRole(normalized)) {
      return normalized;
    }
    if (ROLE_ALIASES[normalized]) {
      return ROLE_ALIASES[normalized];
    }
  }

  const roleParam = searchParams?.get("role")?.toLowerCase() ?? null;
  if (roleParam) {
    if (isRole(roleParam)) {
      return roleParam as RoleSlug;
    }
    if (ROLE_ALIASES[roleParam]) {
      return ROLE_ALIASES[roleParam];
    }
  }

  return DEFAULT_ROLE;
};

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { theme: tenantTheme } = useGlobalThemeContext();
  const themeColors = useThemeColors();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [shouldShowOnlineChip, setShouldShowOnlineChip] = useState(false);
  const [currentRole, setCurrentRole] = useState<RoleSlug>(DEFAULT_ROLE);

  const logoSrc = tenantTheme?.images?.logo ?? "";
  const faviconSrc = tenantTheme?.images?.favicon ?? "";

  useEffect(() => {
    if (!faviconSrc) {
      return;
    }

    const link = document.querySelector<HTMLLinkElement>("link[rel='icon']");
    if (link) {
      link.href = faviconSrc;
    } else {
      const head = document.head;
      const newLink = document.createElement("link");
      newLink.rel = "icon";
      newLink.href = faviconSrc;
      head.appendChild(newLink);
    }
  }, [faviconSrc]);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // Verifica autenticação ao montar o componente
  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        const isAuthenticated = authService.isAuthenticated();

        if (!isAuthenticated) {
          authService.logout();
          const tenant = new URLSearchParams(window.location.search).get(
            "tenant"
          );
          const loginUrl = tenant ? `/login?tenant=${tenant}` : `/login`;
          router.replace(loginUrl);
          return;
        }

        try {
          const profile = await authService.getUserProfile();
          setUserProfile(profile);
        } catch (profileError) {
          authService.logout();
          const tenant = new URLSearchParams(window.location.search).get(
            "tenant"
          );
          const loginUrl = tenant ? `/login?tenant=${tenant}` : `/login`;
          router.replace(loginUrl);
          return;
        }
      } catch (error) {
        authService.logout();
        const tenant = new URLSearchParams(window.location.search).get("tenant");
        const loginUrl = tenant ? `/login?tenant=${tenant}` : `/login`;
        router.replace(loginUrl);
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkAuthentication();
  }, [router, pathname]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const computedRole = resolveRole(
      pathname ?? window.location.pathname,
      params
    );
    setCurrentRole(computedRole);
    setShouldShowOnlineChip(computedRole !== RoleEnum.AdminRh);
  }, [pathname]);

  const handleLogout = async () => {
    try {
      authService.logout();
      handleMenuClose();

      // Preserva o parâmetro tenant se existir
      const params = new URLSearchParams(window.location.search);
      const tenant = params.get("tenant");
      const loginUrl = tenant ? `/login?tenant=${tenant}` : `/login`;

      // Força reload completo para garantir que cookies sejam limpos
      // e o middleware seja executado novamente
      window.location.href = loginUrl;
    } catch (error) {
      // Mesmo com erro, redireciona para login
      handleMenuClose();
      const params = new URLSearchParams(window.location.search);
      const tenant = params.get("tenant");
      const loginUrl = tenant ? `/login?tenant=${tenant}` : `/login`;
      window.location.href = loginUrl;
    }
  };

  // Mostra loading enquanto verifica autenticação
  if (isCheckingAuth) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: theme.background,
        }}
      >
        <Box sx={{ textAlign: "center" }}>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <Typography sx={{ color: theme.textDark }}>
            Verificando autenticação...
          </Typography>
        </Box>
      </Box>
    );
  }

  // Ícone de Tutorial
  const TutorialIcon = () => (
    <DynamicSVG width="20" height="20" viewBox="0 0 24 24">
      <g clipPath="url(#clip0_4783_1145)">
        <path
          d="M20.5712 3.42871H22.2855C22.5128 3.42871 22.7309 3.51902 22.8916 3.67976C23.0523 3.84051 23.1426 4.05853 23.1426 4.28585V18.0001C23.1426 18.2275 23.0523 18.4455 22.8916 18.6062C22.7309 18.767 22.5128 18.8573 22.2855 18.8573H1.71408C1.48675 18.8573 1.26873 18.767 1.10798 18.6062C0.947239 18.4455 0.856934 18.2275 0.856934 18.0001V4.28585C0.856934 4.05853 0.947239 3.84051 1.10798 3.67976C1.26873 3.51902 1.48675 3.42871 1.71408 3.42871H3.42836"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M10.2856 18.8572L8.57129 23.1429"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M13.7139 18.8572L15.4282 23.1429"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M6.85693 23.1428H17.1426"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M8.57129 4.28575C8.57129 3.60764 8.77237 2.94476 9.14911 2.38094C9.52584 1.81711 10.0613 1.37766 10.6878 1.11816C11.3143 0.858663 12.0037 0.790766 12.6687 0.923058C13.3338 1.05535 13.9447 1.38189 14.4242 1.86138C14.9037 2.34088 15.2303 2.95179 15.3626 3.61687C15.4948 4.28195 15.4269 4.97132 15.1674 5.59781C14.9079 6.2243 14.4685 6.75977 13.9047 7.1365C13.3408 7.51324 12.678 7.71432 11.9999 7.71432V9.42861"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M11.9999 14.5715C11.7632 14.5715 11.5713 14.3796 11.5713 14.1429C11.5713 13.9062 11.7632 13.7144 11.9999 13.7144"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M12 14.5715C12.2367 14.5715 12.4286 14.3796 12.4286 14.1429C12.4286 13.9062 12.2367 13.7144 12 13.7144"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_4783_1145">
          <rect width="24" height="24" fill="white" />
        </clipPath>
      </defs>
    </DynamicSVG>
  );

  const userName = userProfile?.name ?? "Usuário";
  const userEmail = userProfile?.email ?? "E-mail não disponível";
  const avatarInitials = userProfile?.name
    ? userProfile.name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((word) => word[0]?.toUpperCase())
        .join("") || "US"
    : "US";

  // Verifica se está na rota de onboarding, privacy-acceptance ou triagem para ocultar o header
  const isOnboardingPage =
    pathname?.includes("/onboarding") ||
    pathname?.includes("/privacy-acceptance") ||
    pathname?.includes("/triagem-intro") ||
    pathname?.includes("/triagem/");

  // Se for página de onboarding ou privacy-acceptance, renderiza apenas o conteúdo sem header
  if (isOnboardingPage) {
    return (
      <Box sx={{ minHeight: "100vh", backgroundColor: theme.background }}>
        {children}
      </Box>
    );
  }

  // Additional menu items for drawer (mobile)
  const drawerAdditionalItems = userProfile?.role?.toUpperCase() === "BENEFICIARY" ? (
    <>
      <Box
        onClick={() => {
          // Sinaliza para iniciar o tutorial manualmente
          localStorage.setItem("start_tutorial_manually", "true");
          // Dispara evento customizado para iniciar o tutorial imediatamente
          window.dispatchEvent(new CustomEvent("startTutorial"));
          // Se for paciente e não estiver na página do paciente, navega para lá
          if (
            currentRole === RoleEnum.Paciente &&
            !pathname?.includes("/paciente")
          ) {
            router.push("/paciente");
          }
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
        <TutorialIcon />
        <Typography
          sx={{
            color: theme.textDark,
            fontSize: "14px",
            fontWeight: 400,
            fontFamily: "Chivo, sans-serif",
          }}
        >
          Tutorial da plataforma
        </Typography>
      </Box>
      <Divider sx={{ my: 1 }} />
    </>
  ) : null;

  // Additional menu items for dropdown (desktop)
  const dropdownAdditionalItems = userProfile?.role?.toUpperCase() === "BENEFICIARY" ? (
    <MenuItem
      onClick={() => {
        handleMenuClose();
        // Sinaliza para iniciar o tutorial manualmente
        localStorage.setItem("start_tutorial_manually", "true");
        // Dispara evento customizado para iniciar o tutorial imediatamente
        window.dispatchEvent(new CustomEvent("startTutorial"));
        // Se for paciente e não estiver na página do paciente, navega para lá
        if (
          currentRole === RoleEnum.Paciente &&
          !pathname?.includes("/paciente")
        ) {
          router.push("/paciente");
        }
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
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <TutorialIcon />
        Tutorial da plataforma
      </Box>
    </MenuItem>
  ) : null;

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: theme.background }}>
      <AppHeader
        logoSrc={logoSrc}
        userName={userName}
        userEmail={userEmail}
        avatarInitials={avatarInitials}
        showOnlineChip={shouldShowOnlineChip}
        onLogout={handleLogout}
        onMenuOpen={handleMenuOpen}
        themeColors={{
          primary: themeColors.primary,
          textDark: themeColors.textDark,
          background: themeColors.background,
          border: theme.border,
          avatarBackground: themeColors.avatarBackground,
        }}
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
            textPrimaryColor={
              tenantTheme?.colors?.text?.primary || "#041616"
            }
          />
        }
      />

      <PageContainer>{children}</PageContainer>
    </Box>
  );
}
